// Registrations run on the student's own logged-in session through the anon
// client, guarded by row level security. supabaseAdmin is deliberately not used
// here: a student can read and write their own registration and nobody else's,
// enforced by the database rather than by this file being careful.
import { supabase } from './supabase'

function unwrap({ data, error }) {
  if (error) throw new Error(error.message || 'Something went wrong. Try again.')
  if (data && typeof data === 'object' && data.error) throw new Error(data.error)
  return data
}

/** Open forms only. Draft and closed intakes are invisible, enforced by RLS. */
export async function getOpenForms() {
  const { data, error } = await supabase
    .from('registration_forms')
    .select('*')
    .eq('status', 'open')
    .order('closes_at', { ascending: true, nullsFirst: false })

  if (error) throw error
  return { forms: data || [] }
}

/**
 * Resolve a shareable slug like KMAC26, or a uuid, to the form itself.
 *
 * Goes through an RPC rather than a plain select because RLS hides anything not
 * open, which makes a draft form and a mistyped link look identical. The RPC
 * can tell them apart and say which it is.
 */
export async function getForm(slugOrId) {
  const res = unwrap(await supabase.rpc('resolve_registration_form', { p_slug: String(slugOrId) }))
  if (!res?.found) throw new Error(res?.error || 'That registration is not available.')
  return { form: res.form }
}

/**
 * Everything already known about this student for this form: their profile,
 * every answer they have given on any previous form, and any draft in progress.
 * This is what makes the second registration short.
 */
export async function getPrefill(formId) {
  return unwrap(await supabase.rpc('get_registration_prefill', { p_form_id: formId }))
}

export async function submitRegistration(formId, answers, beneficiary = null) {
  return unwrap(await supabase.rpc('submit_registration', {
    p_form_id: formId,
    p_answers: answers,
    p_beneficiary: beneficiary,
  }))
}

/** Save without submitting, so a long form can be finished later. */
export async function saveDraft(formId, userId, answers) {
  const { error } = await supabase
    .from('registrations')
    .upsert(
      { form_id: formId, user_id: userId, answers, status: 'draft', updated_at: new Date().toISOString() },
      { onConflict: 'form_id,user_id' }
    )
  if (error) throw error
  return { saved: true }
}

export async function getMyRegistrations() {
  const { data, error } = await supabase
    .from('registrations')
    // The payment fields come along so My Registrations and Payments can show
    // the same instructions the confirmation screen does. Without them both
    // screens could say what was owed but not how to pay it.
    .select(`*, registration_forms(
      title, program_title, fee_currency, closes_at,
      payment_note, payment_link_url, payment_link_label
    )`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return { registrations: data || [] }
}

/**
 * Does this email or phone already belong to somebody here.
 *
 * Almost everyone filling in these forms already exists: 11,198 of the 11,229
 * accounts came across in the backfill and have never been claimed. Those
 * people have no way of knowing that, so they register as strangers and the
 * prefill that would make every later form short never reaches them.
 *
 * Returns only { known, claimable }. Never throws: a failed lookup means the
 * form simply says nothing, which is the same as it did before.
 */
export async function lookupAccount({ email, phone }) {
  try {
    const { data, error } = await supabase.rpc('lookup_account_status', {
      p_email: email || null,
      p_phone: phone || null,
    })
    if (error || !data || data.error) return { known: false }
    return { known: !!data.known, claimable: !!data.claimable }
  } catch {
    return { known: false }
  }
}

// ── Guests ─────────────────────────────────────────────────────────────────
//
// Registering without an account. The account was always meant to make the
// second form short, not to be the price of entry, but both server functions
// opened with "Sign in to register" so a guest never even saw the questions.
//
// A guest gets a reference and a private token on submit. The token is the
// only way back to that registration: there is no anon read policy on the
// table, so a guessed reference reaches nothing. It is kept on this device so
// they can pay later without digging through their email.

const GUEST_KEY = 'guestRegistrations'

export function rememberGuestRegistration(entry) {
  try {
    const all = readGuestRegistrations().filter((r) => r.reference !== entry.reference)
    all.unshift({ ...entry, savedAt: new Date().toISOString() })
    localStorage.setItem(GUEST_KEY, JSON.stringify(all.slice(0, 20)))
  } catch {
    // A browser refusing storage is not a reason to fail the registration.
    // They still have the reference on screen and in the return link.
  }
}

export function readGuestRegistrations() {
  try {
    const raw = JSON.parse(localStorage.getItem(GUEST_KEY) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch { return [] }
}

export function forgetGuestRegistrations() {
  try { localStorage.removeItem(GUEST_KEY) } catch { /* nothing to clear */ }
}

/** Resume a guest registration from a reference and its token. */
export async function getGuestRegistration(reference, token) {
  return unwrap(await supabase.rpc('get_guest_registration', {
    p_reference: reference,
    p_token: token,
  }))
}

export async function confirmGuestPayment(registrationId, token, reference) {
  return unwrap(await supabase.rpc('confirm_guest_payment', {
    p_registration_id: registrationId,
    p_token: token,
    p_reference: reference || null,
  }))
}

/**
 * Attach anything registered as a guest with this account's email.
 *
 * Called after sign in. Without it, registering as a guest first would opt
 * someone out of prefill permanently: their answers would live on a row with
 * no user_id, and every later form would ask for their school again.
 */
export async function claimGuestRegistrations() {
  try {
    const res = await supabase.rpc('claim_guest_registrations')
    if (res.error || res.data?.error) return { claimed: 0 }
    if (res.data?.claimed > 0) forgetGuestRegistrations()
    return { claimed: res.data?.claimed || 0 }
  } catch {
    // Never block a sign in on this
    return { claimed: 0 }
  }
}

/**
 * Record a card payment the student just made.
 *
 * Goes through an RPC rather than a direct update: the row-level policy lets a
 * student edit their own submission while it is in play, and payment fields
 * should not be part of that. This narrows them to exactly one transition,
 * pending to paid.
 */
export async function markPaid(registrationId, reference) {
  return unwrap(await supabase.rpc('confirm_my_payment', {
    p_registration_id: registrationId,
    p_reference: reference || null,
  }))
}

/** Only the programmes this student's grade is meant to see. */
export async function getOpenFormsForMe(grade) {
  const { forms } = await getOpenForms()
  const g = String(grade || '').trim()
  return {
    forms: forms.filter((f) => {
      const targets = f.target_grades || []
      // No targeting means everyone. Targeting with no grade on file also shows
      // it, since hiding a programme from someone whose profile is incomplete
      // is worse than showing one they might not need.
      return targets.length === 0 || !g || targets.includes(g)
    }),
  }
}

/**
 * Resolve one field's starting value.
 *
 * Order matters: a draft the student was part way through beats a remembered
 * answer, which beats their profile. Never overwrite something they typed.
 */
export function initialValue(field, { profile, memory, existing }) {
  const saved = existing?.answers?.[field.key]
  if (saved !== undefined && saved !== '') return saved

  if (memory && memory[field.key] !== undefined) return memory[field.key]

  if (field.source?.startsWith('profile.')) {
    const key = field.source.slice('profile.'.length)
    const v = profile?.[key]
    if (v !== undefined && v !== null && v !== '') return v
  }

  return field.type === 'multiselect' ? [] : field.type === 'checkbox' ? false : ''
}

/** Why a value is already filled in, so the student knows it came from them. */
export function prefillReason(field, { profile, memory, existing }) {
  if (existing?.answers?.[field.key] !== undefined && existing.answers[field.key] !== '') return null
  if (memory && memory[field.key] !== undefined) return 'You told us this before'
  if (field.source?.startsWith('profile.')) {
    const v = profile?.[field.source.slice('profile.'.length)]
    if (v !== undefined && v !== null && v !== '') return 'From your profile'
  }
  return null
}

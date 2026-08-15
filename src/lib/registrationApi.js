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
    .select('*, registration_forms(title, program_title, fee_currency, closes_at)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return { registrations: data || [] }
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

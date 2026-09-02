import { useEffect, useMemo, useState } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { usePaystackPayment } from "react-paystack"
import {
  ArrowLeft, CheckCircle2, AlertCircle, Loader2, CreditCard, Clock,
} from "lucide-react"
import {
  getForm, getPrefill, submitRegistration, saveDraft, markPaid,
  initialValue, prefillReason,
} from "../lib/registrationApi"
import { getTokenUserId } from "../lib/auth"
import {
  rememberGuestRegistration, getGuestRegistration, confirmGuestPayment, lookupAccount,
} from "../lib/registrationApi"

const NAVY = "#003366"
const MID  = "#336699"

// Half-finished answers, held for this tab only.
//
// Offering someone a route out of the form to sign in is only kind if taking
// it does not cost them what they have already typed. Session rather than
// local storage because it should not outlive the visit.

const draftKey = (slug) => `registrationInProgress:${slug}`

function keepInProgress(slug, values) {
  try { sessionStorage.setItem(draftKey(slug), JSON.stringify(values)) }
  catch { /* a browser refusing storage just means no rescue */ }
}

function readInProgress(slug) {
  try {
    const raw = JSON.parse(sessionStorage.getItem(draftKey(slug)) || "null")
    return raw && typeof raw === "object" ? raw : null
  } catch { return null }
}

function clearInProgress(slug) {
  try { sessionStorage.removeItem(draftKey(slug)) } catch { /* nothing to clear */ }
}

export default function RegisterProgram() {
  // The URL carries a shareable slug such as KMAC26. Everything downstream
  // needs the form's real id, so resolve once and use form.id from then on.
  const { formId: slug } = useParams()
  const navigate = useNavigate()
  const [search] = useSearchParams()

  // A guest returning to pay arrives on ?ref=...&t=... The reference alone is
  // not enough to reach anything; the token is what authorises it.
  const returningRef   = search.get("ref")
  const returningToken = search.get("t")

  // What we found out about the address they typed, and whether they have
  // waved it away. Never blocks the form.
  const [recognised, setRecognised] = useState(null)
  const [dismissed, setDismissed]   = useState(false)

  const [form, setForm]       = useState(null)
  const [context, setContext] = useState(null)   // profile, memory, existing
  const [values, setValues]   = useState({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy]       = useState(false)
  const [error, setError]     = useState("")
  const [result, setResult]   = useState(null)
  const [savedAt, setSavedAt] = useState("")

  const userId = getTokenUserId()

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { form: f } = await getForm(slug)
        if (!alive) return
        if (!f) { setError("That registration form is not available."); return }

        // A guest coming back to pay does not need the form again
        if (returningRef && returningToken) {
          const existing = await getGuestRegistration(returningRef, returningToken)
          if (!alive) return
          setForm(f)
          setResult({
            id: existing.id,
            reference: existing.reference,
            status: existing.status,
            paymentStatus: existing.paymentStatus,
            amount: existing.amount,
            guest: true,
            claimToken: returningToken,
            answers: existing.answers,
            message: "This is the registration you sent us.",
            returning: true,
          })
          return
        }

        const ctx = await getPrefill(f.id)
        if (!alive) return

        setForm(f)
        setContext(ctx)

        const seeded = {}
        for (const field of f.fields || []) {
          if (field.type === "section" || field.type === "info") continue
          seeded[field.key] = initialValue(field, ctx)
        }

        // Anything they had typed before stepping away to sign in or claim an
        // account. Offering those routes would be worse than not offering them
        // if taking one threw away half a filled-in form.
        const rescued = readInProgress(slug)
        setValues(rescued ? { ...seeded, ...rescued } : seeded)

        if (ctx.existing && !["draft", "submitted"].includes(ctx.existing.status)) {
          setResult({
            reference: ctx.existing.reference,
            status: ctx.existing.status,
            alreadyDecided: true,
          })
        }
      } catch (e) {
        if (alive) setError(e.message || "Could not load this registration form.")
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [slug, returningRef, returningToken])

  const fields = useMemo(
    () => (form?.fields || []).filter((f) => f.key || f.type === "section" || f.type === "info"),
    [form]
  );

  const answered = useMemo(() => {
    const real = fields.filter((f) => !["section", "info"].includes(f.type))
    const done = real.filter((f) => {
      const v = values[f.key]
      return Array.isArray(v) ? v.length > 0 : v !== "" && v !== undefined && v !== false
    })
    return { done: done.length, total: real.length }
  }, [fields, values])

  // Going to sign in or claim, and coming back to this exact form with the
  // answers still in place.
  const leaveTo = (path) => {
    keepInProgress(slug, values)
    navigate(`${path}?next=${encodeURIComponent(window.location.pathname)}`)
  }

  const set = (key, v) => {
    setValues((p) => {
      const next = { ...p, [key]: v }
      keepInProgress(slug, next)
      return next
    })
    setError("")
  }

  /**
   * Ask, once, whether we already know this address.
   *
   * Runs when they leave an email or phone box, not on every keystroke: a
   * half-typed address is not a question worth asking, and this is a lookup
   * against every account on the platform.
   */
  const maybeRecognise = async (field, value) => {
    if (userId || dismissed || recognised?.known) return
    const v = String(value || "").trim()
    if (!v) return

    const isEmail = field.type === "email" || /email/.test(field.key)
    const isPhone = field.type === "phone" || /phone|mobile/.test(field.key)
    if (!isEmail && !isPhone) return
    if (isEmail && !/^\S+@\S+\.\S+$/.test(v)) return
    if (isPhone && v.replace(/\D/g, "").length < 9) return

    // A parent's address is not the student's account, so those are skipped
    if (/parent|guardian/.test(field.key)) return

    const res = await lookupAccount(isEmail ? { email: v } : { phone: v })
    if (res.known) setRecognised({ ...res, value: v, isEmail })
  }

  const stash = async () => {
    if (!userId || !form) return
    try { await saveDraft(form.id, userId, values); setSavedAt(new Date().toLocaleTimeString()) }
    catch { /* a failed draft save is not worth interrupting them for */ }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return

    const missing = fields.filter(
      (f) => f.required && !["section", "info"].includes(f.type) &&
        (Array.isArray(values[f.key]) ? values[f.key].length === 0 : !values[f.key])
    )
    if (missing.length) {
      setError(`Please answer: ${missing.map((m) => m.label).join(", ")}.`)
      return
    }

    setBusy(true); setError("")
    try {
      const res = await submitRegistration(form.id, values)

      // A guest has no account to look this up from later, so the token that
      // gets them back to it is kept on this device and shown to them.
      if (res.guest && res.claimToken) {
        rememberGuestRegistration({
          reference: res.reference,
          token: res.claimToken,
          id: res.id,
          slug,
          formTitle: form.title,
          amount: res.amount,
          currency: res.currency || form.fee_currency,
          paymentStatus: res.paymentStatus,
        })
      }

      clearInProgress(slug)

      // Carried through so the payment step has an email to use. A guest has
      // no profile to read one from.
      setResult({ ...res, answers: values })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <Shell><p className="text-sm" style={{ color: MID }}>Loading this registration...</p></Shell>
  }

  if (error && !form) {
    return (
      <Shell>
        <AlertCircle size={30} className="text-red-500 mb-3" />
        <p className="text-lg font-semibold mb-4" style={{ color: NAVY }}>{error}</p>
        <button onClick={() => navigate("/programs")} className="px-5 py-2.5 rounded-xl text-white font-semibold"
          style={{ backgroundColor: NAVY }}>Browse programmes</button>
      </Shell>
    )
  }

  if (result) {
    return <Done form={form} result={result} navigate={navigate} onPaid={() => setResult({ ...result, paymentStatus: "paid" })} />
  }

  const autoCount = fields.filter((f) => prefillReason(f, context)).length
  const accent = form.accent_color || NAVY

  return (
    <div className="min-h-screen w-full py-8 px-4" style={{ backgroundColor: "#F0F4F8" }}>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium mb-5" style={{ color: MID }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {form.cover_image_url && (
            <img src={form.cover_image_url} alt=""
              className="w-full h-40 sm:h-52 object-cover"
              onError={(e) => { e.target.style.display = "none" }} />
          )}
          <div className="h-1.5" style={{ backgroundColor: accent }} />

          <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-gray-100">
            {form.program_title && (
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: accent }}>{form.program_title}</p>
            )}
            <h1 className="text-2xl font-bold leading-tight" style={{ color: NAVY }}>
              {form.intro_heading || form.title}
            </h1>
            {form.description && (
              <p className="text-[15px] leading-relaxed mt-3 whitespace-pre-line" style={{ color: "#374151" }}>
                {form.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4 mt-4 text-xs" style={{ color: MID }}>
              {form.closes_at && (
                <span className="flex items-center gap-1.5">
                  <Clock size={12} /> Closes {new Date(form.closes_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                </span>
              )}
              {form.requires_payment && (
                <span className="flex items-center gap-1.5">
                  <CreditCard size={12} /> {form.fee_currency} {form.fee_amount}
                </span>
              )}
            </div>
          </div>

          {autoCount > 0 && (
            <div className="px-6 sm:px-8 py-3 bg-emerald-50 border-b border-emerald-100 flex items-start gap-2">
              <p className="text-sm text-emerald-800">
                We have filled in {autoCount} answer{autoCount === 1 ? "" : "s"} from what you have
                already told us. Check they are right and change anything that has moved on.
              </p>
            </div>
          )}

          {/* An offer, not a gate. Anyone can register from here; an account
              only means the next form is shorter. */}
          {!userId && (
            <div className="px-6 sm:px-8 py-3 border-b border-gray-100"
              style={{ backgroundColor: "#F0F4F8" }}>
              <p className="text-sm" style={{ color: "#374151" }}>
                Carry on and register. If you already have an account,{" "}
                <button type="button" onClick={() => leaveTo("/login")}
                  className="font-semibold underline" style={{ color: NAVY }}>
                  sign in
                </button>{" "}
                or{" "}
                <button type="button" onClick={() => leaveTo("/claim-account")}
                  className="font-semibold underline" style={{ color: NAVY }}>
                  claim it
                </button>{" "}
                and most of this fills itself in. Nothing you have typed is lost.
              </p>
            </div>
          )}

          <form onSubmit={submit} className="px-6 sm:px-8 py-6">
            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-5">
              {fields.map((f) => (
                <Field key={f.id || f.key} field={f} value={values[f.key]}
                  reason={prefillReason(f, context)} onChange={(v) => set(f.key, v)}
                  onBlur={() => maybeRecognise(f, values[f.key])} />
              ))}
            </div>

            {recognised && !dismissed && (
              <div className="mt-5 rounded-xl border px-4 py-3.5"
                style={{ borderColor: "#BFDBFE", backgroundColor: "#EFF6FF" }}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm" style={{ color: "#1E3A8A" }}>
                    {recognised.claimable
                      ? "We already have a record of you from before. Claim your account and this form, and every one after it, fills itself in."
                      : "That already belongs to an account here. Sign in and we will fill the rest in for you."}
                  </p>
                  <button type="button" onClick={() => setDismissed(true)}
                    className="text-xs shrink-0 mt-0.5" style={{ color: MID }}
                    aria-label="Dismiss">
                    Not now
                  </button>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {recognised.claimable ? (
                    <>
                      <button type="button" onClick={() => leaveTo("/claim-account")}
                        className="px-4 py-2 rounded-lg text-white text-sm font-semibold"
                        style={{ backgroundColor: NAVY }}>
                        Claim my account
                      </button>
                      <button type="button" onClick={() => leaveTo("/login")}
                        className="px-4 py-2 rounded-lg text-sm font-semibold border"
                        style={{ borderColor: "#BFDBFE", color: NAVY }}>
                        I already set it up
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => leaveTo("/login")}
                      className="px-4 py-2 rounded-lg text-white text-sm font-semibold"
                      style={{ backgroundColor: NAVY }}>
                      Sign in
                    </button>
                  )}
                </div>
                <p className="text-xs mt-2.5" style={{ color: "#1E40AF" }}>
                  Either way you come straight back here and nothing you have typed is lost.
                </p>
              </div>
            )}

            {error && (
              <p className="mt-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
            )}

            <div className="mt-7 pt-5 border-t border-gray-100 flex items-center gap-3 flex-wrap">
              <button type="submit" disabled={busy}
                className="px-7 py-3 rounded-xl text-white font-semibold disabled:opacity-60"
                style={{ backgroundColor: accent }}>
                {busy ? "Sending your registration..." : "Complete registration"}
              </button>
              {/* Finishing later means coming back to a saved draft, which
                  needs somewhere to save it. A guest has no account, so the
                  button is not offered rather than offered and doing nothing. */}
              {userId && (
                <button type="button" onClick={stash}
                  className="px-5 py-3 rounded-xl font-semibold border border-gray-200"
                  style={{ color: MID }}>
                  Save and finish later
                </button>
              )}
              <span className="text-xs" style={{ color: MID }}>
                {savedAt ? `Saved at ${savedAt}` : `${answered.done} of ${answered.total} answered`}
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── One field ──────────────────────────────────────────────────────────────

function Field({ field, value, reason, onChange, onBlur }) {
  if (field.type === "section") {
    return (
      <div className="sm:col-span-2 pt-3 first:pt-0">
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: NAVY }}>{field.label}</h2>
        <div className="h-px bg-gray-100 mt-2" />
      </div>
    )
  }
  if (field.type === "info") {
    return <p className="sm:col-span-2 text-sm leading-relaxed" style={{ color: "#4B5563" }}>{field.label}</p>
  }

  const span = field.half ? "" : "sm:col-span-2"
  const base = "w-full border rounded-xl px-3.5 py-3 text-[15px] focus:outline-none focus:ring-2 transition-shadow"
  const style = { borderColor: "#D8E1EA", color: "#111827" }

  if (field.type === "checkbox") {
    return (
      <label className={`${span} flex items-start gap-3 cursor-pointer`}>
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 w-4 h-4 shrink-0" style={{ accentColor: NAVY }} />
        <span className="text-[15px] leading-relaxed" style={{ color: "#374151" }}>
          {field.label}{field.required && <span className="text-red-500"> *</span>}
        </span>
      </label>
    )
  }

  return (
    <div className={span}>
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <label className="text-sm font-medium" style={{ color: NAVY }}>
          {field.label}{field.required && <span className="text-red-500"> *</span>}
        </label>
        {reason && (
          <span className="text-[11px] flex items-center gap-1 shrink-0" style={{ color: "#1D9E75" }}>
            <CheckCircle2 size={10} /> {reason}
          </span>
        )}
      </div>

      {field.type === "textarea" ? (
        <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={3}
          placeholder={field.placeholder || ""} className={`${base} resize-y`} style={style} />
      ) : field.type === "select" ? (
        <select value={value || ""} onChange={(e) => onChange(e.target.value)} className={base} style={style}>
          <option value="">Choose one...</option>
          {(field.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : field.type === "multiselect" ? (
        <div className="flex flex-wrap gap-1.5">
          {(field.options || []).map((o) => {
            const on = Array.isArray(value) && value.includes(o)
            return (
              <button key={o} type="button"
                onClick={() => onChange(on ? value.filter((x) => x !== o) : [...(value || []), o])}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                style={on
                  ? { backgroundColor: NAVY, color: "#fff", borderColor: NAVY }
                  : { borderColor: "#D8E1EA", color: MID }}>
                {o}
              </button>
            )
          })}
        </div>
      ) : (
        <input type={field.type === "file" ? "text" : field.type} value={value || ""}
          onChange={(e) => onChange(e.target.value)} onBlur={onBlur}
          placeholder={field.placeholder || ""}
          className={base} style={style} />
      )}

      {field.help && <p className="text-xs mt-1.5" style={{ color: MID }}>{field.help}</p>}
    </div>
  )
}

// ── Done ───────────────────────────────────────────────────────────────────

function Done({ form, result, navigate, onPaid }) {
  const needsPayment = result.paymentStatus === "pending" && form?.requires_payment
  return (
    <div className="min-h-screen w-full py-10 px-4" style={{ backgroundColor: "#F0F4F8" }}>
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <CheckCircle2 size={44} className="mx-auto mb-4" style={{ color: "#1D9E75" }} />
        <h1 className="text-2xl font-bold mb-2" style={{ color: NAVY }}>
          {result.alreadyDecided ? "You have already registered" : "You are registered"}
        </h1>
        <p className="text-[15px] leading-relaxed mb-4" style={{ color: "#4B5563" }}>
          {result.message || "We have your registration."}
        </p>

        {result.reference && (
          <div className="inline-block rounded-xl px-4 py-2.5 mb-5" style={{ backgroundColor: "#F0F4F8" }}>
            <p className="text-[11px] uppercase tracking-wide mb-0.5" style={{ color: MID }}>Your reference</p>
            <p className="font-mono font-bold" style={{ color: NAVY }}>{result.reference}</p>
          </div>
        )}

        {result.status === "waitlisted" && (
          <p className="text-sm rounded-xl px-4 py-3 mb-5 bg-amber-50 border border-amber-200 text-amber-800">
            This programme was full, so you are on the waitlist. We will be in touch if a place opens.
          </p>
        )}

        {needsPayment && <PayNow form={form} result={result} onPaid={onPaid} />}

        {form?.post_submit_note && (
          <p className="text-sm text-left rounded-xl px-4 py-3 mb-5 whitespace-pre-line"
            style={{ backgroundColor: "#F0F4F8", color: "#374151" }}>
            {form.post_submit_note}
          </p>
        )}

        {result.guest && result.claimToken && <GuestReturn result={result} />}

        <div className="flex gap-3 justify-center flex-wrap mt-2">
          {result.guest ? (
            <>
              <button onClick={() => navigate("/sign-up")}
                className="px-5 py-2.5 rounded-xl text-white font-semibold" style={{ backgroundColor: NAVY }}>
                Create an account
              </button>
              <button onClick={() => navigate("/programs")}
                className="px-5 py-2.5 rounded-xl font-semibold border border-gray-200" style={{ color: MID }}>
                Browse programmes
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/my-registrations")}
                className="px-5 py-2.5 rounded-xl text-white font-semibold" style={{ backgroundColor: NAVY }}>
                My registrations
              </button>
              <button onClick={() => navigate("/overview")}
                className="px-5 py-2.5 rounded-xl font-semibold border border-gray-200" style={{ color: MID }}>
                Back to dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Coming back later ──────────────────────────────────────────────────────
//
// The one thing a guest leaves with. A reference on its own reaches nothing,
// so the link carries the token too, and it is offered as something to copy
// rather than only kept in this browser's storage, which they might clear.

function GuestReturn({ result }) {
  const [copied, setCopied] = useState(false)
  const link = `${window.location.origin}${window.location.pathname}?ref=${encodeURIComponent(result.reference)}&t=${encodeURIComponent(result.claimToken)}`

  return (
    <div className="rounded-xl px-4 py-3.5 mb-5 text-left border" style={{ borderColor: "#E5E7EB" }}>
      <p className="text-sm font-semibold mb-1" style={{ color: NAVY }}>
        Keep this link
      </p>
      <p className="text-xs mb-2.5" style={{ color: MID }}>
        It brings you back to this registration to check it or pay, without an account.
        Sign up with the same email and it moves across on its own.
      </p>
      <div className="flex gap-2">
        <input readOnly value={link}
          onFocus={(e) => e.target.select()}
          className="flex-1 min-w-0 text-xs font-mono px-2.5 py-2 rounded-lg border bg-gray-50"
          style={{ borderColor: "#E5E7EB", color: "#4B5563" }} />
        <button type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(link)
              setCopied(true); setTimeout(() => setCopied(false), 2000)
            } catch {
              // Clipboard blocked. The field is selectable, which is the fallback.
            }
          }}
          className="px-3 py-2 rounded-lg text-xs font-semibold text-white shrink-0"
          style={{ backgroundColor: NAVY }}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  )
}

// ── Payment ────────────────────────────────────────────────────────────────

function PayNow({ form, result, onPaid }) {
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState("")
  const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY

  const profile = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}") } catch { return {} }
  })()

  // A guest has no profile to take an email from, so it comes from what they
  // just answered. Paystack refuses a payment without one.
  const guestEmail = (() => {
    const a = result.answers || {}
    return a.email || a.email_address || ""
  })()

  const initialise = usePaystackPayment({
    publicKey: key || "",
    email: profile.email || guestEmail || "",
    amount: Math.round(Number(form.fee_amount || 0) * 100), // Paystack works in the minor unit
    currency: form.fee_currency || "GHS",
    reference: `${result.reference || "REG"}-${Date.now()}`,
  })

  // Card payment is not switched on, so this is what almost everyone sees.
  // What it says comes from the form rather than from here: the old copy
  // promised a payment link that nothing was going to send.
  if (!key) {
    return (
      <div className="rounded-xl px-4 py-3.5 mb-5 bg-amber-50 border border-amber-200 text-left">
        <p className="text-sm text-amber-900">
          Your place is held. {form.fee_currency} {form.fee_amount} is still to pay.
        </p>
        {form.payment_note && (
          <p className="text-sm text-amber-900 mt-2 whitespace-pre-line">{form.payment_note}</p>
        )}
        {form.payment_link_url && (
          <a href={form.payment_link_url} target="_blank" rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold"
            style={{ backgroundColor: "#1D9E75" }}>
            <CreditCard size={15} />
            {form.payment_link_label || `Pay ${form.fee_currency} ${form.fee_amount}`}
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="mb-5">
      <p className="text-sm mb-3" style={{ color: "#4B5563" }}>
        Your place is held. Pay {form.fee_currency} {form.fee_amount} to confirm it.
      </p>
      {/* Still shown when cards work, because momo remains how most of this
          money actually arrives */}
      {form.payment_note && (
        <p className="text-sm mb-3 text-left whitespace-pre-line" style={{ color: "#4B5563" }}>
          {form.payment_note}
        </p>
      )}
      <button
        disabled={paying}
        onClick={() => {
          setError(""); setPaying(true)
          initialise({
            onSuccess: async (ref) => {
              const paid = ref.reference || ref.trxref
              try {
                // A guest settles through their token; markPaid needs a session
                if (result.guest && result.claimToken) {
                  await confirmGuestPayment(result.id, result.claimToken, paid)
                } else {
                  await markPaid(result.id, paid)
                }
                onPaid()
              } catch {
                setError(`Payment went through but we could not record it. Send us this reference: ${paid}`)
              }
              finally { setPaying(false) }
            },
            onClose: () => setPaying(false),
          })
        }}
        className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        style={{ backgroundColor: "#1D9E75" }}
      >
        {paying ? <><Loader2 size={15} className="animate-spin" /> Opening payment...</>
                : <><CreditCard size={15} /> Pay {form.fee_currency} {form.fee_amount}</>}
      </button>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  )
}

function Shell({ children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4" style={{ backgroundColor: "#F0F4F8" }}>
      <div className="text-center max-w-sm">{children}</div>
    </div>
  )
}

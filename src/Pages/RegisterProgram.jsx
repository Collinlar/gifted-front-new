import { useEffect, useMemo, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { usePaystackPayment } from "react-paystack"
import {
  ArrowLeft, CheckCircle2, Sparkles, AlertCircle, Loader2, CreditCard, Clock,
} from "lucide-react"
import {
  getForm, getPrefill, submitRegistration, saveDraft, markPaid,
  initialValue, prefillReason,
} from "../lib/registrationApi"
import { getTokenUserId } from "../lib/auth"

const NAVY = "#003366"
const MID  = "#336699"

export default function RegisterProgram() {
  const { formId } = useParams()
  const navigate = useNavigate()

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
        const [{ form: f }, ctx] = await Promise.all([getForm(formId), getPrefill(formId)])
        if (!alive) return
        if (!f) { setError("That registration form is not available."); return }

        setForm(f)
        setContext(ctx)

        const seeded = {}
        for (const field of f.fields || []) {
          if (field.type === "section" || field.type === "info") continue
          seeded[field.key] = initialValue(field, ctx)
        }
        setValues(seeded)

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
  }, [formId])

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

  const set = (key, v) => { setValues((p) => ({ ...p, [key]: v })); setError("") }

  const stash = async () => {
    if (!userId) return
    try { await saveDraft(formId, userId, values); setSavedAt(new Date().toLocaleTimeString()) }
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
      setResult(await submitRegistration(formId, values))
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

  return (
    <div className="min-h-screen w-full py-8 px-4" style={{ backgroundColor: "#F0F4F8" }}>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium mb-5" style={{ color: MID }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-gray-100">
            {form.program_title && (
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: MID }}>{form.program_title}</p>
            )}
            <h1 className="text-2xl font-bold leading-tight" style={{ color: NAVY }}>{form.title}</h1>
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
              <Sparkles size={15} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-800">
                We have filled in {autoCount} answer{autoCount === 1 ? "" : "s"} from what you have
                already told us. Check they are right and change anything that has moved on.
              </p>
            </div>
          )}

          <form onSubmit={submit} className="px-6 sm:px-8 py-6">
            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-5">
              {fields.map((f) => (
                <Field key={f.id || f.key} field={f} value={values[f.key]}
                  reason={prefillReason(f, context)} onChange={(v) => set(f.key, v)} />
              ))}
            </div>

            {error && (
              <p className="mt-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
            )}

            <div className="mt-7 pt-5 border-t border-gray-100 flex items-center gap-3 flex-wrap">
              <button type="submit" disabled={busy}
                className="px-7 py-3 rounded-xl text-white font-semibold disabled:opacity-60"
                style={{ backgroundColor: NAVY }}>
                {busy ? "Sending your registration..." : "Complete registration"}
              </button>
              <button type="button" onClick={stash}
                className="px-5 py-3 rounded-xl font-semibold border border-gray-200"
                style={{ color: MID }}>
                Save and finish later
              </button>
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

function Field({ field, value, reason, onChange }) {
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
          onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || ""}
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

        <div className="flex gap-3 justify-center flex-wrap mt-2">
          <button onClick={() => navigate("/my-registrations")}
            className="px-5 py-2.5 rounded-xl text-white font-semibold" style={{ backgroundColor: NAVY }}>
            My registrations
          </button>
          <button onClick={() => navigate("/overview")}
            className="px-5 py-2.5 rounded-xl font-semibold border border-gray-200" style={{ color: MID }}>
            Back to dashboard
          </button>
        </div>
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

  const initialise = usePaystackPayment({
    publicKey: key || "",
    email: profile.email || "",
    amount: Math.round(Number(form.fee_amount || 0) * 100), // Paystack works in the minor unit
    currency: form.fee_currency || "GHS",
    reference: `${result.reference || "REG"}-${Date.now()}`,
  })

  if (!key) {
    return (
      <p className="text-sm rounded-xl px-4 py-3 mb-5 bg-amber-50 border border-amber-200 text-amber-800">
        Your place is held. Payment of {form.fee_currency} {form.fee_amount} is still due, and we
        will send you a link to pay.
      </p>
    )
  }

  return (
    <div className="mb-5">
      <p className="text-sm mb-3" style={{ color: "#4B5563" }}>
        Your place is held. Pay {form.fee_currency} {form.fee_amount} to confirm it.
      </p>
      <button
        disabled={paying}
        onClick={() => {
          setError(""); setPaying(true)
          initialise({
            onSuccess: async (ref) => {
              try { await markPaid(result.id, ref.reference || ref.trxref); onPaid() }
              catch { setError("Payment went through but we could not record it. Contact us with your reference.") }
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

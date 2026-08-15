import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ClipboardList, Clock, CheckCircle2, XCircle, CreditCard,
  ArrowRight, AlertCircle, Hourglass,
} from "lucide-react"
import { usePaystackPayment } from "react-paystack"
import { getMyRegistrations, getOpenFormsForMe, markPaid } from "../lib/registrationApi"

const NAVY = "#003366"
const MID  = "#336699"

// Each status says what it means for the student and what, if anything, they
// need to do. A bare label like "submitted" leaves them guessing.
const STATUS = {
  draft: {
    label: "Not finished", tone: "#6B7280", bg: "#F3F4F6",
    line: "You started this but have not sent it yet.", Icon: Hourglass,
  },
  submitted: {
    label: "Received", tone: "#1D4ED8", bg: "#EFF6FF",
    line: "We have your registration and will review it.", Icon: CheckCircle2,
  },
  under_review: {
    label: "Being reviewed", tone: "#B45309", bg: "#FFFBEB",
    line: "Your entry is with the team.", Icon: Hourglass,
  },
  accepted: {
    label: "Accepted", tone: "#047857", bg: "#ECFDF5",
    line: "You have a place. Watch for details of what happens next.", Icon: CheckCircle2,
  },
  waitlisted: {
    label: "Waitlisted", tone: "#6D28D9", bg: "#F5F3FF",
    line: "The programme was full. We will be in touch if a place opens.", Icon: Clock,
  },
  rejected: {
    label: "Not accepted", tone: "#B91C1C", bg: "#FEF2F2",
    line: "You were not placed this time.", Icon: XCircle,
  },
  withdrawn: {
    label: "Withdrawn", tone: "#6B7280", bg: "#F3F4F6",
    line: "This registration was withdrawn.", Icon: XCircle,
  },
}

export default function MyRegistrations() {
  const navigate = useNavigate()
  const [regs, setRegs] = useState([])
  const [open, setOpen] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [nonce, setNonce] = useState(0)
  const reload = () => setNonce((n) => n + 1)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const profile = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}") } catch { return {} } })()
        const [mine, forms] = await Promise.all([
          getMyRegistrations(),
          getOpenFormsForMe(profile.grade || profile.Grade),
        ])
        if (!alive) return
        setRegs(mine.registrations)
        setOpen(forms.forms)
      } catch (e) {
        if (alive) setError(e.message || "Could not load your registrations.")
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [nonce])

  // Anything open they have not already entered
  const registeredIds = new Set(regs.map((r) => r.form_id))
  const available = open.filter((f) => !registeredIds.has(f.id))

  const needsAction = regs.filter(
    (r) => r.status === "draft" || (r.payment_status === "pending" && r.status !== "rejected")
  )

  return (
    <div className="min-h-screen w-full py-8 px-4" style={{ backgroundColor: "#F0F4F8" }}>
      <div className="max-w-3xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>My registrations</h1>
          <p className="text-sm mt-1" style={{ color: MID }}>
            Every programme you have entered, and where each one stands.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
        )}

        {needsAction.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-sm font-semibold text-amber-900 flex items-center gap-2">
              <AlertCircle size={15} /> {needsAction.length} thing{needsAction.length === 1 ? "" : "s"} need your attention
            </p>
            <ul className="mt-2 space-y-1">
              {needsAction.map((r) => (
                <li key={r.id} className="text-sm text-amber-800">
                  {r.registration_forms?.title || "A programme"}
                  {r.status === "draft" ? " — not sent yet" : " — payment still due"}
                </li>
              ))}
            </ul>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-center py-10" style={{ color: MID }}>Loading your registrations...</p>
        ) : regs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-14 text-center">
            <ClipboardList size={30} className="mx-auto mb-3" style={{ color: "#9CA3AF" }} />
            <p className="text-sm" style={{ color: MID }}>You have not registered for anything yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {regs.map((r) => {
              const meta = STATUS[r.status] || STATUS.submitted
              const Icon = meta.Icon
              const form = r.registration_forms || {}
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="min-w-0">
                        {form.program_title && (
                          <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: MID }}>
                            {form.program_title}
                          </p>
                        )}
                        <p className="font-semibold" style={{ color: NAVY }}>{form.title || "Programme"}</p>
                        {r.reference && (
                          <p className="text-xs font-mono mt-1" style={{ color: "#9CA3AF" }}>{r.reference}</p>
                        )}
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5"
                        style={{ backgroundColor: meta.bg, color: meta.tone }}>
                        <Icon size={12} /> {meta.label}
                      </span>
                    </div>

                    <p className="text-sm mt-2.5" style={{ color: "#4B5563" }}>{meta.line}</p>

                    {r.payment_status === "pending" && (
                      <PayRow registration={r} form={form} onPaid={reload} />
                    )}

                    {r.status === "draft" && (
                      <button onClick={() => navigate(`/register/${r.form_id}`)}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold"
                        style={{ color: NAVY }}>
                        Finish this registration <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {available.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: MID }}>
              Open for registration
            </h2>
            <div className="space-y-2">
              {available.map((f) => (
                <button key={f.id} onClick={() => navigate(`/register/${f.slug || f.id}`)}
                  className="w-full bg-white rounded-2xl border border-gray-100 px-5 py-4 text-left hover:shadow-md transition-shadow flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold" style={{ color: NAVY }}>{f.title}</p>
                    <div className="flex flex-wrap gap-3 text-xs mt-1" style={{ color: MID }}>
                      {f.closes_at && (
                        <span>Closes {new Date(f.closes_at).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                      )}
                      {f.requires_payment && <span>{f.fee_currency} {f.fee_amount}</span>}
                    </div>
                  </div>
                  <ArrowRight size={17} className="shrink-0" style={{ color: MID }} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Paying what is owed ────────────────────────────────────────────────────
//
// Payment used to be offered only on the confirmation screen, so anyone who
// navigated away had no route back to it. This is that route.

function PayRow({ registration: r, form, onPaid }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
  const profile = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}") } catch { return {} } })()

  const initialise = usePaystackPayment({
    publicKey: key || "",
    email: profile.email || "",
    amount: Math.round(Number(r.amount || 0) * 100),   // Paystack works in the minor unit
    currency: form.fee_currency || "GHS",
    reference: `${r.reference || "REG"}-${Date.now()}`,
  })

  return (
    <div className="mt-3 rounded-lg px-3 py-2.5 bg-amber-50 border border-amber-200">
      <div className="flex items-center gap-2 mb-2">
        <CreditCard size={14} className="text-amber-600 shrink-0" />
        <span className="text-sm text-amber-800">
          {form.fee_currency || "GHS"} {r.amount} still to pay
        </span>
      </div>

      {key ? (
        <button
          disabled={busy}
          onClick={() => {
            setError(""); setBusy(true)
            initialise({
              onSuccess: async (ref) => {
                try { await markPaid(r.id, ref.reference || ref.trxref); onPaid() }
                catch { setError("Payment went through but we could not record it. Contact us with your reference.") }
                finally { setBusy(false) }
              },
              onClose: () => setBusy(false),
            })
          }}
          className="text-sm font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-60"
          style={{ backgroundColor: "#1D9E75" }}
        >
          {busy ? "Opening payment..." : `Pay ${form.fee_currency || "GHS"} ${r.amount}`}
        </button>
      ) : (
        <p className="text-xs text-amber-800">
          Your place is held. We will send you payment details.
        </p>
      )}

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  )
}

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ClipboardList, ArrowRight, Clock, CreditCard, AlertCircle } from "lucide-react"
import { getOpenFormsForMe, getMyRegistrations } from "../lib/registrationApi"

const NAVY = "#003366"
const MID  = "#336699"

// Dashboard strip of programmes currently taking registrations.
//
// Renders nothing when there is nothing open or the student has already entered
// everything, so it never becomes permanent furniture on the dashboard.
export default function OpenRegistrations() {
  const navigate = useNavigate()
  const [forms, setForms] = useState([])
  const [unfinished, setUnfinished] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        // Only what this student's grade is meant to see
        const profile = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}") } catch { return {} } })()
        const [open, mine] = await Promise.all([
          getOpenFormsForMe(profile.grade || profile.Grade),
          getMyRegistrations(),
        ])
        if (!alive) return

        const entered = new Set(mine.registrations.map((r) => r.form_id))
        setForms(open.forms.filter((f) => !entered.has(f.id)))
        setUnfinished(mine.registrations.filter((r) => r.status === "draft"))
      } catch {
        if (alive) { setForms([]); setUnfinished([]) }
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  if (loading || (forms.length === 0 && unfinished.length === 0)) return null

  const daysLeft = (iso) => {
    if (!iso) return null
    const d = Math.ceil((new Date(iso) - Date.now()) / 86400000)
    return d < 0 ? null : d
  }

  return (
    <div className="mb-10">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold" style={{ color: NAVY }}>Open for registration</h2>
        <button onClick={() => navigate("/my-registrations")}
          className="text-sm font-medium hover:underline" style={{ color: MID }}>
          My registrations
        </button>
      </div>

      {unfinished.length > 0 && (
        <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-semibold text-amber-900 flex items-center gap-2 mb-2">
            <AlertCircle size={15} />
            You started {unfinished.length} registration{unfinished.length === 1 ? "" : "s"} without finishing
          </p>
          <div className="space-y-1.5">
            {unfinished.map((r) => (
              <button key={r.id} onClick={() => navigate(`/register/${r.form_id}`)}
                className="flex items-center gap-1.5 text-sm text-amber-800 hover:underline">
                {r.registration_forms?.title || "A programme"} <ArrowRight size={13} />
              </button>
            ))}
          </div>
        </div>
      )}

      {forms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((f) => {
            const days = daysLeft(f.closes_at)
            const accent = f.accent_color || NAVY
            return (
              <button key={f.id} onClick={() => navigate(`/register/${f.slug || f.id}`)}
                className="group text-left rounded-2xl bg-white border overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
                style={{ borderColor: "#E5E7EB" }}>
                {f.cover_image_url ? (
                  <img src={f.cover_image_url} alt="" className="w-full h-24 object-cover"
                    onError={(e) => { e.target.style.display = "none" }} />
                ) : (
                  <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${accent}1A` }}>
                      <ClipboardList size={18} style={{ color: accent }} />
                    </div>
                    {days !== null && days <= 7 && (
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: days <= 2 ? "#DC2626" : "#E8A020" }}>
                        {days === 0 ? "Closes today" : `${days} day${days === 1 ? "" : "s"} left`}
                      </span>
                    )}
                  </div>

                  {f.program_title && (
                    <p className="text-[11px] uppercase tracking-wide mb-0.5" style={{ color: accent }}>
                      {f.program_title}
                    </p>
                  )}
                  <p className="font-semibold mb-2 leading-snug" style={{ color: NAVY }}>{f.title}</p>

                  <div className="flex flex-wrap gap-3 text-xs mb-3" style={{ color: "#6B7280" }}>
                    {f.closes_at && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {new Date(f.closes_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                      </span>
                    )}
                    {f.requires_payment && (
                      <span className="flex items-center gap-1">
                        <CreditCard size={11} /> {f.fee_currency} {f.fee_amount}
                      </span>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: accent }}>
                    Register <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

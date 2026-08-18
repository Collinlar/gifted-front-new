import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Trophy, Search, CalendarDays, ArrowRight, CheckCircle2, Clock, X, Info,
} from "lucide-react"
import { getAllCompetitions } from "../lib/api"
import { getOpenForms, getMyRegistrations } from "../lib/registrationApi"
import { A, shortDate, daysUntil } from "../lib/appTheme"
import { Page, PageHead, FilterRow, Empty, Notice, Btn } from "../Components/common/PageShell"

// The competitions catalogue.
//
// Three things were wrong with the page this replaces.
//
// Every card read "Start: TBD / End: TBD". The competitions table stores
// start_date and end_date; the page read startDate and EndDate, which do not
// exist on the row, so the formatter fell through to its fallback every time.
//
// Titles were built as `${name}-${year}`, which is why the screen showed
// "IGeo Ghana-2025" with a hyphen jammed against the year.
//
// And "Register Now" pushed into /subitem/:name, the old invoice flow, not
// the registration forms. So the one action on the page went somewhere that
// no longer takes registrations. It now resolves the competition's open form
// and goes there, and says plainly when there is no open form to go to.

export default function Programs() {
  const navigate = useNavigate()

  const [comps, setComps]   = useState([])
  const [forms, setForms]   = useState([])
  const [mine, setMine]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState("")
  const [search, setSearch] = useState("")
  const [when, setWhen]     = useState("all")
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      // Competitions are the page. Forms and registrations only decorate it,
      // so a signed-out visitor still sees the catalogue.
      const [c, f, r] = await Promise.allSettled([
        getAllCompetitions(), getOpenForms(), getMyRegistrations(),
      ])
      if (!alive) return

      if (c.status === "fulfilled") setComps(c.value.AllCompetitions || [])
      else setError(c.reason?.message || "We could not load the programmes.")

      if (f.status === "fulfilled") setForms(f.value.forms)
      if (r.status === "fulfilled") setMine(r.value.registrations)

      setLoading(false)
    })()
    return () => { alive = false }
  }, [])

  // A competition's intake is matched on program_id first, then on title,
  // because forms built before the picker existed only carry the title.
  const formFor = useMemo(() => {
    const byId    = new Map()
    const byTitle = new Map()
    forms.forEach((f) => {
      if (f.program_id) byId.set(f.program_id, f)
      if (f.program_title) byTitle.set(norm(f.program_title), f)
    })
    return (c) => byId.get(c.id) || byTitle.get(norm(c.name)) || null
  }, [forms])

  const registeredForm = useMemo(
    () => new Set(mine.filter((r) => r.status !== "draft").map((r) => r.form_id)),
    [mine]
  )

  const rows = useMemo(() => comps.map((c) => {
    const form = formFor(c)
    const start = c.start_date || null
    const end   = c.end_date || null
    return {
      ...c,
      start, end,
      form,
      entered: form ? registeredForm.has(form.id) : false,
      closes: form?.closes_at || null,
      upcoming: start ? new Date(start) >= new Date(new Date().toDateString()) : false,
    }
  }), [comps, formFor, registeredForm])

  const q = search.trim().toLowerCase()
  const shown = rows.filter((c) => {
    if (q && ![c.name, c.description, c.type].filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q))) return false
    if (when === "open")     return !!c.form && !c.entered
    if (when === "mine")     return c.entered
    if (when === "upcoming") return c.upcoming
    return true
  })

  const counts = {
    all: rows.length,
    open: rows.filter((c) => c.form && !c.entered).length,
    mine: rows.filter((c) => c.entered).length,
    upcoming: rows.filter((c) => c.upcoming).length,
  }

  return (
    <Page wide>
      <PageHead
        title="Programmes and competitions"
        sub="Every olympiad and competition we run. Registration opens on the card when it opens."
        actions={<Btn variant="secondary" onClick={() => navigate("/my-registrations")}>My registrations</Btn>}
      />

      {error && <Notice tone="bad">{error}</Notice>}

      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: A.subtle }} />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search programmes"
          className="w-full pl-11 pr-10 rounded-xl border bg-white text-base focus:outline-none"
          style={{ borderColor: A.line, color: A.ink, height: 48 }}
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
            aria-label="Clear search">
            <X size={16} style={{ color: A.subtle }} />
          </button>
        )}
      </div>

      <FilterRow
        className="mb-6"
        value={when} onChange={setWhen}
        options={[
          { value: "all",      label: "Everything",     count: counts.all },
          { value: "open",     label: "Open now",       count: counts.open },
          { value: "mine",     label: "I'm entered",    count: counts.mine },
          { value: "upcoming", label: "Coming up",      count: counts.upcoming },
        ]}
      />

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border p-5 space-y-3" style={{ borderColor: A.line }}>
              <div className="h-5 w-3/4 rounded animate-pulse" style={{ backgroundColor: A.lineSoft }} />
              <div className="h-3.5 rounded animate-pulse" style={{ backgroundColor: A.lineSoft }} />
              <div className="h-9 rounded-xl animate-pulse" style={{ backgroundColor: A.lineSoft }} />
            </div>
          ))}
        </div>
      ) : shown.length === 0 ? (
        <Empty
          icon={Trophy}
          title={q ? "Nothing matches that" : when === "mine" ? "You have not entered anything yet" : "Nothing here right now"}
          line={when === "mine"
            ? "Programmes you enter show up here so you can find them again."
            : "Try clearing the filter."}
          action={(q || when !== "all") && (
            <Btn variant="secondary" onClick={() => { setSearch(""); setWhen("all") }}>Show everything</Btn>
          )}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((c) => (
            <ProgramCard key={c.id} program={c} onOpen={() => setDetail(c)}
              onRegister={() => navigate(`/register/${c.form.slug || c.form.id}`)} />
          ))}
        </div>
      )}

      {detail && (
        <DetailSheet program={detail} onClose={() => setDetail(null)}
          onRegister={() => navigate(`/register/${detail.form.slug || detail.form.id}`)} />
      )}
    </Page>
  )
}

const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "")

// ── One competition ────────────────────────────────────────────────────────

function ProgramCard({ program: c, onOpen, onRegister }) {
  const left = daysUntil(c.closes)

  return (
    <div className="rounded-2xl bg-white border overflow-hidden flex flex-col transition-shadow hover:shadow-lg"
      style={{ borderColor: A.line }}>

      {c.image ? (
        <button onClick={onOpen} className="block w-full">
          <div className="aspect-[16/7] overflow-hidden" style={{ backgroundColor: A.lineSoft }}>
            <img src={c.image} alt="" loading="lazy" className="w-full h-full object-cover"
              onError={(e) => { e.target.parentElement.style.display = "none" }} />
          </div>
        </button>
      ) : (
        <div className="h-1.5 w-full" style={{ backgroundColor: c.entered ? A.green : A.navy }} />
      )}

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          {/* The year is its own line rather than glued to the title with a
              hyphen, which is what produced "IGeo Ghana-2025" on screen. */}
          <div className="min-w-0">
            {c.year && (
              <p className="text-[11px] uppercase tracking-wide" style={{ color: A.accent }}>
                {c.type ? `${c.type} · ${c.year}` : c.year}
              </p>
            )}
            <button onClick={onOpen} className="text-left">
              <h3 className="font-semibold leading-snug" style={{ color: A.navy }}>{c.name}</h3>
            </button>
          </div>

          {c.entered && (
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md flex items-center gap-1"
              style={{ backgroundColor: A.greenSoft, color: A.green }}>
              <CheckCircle2 size={10} /> Entered
            </span>
          )}
        </div>

        {(c.start || c.end) && (
          <p className="text-xs flex items-center gap-1.5 mb-3" style={{ color: A.mid }}>
            <CalendarDays size={12} />
            {c.start && c.end
              ? `${shortDate(c.start)} to ${shortDate(c.end)}`
              : shortDate(c.start || c.end)}
          </p>
        )}

        {c.description && (
          <p className="text-xs line-clamp-2 mb-4" style={{ color: A.muted }}>{c.description}</p>
        )}

        <div className="mt-auto">
          {c.entered ? (
            <Btn size="sm" variant="secondary" full onClick={onOpen}>See the details</Btn>
          ) : c.form ? (
            <>
              <Btn size="sm" full onClick={onRegister}>
                Register for this <ArrowRight size={14} />
              </Btn>
              {left !== null && left >= 0 && left <= 14 && (
                <p className="text-xs mt-2 flex items-center gap-1 font-medium"
                  style={{ color: left <= 3 ? A.red : A.amber }}>
                  <Clock size={11} />
                  {left === 0 ? "Registration closes today" : `${left} day${left === 1 ? "" : "s"} left to register`}
                </p>
              )}
            </>
          ) : (
            // Honest rather than a button that goes nowhere. This is the state
            // the old page hid behind a Register Now on every single card.
            <Btn size="sm" variant="secondary" full onClick={onOpen}>
              <Info size={14} /> Registration not open yet
            </Btn>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Detail ─────────────────────────────────────────────────────────────────

function DetailSheet({ program: c, onClose, onRegister }) {
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", esc)
    document.body.style.overflow = "hidden"
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = "" }
  }, [onClose])

  const subTypes = Array.isArray(c.sub_types) ? c.sub_types : []
  const costs = [
    ["Materials",   c.material_cost],
    ["Assessment",  c.assessment_cost],
  ].filter(([, v]) => v !== null && v !== undefined && v !== "")

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: "rgba(8,24,42,0.45)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[92vh] flex flex-col">

        <div className="flex items-start justify-between gap-3 px-5 sm:px-6 py-4 border-b shrink-0"
          style={{ borderColor: A.line }}>
          <div className="min-w-0">
            {c.year && <p className="text-[11px] uppercase tracking-wide" style={{ color: A.accent }}>
              {c.type ? `${c.type} · ${c.year}` : c.year}
            </p>}
            <h2 className="text-xl font-bold leading-tight" style={{ color: A.navy }}>{c.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 shrink-0" aria-label="Close">
            <X size={18} style={{ color: A.mid }} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 sm:px-6 py-5 space-y-5">
          {(c.start || c.end) && (
            <div className="flex items-center gap-2 text-sm" style={{ color: A.muted }}>
              <CalendarDays size={15} style={{ color: A.mid }} />
              {c.start && c.end
                ? `${shortDate(c.start)} to ${shortDate(c.end)}`
                : shortDate(c.start || c.end)}
            </div>
          )}

          {c.description && (
            <p className="text-sm whitespace-pre-line" style={{ color: A.muted, lineHeight: 1.65 }}>
              {c.description}
            </p>
          )}

          {subTypes.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: A.mid }}>Rounds</h3>
              <div className="space-y-1.5">
                {subTypes.map((s, i) => (
                  <div key={i} className="flex justify-between text-sm rounded-lg px-3 py-2"
                    style={{ backgroundColor: A.lineSoft }}>
                    <span style={{ color: A.navy }}>{s.type || s.name || `Round ${i + 1}`}</span>
                    <span style={{ color: A.mid }}>
                      {shortDate(s.startDate || s.start_date) || "Date to come"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {costs.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: A.mid }}>Costs</h3>
              <div className="space-y-1.5">
                {costs.map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span style={{ color: A.muted }}>{label}</span>
                    <span className="font-medium" style={{ color: A.navy }}>
                      {Number(value) === 0 ? "Free" : `GH₵${value}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t px-5 sm:px-6 py-4 shrink-0" style={{ borderColor: A.line }}>
          {c.entered ? (
            <p className="text-sm flex items-center gap-2" style={{ color: A.green }}>
              <CheckCircle2 size={15} /> You are entered for this one.
            </p>
          ) : c.form ? (
            <Btn full onClick={onRegister}>Register for this <ArrowRight size={15} /></Btn>
          ) : (
            <p className="text-sm" style={{ color: A.mid }}>
              Registration is not open yet. It will appear here and on your dashboard when it opens.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ChevronLeft, ChevronRight, CalendarDays, Trophy, ClipboardList,
  Flag, CircleDot, ArrowRight, Loader2,
} from "lucide-react"
import { getAllCompetitions } from "../lib/api"
import { getOpenForms, getMyRegistrations } from "../lib/registrationApi"
import { A, shortDate, daysUntil } from "../lib/appTheme"
import { Page, PageHead, FilterRow, Empty, Notice, Btn } from "../Components/common/PageShell"

// The calendar.
//
// What this replaced was react-big-calendar with its stock stylesheet, a
// centred "📆 All Events Calendar" heading, and competitions as the only
// source. A student's actual deadlines, the dates registrations close, were
// nowhere on it, which is the one thing a calendar in this product is for.
//
// The library is gone. Its default CSS fought the rest of the app, and a
// month grid that only needs to show a few dots per day does not need three
// hundred kilobytes of drag-and-drop scheduling to draw it.
//
// Two views on purpose. The grid answers "what does this month look like".
// The agenda answers "what is next", which is the question people actually
// arrive with, so it is the one that loads first on a phone.

const KINDS = {
  competition: { label: "Competitions", color: A.navy,  Icon: Trophy },
  round:       { label: "Rounds",       color: A.accent, Icon: CircleDot },
  deadline:    { label: "Deadlines",    color: A.gold,  Icon: Flag },
  mine:        { label: "Mine",         color: A.green, Icon: ClipboardList },
}

const DAY_MS = 86400000
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const keyOf = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

export default function Calendar() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cursor, setCursor] = useState(() => startOfDay(new Date()))
  const [selected, setSelected] = useState(null)
  const [kind, setKind] = useState(null)
  // The agenda is the default because "what is coming up" is why people open
  // this. The grid is one tap away for anyone who thinks in months.
  const [view, setView] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 768 ? "agenda" : "month")

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [c, f, r] = await Promise.allSettled([
        getAllCompetitions(), getOpenForms(), getMyRegistrations(),
      ])
      if (!alive) return

      const out = []

      if (c.status === "fulfilled") {
        (c.value.AllCompetitions || []).forEach((comp) => {
          if (comp.start_date) {
            out.push({
              id: `c-${comp.id}`, kind: "competition", title: comp.name,
              date: new Date(comp.start_date),
              end: comp.end_date ? new Date(comp.end_date) : null,
              detail: comp.description, go: () => navigate("/programs"),
            })
          }
          // Rounds carry their own dates and are the ones a student actually
          // has to turn up for, so they are events in their own right
          ;(Array.isArray(comp.sub_types) ? comp.sub_types : []).forEach((s, i) => {
            const raw = s.startDate || s.start_date
            if (!raw) return
            out.push({
              id: `c-${comp.id}-s-${i}`, kind: "round",
              title: `${comp.name} — ${s.type || s.name || `Round ${i + 1}`}`,
              date: new Date(raw), end: null,
              detail: comp.name, go: () => navigate("/programs"),
            })
          })
        })
      } else {
        setError(c.reason?.message || "We could not load the programme dates.")
      }

      const entered = new Set()
      if (r.status === "fulfilled") {
        r.value.registrations.forEach((reg) => {
          entered.add(reg.form_id)
        })
      }

      if (f.status === "fulfilled") {
        f.value.forms.forEach((form) => {
          if (!form.closes_at) return
          const isMine = entered.has(form.id)
          out.push({
            id: `f-${form.id}`,
            // Something already entered is not a deadline any more, it is a
            // commitment, so it stops shouting in gold
            kind: isMine ? "mine" : "deadline",
            title: isMine
              ? `${form.title} — you are entered`
              : `${form.title} — registration closes`,
            date: new Date(form.closes_at), end: null,
            detail: form.program_title,
            go: () => navigate(isMine ? "/my-registrations" : `/register/${form.slug || form.id}`),
            cta: isMine ? "See my registration" : "Register now",
          })
        })
      }

      out.sort((a, b) => a.date - b.date)
      setEvents(out.filter((e) => !Number.isNaN(e.date.getTime())))
      setLoading(false)
    })()
    return () => { alive = false }
  }, [navigate])

  const filtered = kind ? events.filter((e) => e.kind === kind) : events

  const byDay = useMemo(() => {
    const m = new Map()
    filtered.forEach((e) => {
      // A multi-day competition shows on every day it runs, capped so one bad
      // end date cannot paint the whole year
      const last = e.end && e.end > e.date ? e.end : e.date
      const span = Math.min(Math.floor((startOfDay(last) - startOfDay(e.date)) / DAY_MS), 30)
      for (let i = 0; i <= span; i++) {
        const d = new Date(e.date.getTime() + i * DAY_MS)
        const k = keyOf(d)
        if (!m.has(k)) m.set(k, [])
        m.get(k).push(e)
      }
    })
    return m
  }, [filtered])

  const upcoming = useMemo(() => {
    const today = startOfDay(new Date())
    return filtered.filter((e) => (e.end || e.date) >= today).slice(0, 40)
  }, [filtered])

  const counts = {}
  events.forEach((e) => { counts[e.kind] = (counts[e.kind] || 0) + 1 })

  const selectedEvents = selected ? (byDay.get(keyOf(selected)) || []) : []

  return (
    <Page wide>
      <PageHead
        title="Calendar"
        sub="Competition dates, the rounds inside them, and when registrations close."
        actions={
          <div className="flex gap-1 p-1 rounded-xl border" style={{ borderColor: A.line, backgroundColor: A.surface }}>
            {["agenda", "month"].map((v) => (
              <button key={v} onClick={() => setView(v)}
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={view === v
                  ? { backgroundColor: A.navy, color: "#fff" }
                  : { color: A.mid }}>
                {v === "agenda" ? "What's next" : "Month"}
              </button>
            ))}
          </div>
        }
      />

      {error && <Notice tone="bad">{error}</Notice>}

      <FilterRow
        className="mb-5"
        value={kind} onChange={(k) => { setKind(k); setSelected(null) }}
        options={[
          { value: null, label: "Everything", count: events.length },
          ...Object.entries(KINDS)
            .filter(([k]) => counts[k])
            .map(([k, v]) => ({ value: k, label: v.label, count: counts[k] })),
        ]}
      />

      {loading ? (
        <div className="flex items-center gap-2 justify-center py-20 text-sm" style={{ color: A.mid }}>
          <Loader2 size={16} className="animate-spin" /> Gathering the dates...
        </div>
      ) : events.length === 0 ? (
        <Empty icon={CalendarDays} title="Nothing scheduled yet"
          line="Competition dates and registration deadlines appear here as they are set." />
      ) : view === "month" ? (
        <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
          <MonthGrid cursor={cursor} setCursor={setCursor} byDay={byDay}
            selected={selected} setSelected={setSelected} />
          <DayPanel date={selected} events={selectedEvents} />
        </div>
      ) : (
        <Agenda events={upcoming} />
      )}
    </Page>
  )
}

// ── Month grid ─────────────────────────────────────────────────────────────

function MonthGrid({ cursor, setCursor, byDay, selected, setSelected }) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  // Monday first. A week that starts on Sunday reads wrong to almost everyone
  // filling in a school timetable.
  const lead = (first.getDay() + 6) % 7
  const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
  const today = startOfDay(new Date())

  const cells = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: days }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1)),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const step = (n) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1))

  return (
    <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: A.line }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: A.line }}>
        <button onClick={() => step(-1)} className="p-2 rounded-lg" aria-label="Previous month">
          <ChevronLeft size={17} style={{ color: A.mid }} />
        </button>
        <div className="text-center">
          <p className="font-bold" style={{ color: A.navy }}>
            {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </p>
          {!sameDay(cursor, today) && (
            <button onClick={() => setCursor(startOfDay(new Date()))}
              className="text-xs" style={{ color: A.accent }}>
              Back to today
            </button>
          )}
        </div>
        <button onClick={() => step(1)} className="p-2 rounded-lg" aria-label="Next month">
          <ChevronRight size={17} style={{ color: A.mid }} />
        </button>
      </div>

      <div className="grid grid-cols-7 border-b" style={{ borderColor: A.line }}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="text-center text-[11px] font-semibold py-2" style={{ color: A.subtle }}>
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="aspect-square" style={{ backgroundColor: A.lineSoft }} />
          const list = byDay.get(keyOf(d)) || []
          const isToday = sameDay(d, today)
          const isSel = selected && sameDay(d, selected)

          return (
            <button key={i} onClick={() => setSelected(isSel ? null : d)}
              className="aspect-square border-r border-b p-1.5 flex flex-col items-center justify-start relative transition-colors"
              style={{
                borderColor: A.lineSoft,
                backgroundColor: isSel ? A.navy : "transparent",
              }}>
              <span className="text-sm font-medium grid place-items-center w-7 h-7 rounded-full"
                style={{
                  color: isSel ? "#fff" : isToday ? "#fff" : A.ink,
                  backgroundColor: !isSel && isToday ? A.accent : "transparent",
                }}>
                {d.getDate()}
              </span>

              {list.length > 0 && (
                <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                  {/* Three dots then a count. Six dots on a phone cell is a
                      smudge, not information. */}
                  {[...new Set(list.map((e) => e.kind))].slice(0, 3).map((k) => (
                    <span key={k} className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: isSel ? "#fff" : KINDS[k].color }} />
                  ))}
                  {list.length > 3 && (
                    <span className="text-[9px] leading-none self-center"
                      style={{ color: isSel ? "#fff" : A.subtle }}>+{list.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DayPanel({ date, events }) {
  if (!date) {
    return (
      <div className="bg-white rounded-2xl border p-6 text-center" style={{ borderColor: A.line }}>
        <CalendarDays size={22} className="mx-auto mb-2" style={{ color: A.subtle }} />
        <p className="text-sm" style={{ color: A.mid }}>Tap a day to see what is on it.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border overflow-hidden lg:sticky lg:top-6" style={{ borderColor: A.line }}>
      <div className="px-5 py-3.5 border-b" style={{ borderColor: A.line }}>
        <p className="font-bold" style={{ color: A.navy }}>
          {date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>
      {events.length === 0 ? (
        <p className="text-sm px-5 py-8 text-center" style={{ color: A.subtle }}>Nothing on this day.</p>
      ) : (
        <div className="p-3 space-y-2">
          {events.map((e) => <EventRow key={e.id} event={e} compact />)}
        </div>
      )}
    </div>
  )
}

// ── Agenda ─────────────────────────────────────────────────────────────────

function Agenda({ events }) {
  if (events.length === 0) {
    return <Empty icon={CalendarDays} title="Nothing coming up"
      line="Once dates are set for the next round of programmes they will show here." />
  }

  // Grouped by month so a long list stays navigable by eye
  const groups = []
  events.forEach((e) => {
    const label = e.date.toLocaleDateString(undefined, { month: "long", year: "numeric" })
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.items.push(e)
    else groups.push({ label, items: [e] })
  })

  return (
    <div className="space-y-6 max-w-3xl">
      {groups.map((g) => (
        <div key={g.label}>
          <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: A.mid }}>
            {g.label}
          </h2>
          <div className="space-y-2.5">
            {g.items.map((e) => <EventRow key={e.id} event={e} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

function EventRow({ event: e, compact }) {
  const { color, Icon } = KINDS[e.kind]
  const left = daysUntil(e.date)
  const soon = left !== null && left >= 0 && left <= 7

  return (
    <button onClick={e.go}
      className="w-full text-left bg-white rounded-xl border p-3.5 flex gap-3 items-start hover:shadow-md transition-shadow"
      style={{ borderColor: A.line, borderLeftWidth: 3, borderLeftColor: color }}>

      {!compact && (
        <div className="w-11 shrink-0 text-center">
          <p className="text-[10px] uppercase font-semibold" style={{ color: A.subtle }}>
            {e.date.toLocaleDateString(undefined, { month: "short" })}
          </p>
          <p className="text-lg font-bold leading-none" style={{ color: A.navy }}>{e.date.getDate()}</p>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Icon size={11} style={{ color }} />
          <span className="text-[10px] uppercase tracking-wide font-semibold" style={{ color }}>
            {KINDS[e.kind].label}
          </span>
        </div>
        <p className="text-sm font-semibold leading-snug" style={{ color: A.navy }}>{e.title}</p>
        {e.end && e.end > e.date && (
          <p className="text-xs mt-0.5" style={{ color: A.subtle }}>Runs to {shortDate(e.end)}</p>
        )}
        {soon && (
          <p className="text-xs mt-1 font-medium" style={{ color: left <= 2 ? A.red : A.amber }}>
            {left === 0 ? "Today" : left === 1 ? "Tomorrow" : `In ${left} days`}
          </p>
        )}
      </div>

      <ArrowRight size={15} className="shrink-0 mt-1" style={{ color: A.subtle }} />
    </button>
  )
}

import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Trophy, Tent, ClipboardCheck, BookOpen,
  TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp,
  Calendar, MapPin, CheckCircle, Clock, ArrowRight,
} from "lucide-react"
import { getUserHistory } from "../lib/api"
import { getTokenUserId } from "../lib/auth"

const brandColors = {
  primary: "#003366",
  secondary: "#336699",
  teal: "#1D9E75",
  gold: "#E8A020",
  background: "#F0F4F8",
  border: "#E5E7EB",
  midGrey: "#4B5563",
}

const TABS = [
  { key: "assessments", label: "Assessments", icon: ClipboardCheck },
  { key: "competitions", label: "Competitions", icon: Trophy },
  { key: "camps", label: "Camps", icon: Tent },
  { key: "courses", label: "Courses", icon: BookOpen },
]

const StatusBadge = ({ status }) => {
  const map = {
    registered: { bg: "#E1F5EE", color: "#085041", label: "Registered" },
    paid:        { bg: "#E1F5EE", color: "#085041", label: "Paid" },
    pending:     { bg: "#FEF3E2", color: "#633806", label: "Pending" },
    confirmed:   { bg: "#E6F1FB", color: "#185FA5", label: "Confirmed" },
    cancelled:   { bg: "#FEE2E2", color: "#991B1B", label: "Cancelled" },
  }
  const s = map[status?.toLowerCase()] || map.registered
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

const EmptyState = ({ icon: Icon, label }) => (
  <div className="rounded-2xl bg-white border border-dashed p-12 text-center" style={{ borderColor: brandColors.border }}>
    <Icon size={32} className="mx-auto mb-3 text-gray-300" />
    <p className="text-sm text-gray-400">{label}</p>
  </div>
)

const ScoreTrend = ({ attempts }) => {
  if (attempts.length < 2) return null
  const first = attempts[0].score
  const last = attempts[attempts.length - 1].score
  const diff = Math.round(last - first)
  if (diff > 0) return <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: brandColors.teal }}><TrendingUp size={13} /> +{diff}%</span>
  if (diff < 0) return <span className="flex items-center gap-1 text-xs font-semibold text-red-500"><TrendingDown size={13} /> {diff}%</span>
  return <span className="flex items-center gap-1 text-xs text-gray-400"><Minus size={13} /> No change</span>
}

const AssessmentCard = ({ exam }) => {
  const [expanded, setExpanded] = useState(false)
  const attempts = exam.attempts
  const latest = attempts[attempts.length - 1]
  const best = Math.max(...attempts.map(a => a.score))

  return (
    <div className="rounded-2xl bg-white border overflow-hidden" style={{ borderColor: brandColors.border }}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full p-5 flex items-start justify-between gap-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm mb-1 truncate" style={{ color: brandColors.primary }}>{exam.title}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><ClipboardCheck size={11} /> {attempts.length} attempt{attempts.length !== 1 ? "s" : ""}</span>
            <span className="flex items-center gap-1"><Trophy size={11} /> Best: {Math.round(best)}%</span>
            <span className="flex items-center gap-1"><Clock size={11} /> Latest: {Math.round(latest.score)}%</span>
            <ScoreTrend attempts={attempts} />
          </div>
        </div>
        <div className="shrink-0 mt-0.5">
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {/* Score bar — always visible */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2">
          {attempts.map((a, i) => (
            <div key={i} className="flex-1 relative group">
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${a.score}%`, backgroundColor: i === attempts.length - 1 ? brandColors.teal : `${brandColors.secondary}60` }}
                />
              </div>
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap z-10">
                {Math.round(a.score)}%
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-gray-400">
          <span>Attempt 1</span>
          {attempts.length > 1 && <span>Latest</span>}
        </div>
      </div>

      {expanded && (
        <div className="border-t" style={{ borderColor: brandColors.border }}>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-2.5 font-medium text-gray-500">#</th>
                <th className="text-left px-5 py-2.5 font-medium text-gray-500">Date</th>
                <th className="text-left px-5 py-2.5 font-medium text-gray-500">Score</th>
                <th className="text-left px-5 py-2.5 font-medium text-gray-500">Questions</th>
                <th className="text-left px-5 py-2.5 font-medium text-gray-500">vs. First</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a, i) => {
                const baseline = attempts[0].score
                const diff = i === 0 ? null : Math.round(a.score - baseline)
                return (
                  <tr key={i} className="border-t" style={{ borderColor: brandColors.border }}>
                    <td className="px-5 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-5 py-3 text-gray-600">{a.date || "—"}</td>
                    <td className="px-5 py-3 font-semibold" style={{ color: brandColors.primary }}>{Math.round(a.score)}%</td>
                    <td className="px-5 py-3 text-gray-500">{a.totalQuestions || "—"}</td>
                    <td className="px-5 py-3">
                      {diff === null ? (
                        <span className="text-gray-400">Baseline</span>
                      ) : diff > 0 ? (
                        <span className="flex items-center gap-0.5 font-medium" style={{ color: brandColors.teal }}><TrendingUp size={11} /> +{diff}%</span>
                      ) : diff < 0 ? (
                        <span className="flex items-center gap-0.5 font-medium text-red-500"><TrendingDown size={11} /> {diff}%</span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-gray-400"><Minus size={11} /> No change</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const CompetitionCard = ({ reg }) => (
  <div className="rounded-2xl bg-white border p-5 flex items-start justify-between gap-4" style={{ borderColor: brandColors.border }}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${brandColors.gold}1A` }}>
      <Trophy size={18} style={{ color: brandColors.gold }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm mb-1 truncate" style={{ color: brandColors.primary }}>{reg.program || reg.name}</p>
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        {reg.year && <span className="flex items-center gap-1"><Calendar size={11} /> {reg.year}</span>}
        {reg.grade && <span>Grade {reg.grade}</span>}
        <span className="flex items-center gap-1"><Clock size={11} /> {reg.created_at ? new Date(reg.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
      </div>
    </div>
    <StatusBadge status={reg.status || "registered"} />
  </div>
)

const CampCard = ({ reg }) => {
  const camp = reg.camps || {}
  const dateStr = camp.start_date ? new Date(camp.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null
  return (
    <div className="rounded-2xl bg-white border overflow-hidden" style={{ borderColor: brandColors.border }}>
      {camp.image && (
        <div className="w-full h-32 overflow-hidden bg-gray-100">
          <img src={camp.image} alt={camp.name} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm mb-1 truncate" style={{ color: brandColors.primary }}>{camp.name || "Camp"}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            {dateStr && <span className="flex items-center gap-1"><Calendar size={11} /> {dateStr}</span>}
            {(camp.is_virtual || camp.location) && (
              <span className="flex items-center gap-1"><MapPin size={11} /> {camp.is_virtual ? "Virtual" : camp.location}</span>
            )}
            <span className="flex items-center gap-1"><Clock size={11} /> Registered {new Date(reg.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
        </div>
        <StatusBadge status={reg.status || "registered"} />
      </div>
    </div>
  )
}

const CourseCard = ({ row }) => {
  const course = row.courses || {}
  const pct = typeof row.progress === "number" ? row.progress : null
  const completed = row.completed || pct === 100

  return (
    <div className="rounded-2xl bg-white border p-5" style={{ borderColor: brandColors.border }}>
      <div className="flex items-start gap-4 mb-3">
        {course.thumbnail && (
          <img src={course.thumbnail} alt={course.title} className="w-14 h-14 rounded-xl object-cover shrink-0 bg-gray-100" loading="lazy" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm mb-1 truncate" style={{ color: brandColors.primary }}>{course.title || "Course"}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {completed
              ? <span className="flex items-center gap-1 font-medium" style={{ color: brandColors.teal }}><CheckCircle size={11} /> Completed</span>
              : pct !== null && <span>In progress</span>
            }
            <span className="flex items-center gap-1"><Clock size={11} /> {new Date(row.updated_at || row.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
        </div>
        {pct !== null && (
          <span className="shrink-0 text-sm font-semibold" style={{ color: brandColors.primary }}>{Math.round(pct)}%</span>
        )}
      </div>
      {pct !== null && (
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: completed ? brandColors.teal : brandColors.secondary }} />
        </div>
      )}
    </div>
  )
}

const SkeletonCard = () => (
  <div className="rounded-2xl bg-white border p-5 animate-pulse" style={{ borderColor: brandColors.border }}>
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  </div>
)

const History = () => {
  const navigate = useNavigate()
  const userId = getTokenUserId()

  const [activeTab, setActiveTab] = useState("assessments")
  const [history, setHistory] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    setIsLoading(true)
    getUserHistory(userId)
      .then(res => setHistory(res))
      .catch(err => console.error("History load failed:", err))
      .finally(() => setIsLoading(false))
  }, [userId])

  const counts = history
    ? {
        assessments: history.assessmentHistory.length,
        competitions: history.competitions.length,
        camps: history.camps.length,
        courses: history.courseProgress.length,
      }
    : {}

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 lg:px-8 py-10" style={{ backgroundColor: brandColors.background }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${brandColors.secondary}1A` }}>
            <Clock size={20} style={{ color: brandColors.secondary }} />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: brandColors.primary }}>My History</h1>
        </div>
        <p className="text-gray-500 mb-8">Your full activity record — registrations, assessment attempts, and course progress.</p>

        {/* Tab bar */}
        <div className="flex items-center gap-1 mb-8 border-b" style={{ borderColor: brandColors.border }}>
          {TABS.map(tab => {
            const Icon = tab.icon
            const count = counts[tab.key]
            const active = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px"
                style={{
                  borderBottomColor: active ? brandColors.primary : "transparent",
                  color: active ? brandColors.primary : brandColors.midGrey,
                }}
              >
                <Icon size={15} />
                {tab.label}
                {count !== undefined && count > 0 && (
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: active ? brandColors.primary : "#E5E7EB", color: active ? "#fff" : brandColors.midGrey }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            {activeTab === "assessments" && (
              <div className="space-y-4">
                {!history?.assessmentHistory.length
                  ? <EmptyState icon={ClipboardCheck} label="No assessments taken yet. Start a quiz from any of your tracks." />
                  : history.assessmentHistory.map((exam, i) => <AssessmentCard key={exam.quizId || i} exam={exam} />)
                }
              </div>
            )}

            {activeTab === "competitions" && (
              <div className="space-y-4">
                {!history?.competitions.length
                  ? <EmptyState icon={Trophy} label="No competitions registered yet. Browse your tracks to find competitions to join." />
                  : history.competitions.map(reg => <CompetitionCard key={reg.id} reg={reg} />)
                }
              </div>
            )}

            {activeTab === "camps" && (
              <div className="space-y-4">
                {!history?.camps.length
                  ? (
                    <div>
                      <EmptyState icon={Tent} label="No camps registered yet." />
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => navigate("/tracks")}
                          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                          style={{ color: brandColors.secondary }}
                        >
                          Browse your tracks <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  )
                  : history.camps.map(reg => <CampCard key={reg.id} reg={reg} />)
                }
              </div>
            )}

            {activeTab === "courses" && (
              <div className="space-y-4">
                {!history?.courseProgress.length
                  ? <EmptyState icon={BookOpen} label="No course activity yet. Open a resource from your tracks to get started." />
                  : history.courseProgress.map(row => <CourseCard key={row.id} row={row} />)
                }
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default History

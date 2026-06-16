"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { Trophy, Tent, BookOpen, ClipboardCheck, TrendingUp, Compass, MapPin, Clock, FileQuestion, ChevronDown } from "lucide-react"
import { getTrackBySlug, getTrackContent, getQuizDetails, registerForCamp, markExamsSeen } from "../lib/api"
import { getTokenUserId } from "../lib/auth"

const brandColors = {
  primary: "#003366",
  secondary: "#336699",
  background: "#F0F4F8",
  border: "#E5E7EB",
  success: "#1D9E75",
}

const PAGE_SIZE = 6

const TABS = [
  { key: "competitions", label: "Olympiads & Competitions", icon: <Trophy size={15} /> },
  { key: "camps", label: "Camps", icon: <Tent size={15} /> },
  { key: "courses", label: "Resources", icon: <BookOpen size={15} /> },
  { key: "exams", label: "Assessments", icon: <ClipboardCheck size={15} /> },
]

const formatDateRange = (start, end) => {
  if (!start && !end) return null
  if (start && end && start !== end) return `${start} – ${end}`
  return start || end
}

const ContentCard = ({ title, meta, color, onAction, actionLabel, isNew }) => (
  <div
    className="group rounded-2xl bg-white border overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex flex-col"
    style={{ borderColor: brandColors.border }}
  >
    <div className="p-5 flex flex-col flex-1">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold line-clamp-2" style={{ color: brandColors.primary }}>{title}</h3>
        {isNew && (
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: color }}>
            New
          </span>
        )}
      </div>
      {meta && <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-4">{meta}</div>}
      <button
        onClick={onAction}
        className="mt-auto self-start px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: color }}
      >
        {actionLabel}
      </button>
    </div>
  </div>
)

const Grid = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{children}</div>
)

const EmptyState = ({ label }) => (
  <div className="rounded-2xl bg-white border border-dashed p-8 text-center text-sm text-gray-400" style={{ borderColor: brandColors.border }}>
    {label}
  </div>
)

const StatCard = ({ icon, label, value, color }) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}1A`, color }}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-semibold" style={{ color: brandColors.primary }}>{value}</p>
    </div>
  </div>
)

const TrackDetail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const userId = getTokenUserId()

  const [track, setTrack] = useState(null)
  const [content, setContent] = useState({ competitions: [], courses: [], exams: [], camps: [] })
  const [quizDetails, setQuizDetails] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("competitions")
  const [expandedTabs, setExpandedTabs] = useState({})

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError("")
      try {
        const trackRes = await getTrackBySlug(slug)
        setTrack(trackRes.track)

        const [contentRes, quizRes] = await Promise.all([
          getTrackContent(trackRes.track.id),
          userId ? getQuizDetails(userId) : Promise.resolve({ quizDetails: [] }),
        ])
        setContent(contentRes)
        setQuizDetails(quizRes.quizDetails || [])
      } catch (err) {
        console.error("Error loading track:", err)
        setError("We couldn't load this track. Try going back and selecting it again.")
      } finally {
        setIsLoading(false)
      }
    }
    load()
    setActiveTab("competitions")
    setExpandedTabs({})
  }, [slug, userId])

  const trackProgress = useMemo(() => {
    const examIds = new Set(content.exams.map((e) => e.id))
    const completed = quizDetails.filter((q) => examIds.has(q.id) || examIds.has(q.quizId))
    const avgScore = completed.length
      ? Math.round(completed.reduce((sum, q) => sum + (q.score || 0), 0) / completed.length)
      : 0
    return { completedCount: completed.length, totalExams: content.exams.length, avgScore }
  }, [content.exams, quizDetails])

  // "New" = not yet attempted, and published after the last time this user
  // opened an Assessments tab anywhere (last_seen_exams_at is null the very
  // first time, so every untaken exam counts as new on that first visit)
  const newExamIds = useMemo(() => {
    const profile = JSON.parse(localStorage.getItem('user') || '{}')
    const lastSeenAt = profile.last_seen_exams_at ? new Date(profile.last_seen_exams_at) : null
    const attemptedIds = new Set(quizDetails.map((q) => q.id || q.quizId))
    return new Set(
      content.exams
        .filter((e) => !attemptedIds.has(e.id))
        .filter((e) => !lastSeenAt || (e.created_at && new Date(e.created_at) > lastSeenAt))
        .map((e) => e.id)
    )
  }, [content.exams, quizDetails])

  // Mark exams as seen once per page visit, only after the user actually
  // looks at the Assessments tab — otherwise they'd never see the tag they just earned
  const [hasMarkedSeen, setHasMarkedSeen] = useState(false)
  useEffect(() => {
    if (activeTab === 'exams' && userId && !hasMarkedSeen && newExamIds.size >= 0 && !isLoading) {
      setHasMarkedSeen(true)
      markExamsSeen(userId).catch((err) => console.warn('Could not mark exams seen:', err))
    }
  }, [activeTab, userId, hasMarkedSeen, isLoading])

  const color = track?.color || brandColors.secondary

  const handleCompetitionClick = (competition) => navigate(`/subitem/${competition.name}`, { state: competition })
  const handleCourseClick = (course) => navigate("/course-view", { state: course })
  const handleExamClick = (exam) => navigate("/quiz-overview", { state: { questions: exam } })

  const handleCampRegister = async (campId) => {
    if (!userId) return
    try {
      await registerForCamp(userId, campId)
      alert("You're registered for this camp.")
    } catch (err) {
      console.error("Error registering for camp:", err)
      alert("Could not register right now. Try again shortly.")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: brandColors.background }}>
        <p className="text-gray-500">Loading track...</p>
      </div>
    )
  }

  if (error || !track) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: brandColors.background }}>
        <p className="text-gray-500">{error || "Track not found."}</p>
        <Link to="/tracks" className="text-sm font-medium" style={{ color: brandColors.secondary }}>← Back to My Tracks</Link>
      </div>
    )
  }

  const activeItems = content[activeTab] || []
  const isExpanded = !!expandedTabs[activeTab]
  const visibleItems = isExpanded ? activeItems : activeItems.slice(0, PAGE_SIZE)

  const renderCard = (item) => {
    if (activeTab === "competitions") {
      const dateRange = formatDateRange(item.start_date, item.end_date)
      return (
        <ContentCard
          key={item.id}
          title={item.name}
          color={color}
          actionLabel="View Details"
          onAction={() => handleCompetitionClick(item)}
          meta={dateRange && <span>{dateRange}</span>}
        />
      )
    }
    if (activeTab === "camps") {
      const dateRange = formatDateRange(item.start_date, item.end_date)
      return (
        <ContentCard
          key={item.id}
          title={item.name}
          color={color}
          actionLabel="Register"
          onAction={() => handleCampRegister(item.id)}
          meta={
            <>
              {dateRange && <span>{dateRange}</span>}
              <span className="flex items-center gap-1"><MapPin size={12} /> {item.is_virtual ? "Virtual" : item.location || "TBA"}</span>
            </>
          }
        />
      )
    }
    if (activeTab === "courses") {
      return (
        <ContentCard
          key={item.id}
          title={item.title}
          color={color}
          actionLabel="Open Resource"
          onAction={() => handleCourseClick(item)}
          meta={item.duration && <span className="flex items-center gap-1"><Clock size={12} /> {item.duration}</span>}
        />
      )
    }
    return (
      <ContentCard
        key={item.id}
        title={item.title}
        color={color}
        actionLabel="Start Quiz"
        onAction={() => handleExamClick(item)}
        isNew={newExamIds.has(item.id)}
        meta={
          <>
            <span className="flex items-center gap-1"><FileQuestion size={12} /> {item.number_of_questions} questions</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {item.time} min</span>
          </>
        }
      />
    )
  }

  const emptyLabel = {
    competitions: "No competitions tagged into this track yet.",
    camps: "No camps scheduled in this track yet.",
    courses: "No resources tagged into this track yet.",
    exams: "No assessments tagged into this track yet.",
  }[activeTab]

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: brandColors.background }}>
      {/* Colored header banner */}
      <div className="w-full py-12 px-4 sm:px-6 lg:px-8" style={{ background: `linear-gradient(135deg, ${color} 0%, ${brandColors.primary} 100%)` }}>
        <div className="max-w-6xl mx-auto">
          <Link to="/tracks" className="text-sm font-medium mb-4 inline-block text-white/80 hover:text-white">← All Tracks</Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-3xl shrink-0">
              {track.icon || <Compass size={28} className="text-white" />}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{track.name} Track</h1>
              <p className="text-white/80 mt-1 max-w-2xl">
                {track.description || `Everything in ${track.name} — Olympiads, competitions, camps, resources and assessments — in one place.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7">
        {/* Progress tracker — overlaps the banner slightly for a layered feel */}
        <div className="rounded-2xl bg-white shadow-lg border p-6 mb-8 grid grid-cols-2 sm:grid-cols-4 gap-6" style={{ borderColor: brandColors.border }}>
          <StatCard icon={<Trophy size={18} />} label="Competitions" value={content.competitions.length} color={color} />
          <StatCard icon={<BookOpen size={18} />} label="Resources" value={content.courses.length} color={color} />
          <StatCard icon={<ClipboardCheck size={18} />} label="Assessments Done" value={`${trackProgress.completedCount}/${trackProgress.totalExams}`} color={color} />
          <StatCard icon={<TrendingUp size={18} />} label="Average Score" value={trackProgress.completedCount ? `${trackProgress.avgScore}%` : "—"} color={brandColors.success} />
        </div>

        {/* Section tabs — one section visible at a time to avoid overwhelming the page */}
        <div className="flex flex-wrap gap-2 mb-8 border-b pb-px" style={{ borderColor: brandColors.border }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key
            const count = content[tab.key]?.length || 0
            const newCount = tab.key === "exams" ? newExamIds.size : 0
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium border-b-2 transition-colors"
                style={{
                  borderColor: isActive ? color : "transparent",
                  color: isActive ? color : "#6B7280",
                  backgroundColor: isActive ? `${color}0D` : "transparent",
                }}
              >
                {tab.icon}
                {tab.label}
                <span
                  className="text-xs font-semibold rounded-full px-1.5 py-0.5"
                  style={{ backgroundColor: isActive ? `${color}22` : "#F3F4F6", color: isActive ? color : "#9CA3AF" }}
                >
                  {count}
                </span>
                {newCount > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: color }}>
                    {newCount} new
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="mb-12">
          {activeItems.length === 0 ? (
            <EmptyState label={emptyLabel} />
          ) : (
            <>
              <Grid>{visibleItems.map(renderCard)}</Grid>
              {activeItems.length > PAGE_SIZE && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setExpandedTabs((prev) => ({ ...prev, [activeTab]: !isExpanded }))}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                    style={{ borderColor: color, color }}
                  >
                    {isExpanded ? "Show less" : `Show all ${activeItems.length}`}
                    <ChevronDown size={15} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TrackDetail

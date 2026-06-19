"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams, useLocation, Link } from "react-router-dom"
import { Trophy, Tent, BookOpen, ClipboardCheck, TrendingUp, Compass, MapPin, Clock, FileQuestion, ChevronDown, Lock, CheckCircle, X, Zap, Layers } from "lucide-react"
import { getTrackBySlug, getTrackContent, getQuizDetails, registerForCamp, markExamsSeen, getUserCompetitionRegistrations, registerForCompetition, getExamAttempts } from "../lib/api"
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
  { key: "camps",        label: "Camps",                    icon: <Tent size={15} /> },
  { key: "courses",      label: "Resources",                icon: <BookOpen size={15} /> },
  { key: "exams",        label: "Assessments",              icon: <ClipboardCheck size={15} /> },
]

const formatDateRange = (start, end) => {
  if (!start && !end) return null
  if (start && end && start !== end) return `${start} – ${end}`
  return start || end
}

const CONTEST_COLOR   = "#E8A020"
const PRACTICE_COLOR  = "#1D9E75"
const EXAM_COLOR      = "#185FA5"
const FLASHCARD_COLOR = "#7C3AED"

const MODE_BADGE = {
  contest:   { bg: CONTEST_COLOR,   label: "Contest",      Icon: Zap },
  practice:  { bg: PRACTICE_COLOR,  label: "Practice",     Icon: BookOpen },
  exam:      { bg: EXAM_COLOR,      label: "Exam",         Icon: FileQuestion },
  flashcard: { bg: FLASHCARD_COLOR, label: "Flash Cards",  Icon: Layers },
}

const ContentCard = ({ title, meta, color, onAction, actionLabel, isNew, priceLabel, image, registeredBadge, gated, onSecondaryAction, secondaryLabel, isContest, isPractice, isFlashcard, readiness }) => {
  const mode = isContest ? 'contest' : isPractice ? 'practice' : isFlashcard ? 'flashcard' : 'exam'
  const badge = MODE_BADGE[mode]
  const accentColor = isContest ? CONTEST_COLOR : isPractice ? PRACTICE_COLOR : isFlashcard ? FLASHCARD_COLOR : color

  return (
  <div
    className="group rounded-2xl bg-white border overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex flex-col"
    style={{ borderColor: accentColor, opacity: gated ? 0.85 : 1 }}
  >
    {/* Mode accent stripe */}
    <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />

    {image && (
      <div className="w-full h-40 overflow-hidden bg-gray-100 relative">
        <img src={image} alt={title} className="w-full h-full object-cover" loading="lazy" />
        {gated && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Lock size={24} className="text-white" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: accentColor }}>
          <badge.Icon size={10} /> {badge.label}
        </div>
      </div>
    )}
    <div className="p-5 flex flex-col flex-1">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {!image && (
            <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: accentColor }}>
              <badge.Icon size={9} /> {badge.label}
            </span>
          )}
          <h3 className="font-semibold line-clamp-2" style={{ color: brandColors.primary }}>{title}</h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isNew && (
            <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: color }}>
              New
            </span>
          )}
          {registeredBadge && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#1D9E75" }}>
              <CheckCircle size={10} /> Registered
            </span>
          )}
          {gated && !image && <Lock size={14} className="text-gray-400" />}
        </div>
      </div>
      {meta && <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">{meta}</div>}

      {/* Readiness bar for practice cards */}
      {isPractice && typeof readiness === 'number' && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500">Readiness</span>
            <span className="font-semibold" style={{ color: readiness >= 75 ? PRACTICE_COLOR : '#E8A020' }}>{readiness}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${readiness}%`, backgroundColor: readiness >= 75 ? PRACTICE_COLOR : '#E8A020' }}
            />
          </div>
        </div>
      )}

      {priceLabel && (
        <span className="self-start text-xs font-semibold px-2 py-0.5 rounded-full mb-3" style={{ backgroundColor: `${color}1A`, color }}>
          {priceLabel}
        </span>
      )}
      <div className="mt-auto flex flex-wrap gap-2">
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
          style={{
            backgroundColor: gated ? "#E5E7EB" : accentColor,
            color: gated ? brandColors.primary : "#fff",
          }}
        >
          {actionLabel}
        </button>
        {onSecondaryAction && secondaryLabel && (
          <button
            onClick={onSecondaryAction}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-gray-50"
            style={{ borderColor: accentColor, color: accentColor }}
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  </div>
  )
}

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
  const location = useLocation()
  const userId = getTokenUserId()

  const [track, setTrack] = useState(null)
  const [content, setContent] = useState({ competitions: [], courses: [], exams: [], camps: [], flashcards: [] })
  const [quizDetails, setQuizDetails] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  // Fix 3: honour ?tab= or state.tab from dashboard feed links
  const [activeTab, setActiveTab] = useState(location.state?.tab || "competitions")
  const [expandedTabs, setExpandedTabs] = useState({})

  // Registration state
  const [registrations, setRegistrations] = useState([])
  const [regModal, setRegModal] = useState(null)
  const [regGrade, setRegGrade] = useState("")
  const [regSaving, setRegSaving] = useState(false)
  const [regError, setRegError] = useState("")

  // Grade filtering state
  const [gradePromptDismissed, setGradePromptDismissed] = useState(false)

  // Results modal state
  const [resultsModal, setResultsModal] = useState(null) // { exam } | null
  const [resultsAttempts, setResultsAttempts] = useState([])
  const [resultsLoading, setResultsLoading] = useState(false)
  const [expandedAttempt, setExpandedAttempt] = useState(null) // attempt index

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError("")
      try {
        const trackRes = await getTrackBySlug(slug)
        setTrack(trackRes.track)

        const [contentRes, quizRes, regRes] = await Promise.all([
          getTrackContent(trackRes.track.id),
          userId ? getQuizDetails(userId) : Promise.resolve({ quizDetails: [] }),
          userId ? getUserCompetitionRegistrations(userId) : Promise.resolve({ registrations: [] }),
        ])
        setContent(contentRes)
        setQuizDetails(quizRes.quizDetails || [])
        setRegistrations(regRes.registrations || [])
      } catch (err) {
        console.error("Error loading track:", err)
        setError("We couldn't load this track. Try going back and selecting it again.")
      } finally {
        setIsLoading(false)
      }
    }
    load()
    setActiveTab(location.state?.tab || "competitions")
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

  const isRegisteredFor = (competitionName) =>
    registrations.some(r => r.program === competitionName)

  const handleCompetitionClick = (competition) => {
    if (!isRegisteredFor(competition.name)) {
      setRegModal(competition)
      setRegGrade("")
      setRegError("")
      return
    }
    navigate(`/subitem/${competition.name}`, { state: competition })
  }

  const handleRegisterSubmit = async () => {
    if (!userId || !regModal) return
    setRegSaving(true)
    setRegError("")
    try {
      const res = await registerForCompetition(userId, {
        competitionId: regModal.id,
        name: regModal.name,
        year: regModal.year,
        grade: regGrade,
      })
      setRegistrations(prev => [...prev, res.registration])
      setRegModal(null)
      navigate(`/subitem/${regModal.name}`, { state: regModal })
    } catch (err) {
      console.error("Registration error:", err)
      setRegError("Could not complete registration. Try again.")
    } finally {
      setRegSaving(false)
    }
  }
  const handleViewResults = async (exam) => {
    setResultsModal(exam)
    setResultsAttempts([])
    setExpandedAttempt(null)
    setResultsLoading(true)
    try {
      const res = await getExamAttempts(userId, exam._id || exam.id)
      setResultsAttempts(res.attempts || [])
    } catch (err) {
      console.error("Could not load attempts:", err)
    } finally {
      setResultsLoading(false)
    }
  }

  const handleCourseClick = (course) => navigate("/course-view", { state: { ...course, trackSlug: slug, trackName: track?.name } })
  const handleExamClick = (exam) => navigate("/quiz-overview", { state: { questions: exam, trackSlug: slug, trackName: track?.name } })

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

  // Grade filtering
  const userProfile = JSON.parse(localStorage.getItem('user') || '{}')
  const userGrade = String(userProfile.grade || '').replace(/grade\s*/i, '').trim()

  // Academic year progression (Ghana: new year starts September)
  const now = new Date()
  const currentAcademicYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1
  const storedGradeYear = parseInt(localStorage.getItem('grade_academic_year') || '0')
  const showGradePrompt = !gradePromptDismissed && userGrade && storedGradeYear > 0 && storedGradeYear < currentAcademicYear
  const nextGrade = userGrade ? String(parseInt(userGrade) + 1) : ''

  // Set grade_academic_year on first load if not set
  if (userGrade && !storedGradeYear) {
    localStorage.setItem('grade_academic_year', String(currentAcademicYear))
  }

  const matchesUserGrade = (item) => {
    if (!userGrade) return true
    const grades = Array.isArray(item.grade)
      ? item.grade.map(g => String(g).replace(/grade\s*/i, '').trim())
      : item.grade ? [String(item.grade).replace(/grade\s*/i, '').trim()] : []
    if (grades.length === 0) return true  // untagged = visible to all grades
    return grades.includes(userGrade)
  }

  // Both gates must pass: item must be published AND match user's grade
  const isPublished = (item) => {
    // Supabase column is "publish" (set by admin). Fall back to "published" for other content types.
    const flag = item.publish ?? item.published
    if (flag === undefined || flag === null) return true  // no publish column = visible by default
    return flag === true || flag === 1 || flag === 'true'
  }

  // Group flashcards by subject for display — each group becomes one study card
  const flashcardGroups = (() => {
    const map = new Map()
    for (const fc of (content.flashcards || [])) {
      const key = (fc.subject || '') + '|' + (fc.grade || '')
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          subject: fc.subject || track?.name || 'Flash Cards',
          grade: fc.grade || '',
          trackId: fc.track_id || fc.trackId,
          cards: [],
        })
      }
      map.get(key).cards.push(fc)
    }
    return [...map.values()].map(g => ({ ...g, count: g.cards.length }))
  })()

  // Exams tab merges assessed content + flashcard groups.
  // Flashcard groups are pre-filtered (publish=true at API level); grade shown as metadata not a gate.
  const allActiveItems = activeTab === 'exams'
    ? [...(content.exams || []).filter(isPublished), ...flashcardGroups]
    : (content[activeTab] || []).filter(isPublished)

  const activeItems = activeTab === 'exams'
    ? [
        ...(content.exams || []).filter(isPublished).filter(matchesUserGrade),
        ...flashcardGroups,  // flashcard groups shown to all grades — grade is metadata on each card
      ]
    : allActiveItems.filter(matchesUserGrade)

  const hiddenByGrade = allActiveItems.length - activeItems.length

  const isExpanded = !!expandedTabs[activeTab]
  const visibleItems = isExpanded ? activeItems : activeItems.slice(0, PAGE_SIZE)

  // Phase 3: an exam is gated if its `program` field matches a competition in
  // this track that the user hasn't registered for yet
  const competitionNames = new Set(content.competitions.map(c => c.name))
  const isExamGated = (exam) => {
    if (!exam.program) return false
    if (!competitionNames.has(exam.program)) return false
    return !isRegisteredFor(exam.program)
  }

  const renderCard = (item) => {
    if (activeTab === "competitions") {
      const dateRange = formatDateRange(item.start_date, item.end_date)
      const total = (item.material_cost || 0) + (item.assessment_cost || 0)
      const registered = isRegisteredFor(item.name)
      const isContest = Array.isArray(item.questions) && item.questions.length > 0
      return (
        <ContentCard
          key={item.id}
          title={item.name}
          color={color}
          actionLabel={registered ? "Open Competition" : "Register to join"}
          onAction={() => handleCompetitionClick(item)}
          image={item.image || null}
          priceLabel={total > 0 ? `GH₵${total}` : "Free"}
          registeredBadge={registered}
          meta={dateRange && <span>{dateRange}</span>}
          onSecondaryAction={isContest ? () => navigate("/contest-overview", { state: { contest: item, isContest: true } }) : undefined}
          secondaryLabel={isContest ? "Join Contest" : undefined}
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
          image={item.image || null}
          priceLabel={item.cost > 0 ? `GH₵${item.cost}` : "Free"}
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
      const costLabel = item.cost && !["0", "free"].includes(String(item.cost).toLowerCase()) ? item.cost : "Free"
      return (
        <ContentCard
          key={item.id}
          title={item.title}
          color={color}
          actionLabel="Open Resource"
          onAction={() => handleCourseClick(item)}
          image={item.thumbnail || null}
          priceLabel={costLabel}
          meta={item.duration && <span className="flex items-center gap-1"><Clock size={12} /> {item.duration}</span>}
        />
      )
    }
    // Flashcard group (has a `cards` array — merged into the exams tab)
    if (Array.isArray(item.cards)) {
      const cardCount = item.count || item.cards.length || 0
      const subjectLabel = [item.subject, item.grade ? `Grade ${item.grade}` : null].filter(Boolean).join(" · ")
      return (
        <ContentCard
          key={item.id}
          title={item.subject || "Flash Cards"}
          color={FLASHCARD_COLOR}
          isFlashcard
          actionLabel="Study this set"
          onAction={() => navigate("/flashcards", {
            state: {
              trackId: item.trackId,
              subject: item.subject,
              grade: item.grade,
              title: item.subject || track?.name,
              flashcards: item.cards,
            }
          })}
          meta={
            <>
              <span className="flex items-center gap-1"><Layers size={12} /> {cardCount} card{cardCount !== 1 ? "s" : ""}</span>
              {subjectLabel && <span>{subjectLabel}</span>}
            </>
          }
        />
      )
    }

    const gated = isExamGated(item)
    const isContest = item.contest === true || item.contest === "true" || item.contest === 1
    const isPractice = !isContest && (item.mode === 'practice' || item.mode === 'both')
    const hasAttempts = quizDetails.some(q => q.quizId === item.id)

    const examActionLabel = gated ? "Register for competition first"
      : isContest ? "Join Contest"
      : isPractice ? "Open Practice"
      : hasAttempts ? "Retake Quiz" : "Start Quiz"

    const examAction = gated ? () => setActiveTab("competitions")
      : isContest ? () => { localStorage.removeItem("saved-quiz"); localStorage.removeItem("saved-answers"); localStorage.removeItem("saved-time"); navigate("/contest-overview", { state: { contest: item, isContest: true } }) }
      : isPractice ? () => navigate("/practice-overview", { state: { exam: item, from: `/track/${slug}` } })
      : () => handleExamClick(item)

    return (
      <ContentCard
        key={item.id}
        title={item.title}
        color={color}
        isContest={isContest}
        isPractice={isPractice}
        actionLabel={examActionLabel}
        onAction={examAction}
        isNew={!gated && newExamIds.has(item.id)}
        image={item.image || null}
        gated={gated}
        onSecondaryAction={(!gated && !isContest && !isPractice && hasAttempts) ? () => handleViewResults(item) : undefined}
        secondaryLabel={(!gated && !isContest && !isPractice && hasAttempts) ? "View Results" : undefined}
        meta={
          <>
            <span className="flex items-center gap-1"><FileQuestion size={12} /> {item.number_of_questions} questions</span>
            {item.time && <span className="flex items-center gap-1"><Clock size={12} /> {item.time} min</span>}
            {gated && item.program && <span className="flex items-center gap-1 font-medium" style={{ color: brandColors.secondary }}><Lock size={11} /> Requires {item.program} registration</span>}
          </>
        }
      />
    )
  }

  const totalInTab = activeTab === 'exams'
    ? (content.exams || []).filter(isPublished).length + flashcardGroups.length
    : (content[activeTab] || []).filter(isPublished).length
  const emptyLabel = activeItems.length === 0 && totalInTab > 0 && userGrade
    ? `No ${activeTab === 'courses' ? 'resources' : 'assessments'} for Grade ${userGrade} in this track yet.`
    : {
        competitions: "No competitions in this track yet.",
        camps:        "No camps scheduled in this track yet.",
        courses:      "No resources in this track yet.",
        exams:        "No assessments or flash cards in this track yet.",
      }[activeTab]

  return (
    <>
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
                {track.description || `Everything in ${track.name}: Olympiads, competitions, camps, resources and assessments, in one place.`}
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
            const count = tab.key === 'exams'
              ? (content.exams?.length || 0) + flashcardGroups.length
              : (content[tab.key]?.length || 0)
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

        {/* Grade progression prompt */}
        {showGradePrompt && (
          <div className="mb-6 rounded-xl border px-5 py-4 flex items-start justify-between gap-4" style={{ backgroundColor: '#FEF3E2', borderColor: '#E8A020' }}>
            <div>
              <p className="text-sm font-semibold text-amber-900">New academic year. Still in Grade {userGrade}?</p>
              <p className="text-xs text-amber-700 mt-0.5">If you moved up, update your grade so your content stays relevant.</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    const updated = { ...userProfile, grade: nextGrade }
                    localStorage.setItem('user', JSON.stringify(updated))
                    localStorage.setItem('grade_academic_year', String(currentAcademicYear))
                    setGradePromptDismissed(true)
                    window.location.reload()
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ backgroundColor: '#E8A020' }}
                >
                  I moved to Grade {nextGrade}
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem('grade_academic_year', String(currentAcademicYear))
                    setGradePromptDismissed(true)
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-amber-800 border border-amber-300"
                >
                  Still in Grade {userGrade}
                </button>
              </div>
            </div>
            <button onClick={() => setGradePromptDismissed(true)} className="text-amber-400 hover:text-amber-600 shrink-0">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Grade filter indicator */}
        {userGrade && (
          <div className="mb-4">
            <span className="text-xs text-gray-500">
              Showing content for <span className="font-semibold text-gray-700">Grade {userGrade}</span>
              {hiddenByGrade > 0 && (
                <span className="text-gray-400"> · {hiddenByGrade} item{hiddenByGrade > 1 ? 's' : ''} from other grades not shown</span>
              )}
            </span>
          </div>
        )}

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

    {/* Registration modal — shown when user clicks a competition they haven't joined */}
    {regModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="p-6 border-b flex items-start justify-between" style={{ borderColor: brandColors.border }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Competition Registration</p>
              <h2 className="text-lg font-bold" style={{ color: brandColors.primary }}>{regModal.name}</h2>
              {regModal.year && <p className="text-sm text-gray-500 mt-0.5">{regModal.year}</p>}
            </div>
            <button onClick={() => setRegModal(null)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <X size={18} className="text-gray-400" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600">
              Register to access this competition and unlock any associated assessments.
            </p>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">Your grade</label>
              <select
                value={regGrade}
                onChange={e => setRegGrade(e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: brandColors.border }}
              >
                <option value="">Select grade</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(g => (
                  <option key={g} value={String(g)}>Grade {g}</option>
                ))}
              </select>
            </div>
            {regError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{regError}</p>}
          </div>
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={handleRegisterSubmit}
              disabled={regSaving || !regGrade}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: color }}
            >
              {regSaving ? "Registering..." : "Confirm registration"}
            </button>
            <button
              onClick={() => setRegModal(null)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-gray-50"
              style={{ borderColor: brandColors.border, color: brandColors.primary }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Results modal — shows all attempts for a specific assessment */}
    {resultsModal && (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40">
        <div className="bg-white w-full sm:rounded-2xl shadow-xl sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b flex items-start justify-between shrink-0" style={{ borderColor: brandColors.border }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Assessment Results</p>
              <h2 className="text-lg font-bold" style={{ color: brandColors.primary }}>{resultsModal.title}</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {resultsModal.number_of_questions} questions · {resultsModal.time} min
              </p>
            </div>
            <button
              onClick={() => { setResultsModal(null); setExpandedAttempt(null) }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
            >
              <X size={18} className="text-gray-400" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 p-5">
            {resultsLoading ? (
              <p className="text-sm text-gray-400 text-center py-8">Loading your attempts...</p>
            ) : resultsAttempts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm">No attempts recorded yet.</p>
                <p className="text-gray-300 text-xs mt-1">Use the button below to take this quiz for the first time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {resultsAttempts.map((attempt, idx) => {
                  const pct = attempt.score !== null ? attempt.score : null
                  const isExpanded = expandedAttempt === idx
                  const scoreColor = pct === null ? "#9CA3AF" : pct >= 70 ? "#16A34A" : pct >= 50 ? "#D97706" : "#DC2626"

                  return (
                    <div key={attempt.id} className="border rounded-xl overflow-hidden" style={{ borderColor: brandColors.border }}>
                      {/* Attempt row */}
                      <div className="p-4 flex items-center gap-4">
                        {/* Attempt number */}
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                          style={{ backgroundColor: color }}>
                          {resultsAttempts.length - idx}
                        </div>

                        {/* Score ring */}
                        <div className="relative w-12 h-12 shrink-0">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                            <circle cx="22" cy="22" r="18" fill="none" stroke="#F3F4F6" strokeWidth="5" />
                            {pct !== null && (
                              <circle cx="22" cy="22" r="18" fill="none"
                                stroke={scoreColor} strokeWidth="5" strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 18}`}
                                strokeDashoffset={`${2 * Math.PI * 18 * (1 - pct / 100)}`}
                              />
                            )}
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: scoreColor }}>
                            {pct !== null ? `${pct}%` : "—"}
                          </span>
                        </div>

                        {/* Meta */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold" style={{ color: brandColors.primary }}>
                            {idx === 0 ? "Latest attempt" : `Attempt ${resultsAttempts.length - idx}`}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{attempt.date}</p>
                          {pct !== null && attempt.totalQuestions && (
                            <div className="mt-1.5 h-1.5 rounded-full bg-gray-100 overflow-hidden w-full max-w-[160px]">
                              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: scoreColor }} />
                            </div>
                          )}
                        </div>

                        {/* Expand toggle */}
                        {attempt.review && (
                          <button
                            onClick={() => setExpandedAttempt(isExpanded ? null : idx)}
                            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                            style={{ borderColor: color, color }}
                          >
                            {isExpanded ? "Hide" : "Review"}
                          </button>
                        )}
                      </div>

                      {/* Expanded per-question review */}
                      {isExpanded && attempt.review && (
                        <div className="border-t px-4 pb-4 space-y-3 bg-gray-50" style={{ borderColor: brandColors.border }}>
                          {/* Summary bar */}
                          <div className="flex gap-6 py-3 text-sm">
                            <span className="text-green-600 font-semibold">
                              ✓ {attempt.review.filter(q => q.isCorrect).length} correct
                            </span>
                            <span className="text-red-500 font-semibold">
                              ✗ {attempt.review.filter(q => !q.isCorrect && q.selectedAnswer).length} incorrect
                            </span>
                            <span className="text-gray-400 font-semibold">
                              — {attempt.review.filter(q => !q.selectedAnswer).length} skipped
                            </span>
                          </div>

                          {attempt.review.map((q, qi) => {
                            const clean = (s) => (s || "").replace(/<[^>]*>?/gm, "")
                            return (
                              <div
                                key={qi}
                                className={`p-3 rounded-xl border text-sm ${
                                  !q.selectedAnswer ? "bg-white border-gray-200 text-gray-400"
                                  : q.isCorrect ? "bg-green-50 border-green-300"
                                  : "bg-red-50 border-red-300"
                                }`}
                              >
                                <div className="flex items-start gap-2 mb-1">
                                  <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                                    !q.selectedAnswer ? "bg-gray-200 text-gray-500"
                                    : q.isCorrect ? "bg-green-600 text-white"
                                    : "bg-red-500 text-white"
                                  }`}>
                                    {!q.selectedAnswer ? "—" : q.isCorrect ? "✓" : "✗"}
                                  </span>
                                  <p className="font-medium text-gray-800 leading-snug">{clean(q.question)}</p>
                                </div>
                                {q.image && <img src={q.image} alt="" className="my-2 w-full max-h-32 object-contain rounded" />}
                                <div className="ml-7 space-y-0.5 text-xs">
                                  {q.selectedAnswer && (
                                    <p><span className="text-gray-500">Your answer: </span>
                                      <span className={q.isCorrect ? "text-green-700 font-medium" : "text-red-600 font-medium"}>
                                        {clean(q.selectedAnswer)}
                                      </span>
                                    </p>
                                  )}
                                  {!q.isCorrect && q.correctAnswer && (
                                    <p><span className="text-gray-500">Correct: </span>
                                      <span className="text-green-700 font-medium">{clean(q.correctAnswer)}</span>
                                    </p>
                                  )}
                                  {q.explanation && (
                                    <p className="mt-1 text-gray-500 italic">{clean(q.explanation)}</p>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t flex gap-3 shrink-0" style={{ borderColor: brandColors.border }}>
            <button
              onClick={() => { setResultsModal(null); handleExamClick(resultsModal) }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: color }}
            >
              {resultsAttempts.length > 0 ? "Retake Quiz" : "Start Quiz"}
            </button>
            <button
              onClick={() => { setResultsModal(null); setExpandedAttempt(null) }}
              className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-gray-50"
              style={{ borderColor: brandColors.border, color: brandColors.primary }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

export default TrackDetail

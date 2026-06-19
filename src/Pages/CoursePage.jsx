import React, { useEffect, useState, useCallback } from "react"
import {
  BookOpen, FileQuestion, Target, Layers, Zap,
  CheckCircle, Lock, ChevronRight, ArrowLeft, Clock, Loader,
  Video, FileText, Image as ImageIcon, Link as LinkIcon,
} from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  getCourseById, getCourseStepProgress, markStepComplete,
  getExam, getFlashcardsBySubjectGrade,
} from "../lib/api"
import { getTokenUserId } from "../lib/auth"

// ── Constants ──────────────────────────────────────────────────────────────────

const STEP_META = {
  lesson:        { label: "Lesson",      color: "#185FA5", Icon: BookOpen      },
  assessment:    { label: "Assessment",  color: "#003366", Icon: FileQuestion  },
  practice:      { label: "Practice",    color: "#1D9E75", Icon: Target        },
  flashcard_set: { label: "Flash Cards", color: "#7C3AED", Icon: Layers        },
  contest:       { label: "Contest",     color: "#E8A020", Icon: Zap           },
}

const FORMAT_ICON = {
  video: Video,
  pdf:   FileText,
  image: ImageIcon,
  link:  LinkIcon,
  text:  FileText,
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function CourseViewPage() {
  const location = useLocation()
  const navigate  = useNavigate()
  const courseData = location.state || {}

  const [course, setCourse]           = useState(null)
  const [stepStatus, setStepStatus]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [loadingStep, setLoadingStep] = useState(null)  // step id being fetched
  const [userId, setUserId]           = useState(null)

  const trackSlug = courseData?.trackSlug
  const trackName = courseData?.trackName

  useEffect(() => { setUserId(getTokenUserId()) }, [])

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const courseId = courseData._id || courseData.id
      if (!courseId) return

      const [courseRes, progressRes] = await Promise.all([
        getCourseById(courseId),
        userId ? getCourseStepProgress(userId, courseId) : Promise.resolve({ stepStatus: [] }),
      ])

      if (courseRes.course) setCourse(courseRes.course)
      setStepStatus(progressRes.stepStatus || [])
    } catch (err) {
      console.error("Failed to load course:", err)
    } finally {
      setLoading(false)
    }
  }, [courseData._id, courseData.id, userId])

  useEffect(() => { load() }, [load])

  // Re-fetch progress when user returns to tab
  useEffect(() => {
    const handleFocus = () => { if (userId) load() }
    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [load, userId])

  // ── Derived state ─────────────────────────────────────────────────────────────

  const steps = (course?.steps || []).slice().sort((a, b) => a.position - b.position)

  const isStepComplete = (stepId) => stepStatus.some(s => s.step_id === stepId && s.completed)
  const isStepLocked = (step) => step.unlock_after ? !isStepComplete(step.unlock_after) : false

  const completedCount = steps.filter(s => isStepComplete(s.id)).length
  const progressPct = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0

  // ── Navigation helpers ────────────────────────────────────────────────────────

  const courseId = course?.id || courseData._id || courseData.id

  const returnState = { returnTo: "/course-view", courseId, courseState: courseData }

  const handleStepAction = async (step) => {
    if (isStepLocked(step) || loadingStep) return

    switch (step.type) {
      case "lesson": {
        const stepIdx = steps.findIndex(s => s.id === step.id)
        navigate("/course-details", {
          state: {
            ...step,
            courseId,
            returnTo: "/course-view",
            courseState: courseData,
            trackSlug,
            trackName,
            initialCompleted: isStepComplete(step.id),
            allSteps: steps,
            stepIndex: stepIdx,
            stepStatus,
          },
        })
        break
      }

      case "assessment":
      case "practice": {
        if (!step.content_id) return
        try {
          setLoadingStep(step.id)
          const { exam } = await getExam(step.content_id)
          if (!exam) return
          const fullExam = { ...exam, _id: exam.id || exam._id, id: exam.id || exam._id }
          if (step.type === "practice") {
            navigate("/practice-overview", {
              state: { exam: fullExam, from: "/course-view", courseState: courseData },
            })
          } else {
            navigate("/quiz-overview", {
              state: { questions: fullExam, ...returnState },
            })
          }
        } catch (err) {
          console.error("Could not load exam:", err)
        } finally {
          setLoadingStep(null)
        }
        break
      }

      case "flashcard_set": {
        const [subject, grade] = (step.content_id || "").split("|")
        try {
          setLoadingStep(step.id)
          const { flashcards } = await getFlashcardsBySubjectGrade(subject, grade)
          navigate("/flashcards", {
            state: {
              flashcards,
              subject,
              grade,
              title: step.title || subject || "Flash Cards",
              ...returnState,
            },
          })
        } catch (err) {
          console.error("Could not load flashcards:", err)
        } finally {
          setLoadingStep(null)
        }
        break
      }

      case "contest": {
        if (!step.content_id) return
        try {
          setLoadingStep(step.id)
          const { exam } = await getExam(step.content_id)
          if (!exam) return
          navigate("/contest-overview", {
            state: {
              contest: { ...exam, _id: exam.id || exam._id, id: exam.id || exam._id },
              isContest: true,
              ...returnState,
            },
          })
        } catch (err) {
          console.error("Could not load contest:", err)
        } finally {
          setLoadingStep(null)
        }
        break
      }
    }
  }

  const handleManualComplete = async (step, e) => {
    e.stopPropagation()
    if (!userId || !courseId) return
    const nowComplete = !isStepComplete(step.id)
    setStepStatus(prev => {
      const idx = prev.findIndex(s => s.step_id === step.id)
      if (idx >= 0) {
        const next = [...prev]; next[idx] = { ...next[idx], completed: nowComplete }; return next
      }
      return [...prev, { step_id: step.id, completed: nowComplete }]
    })
    await markStepComplete(userId, courseId, step.id, nowComplete).catch(console.error)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center w-full">
        <p className="text-gray-400 text-sm">Loading learning path...</p>
      </div>
    )
  }

  const displayCourse = course || courseData
  const title = displayCourse?.title || "Learning Path"

  return (
    <div className="min-h-screen bg-gray-50 w-full pb-16">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Back */}
        <button
          onClick={() => trackSlug
            ? navigate(`/track/${trackSlug}`, { state: { tab: "courses" } })
            : navigate(-1)
          }
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back to {trackName || "Track"}
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          {displayCourse?.thumbnail && (
            <img src={displayCourse.thumbnail} alt={title}
              className="w-full h-40 object-cover rounded-xl mb-4 border border-gray-100" />
          )}
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
          {displayCourse?.description && (
            <p className="text-sm text-gray-500 leading-relaxed">{displayCourse.description}</p>
          )}
          {displayCourse?.instructor && (
            <p className="text-xs text-gray-400 mt-2">By {displayCourse.instructor}</p>
          )}
        </div>

        {/* Progress */}
        {steps.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-5">
                <div>
                  <p className="text-2xl font-bold" style={{ color: "#1D9E75" }}>{progressPct}%</p>
                  <p className="text-xs text-gray-400">Complete</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-gray-800">{completedCount}/{steps.length}</p>
                  <p className="text-xs text-gray-400">Steps done</p>
                </div>
              </div>
              {displayCourse?.duration && (
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <Clock size={13} /> {displayCourse.duration}
                </p>
              )}
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%`, backgroundColor: "#1D9E75" }} />
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800 text-sm tracking-wide">Learning path</h2>
          </div>

          {steps.length === 0 ? (
            <div className="py-16 text-center">
              <BookOpen size={28} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No content in this path yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {steps.map((step, idx) => {
                const meta     = STEP_META[step.type] || STEP_META.lesson
                const Icon     = meta.Icon
                const locked   = isStepLocked(step)
                const complete = isStepComplete(step.id)
                const fetching = loadingStep === step.id
                const FmtIcon  = step.content_format ? FORMAT_ICON[step.content_format] : null
                const unlockerStep = step.unlock_after ? steps.find(s => s.id === step.unlock_after) : null

                return (
                  <div
                    key={step.id}
                    className={`relative flex items-start gap-4 py-5 px-5 transition-colors ${
                      locked || fetching ? "opacity-60" : "hover:bg-gray-50 cursor-pointer"
                    }`}
                    onClick={!locked && !fetching ? () => handleStepAction(step) : undefined}
                  >
                    {/* Connector line */}
                    {idx < steps.length - 1 && (
                      <div className="absolute left-[2.375rem] top-[3.5rem] bottom-0 w-px bg-gray-100 z-0" />
                    )}

                    {/* Circle */}
                    <div className="relative z-10 shrink-0 w-9 h-9 rounded-full flex items-center justify-center border-2 shadow-sm"
                      style={{
                        backgroundColor: complete ? "#1D9E75" : locked ? "#F9FAFB" : meta.color,
                        borderColor:     complete ? "#1D9E75" : locked ? "#E5E7EB" : meta.color,
                      }}>
                      {fetching ? (
                        <Loader size={14} className="text-white animate-spin" />
                      ) : complete ? (
                        <CheckCircle size={15} className="text-white" />
                      ) : locked ? (
                        <Lock size={13} className="text-gray-400" />
                      ) : (
                        <Icon size={14} className="text-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: complete ? "#1D9E75" : locked ? "#9CA3AF" : meta.color }}>
                              {meta.label}
                            </span>
                            {complete && (
                              <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                Done
                              </span>
                            )}
                            {locked && unlockerStep && (
                              <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                <Lock size={8} /> Complete step {unlockerStep.position + 1} first
                              </span>
                            )}
                            {FmtIcon && step.type === "lesson" && (
                              <span className="text-[10px] text-gray-400 flex items-center gap-0.5 capitalize">
                                <FmtIcon size={9} /> {step.content_format}
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-sm text-gray-900 leading-snug">{step.title}</p>
                          {step.description && (
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{step.description}</p>
                          )}
                          {step.content_title && step.type !== "lesson" && (
                            <p className="text-xs text-gray-400 mt-0.5 italic">{step.content_title}</p>
                          )}
                          {step.duration && (
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <Clock size={10} /> {step.duration}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center gap-2 mt-0.5">
                          {!locked && (
                            <button
                              onClick={(e) => handleManualComplete(step, e)}
                              className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-colors whitespace-nowrap ${
                                complete
                                  ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                                  : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
                              }`}
                            >
                              {complete ? "Undo" : "Mark done"}
                            </button>
                          )}
                          {!locked && !fetching && (
                            <ChevronRight size={16} className="text-gray-300 shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

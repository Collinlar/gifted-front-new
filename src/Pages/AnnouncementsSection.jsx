import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { X, Pin, FileQuestion, Zap, BookOpen, CheckCircle, Megaphone, ChevronRight, Loader } from "lucide-react"
import { getAnnouncementsForUser, dismissAnnouncement, getExam, getCourseById } from "../lib/api"
import { getTokenUserId } from "../lib/auth"

// ── Type config ───────────────────────────────────────────────────────────────

const TYPE_META = {
  general:  { label: "Update",     color: "#4B5563", bg: "#F3F4F6", Icon: Megaphone    },
  exam:     { label: "Assessment", color: "#185FA5", bg: "#E6F1FB", Icon: FileQuestion },
  contest:  { label: "Contest",    color: "#E8A020", bg: "#FEF3E2", Icon: Zap          },
  results:  { label: "Results",    color: "#1D9E75", bg: "#E1F5EE", Icon: CheckCircle  },
  course:   { label: "Course",     color: "#7C3AED", bg: "#F3F0FF", Icon: BookOpen     },
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AnnouncementsSection() {
  const navigate = useNavigate()
  const [userId]       = useState(() => getTokenUserId())
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [acting,  setActing]  = useState(null) // announcement id being actioned

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    try {
      const { announcements } = await getAnnouncementsForUser(userId)
      setItems(announcements || [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  const handleDismiss = async (a, e) => {
    e.stopPropagation()
    if (a.is_pinned) return
    setItems((prev) => prev.filter((x) => x.id !== a.id))
    await dismissAnnouncement(userId, a.id).catch(() => {})
  }

  const handleCta = async (a) => {
    if (acting) return
    const type = a.type || "general"

    // External or custom URL
    if (a.cta_link) {
      if (a.cta_link.startsWith("http")) {
        window.open(a.cta_link, "_blank", "noopener")
      } else {
        navigate(a.cta_link)
      }
      return
    }

    // Content-linked types
    if (type === "exam" && a.content_id) {
      try {
        setActing(a.id)
        const { exam } = await getExam(a.content_id)
        if (!exam) return
        navigate("/quiz-overview", {
          state: { questions: { ...exam, _id: exam.id, id: exam.id } },
        })
      } catch { /* non-fatal */ } finally { setActing(null) }
      return
    }

    if (type === "contest" && a.content_id) {
      try {
        setActing(a.id)
        const { exam } = await getExam(a.content_id)
        if (!exam) return
        navigate("/contest-overview", {
          state: { contest: { ...exam, _id: exam.id, id: exam.id }, isContest: true },
        })
      } catch { /* non-fatal */ } finally { setActing(null) }
      return
    }

    if (type === "course" && a.content_id) {
      try {
        setActing(a.id)
        const { course } = await getCourseById(a.content_id)
        if (!course) return
        navigate("/course-view", { state: course })
      } catch { /* non-fatal */ } finally { setActing(null) }
      return
    }

    // No link — nothing to do
  }

  if (loading || items.length === 0) return null

  return (
    <div className="mb-8 space-y-3">
      {items.map((a) => {
        const type = a.type || "general"
        const meta = TYPE_META[type] || TYPE_META.general
        const Icon = meta.Icon
        const pinned = !!a.is_pinned
        const isActing = acting === a.id
        const hasAction = a.cta_link || (["exam", "contest", "course"].includes(type) && a.content_id)

        return (
          <div
            key={a.id}
            className="relative rounded-2xl border overflow-hidden"
            style={{ borderColor: `${meta.color}30`, backgroundColor: meta.bg }}
          >
            {/* Pin stripe */}
            {pinned && (
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: meta.color }} />
            )}

            <div className="flex items-start gap-4 p-4 sm:p-5">
              {/* Icon badge */}
              <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
                style={{ backgroundColor: `${meta.color}20` }}>
                <Icon size={16} style={{ color: meta.color }} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: meta.color }}>
                    {meta.label}
                  </span>
                  {pinned && (
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600">
                      <Pin size={9} /> Pinned
                    </span>
                  )}
                </div>
                <p className="font-semibold text-gray-900 text-sm leading-snug mb-1">{a.title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{a.body}</p>

                {hasAction && a.cta_label && (
                  <button
                    onClick={() => handleCta(a)}
                    disabled={isActing}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    style={{ backgroundColor: meta.color }}
                  >
                    {isActing ? (
                      <><Loader size={13} className="animate-spin" /> Loading...</>
                    ) : (
                      <>{a.cta_label} <ChevronRight size={13} /></>
                    )}
                  </button>
                )}
              </div>

              {/* Dismiss button — hidden on pinned */}
              {!pinned && (
                <button
                  onClick={(e) => handleDismiss(a, e)}
                  className="shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors"
                  aria-label="Dismiss"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

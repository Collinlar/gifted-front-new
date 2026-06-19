"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  CheckCircle, FileText, ArrowLeft, BookOpen, ExternalLink,
  ChevronLeft, ChevronRight, Video, StickyNote,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { markStepComplete, updateStepNote } from "../lib/api";
import { getTokenUserId } from "../lib/auth";

// ── Helpers ───────────────────────────────────────────────────────────────────

function toEmbedUrl(url) {
  if (!url) return null
  // youtube.com/watch?v=ID or youtu.be/ID
  if (url.includes("youtube.com/watch")) {
    const id = url.split("v=")[1]?.split("&")[0]
    return id ? `https://www.youtube.com/embed/${id}` : null
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0]
    return id ? `https://www.youtube.com/embed/${id}` : null
  }
  if (url.includes("youtube.com/embed/")) {
    return url // already an embed URL
  }
  if (url.includes("vimeo.com/")) {
    const id = url.split("vimeo.com/")[1]?.split("?")[0]
    return id ? `https://player.vimeo.com/video/${id}` : null
  }
  // Not a known video platform — treat as a direct embed URL (e.g. Loom, Wistia)
  return url
}

function isPdf(url) {
  if (!url) return false
  return url.toLowerCase().includes(".pdf") || url.includes("drive.google.com")
}

// ── Content Renderers ─────────────────────────────────────────────────────────

function VideoBlock({ url, label }) {
  const [blocked, setBlocked] = React.useState(false)
  const embed = toEmbedUrl(url)
  if (!embed) return null
  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-semibold text-gray-700">{label}</p>}
      {blocked ? (
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group">
          <Video size={18} className="text-blue-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-blue-600 group-hover:underline truncate">
              {label || "Watch video"}
            </p>
            <p className="text-xs text-gray-400">Opens in a new tab</p>
          </div>
          <ExternalLink size={14} className="text-blue-400 shrink-0 ml-auto" />
        </a>
      ) : (
        <div className="w-full rounded-xl overflow-hidden border border-gray-100 bg-black aspect-video">
          <iframe
            src={embed}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={label || "Lesson video"}
            onError={() => setBlocked(true)}
          />
        </div>
      )}
    </div>
  )
}

function PdfBlock({ url, label }) {
  if (!url) return null
  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-semibold text-gray-700">{label}</p>}
      <div className="w-full rounded-xl overflow-hidden border border-gray-100">
        <iframe
          src={url}
          className="w-full"
          style={{ height: "80vh", minHeight: 480 }}
          title={label || "Lesson PDF"}
        />
      </div>
    </div>
  )
}

function ImageBlock({ url, label }) {
  if (!url) return null
  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-semibold text-gray-700">{label}</p>}
      <div className="w-full rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
        <img
          src={url}
          alt={label || "Lesson image"}
          className="w-full h-auto object-contain max-h-[70vh]"
        />
      </div>
    </div>
  )
}

function LinkBlock({ url, label }) {
  if (!url) return null
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
    >
      <ExternalLink size={18} className="text-blue-500 shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-blue-600 group-hover:underline truncate">
          {label || url}
        </p>
        <p className="text-xs text-gray-400 truncate">{url}</p>
      </div>
    </a>
  )
}

function TextBlock({ body, label }) {
  if (!body) return null
  const isHtml = /<[a-z][\s\S]*>/i.test(body)
  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-semibold text-gray-700">{label}</p>}
      {isHtml ? (
        <div
          className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      ) : (
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
          {body}
        </div>
      )}
    </div>
  )
}

// Render a single ContentItem
function ContentItemBlock({ item }) {
  if (!item) return null
  const label = item.title || null
  switch (item.type) {
    case "video": return <VideoBlock url={item.url} label={label} />
    case "pdf":   return <PdfBlock   url={item.url} label={label} />
    case "image": return <ImageBlock url={item.url} label={label} />
    case "link":  return <LinkBlock  url={item.url} label={label} />
    case "text":  return <TextBlock  body={item.body} label={label} />
    default:      return null
  }
}

// ── Step type badge ───────────────────────────────────────────────────────────

const STEP_TYPE_LABEL = {
  lesson: "Lesson", assessment: "Assessment", practice: "Practice",
  flashcard_set: "Flash Cards", contest: "Contest",
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CourseDetails() {
  const location = useLocation()
  const navigate  = useNavigate()
  const step = location.state || {}

  const courseId    = step.courseId
  const returnTo    = step.returnTo
  const courseState = step.courseState
  const allSteps    = step.allSteps   || []
  const stepIndex   = step.stepIndex  ?? -1
  const stepStatus  = step.stepStatus || []

  const [isCompleted, setIsCompleted] = useState(!!step.initialCompleted)
  const [isSaving, setIsSaving]       = useState(false)
  const [note, setNote]               = useState("")
  const [noteSaving, setNoteSaving]   = useState(false)
  const [noteSaved, setNoteSaved]     = useState(false)
  const noteTimer = useRef(null)

  const userId = getTokenUserId()

  // Init completed and note from stepStatus
  useEffect(() => {
    setIsCompleted(!!step.initialCompleted)
    const existing = stepStatus.find(s => s.step_id === step.id)
    setNote(existing?.note || "")
    setNoteSaved(false)
  }, [step.id])

  // ── Resolve content ───────────────────────────────────────────────────────

  // New model: content_items array (may also be contentItems from camelCase corruption)
  const contentItems = step.content_items || step.contentItems || []

  // Legacy single-format fallback (backward compat for steps not yet migrated)
  const rawFormat  = step.content_format || step.contentFormat
  const videoUrl   = step.video     || ""
  const fileUrl    = step.file      || ""
  const imageUrl   = step.image     || ""
  const linkUrl    = step.resources || ""
  const bodyText   = step.body      || ""
  const legacyFormat = rawFormat || (() => {
    if (videoUrl) return "video"
    if (fileUrl)  return "pdf"
    if (imageUrl) return "image"
    if (linkUrl)  return "link"
    if (bodyText) return "text"
    return null
  })()

  // Legacy module fields (courses without step model)
  const legacyVideos = Array.isArray(step.Videos)
    ? step.Videos.filter(u => typeof u === "string" && u.trim())
    : []
  const legacyFiles = Array.isArray(step.files) ? step.files : []
  const legacyLinks = Array.isArray(step.additionalResources) ? step.additionalResources : []

  const hasContentItems = contentItems.length > 0
  const isStepBased = !!rawFormat || step.type === "lesson"
  const hasLegacy   = legacyVideos.length || legacyFiles.length || legacyLinks.length
  const hasContent  = hasContentItems ||
                      videoUrl || fileUrl || imageUrl || linkUrl || bodyText ||
                      hasLegacy

  const title       = step.title || step.name || "Lesson"
  const description = step.description || ""
  const duration    = step.duration || ""
  const stepTypeLabel = STEP_TYPE_LABEL[step.type] || "Lesson"

  // ── Adjacent step navigation ──────────────────────────────────────────────

  const prevStep = stepIndex > 0 ? allSteps[stepIndex - 1] : null
  const nextStep = stepIndex >= 0 && stepIndex < allSteps.length - 1 ? allSteps[stepIndex + 1] : null

  const navigateToStep = (targetStep, targetIdx) => {
    if (!targetStep) return
    if (targetStep.type === "lesson") {
      navigate("/course-details", {
        state: {
          ...targetStep,
          courseId,
          returnTo,
          courseState,
          allSteps,
          stepIndex: targetIdx,
          stepStatus,
          initialCompleted: stepStatus.some(s => s.step_id === targetStep.id && s.completed),
        },
      })
    } else {
      navigate(returnTo || "/course-view", { state: courseState })
    }
  }

  // ── Mark complete ─────────────────────────────────────────────────────────

  const handleToggle = async () => {
    setIsSaving(true)
    try {
      const nowComplete = !isCompleted
      setIsCompleted(nowComplete)
      if (userId && courseId && step.id) {
        await markStepComplete(userId, courseId, step.id, nowComplete)
      }
      if (nowComplete && nextStep) {
        setTimeout(() => navigateToStep(nextStep, stepIndex + 1), 500)
      } else if (nowComplete && returnTo) {
        setTimeout(() => navigate(returnTo, { state: courseState }), 500)
      }
    } catch (err) {
      console.error("Could not update completion:", err)
    } finally {
      setIsSaving(false)
    }
  }

  // ── Notes (debounced auto-save) ───────────────────────────────────────────

  const handleNoteChange = useCallback((value) => {
    setNote(value)
    setNoteSaved(false)
    if (noteTimer.current) clearTimeout(noteTimer.current)
    noteTimer.current = setTimeout(async () => {
      if (!userId || !courseId || !step.id) return
      setNoteSaving(true)
      try {
        await updateStepNote(userId, courseId, step.id, value)
        setNoteSaved(true)
      } catch {
        // non-fatal
      } finally {
        setNoteSaving(false)
      }
    }, 1200)
  }, [userId, courseId, step.id])

  // ── Back navigation ───────────────────────────────────────────────────────

  const handleBack = () => {
    if (returnTo) navigate(returnTo, { state: courseState })
    else navigate(-1)
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full pb-16">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Back + step counter */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <ArrowLeft size={16} />
            {returnTo ? "Back to learning path" : "Back"}
          </button>
          {allSteps.length > 0 && stepIndex >= 0 && (
            <span className="text-xs text-gray-400 font-medium">
              Step {stepIndex + 1} of {allSteps.length}
            </span>
          )}
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                <BookOpen size={11} /> {stepTypeLabel}
              </p>
              <h1 className="text-xl font-bold text-gray-900 leading-snug">{title}</h1>
              {description && (
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>
              )}
              {duration && (
                <p className="text-xs text-gray-400 mt-1">{duration}</p>
              )}
            </div>
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              isCompleted ? "bg-green-500 border-green-500" : "bg-white border-gray-200"
            }`}>
              <CheckCircle size={15} className={isCompleted ? "text-white" : "text-gray-300"} />
            </div>
          </div>
        </div>

        {/* ── Content area ── */}

        {/* New model: content_items array */}
        {hasContentItems && (
          <div className="space-y-5">
            {contentItems.map((item, i) => (
              <div key={item.id || i}>
                {item.type === "text" ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <ContentItemBlock item={item} />
                  </div>
                ) : (
                  <ContentItemBlock item={item} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Legacy single-format (steps before content_items) */}
        {!hasContentItems && isStepBased && (
          <div className="space-y-4">
            {legacyFormat === "video" && videoUrl && <VideoBlock url={videoUrl} />}
            {legacyFormat === "pdf"   && fileUrl  && <PdfBlock   url={fileUrl} />}
            {legacyFormat === "image" && imageUrl && <ImageBlock url={imageUrl} label={title} />}
            {legacyFormat === "link"  && linkUrl  && <LinkBlock  url={linkUrl} label={title} />}
            {legacyFormat === "text"  && bodyText && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <TextBlock body={bodyText} />
              </div>
            )}
          </div>
        )}

        {/* Legacy module content (older courses without step model) */}
        {!hasContentItems && !isStepBased && (
          <div className="space-y-4">
            {legacyVideos.map((url, i) => <VideoBlock key={i} url={url} />)}
            {legacyFiles.map((url, i) => {
              if (typeof url !== "string") return null
              return isPdf(url) ? <PdfBlock key={i} url={url} /> : <LinkBlock key={i} url={url} label={url.split("/").pop()} />
            })}
            {legacyLinks.map((resource, i) => {
              const url   = typeof resource === "string" ? resource : resource?.url
              const label = typeof resource === "string" ? resource : (resource?.title || resource?.label || resource?.name || url)
              if (!url) return null
              return <LinkBlock key={i} url={url} label={label} />
            })}
          </div>
        )}

        {/* Empty state */}
        {!hasContent && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
            <FileText size={28} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No content has been added to this lesson yet.</p>
          </div>
        )}

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <StickyNote size={15} className="text-gray-400" />
              Your notes
            </p>
            {noteSaving && <span className="text-[11px] text-gray-400">Saving...</span>}
            {!noteSaving && noteSaved && <span className="text-[11px] text-green-600">Saved</span>}
          </div>
          <textarea
            value={note}
            onChange={(e) => handleNoteChange(e.target.value)}
            rows={4}
            placeholder="Write notes on what you're learning here. They save automatically."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-colors leading-relaxed"
          />
        </div>

        {/* Mark complete action */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {isCompleted ? "Marked as complete" : "Mark this lesson as complete"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isCompleted
                ? "Your progress is saved. You can undo this any time."
                : "Tap when you're done to track your progress."}
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={isSaving}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              isCompleted
                ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                : "bg-blue-600 text-white hover:bg-blue-700"
            } disabled:opacity-50`}
          >
            {isSaving ? "Saving..." : isCompleted ? "Undo" : "Mark complete"}
          </button>
        </div>

        {/* Previous / Next step navigation */}
        {(prevStep || nextStep) && (
          <div className="grid grid-cols-2 gap-3">
            {prevStep ? (
              <button
                onClick={() => navigateToStep(prevStep, stepIndex - 1)}
                className="flex items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-gray-200 hover:bg-gray-50 transition-colors text-left"
              >
                <ChevronLeft size={16} className="text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Previous</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{prevStep.title}</p>
                </div>
              </button>
            ) : <div />}
            {nextStep ? (
              <button
                onClick={() => navigateToStep(nextStep, stepIndex + 1)}
                className="flex items-center justify-end gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-gray-200 hover:bg-gray-50 transition-colors text-right"
              >
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Next</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{nextStep.title}</p>
                </div>
                <ChevronRight size={16} className="text-gray-400 shrink-0" />
              </button>
            ) : <div />}
          </div>
        )}
      </div>
    </div>
  )
}

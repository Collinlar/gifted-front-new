import { useState } from "react"
import { ImageOff } from "lucide-react"

// The picture attached to a question.
//
// 600 of the 1,638 questions on the platform carry one, and for 44 of them the
// picture is the entire question: the text is empty and the diagram is what is
// being asked about. Only the main quiz runner ever drew them. Practice mode,
// contests, the review screen and the exam results screen each rendered the
// question text and silently dropped the image, so half of all practice
// content was being sat without the thing it was asking about.
//
// One component so those four cannot drift apart again.

export default function QuestionImage({
  src,
  title,
  alt,
  className = "",
  maxHeight = "16rem",
  // The picture for the question on screen is the thing being looked at, so it
  // loads eagerly. Only long review lists, where most rows are far below the
  // fold, pass lazy.
  lazy = false,
}) {
  const [failed, setFailed] = useState(false)
  if (!src) return null

  // A dead link on a picture-only question would otherwise leave a blank space
  // with nothing to answer, so it says what happened instead.
  if (failed) {
    return (
      <div className={`mb-4 flex items-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-xs ${className}`}
        style={{ borderColor: "#E5E7EB", color: "#6B7280" }}>
        <ImageOff size={14} />
        This question has a picture that would not load. Check your connection, or tell us if it keeps happening.
      </div>
    )
  }

  return (
    <figure className={`mb-4 ${className}`}>
      <img
        src={src}
        alt={alt || title || "Picture for this question"}
        loading={lazy ? "lazy" : "eager"}
        onError={() => setFailed(true)}
        className="w-full object-contain mx-auto rounded"
        style={{ maxHeight }}
      />
      {title && (
        <figcaption className="text-center text-xs mt-1.5" style={{ color: "#6B7280" }}>
          {title}
        </figcaption>
      )}
    </figure>
  )
}

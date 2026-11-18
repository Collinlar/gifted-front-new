import { useEffect, useMemo, useState } from "react"
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
  media,
  title,
  alt,
  className = "",
  maxHeight = "16rem",
  // The picture for the question on screen is the thing being looked at, so it
  // loads eagerly. Only long review lists, where most rows are far below the
  // fold, pass lazy.
  lazy = false,
}) {
  const items = useMemo(() => Array.isArray(media) && media.length
    ? media.filter(item => item?.url)
    : src ? [{ url: src, title, alt }] : [], [media, src, title, alt])
  const [failed, setFailed] = useState(() => new Set())
  const signature = items.map(item => item.url).join("\n")
  useEffect(() => setFailed(new Set()), [signature])
  if (!items.length) return null

  // A dead link on a picture-only question would otherwise leave a blank space
  // with nothing to answer, so it says what happened instead.
  return (
    <div className={`mb-4 grid gap-3 ${items.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'} ${className}`}>
      {items.map((item, index) => failed.has(index) ? (
        <div key={`${item.url}-${index}`} className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-xs"
          style={{ borderColor: "#E5E7EB", color: "#6B7280" }}>
          <ImageOff size={14} /> This image would not load. Check your connection, or tell us if it keeps happening.
        </div>
      ) : (
        <figure key={`${item.url}-${index}`}>
          <img src={item.url} alt={item.alt || item.title || alt || title || `Assessment image ${index + 1}`}
            loading={lazy ? "lazy" : "eager"}
            onError={() => setFailed(previous => new Set(previous).add(index))}
            className="w-full object-contain mx-auto rounded" style={{ maxHeight }} />
          {(item.title || item.alt) && <figcaption className="text-center text-xs mt-1.5" style={{ color: "#6B7280" }}>
            {item.title || item.alt}
          </figcaption>}
        </figure>
      ))}
    </div>
  )
}

// The Gifted mark.
//
// Three lockups, each in two finishes. The navy finish is for bone and white
// surfaces; the light finish swaps the navy for bone so the mark survives on
// the navy sidebar and the homepage header without sitting in a white box.
//
// Files live in public/brand so they are served straight off the CDN rather
// than bundled, and are never below their legible size: the mark stops making
// sense as a book and a star under about 20px.

const FILES = {
  lockup:  { dark: "/brand/gifted-lockup.png",  light: "/brand/gifted-lockup-light.png",  ratio: 994 / 366 },
  mark:    { dark: "/brand/gifted-mark.png",    light: "/brand/gifted-mark-light.png",    ratio: 202 / 268 },
  stacked: { dark: "/brand/gifted-stacked.png", light: "/brand/gifted-stacked-light.png", ratio: 1 },
}

export default function GiftedLogo({
  variant = "lockup",
  // "navy" for light backgrounds, "bone" for navy and photographic ones
  tone = "navy",
  // Height in pixels. Width follows the artwork so nothing ever stretches.
  height = 32,
  className = "",
  title = "Gifted Olympiad Edu Center",
}) {
  const art = FILES[variant] || FILES.lockup
  const src = tone === "bone" ? art.light : art.dark
  const h = Math.max(20, height)

  return (
    <img
      src={src}
      alt={title}
      width={Math.round(h * art.ratio)}
      height={h}
      style={{ height: h, width: "auto" }}
      className={`block select-none ${className}`}
      draggable={false}
    />
  )
}

// Tokens for the signed-in app.
//
// Separate from giftedTheme.js, which is the marketing and auth language.
// This one is the working surface: navy on a cool grey ground, quiet, legible
// on a phone in daylight.
//
// It exists because every page had been re-declaring its own brandColors
// object with slightly different values, and the marketplace had drifted to a
// sky-blue gradient that belonged to no part of the product.

export const A = {
  navy:       "#003366", // headings, primary actions
  navyDeep:   "#002347",
  mid:        "#336699", // secondary text, links
  accent:     "#6699CC",
  ground:     "#F0F4F8", // page background
  surface:    "#FFFFFF",
  line:       "#E5E7EB",
  lineSoft:   "#F1F4F7",
  ink:        "#111827", // body text
  muted:      "#4B5563",
  subtle:     "#9CA3AF",

  // Used sparingly and always to mean something, never for decoration
  green:      "#047857",
  greenSoft:  "#ECFDF5",
  amber:      "#B45309",
  amberSoft:  "#FFFBEB",
  red:        "#B91C1C",
  redSoft:    "#FEF2F2",
  gold:       "#E8A020",
}

/** Grades a colour to a translucent background of itself. */
export const tint = (hex, alpha = "14") => `${hex}${alpha}`

/** Date formatting used across programmes, orders and the calendar. */
export function shortDate(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
}

export function dayMonth(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" })
}

/** Whole days from now, negative for the past. Null when there is no date. */
export function daysUntil(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return Math.ceil((d - Date.now()) / 86400000)
}

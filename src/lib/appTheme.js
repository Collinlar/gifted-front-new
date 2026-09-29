// Tokens for the signed-in app.
//
// The navy is no longer this file's to decide. It comes from lib/navy.js, the
// same ramp the homepage is built on, so a student does not meet one blue
// signed out and a different one signed in.
//
// What stays here is the working surface: navy on a cool grey ground, quiet,
// legible on a phone in daylight, plus the status colours and the date helpers.

import { NAVY } from "./navy"

export { NAVY }

export const A = {
  navy:       NAVY[800], // headings, primary actions
  navyDeep:   NAVY[900],
  mid:        "#2666A6", // secondary text, links
  accent:     "#6199D1",
  ground:     NAVY[50],  // page background
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

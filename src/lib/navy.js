// The Gifted navy. One ramp, one hue, used by the homepage and the signed-in
// app alike.
//
// Collins' note, September 2026: signed out you saw one blue, signed in you
// saw another. The homepage navy is the one we keep, so this ramp is anchored
// on it at both ends. 900 is the exact panel navy off the homepage and 50 is
// the exact page ground the app already used. Everything between is the same
// hue, 210 degrees, with the saturation easing off as it lightens so the pale
// tints do not read as sky blue.
//
// Contrast against white was matched step for step to the ramp this replaced,
// so nothing that passed WCAG before stopped passing.

export const NAVY = {
  50:  "#F0F4F8", // page ground
  100: "#DFE8F1",
  200: "#BCD1E6",
  300: "#87B0D9",
  400: "#4B8CCE",
  500: "#2A6EB2", // 5.31:1 on white
  600: "#1D5790", // 7.47:1 on white
  700: "#15426F",
  800: "#103254", // headings and primary actions, 13.1:1 on white
  900: "#0B1F33", // homepage panel navy
  950: "#07131F", // homepage hero ink is #08182A, this is the floor below it
}

// The marks are drawn in their own navy, which is a touch bluer than the
// surface ramp. Kept separate on purpose: a logo keeps its own colour.
export const LOGO_NAVY = "#001E52"
export const LOGO_GOLD = "#D1A645"

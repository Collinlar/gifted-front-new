// Design tokens for the Gifted marketing and auth surfaces.
//
// A separate visual language from the signed-in app: editorial, square
// cornered, bone and gold on deep navy. Kept in one place so the homepage and
// the auth page cannot drift apart.
//
// The navy itself is shared, not separate. It lives in lib/navy.js and the app
// reads the same ramp, so the blue does not change the moment a student signs
// in. Only the typography, the spacing and the gold belong to this file.

import { NAVY } from "../lib/navy"

export const T = {
  ink:        "#08182A", // deepest navy, page base
  navy:       NAVY[900], // panel navy, the anchor the whole ramp is built on
  bone:       "#F6F5F2", // primary text on dark, section background
  boneWarm:   "#FFFDFA", // warmest section background
  gold:       "#E8A33D",
  goldLight:  "#F6C378",
  goldDeep:   "#B8862A",
  slate:      "#5A6570",
  slateLight: "#7D8791",
  ruleLight:  "#E4E1DA",
};

export const display = "'Archivo','Helvetica Neue',Helvetica,Arial,sans-serif";
export const body    = "'Instrument Sans','Helvetica Neue',Helvetica,Arial,sans-serif";

// Loaded once per page rather than per component. `display=swap` keeps text
// visible while the webfont arrives, which matters on a slow connection.
export const FONT_LINKS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
`;

export const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600&display=swap";

// Injects the webfonts once, no matter how many of these pages mount.
export function useGiftedFonts() {
  if (typeof document === "undefined") return;
  if (document.getElementById("gifted-fonts")) return;

  const pre1 = document.createElement("link");
  pre1.rel = "preconnect";
  pre1.href = "https://fonts.googleapis.com";

  const pre2 = document.createElement("link");
  pre2.rel = "preconnect";
  pre2.href = "https://fonts.gstatic.com";
  pre2.crossOrigin = "anonymous";

  const font = document.createElement("link");
  font.id = "gifted-fonts";
  font.rel = "stylesheet";
  font.href = FONT_HREF;

  document.head.append(pre1, pre2, font);
}

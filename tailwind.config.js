/** @type {import('tailwindcss').Config} */
const flowbite = require("flowbite-react/tailwind");
import { NAVY } from "./src/lib/navy.js";

// Tailwind ships blue, sky, cyan and indigo as four unrelated bright blues,
// and the app had reached for all four. That is why the colour changed when a
// student signed in. Rather than rewrite eight hundred class names, the four
// scales are re-pointed at the one Gifted navy.
//
// They are offset from each other so a gradient written as
// "from-sky-600 to-cyan-600" still reads as a gradient: sky sits one step
// lighter than blue, cyan one step darker. Nothing goes flat, nothing goes
// bright.
const KEYS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const shift = (by) =>
  Object.fromEntries(
    KEYS.map((k, i) => [k, NAVY[KEYS[Math.min(KEYS.length - 1, Math.max(0, i + by))]]])
  );

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", flowbite.content()],
  theme: {
    extend: {
      colors: {
        blue: shift(0),
        indigo: shift(0),
        sky: shift(-1),
        cyan: shift(1),
        navy: NAVY,

        // Left from the original template. Still referenced in a few places.
        neutralSilver: "#F5F7FA",
        neutralDGrey: "#4D4D4D",
        brandPrimary: "#4CAF4F",
        neutralGrey: "#717171",
        gray900: "#18191F",
      },
    },
  },
  plugins: [flowbite.plugin()],
};

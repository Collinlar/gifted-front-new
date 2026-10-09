import { supabase } from './supabase'

// The homepage's words, and where they come from.
//
// They live in homepage_sections so the team can change a closing date without
// a deploy.
//
// DEFAULTS below is the last resort and nothing else. It used to render while
// the real content was being fetched, on the reasoning that a headline which
// changes a moment later beats a spinner. That was wrong. The seed drifted
// from what the team actually publishes, and by October 2026 every single
// section differed: six programmes that do not exist, a different headline,
// and a footer carrying the wrong email and the wrong phone number, all on
// screen for about a second before the real page replaced it.
//
// So the order is now: whatever we cached from this visitor's last visit,
// then the live fetch, and DEFAULTS only if the fetch actually fails. A page
// that is briefly incomplete is better than a page that is briefly untrue.

export const DEFAULTS = {
  brand: {
    wordmark: "Gifted",
    kicker: "Olympiad Edu Center",
    nav: [
      { label: "Programmes",   target: "#programmes" },
      { label: "How it works", target: "#steps" },
      { label: "Dates",        target: "#dates" },
    ],
    signInLabel: "Sign in",
  },

  hero: {
    eyebrow: "Accra · since 2019",
    headline: ["Olympiad training,", "taught by people", "who have sat it."],
    lede: "Six programmes in maths, physics and computing — live coaching, timed papers and certification students can verify.",
    primaryLabel: "See open dates",
    primaryTarget: "#dates",
    secondaryLabel: "Student sign in",
    secondaryTarget: "/login",
  },

  programmes: {
    heading: "Programmes",
    items: [
      { title: "Mathematics Olympiad",    meta: "Ages 12–18", img: "/math.jpg",          target: "/login",
        line: "Algebra, number theory, combinatorics and geometry, taught through past olympiad papers." },
      { title: "Physics Olympiad",        meta: "Ages 14–18", img: "/stem.jpg",          target: "/login",
        line: "Mechanics and electromagnetism worked to competition depth, with lab-style problem sessions." },
      { title: "Informatics and Coding",  meta: "Ages 13–18", img: "/eng_400x200.jpg",   target: "/login",
        line: "Algorithms, data structures and contest programming, graded on real judge problems." },
      { title: "STEM Bootcamp",           meta: "3 weeks",    img: "/2.jpg",             target: "/login",
        line: "A short, fast introduction across maths, physics and computing for students testing the water." },
      { title: "Pathways for Beginners",  meta: "Ages 10–14", img: "/us.jpg",            target: "/login",
        line: "Foundations first: problem-solving habits, notation and confidence before competition work." },
      { title: "Exams and Certification", meta: "Year-round", img: "/math.jpg",          target: "/login",
        line: "Sit accredited assessments and receive a certificate that schools can verify by serial number." },
    ],
  },

  proof: {
    stats: [
      { value: "12,000", label: "Students on the platform" },
      { value: "20+",    label: "Olympiads supported" },
    ],
    line: "Coaching is run by former olympiad medallists and university faculty, built around the past papers and mark schemes students actually sit.",
  },

  steps: {
    kicker: "How it works",
    items: [
      { n: "01", title: "Choose a programme", body: "Start on a beginner pathway or go straight to a subject olympiad track. A short diagnostic places you." },
      { n: "02", title: "Train every week",   body: "Live coaching, timed problem sets and past papers, with your progress tracked against the syllabus." },
      { n: "03", title: "Sit and certify",    body: "Register through the portal, sit the supervised exam, and get a certificate schools can verify by serial." },
    ],
  },

  dates: {
    heading: "What is open right now.",
    note: "Places are limited per cohort and close once a sitting is scheduled.",
    ctaLabel: "Register",
    items: [
      { term: "Term 3",  name: "National Mathematics Olympiad", what: "Registration and paper selection for the national round.", when: "closes · tbc", target: "/sign-up" },
      { term: "Term 3",  name: "Physics Olympiad, Round One",   what: "Supervised sitting at partner centres in Accra and Kumasi.", when: "sits · tbc",  target: "/sign-up" },
      { term: "Rolling", name: "Beginner Pathway Intake",       what: "Weekly classes for students new to competition work.",      when: "begins · tbc", target: "/sign-up" },
    ],
  },

  footer: {
    brand: "Gifted",
    email: "programs@atdp.africa",
    phone: "+233 20 185 6818",
    address: "East Legon, Accra, Ghana",
    copyright: "© 2026 Olympiad Edu Center",
  },
}

// Order sections appear in when the table has nothing to say about it
const ORDER = ["brand", "hero", "programmes", "proof", "steps", "dates", "footer"]

// ── The visitor's last known good copy ─────────────────────────────────────
//
// Written after every successful fetch and read synchronously on the next
// load, so a returning visitor's first paint is already the real page rather
// than a guess at it. Bumping CACHE_KEY retires every stored copy at once,
// which is what to do if the shape here ever changes.

const CACHE_KEY = "gifted:homepage:v1"

/** The cached page, or null. Never throws: private mode and cleared storage
 *  both read as "no cache", which is a fine thing to be. */
export function readCachedHomepage({ preview = false } = {}) {
  // A preview is unpublished by definition, so it must never be served from
  // or written to a cache a real visitor could pick up.
  if (preview) return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw)
    if (!saved?.sections) return null
    return {
      sections: saved.sections,
      order: saved.order || ORDER,
      hidden: new Set(saved.hidden || []),   // a Set does not survive JSON
      source: "cache",
    }
  } catch {
    return null
  }
}

function writeCache({ sections, order, hidden }) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      sections, order, hidden: [...hidden],
    }))
  } catch {
    // Storage full, blocked, or private mode. The page still works, the next
    // visitor just pays for the fetch again.
  }
}

/**
 * The homepage as it should render.
 *
 * @param {boolean} preview  read drafts instead of published content, so the
 *                           admin can see unpublished edits on the real page
 *                           rather than in a mock of it
 */
export async function getHomepage({ preview = false } = {}) {
  const fallback = {
    sections: DEFAULTS,
    order: ORDER,
    hidden: new Set(),
    fromDatabase: false,
    source: "fallback",
  }

  try {
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("key, enabled, sort_order, content, draft")
      .order("sort_order", { ascending: true })

    if (error || !data?.length) return fallback

    const sections = {}
    const order = []
    const hidden = new Set()

    for (const row of data) {
      // A section with nothing in it renders as the default rather than as a
      // blank strip. Someone clearing a field by accident should not take a
      // hole out of the public page.
      const chosen = preview ? (row.draft ?? row.content) : row.content
      const merged = { ...(DEFAULTS[row.key] || {}), ...(chosen || {}) }

      sections[row.key] = merged
      order.push(row.key)
      if (!row.enabled) hidden.add(row.key)
    }

    // Anything the table has never heard of still renders in its usual place
    for (const key of ORDER) {
      if (!sections[key]) {
        sections[key] = DEFAULTS[key]
        order.splice(ORDER.indexOf(key), 0, key)
      }
    }

    if (!preview) writeCache({ sections, order, hidden })
    return { sections, order, hidden, fromDatabase: true, source: "live" }
  } catch {
    return fallback
  }
}

/** Empty arrays are a real editorial choice, so only null and undefined fall back. */
export function list(value, fallbackList) {
  return Array.isArray(value) ? value : fallbackList
}

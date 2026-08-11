import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { T, display, body, useGiftedFonts } from "./giftedTheme"

// ── Content ────────────────────────────────────────────────────────────────

const PROGRAMMES = [
  { title: "Mathematics Olympiad",   meta: "Ages 12–18", img: "/math.jpg",
    line: "Algebra, number theory, combinatorics and geometry, taught through past olympiad papers." },
  { title: "Physics Olympiad",       meta: "Ages 14–18", img: "/stem.jpg",
    line: "Mechanics and electromagnetism worked to competition depth, with lab-style problem sessions." },
  { title: "Informatics and Coding", meta: "Ages 13–18", img: "/eng_400x200.jpg",
    line: "Algorithms, data structures and contest programming, graded on real judge problems." },
  { title: "STEM Bootcamp",          meta: "3 weeks",    img: "/2.jpg",
    line: "A short, fast introduction across maths, physics and computing for students testing the water." },
  { title: "Pathways for Beginners", meta: "Ages 10–14", img: "/us.jpg",
    line: "Foundations first: problem-solving habits, notation and confidence before competition work." },
  { title: "Exams and Certification",meta: "Year-round", img: "/math.jpg",
    line: "Sit accredited assessments and receive a certificate that schools can verify by serial number." },
]

const STEPS = [
  { n: "01", title: "Choose a programme", body: "Start on a beginner pathway or go straight to a subject olympiad track. A short diagnostic places you." },
  { n: "02", title: "Train every week",   body: "Live coaching, timed problem sets and past papers, with your progress tracked against the syllabus." },
  { n: "03", title: "Sit and certify",    body: "Register through the portal, sit the supervised exam, and get a certificate schools can verify by serial." },
]

const EVENTS = [
  { term: "Term 3",  name: "National Mathematics Olympiad", what: "Registration and paper selection for the national round.", when: "closes · tbc" },
  { term: "Term 3",  name: "Physics Olympiad, Round One",   what: "Supervised sitting at partner centres in Accra and Kumasi.", when: "sits · tbc" },
  { term: "Rolling", name: "Beginner Pathway Intake",       what: "Weekly classes for students new to competition work.",      when: "begins · tbc" },
]

const ROTATE_MS = 5200

// ── Page ───────────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate()
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const timer = useRef(null)

  useGiftedFonts()

  // Rotate the hero imagery. Pauses on interaction so a chosen programme stays
  // put, and respects a reduced-motion preference by not rotating at all.
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    if (reduce || paused) return
    timer.current = setInterval(() => setActive((i) => (i + 1) % PROGRAMMES.length), ROTATE_MS)
    return () => clearInterval(timer.current)
  }, [paused])

  // Warm the images so switching does not flash on a slow connection
  useEffect(() => {
    PROGRAMMES.forEach((p) => { const im = new Image(); im.src = p.img })
  }, [])

  const choose = (i) => { setActive(i); setPaused(true) }

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.offsetTop, behavior: "smooth" })
  }

  return (
    <div className="gf">
      <style>{CSS}</style>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="gf-hero">
        {PROGRAMMES.map((p, i) => (
          <div
            key={p.title + i}
            aria-hidden
            className="gf-slide"
            style={{ backgroundImage: `url(${p.img})`, opacity: i === active ? 1 : 0 }}
          />
        ))}
        <div className="gf-scrim" aria-hidden />

        <div className="gf-heroInner">
          <header className="gf-header">
            <a href="/" className="gf-brand" onClick={(e) => { e.preventDefault(); scrollTo("top") }}>
              <span className="gf-wordmark">Gifted</span>
              <span className="gf-kicker">Olympiad Edu Center</span>
            </a>
            <nav className="gf-nav">
              <button onClick={() => scrollTo("programmes")}>Programmes</button>
              <button onClick={() => scrollTo("steps")}>How it works</button>
              <button onClick={() => scrollTo("dates")}>Dates</button>
              <button className="gf-navSignIn" onClick={() => navigate("/login")}>Sign in</button>
            </nav>
          </header>

          <div className="gf-heroGrid">
            <div className="gf-heroCopy">
              <div className="gf-eyebrow">Accra · since 2019</div>
              <h1 className="gf-h1">
                Olympiad training,<br />taught by people<br />who have sat it.
              </h1>
              <p className="gf-lede">
                Six programmes in maths, physics and computing — live coaching, timed papers
                and certification students can verify.
              </p>
              <div className="gf-cta">
                <button className="gf-btnGold" onClick={() => scrollTo("dates")}>See open dates</button>
                <button className="gf-btnGhost" onClick={() => navigate("/login")}>Student sign in</button>
              </div>
            </div>

            <div className="gf-index" id="programmes">
              <div className="gf-indexHead">Programmes</div>
              {PROGRAMMES.map((p, i) => (
                <button
                  key={p.title + i}
                  className={`gf-row ${i === active ? "is-active" : ""}`}
                  onMouseEnter={() => choose(i)}
                  onFocus={() => choose(i)}
                  onClick={() => navigate("/login")}
                  aria-current={i === active ? "true" : undefined}
                >
                  <span className="gf-rowNum">{String(i + 1).padStart(2, "0")}</span>
                  <span className="gf-rowTitle">{p.title}</span>
                  <span className="gf-rowMeta">{p.meta}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="gf-heroFoot">
            <p className="gf-activeLine" aria-live="polite">{PROGRAMMES[active].line}</p>
            <button className="gf-scroll" aria-label="Scroll to programmes" onClick={() => scrollTo("proof")}>
              <span className="gf-chev" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Proof ────────────────────────────────────────────────────── */}
      <section id="proof" className="gf-proof">
        <div>
          <div className="gf-stat">12,000</div>
          <div className="gf-statLabel">Students on the platform</div>
        </div>
        <div>
          <div className="gf-stat">20+</div>
          <div className="gf-statLabel">Olympiads supported</div>
        </div>
        <p className="gf-proofLine">
          Coaching is run by former olympiad medallists and university faculty, built around
          the past papers and mark schemes students actually sit.
        </p>
      </section>

      {/* ── Steps ────────────────────────────────────────────────────── */}
      <section id="steps" className="gf-steps">
        <div className="gf-sectionKicker">How it works</div>
        {STEPS.map((s) => (
          <div key={s.n} className="gf-step">
            <span className="gf-stepNum">{s.n}</span>
            <h3 className="gf-stepTitle">{s.title}</h3>
            <p className="gf-stepBody">{s.body}</p>
          </div>
        ))}
      </section>

      {/* ── Dates ────────────────────────────────────────────────────── */}
      <section id="dates" className="gf-dates">
        <div className="gf-datesHead">
          <h2 className="gf-h2">What is open right now.</h2>
          <p className="gf-datesNote">
            Places are limited per cohort and close once a sitting is scheduled.
          </p>
        </div>

        {EVENTS.map((e) => (
          <div key={e.name} className="gf-event">
            <span className="gf-eventTerm">{e.term}</span>
            <h3 className="gf-eventName">{e.name}</h3>
            <span className="gf-eventWhat">{e.what}</span>
            <span className="gf-eventWhen">{e.when}</span>
            <button className="gf-eventCta" onClick={() => navigate("/sign-up")}>Register</button>
          </div>
        ))}

        <footer className="gf-footer">
          <span className="gf-footBrand">Gifted</span>
          <a href="mailto:programs@atdp.africa">programs@atdp.africa</a>
          <a href="tel:+233201856818">+233 20 185 6818</a>
          <span>East Legon, Accra, Ghana</span>
          <span className="gf-copy">© 2026 Olympiad Edu Center</span>
        </footer>
      </section>
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────
//
// Real CSS rather than inline styles so hover, focus-visible and breakpoints
// all work. The mock is desktop only; every media query below is an addition,
// since a two-column hero and a five-column events table are unusable on a
// phone and most of this traffic is mobile.

const CSS = `
.gf{background:${T.navy};color:${T.bone};font-family:${body};-webkit-font-smoothing:antialiased}
.gf *{box-sizing:border-box}
.gf button{font-family:inherit}
.gf :focus-visible{outline:2px solid ${T.gold};outline-offset:2px}

/* Hero */
.gf-hero{position:relative;min-height:100svh;overflow:hidden;background:${T.ink};display:flex}
.gf-slide{position:absolute;inset:0;background-size:cover;background-position:center;transition:opacity 1100ms cubic-bezier(.4,0,.2,1)}
.gf-scrim{position:absolute;inset:0;background:linear-gradient(105deg,rgba(8,24,42,.94) 0%,rgba(8,24,42,.80) 46%,rgba(8,24,42,.42) 100%)}
.gf-heroInner{position:relative;flex:1;display:flex;flex-direction:column;padding:0 clamp(20px,3.4vw,56px);min-width:0}

.gf-header{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:clamp(64px,9vh,88px);flex:none;border-bottom:1px solid rgba(246,245,242,.14)}
.gf-brand{display:flex;align-items:baseline;gap:12px;text-decoration:none}
.gf-wordmark{font-family:${display};font-weight:700;font-size:26px;letter-spacing:-.02em;color:${T.bone}}
.gf-kicker{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,245,242,.45)}
.gf-nav{display:flex;align-items:center;gap:clamp(16px,2.4vw,32px)}
.gf-nav button{background:none;border:0;padding:6px 0;font-size:13px;letter-spacing:.02em;color:rgba(246,245,242,.72);cursor:pointer;transition:color 200ms}
.gf-nav button:hover{color:${T.gold}}
.gf-navSignIn{color:${T.bone}!important;border-bottom:1px solid rgba(246,245,242,.35)!important}

.gf-heroGrid{flex:1;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:clamp(28px,5vw,88px);align-items:center;min-height:0;padding:clamp(16px,3vh,40px) 0}
.gf-heroCopy{min-width:0}
.gf-eyebrow{font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:${T.gold};margin-bottom:clamp(14px,2.4vh,24px)}
.gf-h1{font-family:${display};font-weight:700;font-size:clamp(34px,min(5.4vw,8.4vh),86px);line-height:.98;letter-spacing:-.035em;margin:0 0 clamp(16px,2.6vh,26px);text-wrap:balance}
.gf-lede{font-size:15px;line-height:1.65;color:rgba(246,245,242,.62);margin:0 0 clamp(20px,3.2vh,34px);max-width:44ch;text-wrap:pretty}
.gf-cta{display:flex;flex-wrap:wrap;gap:12px}
.gf-btnGold{height:48px;padding:0 26px;border:0;background:${T.gold};color:${T.ink};font-size:13.5px;letter-spacing:.04em;cursor:pointer;transition:background 200ms}
.gf-btnGold:hover{background:${T.goldLight}}
.gf-btnGhost{height:48px;padding:0 26px;background:transparent;border:1px solid rgba(246,245,242,.32);color:${T.bone};font-size:13.5px;letter-spacing:.04em;cursor:pointer;transition:border-color 200ms,background 200ms}
.gf-btnGhost:hover{border-color:${T.gold};background:rgba(232,163,61,.10)}

.gf-index{min-width:0;display:flex;flex-direction:column;border-top:1px solid rgba(246,245,242,.16)}
.gf-indexHead{display:none}
.gf-row{display:flex;align-items:center;gap:16px;width:100%;padding:clamp(11px,1.5vh,16px) 0;border:0;border-bottom:1px solid rgba(246,245,242,.16);background:transparent;color:rgba(246,245,242,.62);cursor:pointer;transition:background 260ms,color 260ms}
.gf-row.is-active{background:rgba(232,163,61,.08);color:${T.bone}}
.gf-rowNum{font-size:11px;letter-spacing:.12em;color:rgba(246,245,242,.38);font-variant-numeric:tabular-nums;flex:none;width:24px;text-align:left;transition:color 260ms}
.gf-row.is-active .gf-rowNum{color:${T.gold}}
.gf-rowTitle{font-family:${display};font-weight:500;font-size:clamp(15px,1.35vw,20px);letter-spacing:-.01em;flex:1;text-align:left;line-height:1.2}
.gf-rowMeta{font-size:11px;letter-spacing:.06em;color:rgba(246,245,242,.42);flex:none;white-space:nowrap}

.gf-heroFoot{flex:none;min-height:clamp(52px,7.5vh,80px);display:flex;align-items:center;justify-content:space-between;gap:20px;border-top:1px solid rgba(246,245,242,.14)}
.gf-activeLine{font-size:12px;line-height:1.4;color:rgba(246,245,242,.5);max-width:52ch;margin:0}
.gf-scroll{border:0;background:transparent;cursor:pointer;color:rgba(246,245,242,.55);padding:8px;flex:none;transition:color 200ms}
.gf-scroll:hover{color:${T.gold}}
.gf-chev{display:block;width:11px;height:11px;border-right:1px solid currentColor;border-bottom:1px solid currentColor;transform:rotate(45deg);animation:gfNudge 2.4s ease-in-out infinite}
@keyframes gfNudge{0%,100%{transform:rotate(45deg) translate(0,0)}50%{transform:rotate(45deg) translate(4px,4px)}}

/* Proof */
.gf-proof{background:${T.bone};color:${T.navy};padding:clamp(56px,6vw,88px) clamp(20px,3.4vw,56px);display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:clamp(24px,4vw,64px);align-items:end}
.gf-stat{font-family:${display};font-weight:700;font-size:clamp(44px,5.4vw,76px);line-height:.88;letter-spacing:-.035em;color:${T.navy}}
.gf-statLabel{font-size:11.5px;letter-spacing:.13em;text-transform:uppercase;color:${T.slateLight};margin-top:12px}
.gf-proofLine{font-size:15px;line-height:1.7;color:${T.slate};margin:0;max-width:46ch;text-wrap:pretty}

/* Steps */
.gf-steps{background:${T.boneWarm};color:${T.navy};padding:clamp(64px,8vw,120px) clamp(20px,3.4vw,56px);border-top:1px solid ${T.ruleLight}}
.gf-sectionKicker{font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:${T.goldDeep};margin-bottom:clamp(28px,3.5vw,48px)}
.gf-step{display:grid;grid-template-columns:minmax(0,64px) minmax(0,1fr) minmax(0,1.2fr);gap:clamp(16px,3vw,56px);align-items:baseline;padding:clamp(22px,2.6vw,34px) 0;border-top:1px solid ${T.ruleLight}}
.gf-stepNum{font-family:${display};font-weight:600;font-size:14px;letter-spacing:.1em;color:${T.goldDeep};font-variant-numeric:tabular-nums}
.gf-stepTitle{font-family:${display};font-weight:600;font-size:clamp(22px,2.4vw,36px);line-height:1.08;letter-spacing:-.025em;margin:0;text-wrap:pretty}
.gf-stepBody{font-size:14.5px;line-height:1.7;color:${T.slate};margin:0;max-width:52ch;text-wrap:pretty}

/* Dates */
.gf-dates{background:${T.navy};color:${T.bone};padding:clamp(64px,8vw,120px) clamp(20px,3.4vw,56px) clamp(40px,5vw,64px)}
.gf-datesHead{display:flex;flex-wrap:wrap;gap:20px 48px;align-items:baseline;justify-content:space-between;margin-bottom:clamp(28px,3.5vw,48px)}
.gf-h2{font-family:${display};font-weight:700;font-size:clamp(28px,3.4vw,52px);line-height:1;letter-spacing:-.03em;margin:0}
.gf-datesNote{font-size:14px;line-height:1.65;color:rgba(246,245,242,.6);margin:0;max-width:42ch;text-wrap:pretty}
.gf-event{display:grid;grid-template-columns:minmax(0,90px) minmax(0,1.3fr) minmax(0,1fr) minmax(0,150px) minmax(0,100px);gap:clamp(12px,2vw,32px);align-items:center;padding:clamp(18px,2vw,26px) 0;border-top:1px solid rgba(246,245,242,.18);transition:background 200ms}
.gf-event:hover{background:rgba(246,245,242,.04)}
.gf-eventTerm{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:rgba(246,245,242,.5);white-space:nowrap}
.gf-eventName{font-family:${display};font-weight:600;font-size:clamp(17px,1.6vw,24px);line-height:1.15;letter-spacing:-.02em;margin:0;text-wrap:pretty}
.gf-eventWhat{font-size:13px;line-height:1.5;color:rgba(246,245,242,.58)}
.gf-eventWhen{font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:${T.gold};font-family:ui-monospace,Menlo,monospace;white-space:nowrap}
.gf-eventCta{justify-self:end;background:none;border:0;border-bottom:1px solid rgba(246,245,242,.35);color:${T.bone};font-size:12.5px;padding:2px 0;cursor:pointer;white-space:nowrap;transition:border-color 200ms,color 200ms}
.gf-eventCta:hover{color:${T.gold};border-color:${T.gold}}

.gf-footer{display:flex;flex-wrap:wrap;gap:12px 40px;justify-content:space-between;align-items:baseline;margin-top:clamp(48px,6vw,88px);padding-top:26px;border-top:1px solid rgba(246,245,242,.25);font-size:13px;color:rgba(246,245,242,.7)}
.gf-footBrand{font-family:${display};font-weight:700;font-size:20px;color:${T.bone}}
.gf-footer a{color:rgba(246,245,242,.7);text-decoration:none;transition:color 200ms}
.gf-footer a:hover{color:${T.gold}}
.gf-copy{color:rgba(246,245,242,.45)}

/* ── Tablet ─────────────────────────────────────────────────────────── */
@media (max-width:1000px){
  .gf-heroGrid{grid-template-columns:1fr;gap:clamp(24px,4vh,40px);align-content:center}
  .gf-hero{min-height:auto}
  .gf-heroInner{padding-bottom:clamp(24px,4vh,40px)}
  .gf-heroGrid{padding:clamp(32px,6vh,64px) 0}
  .gf-indexHead{display:block;font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:${T.gold};padding-bottom:12px}
  .gf-index{border-top:0}
  .gf-event{grid-template-columns:minmax(0,1fr) auto;gap:6px 16px;row-gap:8px}
  .gf-eventTerm{grid-column:1}
  .gf-eventWhen{grid-column:2;justify-self:end}
  .gf-eventName{grid-column:1 / -1}
  .gf-eventWhat{grid-column:1 / -1}
  .gf-eventCta{grid-column:1 / -1;justify-self:start;margin-top:4px}
}

/* ── Phone ──────────────────────────────────────────────────────────── */
@media (max-width:640px){
  .gf-kicker{display:none}
  .gf-nav button:not(.gf-navSignIn){display:none}
  .gf-heroFoot{flex-direction:column;align-items:flex-start;gap:10px;padding:16px 0}
  .gf-scroll{display:none}
  .gf-cta{flex-direction:column;align-items:stretch}
  .gf-btnGold,.gf-btnGhost{width:100%}
  .gf-rowMeta{display:none}
  .gf-step{grid-template-columns:minmax(0,40px) minmax(0,1fr);gap:8px 16px}
  .gf-stepBody{grid-column:2}
  .gf-footer{flex-direction:column;gap:10px}
}

@media (prefers-reduced-motion:reduce){
  .gf-slide{transition:none}
  .gf-chev{animation:none}
}
`

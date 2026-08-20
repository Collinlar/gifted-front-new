import { useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { T, display, body, useGiftedFonts } from "./giftedTheme"
import { getHomepage, DEFAULTS, list } from "../lib/homepageContent"

const ROTATE_MS = 5200

// The lower half of the page is the part an admin can reorder and switch off.
// The hero is not in this list on purpose: the brand, the headline and the
// programme index are one composed unit, and "hide the hero" would leave a
// page that opens on a statistics strip.
const MOVEABLE = ["proof", "steps", "dates"]

// ── Page ───────────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  // ?preview=1 renders unpublished drafts, so the admin checks their edits on
  // the real page rather than on an approximation of it
  const preview = params.get("preview") === "1"

  const [page, setPage]     = useState(null)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const timer = useRef(null)

  useGiftedFonts()

  useEffect(() => {
    let alive = true
    getHomepage({ preview }).then((p) => { if (alive) setPage(p) })
    return () => { alive = false }
  }, [preview])

  // Render the defaults until the fetch lands. The homepage is the first thing
  // anyone sees on a slow connection, and a spinner where the headline should
  // be is worse than a headline that changes a moment later.
  const sections = page?.sections || DEFAULTS
  const hidden   = page?.hidden || new Set()

  const brand      = sections.brand      || DEFAULTS.brand
  const hero       = sections.hero       || DEFAULTS.hero
  const programmes = sections.programmes || DEFAULTS.programmes
  const proof      = sections.proof      || DEFAULTS.proof
  const steps      = sections.steps      || DEFAULTS.steps
  const dates      = sections.dates      || DEFAULTS.dates
  const footer     = sections.footer     || DEFAULTS.footer

  const items    = list(programmes.items, DEFAULTS.programmes.items)
  const headline = list(hero.headline, DEFAULTS.hero.headline)

  // Rotate the hero imagery. Pauses on interaction so a chosen programme stays
  // put, and respects a reduced-motion preference by not rotating at all.
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    if (reduce || paused || items.length < 2) return
    timer.current = setInterval(() => setActive((i) => (i + 1) % items.length), ROTATE_MS)
    return () => clearInterval(timer.current)
  }, [paused, items.length])

  // A shorter list after an edit must not leave the highlight past the end
  useEffect(() => { setActive((i) => (i < items.length ? i : 0)) }, [items.length])

  // Warm the images so switching does not flash on a slow connection
  useEffect(() => {
    items.forEach((p) => { if (p.img) { const im = new Image(); im.src = p.img } })
  }, [page])

  const choose = (i) => { setActive(i); setPaused(true) }

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.offsetTop, behavior: "smooth" })
  }

  // One destination field per button, so the admin can point anything at a
  // section of this page, a route in the app, or somewhere else entirely
  // without needing to know which is which.
  const go = (target) => {
    if (!target) return
    if (target.startsWith("#")) return scrollTo(target.slice(1))
    if (/^https?:\/\//i.test(target)) return window.open(target, "_blank", "noopener")
    navigate(target)
  }

  const current = items[active] || items[0] || {}

  const blocks = {
    proof: !hidden.has("proof") && (
      <section key="proof" id="proof" className="gf-proof">
        {list(proof.stats, DEFAULTS.proof.stats).map((s, i) => (
          <div key={`${s.label}-${i}`}>
            <div className="gf-stat">{s.value}</div>
            <div className="gf-statLabel">{s.label}</div>
          </div>
        ))}
        {proof.line && <p className="gf-proofLine">{proof.line}</p>}
      </section>
    ),

    steps: !hidden.has("steps") && (
      <section key="steps" id="steps" className="gf-steps">
        <div className="gf-sectionKicker">{steps.kicker}</div>
        {list(steps.items, DEFAULTS.steps.items).map((s, i) => (
          <div key={`${s.title}-${i}`} className="gf-step">
            <span className="gf-stepNum">{s.n}</span>
            <h3 className="gf-stepTitle">{s.title}</h3>
            <p className="gf-stepBody">{s.body}</p>
          </div>
        ))}
      </section>
    ),

    dates: !hidden.has("dates") && (
      <section key="dates" id="dates" className="gf-dates">
        <div className="gf-datesHead">
          <h2 className="gf-h2">{dates.heading}</h2>
          {dates.note && <p className="gf-datesNote">{dates.note}</p>}
        </div>

        {list(dates.items, DEFAULTS.dates.items).map((e, i) => (
          <div key={`${e.name}-${i}`} className="gf-event">
            <span className="gf-eventTerm">{e.term}</span>
            <h3 className="gf-eventName">{e.name}</h3>
            <span className="gf-eventWhat">{e.what}</span>
            <span className="gf-eventWhen">{e.when}</span>
            <button className="gf-eventCta" onClick={() => go(e.target || "/sign-up")}>
              {dates.ctaLabel || "Register"}
            </button>
          </div>
        ))}

        {!hidden.has("footer") && (
          <footer className="gf-footer">
            <span className="gf-footBrand">{footer.brand}</span>
            {footer.email   && <a href={`mailto:${footer.email}`}>{footer.email}</a>}
            {footer.phone   && <a href={`tel:${String(footer.phone).replace(/[^\d+]/g, "")}`}>{footer.phone}</a>}
            {footer.address && <span>{footer.address}</span>}
            {footer.copyright && <span className="gf-copy">{footer.copyright}</span>}
          </footer>
        )}
      </section>
    ),
  }

  // The footer is drawn inside the dates section because that is where the
  // layout puts it. If dates is switched off it would vanish with it, so it
  // gets its own strip in that case.
  const orphanFooter = hidden.has("dates") && !hidden.has("footer") && (
    <section key="footer" className="gf-dates">
      <footer className="gf-footer">
        <span className="gf-footBrand">{footer.brand}</span>
        {footer.email   && <a href={`mailto:${footer.email}`}>{footer.email}</a>}
        {footer.phone   && <a href={`tel:${String(footer.phone).replace(/[^\d+]/g, "")}`}>{footer.phone}</a>}
        {footer.address && <span>{footer.address}</span>}
        {footer.copyright && <span className="gf-copy">{footer.copyright}</span>}
      </footer>
    </section>
  )

  const ordered = (page?.order || MOVEABLE).filter((k) => MOVEABLE.includes(k))
  const lower = ordered.length ? ordered : MOVEABLE

  return (
    <div className="gf">
      <style>{CSS}</style>

      {preview && (
        <div className="gf-previewBar">
          Previewing unpublished changes. Nobody else sees this yet.
        </div>
      )}

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="gf-hero">
        {items.map((p, i) => (
          <div
            key={`${p.title}-${i}`}
            aria-hidden
            className="gf-slide"
            style={{ backgroundImage: `url(${p.img})`, opacity: i === active ? 1 : 0 }}
          />
        ))}
        <div className="gf-scrim" aria-hidden />

        <div className="gf-heroInner">
          <header className="gf-header">
            <a href="/" className="gf-brand" onClick={(e) => { e.preventDefault(); scrollTo("top") }}>
              <span className="gf-wordmark">{brand.wordmark}</span>
              <span className="gf-kicker">{brand.kicker}</span>
            </a>
            <nav className="gf-nav">
              {list(brand.nav, DEFAULTS.brand.nav).map((n, i) => (
                <button key={`${n.label}-${i}`} onClick={() => go(n.target)}>{n.label}</button>
              ))}
              <button className="gf-navSignIn" onClick={() => navigate("/login")}>
                {brand.signInLabel || "Sign in"}
              </button>
            </nav>
          </header>

          <div className="gf-heroGrid">
            <div className="gf-heroCopy">
              {hero.eyebrow && <div className="gf-eyebrow">{hero.eyebrow}</div>}
              <h1 className="gf-h1">
                {headline.map((line, i) => (
                  <span key={i}>{line}{i < headline.length - 1 && <br />}</span>
                ))}
              </h1>
              {hero.lede && <p className="gf-lede">{hero.lede}</p>}
              <div className="gf-cta">
                {hero.primaryLabel && (
                  <button className="gf-btnGold" onClick={() => go(hero.primaryTarget)}>
                    {hero.primaryLabel}
                  </button>
                )}
                {hero.secondaryLabel && (
                  <button className="gf-btnGhost" onClick={() => go(hero.secondaryTarget)}>
                    {hero.secondaryLabel}
                  </button>
                )}
              </div>
            </div>

            <div className="gf-index" id="programmes">
              <div className="gf-indexHead">{programmes.heading}</div>
              {items.map((p, i) => (
                <button
                  key={`${p.title}-${i}`}
                  className={`gf-row ${i === active ? "is-active" : ""}`}
                  onMouseEnter={() => choose(i)}
                  onFocus={() => choose(i)}
                  onClick={() => go(p.target || "/login")}
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
            <p className="gf-activeLine" aria-live="polite">{current.line}</p>
            <button className="gf-scroll" aria-label="Scroll to programmes" onClick={() => scrollTo("proof")}>
              <span className="gf-chev" />
            </button>
          </div>
        </div>
      </div>

      {lower.map((k) => blocks[k])}
      {orphanFooter}
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

/* Preview. Deliberately unmissable: the whole risk of a preview mode is
   somebody mistaking it for the live page. */
.gf-previewBar{position:sticky;top:0;z-index:50;background:${T.gold};color:${T.ink};
  font-size:12.5px;letter-spacing:.02em;text-align:center;padding:9px 16px;font-weight:600}
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

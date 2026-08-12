import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { loginUser, registerUser } from "../lib/auth"
import { T, display, body, useGiftedFonts } from "./giftedTheme"

// ── Role definitions ───────────────────────────────────────────────────────
//
// The role picked here becomes the account `category`, and the extra fields
// shown are the ones that role actually needs. Everything maps onto what
// registerUser already accepts, so no server change is involved.

const ROLES = [
  { id: "Student",  title: "Student",                  tag: "Ages 10–18",      line: "Join a subject olympiad track or a beginner pathway." },
  { id: "Parent",   title: "Parent or guardian",       tag: "Manages a child", line: "Enrol a child, pay fees and follow their results." },
  { id: "Graduate", title: "Graduate or professional", tag: "18+",             line: "Short courses, certification and coaching pathways." },
  { id: "Teacher",  title: "Teacher or school",        tag: "Institution",     line: "Register a cohort and track a whole class." },
]

const COMMON = [
  { name: "firstName",    label: "First name", placeholder: "Ama",                 half: true, required: true },
  { name: "lastName",     label: "Last name",  placeholder: "Mensah",              half: true, required: true },
  { name: "email",        label: "Email",      placeholder: "ama@school.edu.gh", type: "email", required: true },
  { name: "mobileNumber", label: "Phone",      placeholder: "+233 20 000 0000", type: "tel", half: true },
  { name: "country",      label: "Country",    options: ["Ghana", "Nigeria", "Kenya", "Other"], half: true },
]

// Interest options deliberately mirror the track names the platform actually
// has, so syncUserTracksFromInterests can match them and the student lands in
// a real track rather than none.
const INTERESTS = ["Mathematics", "Science", "ICT", "Technology", "English", "Undecided"]
const GRADES = ["JHS 1", "JHS 2", "JHS 3", "SHS 1", "SHS 2", "SHS 3"]

const EXTRA = {
  Student: [
    { name: "dob",    label: "Date of birth", type: "date", half: true },
    { name: "gender", label: "Gender", options: ["Prefer not to say", "Female", "Male"], half: true },
    { name: "school", label: "School", placeholder: "Achimota School" },
    { name: "grade",  label: "Grade", options: GRADES, half: true },
    { name: "interest", label: "Interest", options: INTERESTS, half: true },
  ],
  Parent: [
    { name: "childName",  label: "Child's name",  placeholder: "Kofi Mensah", half: true },
    { name: "grade",      label: "Child's grade", options: GRADES, half: true },
    { name: "school",     label: "Child's school", placeholder: "Achimota School" },
  ],
  Graduate: [
    { name: "educationalLevel", label: "Education level", options: ["Undergraduate", "Graduate", "Postgraduate", "Working professional"], half: true },
    { name: "interest",         label: "Purpose", options: INTERESTS, half: true },
  ],
  Teacher: [
    { name: "school",   label: "School or institution", placeholder: "Achimota School" },
    { name: "position", label: "Role at school", placeholder: "Head of Mathematics", half: true },
    { name: "interest", label: "Subject", options: INTERESTS, half: true },
  ],
}

const ART = {
  signin: { title: "Back to the papers.",         line: "Live coaching, timed sittings and certificates schools can verify by serial number." },
  signup: { title: "Start where you actually are.", line: "A short diagnostic places every new student on the right track — beginner pathway or straight to competition work." },
}

const NEXT_STEPS = [
  { n: "01", t: "Pick a cohort and start weekly coaching" },
  { n: "02", t: "Sit the placement diagnostic" },
  { n: "03", t: "Track your progress in the portal" },
]

// ── Page ───────────────────────────────────────────────────────────────────

export default function Auth() {
  const navigate = useNavigate()
  const location = useLocation()

  const [view, setView]   = useState(location.pathname === "/sign-up" ? "signup" : "signin")
  const [step, setStep]   = useState(0)
  const [role, setRole]   = useState("Student")
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState("")
  const [form, setForm]   = useState({ country: "Ghana", gender: "Prefer not to say", interest: "Undecided", grade: "JHS 1" })

  const [signin, setSignin] = useState({ emailOrUsername: "", password: "" })

  useGiftedFonts()

  useEffect(() => { setError("") }, [view, step])

  const fields = [...COMMON, ...(EXTRA[role] || []),
    { name: "password", label: "Password", type: "password", placeholder: "At least 8 characters", required: true }]

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  // ── Sign in ──────────────────────────────────────────────────────────────
  const submitSignIn = async (e) => {
    e.preventDefault()
    if (busy) return
    setError(""); setBusy(true)
    try {
      const id = signin.emailOrUsername.trim()
      const isEmail = /\S+@\S+\.\S+/.test(id)
      const res = await loginUser({
        password: signin.password,
        ...(isEmail ? { email: id } : { userName: id }),
      })
      if (res.success) navigate("/overview")
      else setError(res.message || "Incorrect email or password. Try again.")
    } catch {
      setError("We could not reach the server. Try again in a moment.")
    } finally {
      setBusy(false)
    }
  }

  // ── Sign up ──────────────────────────────────────────────────────────────
  const submitSignUp = async (e) => {
    e.preventDefault()
    if (busy) return

    const missing = fields.filter((f) => f.required && !String(form[f.name] || "").trim())
    if (missing.length) {
      setError(`Please fill in ${missing.map((m) => m.label.toLowerCase()).join(", ")}.`)
      return
    }
    if (String(form.password || "").length < 8) {
      setError("Your password needs at least 8 characters.")
      return
    }

    setError(""); setBusy(true)
    try {
      const res = await registerUser({
        ...form,
        email: String(form.email || "").trim(),
        category: role,
        School: form.school || "",
        // registerUser expects an array here, and it drives track assignment
        purposeOfRegistration: form.interest && form.interest !== "Undecided" ? [form.interest] : [],
      })

      if (res.success) {
        // The account exists either way. needsSignIn means only the automatic
        // session failed, so send them to the form rather than implying the
        // signup itself did not work.
        if (res.needsSignIn) {
          setView("signin")
          setStep(0)
          setSignin({ emailOrUsername: res.email || form.email, password: "" })
          setError(res.message)
        } else {
          setStep(2)
        }
      } else {
        setError(res.message || "We could not create your account. Try again.")
      }
    } catch {
      setError("We could not reach the server. Try again in a moment.")
    } finally {
      setBusy(false)
    }
  }

  const isSignIn = view === "signin"
  const art = ART[isSignIn ? "signin" : "signup"]

  return (
    <div className="ga">
      <style>{CSS}</style>

      {/* ── Left: artwork ─────────────────────────────────────────────── */}
      <div className="ga-art">
        <div className="ga-artImg" aria-hidden />
        <div className="ga-artScrim" aria-hidden />
        <div className="ga-artInner">
          <button className="ga-brand" onClick={() => navigate("/")}>
            <span className="ga-wordmark">Gifted</span>
            <span className="ga-kicker">Olympiad Edu Center</span>
          </button>

          <div className="ga-artCopy">
            <h2 className="ga-artTitle">{art.title}</h2>
            <p className="ga-artLine">{art.line}</p>
          </div>

          <div className="ga-artStats">
            {[["12,000", "Students"], ["20+", "Olympiads"], ["Accra", "Since 2019"]].map(([v, l]) => (
              <div key={l}>
                <div className="ga-statV">{v}</div>
                <div className="ga-statL">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: panel ──────────────────────────────────────────────── */}
      <div className="ga-panel">
        <div className="ga-tabs">
          <button className={`ga-tab ${isSignIn ? "is-on" : ""}`} onClick={() => { setView("signin"); setStep(0) }}>Sign in</button>
          <button className={`ga-tab ${!isSignIn ? "is-on" : ""}`} onClick={() => { setView("signup"); setStep(0) }}>Create account</button>
        </div>

        {/* Sign in */}
        {isSignIn && (
          <div className="ga-body ga-fade">
            <div className="ga-eyebrow">Student portal</div>
            <h1 className="ga-h1">Welcome back.</h1>
            <p className="ga-sub">Sign in to see your cohort, timed papers and certificates.</p>

            <form onSubmit={submitSignIn} className="ga-form">
              <label className="ga-label">
                <span>Email or username</span>
                <input type="text" autoComplete="username" placeholder="ama.mensah@school.edu.gh"
                  value={signin.emailOrUsername}
                  onChange={(e) => { setSignin({ ...signin, emailOrUsername: e.target.value }); setError("") }} />
              </label>
              <label className="ga-label">
                <span>Password</span>
                <input type="password" autoComplete="current-password" placeholder="••••••••"
                  value={signin.password}
                  onChange={(e) => { setSignin({ ...signin, password: e.target.value }); setError("") }} />
              </label>

              <div className="ga-formRow">
                <span />
                <button type="button" className="ga-link" onClick={() => navigate("/forgot-password")}>Forgot password</button>
              </div>

              {error && <p className="ga-error">{error}</p>}

              <button type="submit" className="ga-submit" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </form>

            {/* Routes to the dedicated claim page, which confirms the matched
                record before anyone sets a password on it. */}
            <button className="ga-claim" onClick={() => navigate("/claim-account")}>
              <span className="ga-claimTag">Old account</span>
              <span className="ga-claimLine">
                Registered before 2025? Your scores and history moved with us — claim your
                account with the phone number you signed up with.
              </span>
            </button>
          </div>
        )}

        {/* Sign up */}
        {!isSignIn && (
          <div className="ga-body">
            <div className="ga-dots">
              {["Account type", "Your details", "Confirm"].map((label, n) => (
                <div key={label} className="ga-dot">
                  <div className="ga-bar" style={{ background: n <= step ? T.gold : "rgba(246,245,242,.2)" }} />
                  <span style={{ color: n <= step ? T.gold : "rgba(246,245,242,.38)" }}>{label}</span>
                </div>
              ))}
            </div>

            {step === 0 && (
              <div className="ga-stepBody ga-fade">
                <h1 className="ga-h1 ga-h1sm">Who is joining?</h1>
                <p className="ga-sub">This sets which programmes and forms you see next.</p>
                <div className="ga-roles">
                  {ROLES.map((r) => (
                    <button key={r.id} className={`ga-role ${role === r.id ? "is-on" : ""}`} onClick={() => setRole(r.id)}>
                      <span className="ga-roleTop">
                        <span className="ga-roleTitle">{r.title}</span>
                        <span className="ga-roleTag">{r.tag}</span>
                      </span>
                      <span className="ga-roleLine">{r.line}</span>
                    </button>
                  ))}
                </div>
                <button className="ga-submit" onClick={() => setStep(1)}>Continue</button>
              </div>
            )}

            {step === 1 && (
              <div className="ga-stepBody ga-fade">
                <h1 className="ga-h1 ga-h1sm">{ROLES.find((r) => r.id === role)?.title} details</h1>
                <p className="ga-sub ga-subTight">
                  Everything here goes on your certificate, so use the name your school has on record.
                </p>

                <form onSubmit={submitSignUp} className="ga-signupForm">
                  <div className="ga-grid">
                    {fields.map((f) => (
                      <label key={f.name} className={`ga-label ${f.half ? "" : "ga-span2"}`}>
                        <span>{f.label}{f.required ? "" : " (optional)"}</span>
                        {f.options ? (
                          <select value={form[f.name] || ""} onChange={(e) => set(f.name, e.target.value)}>
                            {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input
                            type={f.type || "text"}
                            placeholder={f.placeholder || ""}
                            autoComplete={f.name === "password" ? "new-password" : "on"}
                            value={form[f.name] || ""}
                            onChange={(e) => { set(f.name, e.target.value); setError("") }}
                          />
                        )}
                      </label>
                    ))}
                  </div>

                  {error && <p className="ga-error">{error}</p>}

                  <div className="ga-actions">
                    <button type="button" className="ga-back" onClick={() => setStep(0)}>Back</button>
                    <button type="submit" className="ga-submit ga-grow" disabled={busy}>
                      {busy ? "Creating account…" : "Create account"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="ga-stepBody ga-fade ga-center">
                <div className="ga-tick">✓</div>
                <h1 className="ga-h1">Account created.</h1>
                <p className="ga-sub">
                  You are signed in. Next: pick a cohort and take the short placement diagnostic
                  so we can put you on the right track.
                </p>
                <div className="ga-next">
                  {NEXT_STEPS.map((n) => (
                    <div key={n.n} className="ga-nextRow">
                      <span className="ga-nextNum">{n.n}</span>
                      <span className="ga-nextText">{n.t}</span>
                    </div>
                  ))}
                </div>
                <button className="ga-submit ga-bone" onClick={() => navigate("/overview")}>Go to the portal</button>
              </div>
            )}
          </div>
        )}

        <div className="ga-foot">
          <a href="mailto:programs@atdp.africa">programs@atdp.africa</a>
          <span>© 2026 Olympiad Edu Center</span>
        </div>
      </div>
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────
//
// The mock fixes the right column at a 400px minimum, which overflows a phone.
// Below 900px the two columns stack and the artwork becomes a short banner.

const CSS = `
.ga{position:relative;min-height:100svh;display:grid;grid-template-columns:minmax(0,1fr) minmax(400px,clamp(430px,36vw,560px));background:${T.ink};color:${T.bone};font-family:${body};-webkit-font-smoothing:antialiased}
.ga *{box-sizing:border-box}
.ga button{font-family:inherit}
.ga :focus-visible{outline:2px solid ${T.gold};outline-offset:2px}
@keyframes gaUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.ga-fade{animation:gaUp 320ms ease both}

/* Artwork */
.ga-art{position:relative;overflow:hidden;min-height:280px}
.ga-artImg{position:absolute;inset:0;background-image:url(/math.jpg);background-size:cover;background-position:center}
.ga-artScrim{position:absolute;inset:0;background:linear-gradient(120deg,rgba(8,24,42,.92) 0%,rgba(8,24,42,.66) 55%,rgba(8,24,42,.34) 100%)}
.ga-artInner{position:relative;height:100%;display:flex;flex-direction:column;justify-content:space-between;gap:24px;padding:clamp(24px,3vw,48px)}
.ga-brand{display:flex;align-items:baseline;gap:12px;background:none;border:0;padding:0;cursor:pointer;text-align:left}
.ga-wordmark{font-family:${display};font-weight:700;font-size:26px;letter-spacing:-.02em;color:${T.bone}}
.ga-kicker{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,245,242,.45)}
.ga-artCopy{max-width:20ch}
.ga-artTitle{font-family:${display};font-weight:700;font-size:clamp(28px,3.6vw,58px);line-height:.98;letter-spacing:-.035em;margin:0 0 18px;text-wrap:balance}
.ga-artLine{font-size:14.5px;line-height:1.65;color:rgba(246,245,242,.6);margin:0;max-width:34ch;text-wrap:pretty}
.ga-artStats{display:flex;gap:clamp(20px,3vw,56px);border-top:1px solid rgba(246,245,242,.16);padding-top:20px}
.ga-statV{font-family:${display};font-weight:700;font-size:24px;letter-spacing:-.02em}
.ga-statL{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:rgba(246,245,242,.45);margin-top:6px}

/* Panel */
.ga-panel{position:relative;background:${T.navy};border-left:1px solid rgba(246,245,242,.14);display:flex;flex-direction:column;padding:clamp(24px,2.4vw,40px) clamp(22px,2.6vw,48px)}
.ga-tabs{display:flex;gap:2px;flex:none;margin-bottom:clamp(22px,3vh,38px)}
.ga-tab{flex:1;height:44px;border:0;border-bottom:1px solid rgba(246,245,242,.2);background:transparent;color:rgba(246,245,242,.5);font-size:12.5px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:color 200ms,border-color 200ms}
.ga-tab.is-on{color:${T.bone};border-bottom:2px solid ${T.gold}}
.ga-body{flex:1;display:flex;flex-direction:column;justify-content:center;min-height:0}
.ga-stepBody{flex:1;display:flex;flex-direction:column;min-height:0}
.ga-center{justify-content:center}

.ga-eyebrow{font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:${T.gold};margin-bottom:14px}
.ga-h1{font-family:${display};font-weight:700;font-size:clamp(26px,2.6vw,40px);line-height:1;letter-spacing:-.03em;margin:0 0 10px}
.ga-h1sm{font-size:clamp(24px,2.4vw,36px);line-height:1.02}
.ga-sub{font-size:14px;line-height:1.6;color:rgba(246,245,242,.55);margin:0 0 26px;max-width:40ch}
.ga-subTight{margin-bottom:20px}

.ga-form{display:flex;flex-direction:column;gap:14px}
.ga-label{display:flex;flex-direction:column;gap:7px;min-width:0}
.ga-label>span{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:rgba(246,245,242,.5)}
.ga input,.ga select{height:48px;padding:0 14px;border:1px solid rgba(246,245,242,.22);background:rgba(8,24,42,.6);font-size:14.5px;color:${T.bone};font-family:inherit;transition:border-color 180ms;border-radius:0}
.ga select{appearance:none;cursor:pointer;background-image:linear-gradient(45deg,transparent 50%,rgba(246,245,242,.5) 50%),linear-gradient(135deg,rgba(246,245,242,.5) 50%,transparent 50%);background-position:calc(100% - 18px) 21px,calc(100% - 13px) 21px;background-size:5px 5px,5px 5px;background-repeat:no-repeat;padding-right:38px}
.ga select option{background:${T.ink};color:${T.bone}}
.ga input:focus,.ga select:focus{outline:none;border-color:${T.gold}}
.ga input::placeholder{color:rgba(246,245,242,.34)}

.ga-formRow{display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:12.5px}
.ga-link{background:none;border:0;padding:0;color:rgba(246,245,242,.7);font-size:12.5px;cursor:pointer;transition:color 200ms}
.ga-link:hover{color:${T.gold}}

.ga-error{font-size:13px;line-height:1.5;color:#F6C378;background:rgba(232,163,61,.10);border:1px solid rgba(232,163,61,.35);padding:10px 12px;margin:0}
.ga-submit{height:52px;border:0;background:${T.gold};color:${T.ink};font-size:13.5px;letter-spacing:.05em;cursor:pointer;margin-top:6px;transition:background 200ms}
.ga-submit:hover:not(:disabled){background:${T.goldLight}}
.ga-submit:disabled{opacity:.65;cursor:default}
.ga-bone{background:${T.bone}}
.ga-bone:hover{background:${T.gold}}
.ga-grow{flex:1}

.ga-claim{margin-top:26px;display:flex;align-items:flex-start;gap:14px;text-align:left;width:100%;padding:16px 18px;background:rgba(246,245,242,.05);border:1px solid rgba(246,245,242,.16);color:${T.bone};cursor:pointer;transition:border-color 200ms,background 200ms}
.ga-claim:hover{border-color:${T.gold};background:rgba(232,163,61,.08)}
.ga-claimTag{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${T.gold};padding-top:2px;white-space:nowrap}
.ga-claimLine{font-size:13px;line-height:1.55;color:rgba(246,245,242,.66)}

/* Sign-up */
.ga-dots{display:flex;gap:8px;flex:none;margin-bottom:clamp(18px,2.6vh,30px)}
.ga-dot{flex:1;display:flex;flex-direction:column;gap:8px}
.ga-dot span{font-size:10.5px;letter-spacing:.12em;text-transform:uppercase}
.ga-bar{height:2px;transition:background 300ms}
.ga-roles{display:flex;flex-direction:column;gap:10px}
.ga-role{display:flex;flex-direction:column;gap:6px;width:100%;padding:16px 18px;border:1px solid rgba(246,245,242,.18);background:rgba(246,245,242,.03);color:${T.bone};cursor:pointer;text-align:left;transition:border-color 200ms,background 200ms}
.ga-role:hover{border-color:rgba(246,245,242,.4)}
.ga-role.is-on{border-color:${T.gold};background:rgba(232,163,61,.10)}
.ga-roleTop{display:flex;justify-content:space-between;align-items:baseline;gap:12px;width:100%}
.ga-roleTitle{font-family:${display};font-weight:600;font-size:17px;letter-spacing:-.015em}
.ga-roleTag{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:rgba(246,245,242,.38);white-space:nowrap}
.ga-role.is-on .ga-roleTag{color:${T.gold}}
.ga-roleLine{font-size:13px;line-height:1.55;color:rgba(246,245,242,.55)}

.ga-signupForm{display:flex;flex-direction:column;min-height:0;flex:1;gap:14px}
.ga-grid{flex:1;overflow-y:auto;display:grid;grid-template-columns:1fr 1fr;gap:14px;align-content:start;padding-right:4px}
.ga-span2{grid-column:span 2}
.ga-actions{display:flex;gap:10px;flex:none}
.ga-back{height:52px;padding:0 22px;border:1px solid rgba(246,245,242,.22);background:transparent;color:rgba(246,245,242,.72);font-size:13px;letter-spacing:.04em;cursor:pointer;margin-top:6px;transition:border-color 200ms,color 200ms}
.ga-back:hover{border-color:${T.gold};color:${T.bone}}

.ga-tick{width:52px;height:52px;border:1px solid ${T.gold};color:${T.gold};display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:22px}
.ga-next{border-top:1px solid rgba(246,245,242,.16)}
.ga-nextRow{display:flex;align-items:baseline;gap:16px;padding:14px 0;border-bottom:1px solid rgba(246,245,242,.16)}
.ga-nextNum{font-size:11px;letter-spacing:.12em;color:${T.gold};font-variant-numeric:tabular-nums;flex:none}
.ga-nextText{font-size:14px;line-height:1.5;color:rgba(246,245,242,.72)}

.ga-foot{flex:none;padding-top:20px;margin-top:20px;border-top:1px solid rgba(246,245,242,.14);display:flex;justify-content:space-between;gap:16px;font-size:12px;color:rgba(246,245,242,.42)}
.ga-foot a{color:rgba(246,245,242,.42);text-decoration:none;transition:color 200ms}
.ga-foot a:hover{color:${T.gold}}

/* ── Stack below 900px ──────────────────────────────────────────────── */
@media (max-width:900px){
  .ga{grid-template-columns:1fr;min-height:auto}
  .ga-art{min-height:0}
  .ga-artInner{padding:20px clamp(20px,5vw,32px) 24px;gap:18px}
  .ga-artCopy{max-width:none}
  .ga-artTitle{font-size:clamp(24px,6vw,34px);margin-bottom:10px}
  .ga-artLine{font-size:13.5px;max-width:52ch}
  .ga-artStats{display:none}
  .ga-panel{border-left:0;border-top:1px solid rgba(246,245,242,.14);min-height:0;padding:clamp(20px,5vw,32px)}
  .ga-grid{overflow:visible}
}

@media (max-width:520px){
  .ga-grid{grid-template-columns:1fr}
  .ga-span2{grid-column:span 1}
  .ga-actions{flex-direction:column-reverse}
  .ga-back{width:100%}
  .ga-artCopy{display:none}
  .ga-roleTop{flex-direction:column;gap:4px}
  .ga-foot{flex-direction:column;gap:6px}
}
`

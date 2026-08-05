import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Clock, ShieldAlert, CheckCircle2, AlertCircle, Send, Loader2, Flag,
} from "lucide-react"
import {
  examGetPaper, examSaveProgress, examHeartbeat, examLogEvent, examSubmit,
} from "../lib/examApi"

const NAVY = "#003366"
const MID  = "#336699"

const HEARTBEAT_MS = 20000  // server truth for the clock
const AUTOSAVE_MS  = 15000

export default function ExamRunner({ token, onFinished }) {
  const [paper,   setPaper]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [fatal,   setFatal]   = useState("")

  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)
  const [flagged, setFlagged] = useState(() => new Set())

  const [remaining, setRemaining] = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [result,      setResult]      = useState(null)
  const [warning,     setWarning]     = useState(null)

  const answersRef  = useRef(answers)
  const submittedRef = useRef(false)
  answersRef.current = answers

  // ── Load the paper ───────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const p = await examGetPaper(token)
        if (!alive) return
        setPaper(p)
        setAnswers(p.savedAnswers || {})
        const secs = Math.max(0, Math.floor((new Date(p.expiresAt) - new Date(p.serverNow)) / 1000))
        setRemaining(secs)
      } catch (e) {
        if (alive) setFatal(e.message)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [token])

  // ── Submit ───────────────────────────────────────────────────────────────
  const doSubmit = useCallback(async (auto = false) => {
    if (submittedRef.current) return
    submittedRef.current = true
    setSubmitting(true)
    try {
      const res = await examSubmit(token, answersRef.current, auto)
      setResult({ ...res, auto })
    } catch (e) {
      setFatal(e.message)
      submittedRef.current = false
    } finally {
      setSubmitting(false)
    }
  }, [token])

  // ── Server-enforced clock ────────────────────────────────────────────────
  // The countdown on screen is cosmetic. Every 20 seconds the server tells us
  // the real remaining time, so changing the device clock or editing the
  // counter in devtools buys nothing.
  useEffect(() => {
    if (!paper || result) return
    const tick = setInterval(() => setRemaining((r) => (r == null ? r : Math.max(0, r - 1))), 1000)
    const beat = setInterval(async () => {
      try {
        const h = await examHeartbeat(token)
        setRemaining(h.remainingSeconds)
        if (h.status === "disqualified") {
          setFatal("This attempt has been stopped. Speak to your invigilator.")
          clearInterval(tick); clearInterval(beat)
          return
        }
        if (h.expired) doSubmit(true)
      } catch { /* a dropped beat is not fatal, the next one will catch up */ }
    }, HEARTBEAT_MS)
    return () => { clearInterval(tick); clearInterval(beat) }
  }, [paper, result, token, doSubmit])

  // Local clock reaching zero submits without waiting for the next heartbeat
  useEffect(() => {
    if (remaining === 0 && paper && !result && !submittedRef.current) doSubmit(true)
  }, [remaining, paper, result, doSubmit])

  // ── Autosave ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!paper || result) return
    const t = setInterval(async () => {
      setSaving(true)
      try { await examSaveProgress(token, answersRef.current) } catch { /* retried next cycle */ }
      finally { setSaving(false) }
    }, AUTOSAVE_MS)
    return () => clearInterval(t)
  }, [paper, result, token])

  // ── Invigilation ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!paper || result) return

    const onHide = async () => {
      if (document.visibilityState !== "hidden") return
      // Save first: if they do not come back, their work is still banked
      examSaveProgress(token, answersRef.current).catch(() => {})
      const res = await examLogEvent(token, "tab_blur", { at: new Date().toISOString() })
      if (res?.disqualified) {
        setFatal("Your attempt was stopped after too many tab switches. Speak to your invigilator.")
      } else if (res && typeof res.remaining === "number") {
        setWarning(
          res.remaining > 0
            ? `Leaving the exam page is recorded. ${res.remaining} more will stop your attempt.`
            : "Leaving the exam page is recorded. The next one will stop your attempt."
        )
      }
    }

    const block = (e) => { e.preventDefault(); return false }
    const onCopyPaste = (e) => {
      e.preventDefault()
      examLogEvent(token, e.type, {})
      setWarning("Copying and pasting is switched off during the exam.")
    }

    document.addEventListener("visibilitychange", onHide)
    document.addEventListener("contextmenu", block)
    document.addEventListener("copy", onCopyPaste)
    document.addEventListener("paste", onCopyPaste)
    document.addEventListener("cut", onCopyPaste)

    const onBeforeUnload = (e) => {
      examSaveProgress(token, answersRef.current).catch(() => {})
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", onBeforeUnload)

    return () => {
      document.removeEventListener("visibilitychange", onHide)
      document.removeEventListener("contextmenu", block)
      document.removeEventListener("copy", onCopyPaste)
      document.removeEventListener("paste", onCopyPaste)
      document.removeEventListener("cut", onCopyPaste)
      window.removeEventListener("beforeunload", onBeforeUnload)
    }
  }, [paper, result, token])

  useEffect(() => {
    if (!warning) return
    const t = setTimeout(() => setWarning(null), 6000)
    return () => clearTimeout(t)
  }, [warning])

  // ── Derived ──────────────────────────────────────────────────────────────
  const questions = paper?.questions || []
  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q.idx] != null).length,
    [questions, answers]
  )
  const q = questions[current]

  const pick = (idx, option) => setAnswers((prev) => ({ ...prev, [idx]: option }))
  const toggleFlag = (idx) => setFlagged((prev) => {
    const next = new Set(prev)
    next.has(idx) ? next.delete(idx) : next.add(idx)
    return next
  })

  // ── Screens ──────────────────────────────────────────────────────────────

  if (loading) {
    return <Centered><Loader2 size={26} className="animate-spin mb-3" style={{ color: NAVY }} />
      <p style={{ color: MID }}>Opening your exam paper...</p></Centered>
  }

  if (fatal && !result) {
    return <Centered>
      <AlertCircle size={34} className="text-red-500 mb-3" />
      <p className="text-lg font-semibold mb-1" style={{ color: NAVY }}>{fatal}</p>
      <button onClick={onFinished} className="mt-4 px-5 py-2 rounded-xl text-white font-semibold" style={{ backgroundColor: NAVY }}>
        Back to sign in
      </button>
    </Centered>
  }

  if (result) {
    return <Centered>
      <CheckCircle2 size={44} className="text-emerald-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2" style={{ color: NAVY }}>
        {result.alreadySubmitted ? "Already submitted" : "Your exam is submitted"}
      </h2>
      {result.auto && (
        <p className="text-sm mb-2" style={{ color: MID }}>Your time ran out, so we submitted your work for you.</p>
      )}
      {result.showResults ? (
        <p className="text-lg font-semibold mb-3" style={{ color: NAVY }}>
          You scored {result.score} out of {result.total}
        </p>
      ) : (
        <p className="text-sm mb-3" style={{ color: MID }}>Your results will be released by your invigilator.</p>
      )}
      <button onClick={onFinished} className="mt-3 px-5 py-2.5 rounded-xl text-white font-semibold" style={{ backgroundColor: NAVY }}>
        Close
      </button>
    </Centered>
  }

  return (
    <div className="min-h-screen w-full select-none" style={{ backgroundColor: "#F0F4F8" }}>
      {/* Sticky exam bar */}
      <div className="sticky top-0 z-30 border-b" style={{ backgroundColor: NAVY, borderColor: "#ffffff20" }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{paper.examTitle}</p>
            <p className="text-xs truncate" style={{ color: "#9FC0E0" }}>{paper.candidateName}</p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-xs" style={{ color: "#9FC0E0" }}>
              {answeredCount} of {questions.length} answered
            </span>
            <TimeChip seconds={remaining} />
          </div>
        </div>
      </div>

      {warning && (
        <div className="sticky top-[60px] z-20 bg-amber-50 border-b border-amber-200">
          <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-2">
            <ShieldAlert size={14} className="text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">{warning}</p>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
        {/* Question */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: MID }}>
              Question {current + 1} of {questions.length}
            </span>
            <button
              onClick={() => toggleFlag(q.idx)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                flagged.has(q.idx)
                  ? "bg-amber-50 border-amber-300 text-amber-700"
                  : "border-gray-200 text-gray-400 hover:text-gray-600"
              }`}>
              <Flag size={11} /> {flagged.has(q.idx) ? "Flagged" : "Flag for review"}
            </button>
          </div>

          {q.image && (
            <img src={q.image} alt="" className="mb-4 w-full max-h-72 object-contain rounded-lg border border-gray-100" />
          )}

          <div className="text-[15px] leading-relaxed mb-5" style={{ color: "#1F2937" }}
            dangerouslySetInnerHTML={{ __html: q.question }} />

          <div className="space-y-2.5">
            {q.answers.map((option, i) => {
              const chosen = answers[q.idx] === option
              return (
                <button
                  key={i}
                  onClick={() => pick(q.idx, option)}
                  className="w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-start gap-3"
                  style={{
                    borderColor: chosen ? NAVY : "#E5E7EB",
                    backgroundColor: chosen ? "#F0F5FA" : "#FFFFFF",
                  }}
                >
                  <span
                    className="shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold mt-0.5"
                    style={{
                      borderColor: chosen ? NAVY : "#D1D5DB",
                      backgroundColor: chosen ? NAVY : "transparent",
                      color: chosen ? "#FFFFFF" : "#6B7280",
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 text-[15px]" style={{ color: "#1F2937" }}
                    dangerouslySetInnerHTML={{ __html: option }} />
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-gray-400">
              {saving ? "Saving your work..." : "Your answers save automatically"}
            </span>
            {current < questions.length - 1 ? (
              <button
                onClick={() => setCurrent((c) => c + 1)}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: NAVY }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => setConfirmOpen(true)}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5"
                style={{ backgroundColor: "#1D9E75" }}
              >
                <Send size={13} /> Submit
              </button>
            )}
          </div>
        </div>

        {/* Navigator */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4 h-fit lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: MID }}>
            Your questions
          </p>
          <div className="grid grid-cols-6 lg:grid-cols-5 gap-1.5 mb-4">
            {questions.map((qq, i) => {
              const done = answers[qq.idx] != null
              const isFlag = flagged.has(qq.idx)
              const active = i === current
              return (
                <button
                  key={qq.idx}
                  onClick={() => setCurrent(i)}
                  className="aspect-square rounded-lg text-xs font-bold border-2 transition-all relative"
                  style={{
                    borderColor: active ? NAVY : done ? "#1D9E75" : "#E5E7EB",
                    backgroundColor: active ? NAVY : done ? "#E1F5EE" : "#FFFFFF",
                    color: active ? "#FFFFFF" : done ? "#085041" : "#9CA3AF",
                  }}
                >
                  {i + 1}
                  {isFlag && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setConfirmOpen(true)}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1.5"
            style={{ backgroundColor: "#1D9E75" }}
          >
            <Send size={13} /> Submit my exam
          </button>
        </div>
      </div>

      {/* Submit confirmation */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2" style={{ color: NAVY }}>Submit your exam?</h3>
            <p className="text-sm text-gray-600 mb-1">
              You have answered {answeredCount} of {questions.length} questions.
            </p>
            {answeredCount < questions.length && (
              <p className="text-sm text-amber-700 mb-1">
                {questions.length - answeredCount} question{questions.length - answeredCount === 1 ? " is" : "s are"} still blank.
              </p>
            )}
            <p className="text-sm text-gray-600 mb-5">You cannot change your answers after this.</p>
            <div className="flex gap-3">
              <button
                onClick={() => doSubmit(false)}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: "#1D9E75" }}
              >
                {submitting ? "Submitting your work..." : "Yes, submit"}
              </button>
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600"
              >
                Keep working
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Bits ───────────────────────────────────────────────────────────────────

function TimeChip({ seconds }) {
  if (seconds == null) return null
  const low = seconds <= 300
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const text = h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`
  return (
    <span
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-sm"
      style={{ backgroundColor: low ? "#DC2626" : "#ffffff1A", color: "#FFFFFF" }}
    >
      <Clock size={13} /> {text}
    </span>
  )
}

function Centered({ children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4" style={{ backgroundColor: "#F0F4F8" }}>
      <div className="text-center max-w-sm">{children}</div>
    </div>
  )
}

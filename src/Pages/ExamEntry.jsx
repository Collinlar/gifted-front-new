import { useState } from "react"
import { KeyRound, Lock, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react"
import { examLogin } from "../lib/examApi"

const NAVY = "#003366"
const MID  = "#336699"

export default function ExamEntry({ sessionCode, onAuthenticated }) {
  const [accessCode, setAccessCode] = useState("")
  const [password, setPassword]     = useState("")
  const [busy, setBusy]             = useState(false)
  const [error, setError]           = useState("")

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    setError("")
    setBusy(true)
    try {
      // The server returns mode 'exam' with a token, or mode 'results' with a
      // score once the invigilator has published them.
      const res = await examLogin(sessionCode, accessCode.trim(), password.trim())
      onAuthenticated(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10" style={{ backgroundColor: "#F0F4F8" }}>
      <div className="w-full max-w-md">

        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-3"
            style={{ backgroundColor: "#6699CC30", color: NAVY }}>
            <ShieldCheck size={13} /> Supervised exam
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: NAVY }}>Sign in to your exam</h1>
          <p className="text-sm" style={{ color: MID }}>
            Use the access code and password on your slip.
          </p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl shadow-lg p-7 space-y-5">
          <div>
            <label htmlFor="accessCode" className="block text-sm font-medium mb-1.5" style={{ color: NAVY }}>
              Access code
            </label>
            <div className="relative">
              <KeyRound size={17} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: MID }} />
              <input
                id="accessCode"
                value={accessCode}
                onChange={(e) => { setAccessCode(e.target.value.toUpperCase()); setError("") }}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border font-mono tracking-widest uppercase text-base focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: error ? "#ef4444" : "#33669930" }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="examPassword" className="block text-sm font-medium mb-1.5" style={{ color: NAVY }}>
              Password
            </label>
            <div className="relative">
              <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: MID }} />
              <input
                id="examPassword"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError("") }}
                autoComplete="off"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border text-base focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: error ? "#ef4444" : "#33669930" }}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy || !accessCode.trim() || !password.trim()}
            className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: NAVY }}
          >
            {busy ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Checking your details...</>
            ) : (
              <>Start my exam <ArrowRight size={16} /></>
            )}
          </button>

          <p className="text-xs text-center" style={{ color: MID }}>
            Once you begin, your time starts and runs on our server. Closing this page will not pause it.
          </p>
        </form>
      </div>
    </div>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { claimExamResult, getMyExams, getMyExamResult } from '../lib/examApi'
import ExamResults from './ExamResults'
import { examAccountPath } from '../lib/examAccountLinks'

export default function MyExams() {
  const location = useLocation()
  const [user, setUser] = useState(undefined)
  const [authError, setAuthError] = useState('')
  useEffect(() => {
    let alive = true, eventSeen = false
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      eventSeen = true
      if (alive) { setUser(session?.user || null); setAuthError('') }
    })
    supabase.auth.getSession().then(({ data, error }) => {
      if (!alive || eventSeen) return
      if (error) setAuthError('Could not check your sign-in. Refresh this page to try again.')
      setUser(data.session?.user || null)
    }).catch(() => {
      if (alive) { setUser(null); setAuthError('Could not check your sign-in. Refresh this page to try again.') }
    })
    return () => { alive = false; subscription.unsubscribe() }
  }, [])
  if (user === undefined) return <div className="p-8 text-[#103254]">Checking your Gifted sign-in...</div>
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <main className="max-w-xl mx-auto p-6 pt-20 space-y-4">
      <h1 className="text-3xl font-bold text-[#103254]">Your exams, in one place</h1>
      <p>Sign in or create a Gifted account to save your completed online and paper-based exams. Keep your exam slip ready; we will ask for it after you sign in.</p>
      {authError && <p role="alert" className="text-red-700">{authError}</p>}
      <div className="flex flex-wrap gap-3">
        <Link className="px-5 py-3 rounded-lg bg-[#103254] text-white font-semibold" to={`/login?next=${next}`}>Sign in to Gifted</Link>
        <Link className="px-5 py-3 rounded-lg border border-[#103254] text-[#103254] font-semibold" to={`/sign-up?next=${next}`}>Create my Gifted account</Link>
      </div>
    </main>
  }
  return <AccountExams key={user.id} user={user} initialCode={new URLSearchParams(location.search).get('session') || ''} />
}

function AccountExams({ user, initialCode }) {
  const readVersion = useRef(0)
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [opening, setOpening] = useState(null)
  const [results, setResults] = useState(null)
  const [sessionCode, setSessionCode] = useState(initialCode)
  const [accessCode, setAccessCode] = useState('')
  const [password, setPassword] = useState('')
  useEffect(() => { setSessionCode(initialCode) }, [initialCode])
  const refresh = useCallback(async () => {
    const version = ++readVersion.current
    setLoadError(''); setLoading(true)
    try {
      const response = await getMyExams()
      if (version === readVersion.current) setExams(response.exams || [])
    }
    catch (e) { if (version === readVersion.current) setLoadError(e.message || 'Could not read your saved exams. Try again.') }
    finally { if (version === readVersion.current) setLoading(false) }
  }, [])
  useEffect(() => { refresh() }, [refresh])
  async function claim(e) {
    e.preventDefault()
    if (busy) return
    setError(''); setNotice(''); setBusy(true)
    try {
      const result = await claimExamResult(sessionCode.trim(), accessCode.trim(), password.trim())
      setPassword('')
      setNotice(result.alreadyLinked ? 'This exam is already saved to your account.' : `${result.exam.examTitle} is now saved to your account. Your exam record and score have not changed.`)
      await refresh()
    } catch (e) { setError(e.message || 'Could not save this exam. Check your slip and try again.') }
    finally { setBusy(false) }
  }
  async function open(candidateId) {
    setOpening(candidateId); setError('')
    try { setResults(await getMyExamResult(candidateId)) }
    catch (e) { setError(e.message || 'Could not open that result. Refresh your exams and try again.') }
    finally { setOpening(null) }
  }
  if (results) return <ExamResults results={results} onClose={() => { setResults(null); refresh() }} />
  return <main className="max-w-4xl mx-auto p-5 sm:p-8 pt-20 lg:pt-8 space-y-6">
    <header>
      <h1 className="text-3xl font-bold text-[#103254]">My Exams</h1>
      <p className="text-gray-600 mt-2">Online and paper-based exams saved to your Gifted account.</p>
    </header>
    <section className="border border-gray-200 rounded-xl p-5 bg-white">
      <h2 className="text-lg font-semibold text-[#103254]">Save a completed exam</h2>
      <p className="text-sm text-gray-600 mt-2">This exam will be attached to <strong>{user.email || 'your signed-in account'}</strong>. Use the private details on your exam slip. Your name alone cannot verify ownership.</p>
      <Link className="inline-block text-sm text-[#103254] underline mt-2 py-2"
        to={`/login?next=${encodeURIComponent(examAccountPath(sessionCode))}`}>Use another Gifted account</Link>
      <form onSubmit={claim} className="space-y-4 mt-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <label className="text-sm font-medium">Sitting code
            <input required maxLength={100} disabled={busy} value={sessionCode} autoComplete="off" spellCheck={false}
              onChange={e => setSessionCode(e.target.value.toUpperCase())} className="block w-full border rounded-lg p-3 mt-1 text-base" />
          </label>
          <label className="text-sm font-medium">Access code
            <input required maxLength={100} disabled={busy} value={accessCode} autoComplete="off" spellCheck={false}
              onChange={e => setAccessCode(e.target.value.toUpperCase())} className="block w-full border rounded-lg p-3 mt-1 text-base" />
          </label>
          <label className="text-sm font-medium">Exam password
            <input required type="password" maxLength={200} disabled={busy} value={password} autoComplete="off"
              onChange={e => setPassword(e.target.value)} className="block w-full border rounded-lg p-3 mt-1 text-base" />
          </label>
        </div>
        <button disabled={busy} className="px-5 py-3 rounded-lg bg-[#103254] text-white font-semibold disabled:opacity-50">
          {busy ? 'Verifying your exam slip...' : 'Verify and save my exam'}
        </button>
        <p className="text-sm text-gray-600">Lost your slip or linked to the wrong account? Contact your exam administrator. You can save an exam before results are published.</p>
      </form>
    </section>
    {error && <p role="alert" className="bg-red-50 text-red-700 p-3 rounded-lg">{error}</p>}
    {notice && <p role="status" className="bg-emerald-50 text-emerald-800 p-3 rounded-lg">{notice}</p>}
    <section>
      <div className="flex justify-between items-center gap-3 mb-3">
        <h2 className="text-xl font-semibold text-[#103254]">Saved exams</h2>
        <button onClick={refresh} disabled={loading} className="border rounded-lg px-4 py-3 text-sm">Refresh exams</button>
      </div>
      {loading ? <p>Reading your saved exams...</p> : loadError ? <p role="alert" className="text-red-700">{loadError}</p> : !exams.length ?
        <p className="text-gray-600">No exams saved yet. Use your slip above to add your first exam.</p> :
        <div className="divide-y border rounded-xl bg-white">
          {exams.map(exam => <article key={exam.candidateId} className="p-5 flex flex-wrap justify-between items-center gap-4">
            <div>
              <h3 className="font-semibold text-[#103254]">{exam.examTitle}</h3>
              <p className="text-sm text-gray-600">{exam.candidateName} · {exam.entrySource === 'paper' ? 'Paper-based' : 'Online'}</p>
              <p className="text-sm mt-2">{exam.status === 'disqualified' ? 'Attempt stopped. Contact your exam administrator.' : exam.status !== 'submitted' ? 'Exam not completed yet.' : exam.resultsOut ? `${exam.score} / ${exam.total} marks` : 'Results not published yet.'}</p>
              {exam.certificate && <p className="text-sm text-emerald-700">Certificate available{exam.certificate.band ? `: ${exam.certificate.band}` : ''}</p>}
            </div>
            <button onClick={() => open(exam.candidateId)} disabled={opening !== null || exam.status !== 'submitted'}
              className="border border-[#103254] text-[#103254] rounded-lg px-4 py-3 font-semibold text-sm disabled:opacity-50">
              {opening === exam.candidateId ? 'Opening exam record...' : 'View results and certificate'}
            </button>
          </article>)}
        </div>}
    </section>
  </main>
}

import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Target, Clock, Zap, ChevronRight, BarChart2, Calendar, ArrowLeft } from 'lucide-react'
import { getTokenUserId } from '../lib/auth'
import { getUserMasteryForExam, getExamReadiness, getPracticeSessions } from '../lib/api'

function MasteryRing({ score, size = 80, label }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const filled = circ * Math.min(score, 1)
  const pct = Math.round(score * 100)
  const color = score >= 0.8 ? '#1D9E75' : score >= 0.5 ? '#E8A020' : '#EF4444'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={8} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={8}
            strokeDasharray={`${filled} ${circ}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-800">{pct}%</span>
        </div>
      </div>
      {label && <span className="text-xs text-gray-500 text-center max-w-[80px] leading-tight">{label}</span>}
    </div>
  )
}

function ExamReadinessBar({ readiness }) {
  const color = readiness >= 75 ? '#1D9E75' : readiness >= 50 ? '#E8A020' : '#EF4444'
  const label = readiness >= 75 ? 'Ready to sit the exam' : readiness >= 50 ? 'Getting there — keep practising' : 'More practice needed'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target size={16} style={{ color: '#1D9E75' }} />
          <span className="text-sm font-semibold text-gray-700">Exam Readiness</span>
        </div>
        <span className="text-2xl font-bold" style={{ color }}>{readiness}%</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${readiness}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </div>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

function SessionHistoryRow({ session }) {
  const accuracy = session.questions_seen > 0
    ? Math.round((session.correct_count / session.questions_seen) * 100)
    : 0
  const date = new Date(session.completed_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short'
  })
  const mins = session.duration_secs ? Math.ceil(session.duration_secs / 60) : '—'

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
          accuracy >= 70 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {accuracy}%
        </div>
        <div>
          <div className="text-sm font-medium text-gray-800">
            {session.correct_count}/{session.questions_seen} correct
          </div>
          <div className="text-xs text-gray-400">{date} · {mins} min</div>
        </div>
      </div>
      {session.hints_used > 0 && (
        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
          {session.hints_used} hint{session.hints_used > 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}

export default function PracticeOverviewPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const exam = location.state?.exam
  const userId = getTokenUserId()

  const [readiness, setReadiness]   = useState(0)
  const [mastery, setMastery]       = useState([])
  const [sessions, setSessions]     = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    if (!exam || !userId) { setLoading(false); return }
    const examId = exam.id || exam._id

    Promise.all([
      getExamReadiness(userId, examId),
      getUserMasteryForExam(userId, examId),
      getPracticeSessions(userId, examId, 5),
    ]).then(([r, m, s]) => {
      setReadiness(r.readiness || 0)
      setMastery(m.mastery || [])
      setSessions(s.sessions || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (!exam) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        No practice data found. Navigate here from a track.
      </div>
    )
  }

  const totalQuestions = exam.questions?.length || 0
  const attemptedCount = mastery.length
  const avgMastery     = mastery.length > 0
    ? mastery.reduce((s, m) => s + m.mastery_score, 0) / mastery.length
    : 0

  // Group mastery rows by rough topic (use question_id prefix or just show overall)
  // For now, show overall mastery until questions have topic tags
  const masteredCount = mastery.filter(m => m.mastery_score >= 0.8).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E1F5EE' }}>
              <BookOpen size={20} style={{ color: '#1D9E75' }} />
            </div>
            <div>
              <div className="text-xs text-teal-600 font-semibold uppercase tracking-wider">Practice Mode</div>
              <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Exam Readiness */}
            <ExamReadinessBar readiness={readiness} />

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <div className="text-2xl font-bold text-gray-800">{attemptedCount}</div>
                <div className="text-xs text-gray-500 mt-1">Questions seen</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <div className="text-2xl font-bold" style={{ color: '#1D9E75' }}>{masteredCount}</div>
                <div className="text-xs text-gray-500 mt-1">Mastered</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <div className="text-2xl font-bold text-gray-800">{totalQuestions - attemptedCount}</div>
                <div className="text-xs text-gray-500 mt-1">Not yet seen</div>
              </div>
            </div>

            {/* Overall mastery ring */}
            {attemptedCount > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-6">
                <MasteryRing score={avgMastery} size={88} />
                <div>
                  <div className="text-sm font-semibold text-gray-800 mb-1">Overall mastery</div>
                  <div className="text-sm text-gray-500">
                    {avgMastery >= 0.8
                      ? 'Strong. Your accuracy is consistently high.'
                      : avgMastery >= 0.5
                      ? 'Building. Keep going — more sessions will sharpen this.'
                      : 'Early days. Each session brings you closer.'}
                  </div>
                  {readiness < 75 && (
                    <div className="mt-2 text-xs text-teal-600 font-medium">
                      {Math.max(0, 75 - readiness)}% more readiness to reach exam confidence
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Start session CTA */}
            <button
              onClick={() => navigate('/practice', { state: { exam, from: location.state?.from } })}
              className="w-full py-4 rounded-2xl text-white font-semibold text-base flex items-center justify-center gap-2 shadow-sm"
              style={{ backgroundColor: '#1D9E75' }}
            >
              <Zap size={18} />
              {sessions.length === 0 ? 'Start your first session' : 'Start a new session'}
            </button>

            {/* Session history */}
            {sessions.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700">Recent sessions</span>
                </div>
                {sessions.map(s => <SessionHistoryRow key={s.id} session={s} />)}
              </div>
            )}

            {/* Spacing note */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
              <strong>How practice mode works:</strong> Questions you find difficult come back sooner.
              Questions you have mastered are spaced out over days. Each session adapts to where you need the most work.
            </div>
          </>
        )}
      </div>
    </div>
  )
}

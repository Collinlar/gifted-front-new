import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Lightbulb, ChevronRight, BookOpen, Clock, Target, Zap } from 'lucide-react'
import { getTokenUserId } from '../lib/auth'
import {
  getPracticeQueue,
  updateQuestionMastery,
  savePracticeSession,
} from '../lib/api'
import { generateHint, generateExplanation } from '../lib/practiceAI'

// Strip HTML tags from question text
function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '')
}

// Mastery ring — small circular indicator
function MasteryRing({ score, size = 40 }) {
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const filled = circ * score
  const color = score >= 0.8 ? '#1D9E75' : score >= 0.5 ? '#E8A020' : '#EF4444'
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={5} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={5}
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  )
}

export default function PracticeModePage() {
  const location = useLocation()
  const navigate = useNavigate()

  const exam     = location.state?.exam
  const fromPath = location.state?.from || '/tracks'

  // ── Session state ──────────────────────────────────────────
  const [questions, setQuestions]           = useState([])
  const [loading, setLoading]               = useState(true)
  const [currentIndex, setCurrentIndex]     = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answered, setAnswered]             = useState(false)
  const [sessionAnswers, setSessionAnswers] = useState([]) // { questionId, correct, hintsUsed }
  const [hintsUsed, setHintsUsed]           = useState(0)
  const [sessionDone, setSessionDone]       = useState(false)

  // ── Feedback card state ────────────────────────────────────
  const [explanation, setExplanation] = useState('')
  const [loadingExplanation, setLoadingExplanation] = useState(false)

  // ── Hint state ─────────────────────────────────────────────
  const [hint, setHint]               = useState('')
  const [showHint, setShowHint]       = useState(false)
  const [loadingHint, setLoadingHint] = useState(false)

  const hintsEnabled = exam?.hints_enabled !== false  // default true if column not yet set

  // ── Soft timer ────────────────────────────────────────────
  const [elapsedSecs, setElapsedSecs] = useState(0)
  const timerRef = useRef(null)
  const startTimeRef = useRef(Date.now())

  const userId = getTokenUserId()

  // ── Load question queue ────────────────────────────────────
  useEffect(() => {
    if (!exam || !userId) { setLoading(false); return }

    getPracticeQueue(userId, exam.id || exam._id)
      .then(({ questions: q }) => {
        setQuestions(q)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // ── Soft timer ─────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSecs(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // ── Current question helpers ───────────────────────────────
  const current = questions[currentIndex]
  const correctIndex = current ? (current.correct ?? current.answer ?? 0) : 0

  // ── Answer selection ───────────────────────────────────────
  const handleAnswer = useCallback(async (optionIndex) => {
    if (answered) return
    setSelectedAnswer(optionIndex)
    setAnswered(true)

    const isCorrect = optionIndex === correctIndex
    const qId = current._qId || current.id || current._id || String(current.question)

    // Update mastery in DB
    if (userId && exam) {
      updateQuestionMastery(userId, exam.id || exam._id, qId, isCorrect).catch(() => {})
    }

    // Record answer for session summary
    setSessionAnswers(prev => [...prev, {
      questionId: qId,
      correct: isCorrect,
      hintsUsed: showHint ? 1 : 0,
    }])

    // Fetch / use explanation
    const existingExplanation = current.explanation
    if (existingExplanation) {
      setExplanation(existingExplanation)
    } else {
      setLoadingExplanation(true)
      generateExplanation(current)
        .then(text => setExplanation(text))
        .catch(() => setExplanation(''))
        .finally(() => setLoadingExplanation(false))
    }
  }, [answered, correctIndex, current, userId, exam, showHint])

  // ── Hint request ───────────────────────────────────────────
  const handleHint = useCallback(async () => {
    if (hint) { setShowHint(true); return }
    const existingHint = current?.hint
    if (existingHint) { setHint(existingHint); setShowHint(true); return }
    setLoadingHint(true)
    setShowHint(true)
    try {
      const text = await generateHint(current)
      setHint(text)
      setHintsUsed(h => h + 1)
    } catch {
      setHint('Focus on the key concept in the question — what is it really asking you to compare or identify?')
    } finally {
      setLoadingHint(false)
    }
  }, [current, hint])

  // ── Next question ──────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      // Session complete
      clearInterval(timerRef.current)
      const totalSecs = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const correctCount = sessionAnswers.filter(a => a.correct).length + (answered && selectedAnswer === correctIndex ? 0 : 0)
      const finalCorrect = sessionAnswers.filter(a => a.correct).length

      if (userId && exam) {
        savePracticeSession(userId, exam.id || exam._id, {
          questionsSeen: questions.length,
          correctCount: finalCorrect,
          hintsUsed,
          durationSecs: totalSecs,
        }).catch(() => {})
      }
      setSessionDone(true)
      return
    }

    setCurrentIndex(i => i + 1)
    setSelectedAnswer(null)
    setAnswered(false)
    setExplanation('')
    setHint('')
    setShowHint(false)
    wrongAttemptsRef.current = 0
  }, [currentIndex, questions.length, sessionAnswers, answered, selectedAnswer, correctIndex, userId, exam, hintsUsed])

  // ── Guards ─────────────────────────────────────────────────
  if (!exam) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        No practice content loaded. Return to your track and select a practice module.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600">Building your practice session...</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 px-6 text-center">
        <Target size={48} className="text-teal-500" />
        <h2 className="text-2xl font-semibold text-gray-800">You have mastered all questions here.</h2>
        <p className="text-gray-500">Come back later — spaced repetition will resurface questions when it is time to review.</p>
        <button
          onClick={() => navigate(fromPath)}
          className="mt-4 px-6 py-3 rounded-lg text-white font-medium"
          style={{ backgroundColor: '#1D9E75' }}
        >
          Back to track
        </button>
      </div>
    )
  }

  // ── Session complete screen ────────────────────────────────
  if (sessionDone) {
    const correctCount = sessionAnswers.filter(a => a.correct).length
    const accuracy = Math.round((correctCount / sessionAnswers.length) * 100)
    const masteryChange = accuracy >= 70 ? '+' : ''

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center"
        >
          <div className="text-5xl mb-4">{accuracy >= 80 ? '🎉' : accuracy >= 60 ? '💪' : '📚'}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Session complete</h2>
          <p className="text-gray-500 mb-6">{exam.title}</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-800">{correctCount}/{sessionAnswers.length}</div>
              <div className="text-xs text-gray-500 mt-1">Correct</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-2xl font-bold" style={{ color: accuracy >= 70 ? '#1D9E75' : '#E8A020' }}>{accuracy}%</div>
              <div className="text-xs text-gray-500 mt-1">Accuracy</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-800">{hintsUsed}</div>
              <div className="text-xs text-gray-500 mt-1">Hints used</div>
            </div>
          </div>

          {accuracy < 60 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800 text-left">
              <strong>Keep going.</strong> Questions you struggled with will come back sooner in your next session so you can strengthen them.
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setSessionDone(false)
                setCurrentIndex(0)
                setSelectedAnswer(null)
                setAnswered(false)
                setSessionAnswers([])
                setHintsUsed(0)
                setExplanation('')
                setHint('')
                setShowHint(false)
                startTimeRef.current = Date.now()
                setElapsedSecs(0)
                setLoading(true)
                getPracticeQueue(userId, exam.id || exam._id)
                  .then(({ questions: q }) => { setQuestions(q); setLoading(false) })
                  .catch(() => setLoading(false))
              }}
              className="w-full py-3 rounded-xl text-white font-semibold"
              style={{ backgroundColor: '#1D9E75' }}
            >
              Start another session
            </button>
            <button
              onClick={() => navigate('/practice-overview', { state: { exam } })}
              className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-medium"
            >
              View my progress
            </button>
            <button
              onClick={() => navigate(fromPath)}
              className="text-sm text-gray-400 mt-1"
            >
              Back to track
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Main session UI ────────────────────────────────────────
  const progress = ((currentIndex) / questions.length) * 100
  const options = current.options || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E1F5EE' }}>
              <BookOpen size={16} style={{ color: '#1D9E75' }} />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Practice</div>
              <div className="text-sm font-semibold text-gray-800 leading-tight">{exam.title}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Clock size={14} />
              <span>{formatTime(elapsedSecs)}</span>
            </div>
            <div className="text-sm text-gray-500 font-medium">
              {currentIndex + 1} / {questions.length}
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="max-w-2xl mx-auto mt-3">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: '#1D9E75' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* Question text */}
            <div className="mb-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-teal-600 mb-2">
                Question {currentIndex + 1}
              </div>
              <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
                {stripHtml(current.question)}
              </h2>
            </div>

            {/* Hint — available before answering when hints are enabled */}
            {!answered && hintsEnabled && (
              <div className="mb-5">
                {!showHint ? (
                  <button
                    onClick={handleHint}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-amber-500 transition-colors"
                  >
                    <Lightbulb size={14} />
                    Show hint
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3"
                  >
                    <Lightbulb size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      {loadingHint ? 'Getting your hint...' : hint}
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Options */}
            <div className="space-y-3 mb-6">
              {options.map((option, idx) => {
                const isSelected = selectedAnswer === idx
                const isCorrect  = idx === correctIndex
                let bg = 'bg-white border-gray-200 hover:border-gray-300'
                let textCol = 'text-gray-800'

                if (answered) {
                  if (isCorrect) {
                    bg = 'bg-green-50 border-green-400'
                    textCol = 'text-green-800'
                  } else if (isSelected && !isCorrect) {
                    bg = 'bg-red-50 border-red-400'
                    textCol = 'text-red-800'
                  } else {
                    bg = 'bg-white border-gray-100'
                    textCol = 'text-gray-400'
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={answered}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center justify-between gap-4 ${bg} ${!answered ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        answered && isCorrect ? 'border-green-400 bg-green-100 text-green-700' :
                        answered && isSelected ? 'border-red-400 bg-red-100 text-red-700' :
                        'border-gray-300 text-gray-500'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className={`text-sm font-medium ${textCol}`}>{stripHtml(String(option))}</span>
                    </div>
                    {answered && isCorrect && <CheckCircle size={18} className="text-green-500 flex-shrink-0" />}
                    {answered && isSelected && !isCorrect && <XCircle size={18} className="text-red-500 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>

            {/* Feedback card (after answering) */}
            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl p-5 mb-6 border-l-4 ${
                    selectedAnswer === correctIndex
                      ? 'bg-green-50 border-green-400'
                      : 'bg-red-50 border-red-400'
                  }`}
                >
                  <div className={`flex items-center gap-2 font-semibold mb-2 text-sm ${
                    selectedAnswer === correctIndex ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {selectedAnswer === correctIndex
                      ? <><CheckCircle size={16} /> Correct</>
                      : <><XCircle size={16} /> Not quite — the right answer is {String.fromCharCode(65 + correctIndex)}</>
                    }
                  </div>
                  <div className="text-sm text-gray-700">
                    {loadingExplanation
                      ? <span className="text-gray-400">Loading explanation...</span>
                      : explanation || 'Move on and this question will come back in a future session.'}
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

            {/* Action row */}
            <div className="flex items-center justify-between">
              <div />
              {answered && (
                <button
                  onClick={handleNext}
                  className="ml-auto flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm"
                  style={{ backgroundColor: '#1D9E75' }}
                >
                  {currentIndex + 1 >= questions.length ? 'Finish session' : 'Next question'}
                  <ChevronRight size={16} />
                </button>
              )}
              {!answered && <div />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

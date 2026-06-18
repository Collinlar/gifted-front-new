import { getTokenUserId } from "../lib/auth";
import { sendFeedback, sendAssessmentAnalytics, addExamRecord, saveQuizReview } from "../lib/api";
import { jwtDecode } from "jwt-decode";
// import { extname } from "path";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const QuizPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [shuffledQuizData, setShuffledQuizData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [postQuizTab, setPostQuizTab] = useState("summary"); // "summary" | "analytics" | "review"
  const [feedback, setFeedback] = useState("");

  // track context threaded from TrackDetail via QuizOverview
  const trackSlug = location.state?.trackSlug || localStorage.getItem("quiz-track-slug");
  const trackName = location.state?.trackName || localStorage.getItem("quiz-track-name");

  useEffect(() => {
    const savedQuiz = localStorage.getItem("saved-quiz");
    const savedAnswers = localStorage.getItem("saved-answers");
    const savedTime = localStorage.getItem("saved-time");

    if (location.state?.questions) {
      const original = location.state.questions;
      const incomingId = original._id || original.id

      // Check whether the saved quiz in localStorage is the same quiz.
      // If it's a different quiz (or there's no saved quiz), start fresh.
      let savedQuizData = null
      try { savedQuizData = savedQuiz ? JSON.parse(savedQuiz) : null } catch {}
      const savedId = savedQuizData ? (savedQuizData._id || savedQuizData.id) : null
      const isSameQuiz = savedId && savedId === incomingId

      // Store track context for the completion screen
      if (location.state?.trackSlug) {
        localStorage.setItem("quiz-track-slug", location.state.trackSlug)
        localStorage.setItem("quiz-track-name", location.state.trackName || "")
      } else {
        localStorage.removeItem("quiz-track-slug")
        localStorage.removeItem("quiz-track-name")
      }

      if (isSameQuiz) {
        // Resume the in-progress session for this quiz
        setShuffledQuizData(savedQuizData)
        setSelectedAnswers(savedAnswers ? JSON.parse(savedAnswers) : {})
        setTimeLeft(savedTime ? parseInt(savedTime, 10) : savedQuizData.time * 60)
      } else {
        // Different quiz — clear any stale saved state and start fresh
        localStorage.removeItem("saved-quiz")
        localStorage.removeItem("saved-answers")
        localStorage.removeItem("saved-time")
        const shuffledQuestions = shuffleArray(
          original.questions.map((q) => ({
            ...q,
            answers: shuffleArray(q.answers),
          }))
        )
        const newQuizData = { ...original, questions: shuffledQuestions }
        setShuffledQuizData(newQuizData)
        setSelectedAnswers({})
        setTimeLeft(newQuizData.time * 60)
        localStorage.setItem("saved-quiz", JSON.stringify(newQuizData))
      }
    } else if (savedQuiz) {
      // No location state (direct URL / page refresh) — resume whatever was saved
      let parsedQuiz = null
      try { parsedQuiz = JSON.parse(savedQuiz) } catch {}
      if (parsedQuiz) {
        setShuffledQuizData(parsedQuiz)
        setSelectedAnswers(savedAnswers ? JSON.parse(savedAnswers) : {})
        setTimeLeft(savedTime ? parseInt(savedTime, 10) : parsedQuiz.time * 60)
      }
    }
  }, [location.state]);

 useEffect(() => {
  if (!shuffledQuizData || quizFinished) return;

  if (timeLeft <= 0) {
    handleScoreSubmit(shuffledQuizData._id || shuffledQuizData.id);
    setQuizFinished(true);
    return;
  }

  const timer = setTimeout(() => {
    setTimeLeft((t) => t - 1);
  }, 1000);

  return () => clearTimeout(timer);
}, [timeLeft, quizFinished, shuffledQuizData]);


  useEffect(() => {
    if (shuffledQuizData) {
      localStorage.setItem("saved-answers", JSON.stringify(selectedAnswers));
    }
  }, [selectedAnswers, shuffledQuizData]);

  useEffect(() => {
    if (shuffledQuizData) {
      localStorage.setItem("saved-time", timeLeft.toString());
    }
  }, [timeLeft, shuffledQuizData]);

  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const handleOptionSelect = (option) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: option });
  };

  const nextQuestion = () => {
    if (currentQuestion < shuffledQuizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const jumpToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  const calculateScore = () => {
    return shuffledQuizData.questions.reduce(
      (score, q, index) =>
        selectedAnswers[index] === q.correctAnswer ? score + 1 : score,
      0
    );
  };

  const handleFeedBackSubmit = async (e) => {
    e.preventDefault();
    if (feedback.trim()) {
      const quiz = shuffledQuizData.title
      
      console.log(quiz)
      await sendFeedback({ quiz, feedback })
      alert("Feedback submitted, thank you!");
      setFeedback("");
      navigate("/overview");

    }
  };

  const handleScoreSubmit = async (id) => {
    try {
      const token = localStorage.getItem("token");
      let userId=""
      const user = JSON.parse(localStorage.getItem("user"))
      if(localStorage.getItem("examMode")){
        userId = JSON.parse(localStorage.getItem("user"))._id
      }
      userId = getTokenUserId();
      const date = new Date();

      const formattedDate = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const score = Math.round(
        (calculateScore() / shuffledQuizData.questions.length) * 100
      );

      const scoreData = {
        userId,
        details: {
          quizId: id,
          title: `${shuffledQuizData.title}-${shuffledQuizData.grade}`,
          totalQuestions: shuffledQuizData.questions.length,
          score,
          completed: true,
          date: formattedDate,
          // store per-question review so any attempt can be replayed later
          review: shuffledQuizData.questions.map((q, index) => ({
            question: q.question,
            selectedAnswer: selectedAnswers[index] || null,
            image: q.image || null,
            correctAnswer: q.correctAnswer,
            isCorrect: selectedAnswers[index] === q.correctAnswer,
            explanation: q.explanation || null,
          })),
        },
      };

      const reviewData = {
        userId,
        quizId: shuffledQuizData._id || shuffledQuizData.id,
        score,
        date: formattedDate,
        year: new Date().getFullYear().toString(),
        correctAnswers: calculateScore(),
        numberOfQuestions: shuffledQuizData.questions.length,
        review: shuffledQuizData.questions.map((q, index) => ({
          question: q.question,
          selectedAnswer: selectedAnswers[index] || null,
          image: q.image,
          correctAnswer: q.correctAnswer,
          isCorrect: selectedAnswers[index] === q.correctAnswer,
          explanation: q.explanation || null,
        })),
      };

      
      await sendAssessmentAnalytics(scoreData);

      const fractionScore = `${calculateScore()}/${shuffledQuizData.questions.length}`
      if(localStorage.getItem("examMode")){

        await addExamRecord(userId, {quizId:shuffledQuizData._id || shuffledQuizData.id,name:user.name,grade:user.grade,school:user.school,score:fractionScore})
        
      }

      

      const reviewResponse = await saveQuizReview(reviewData);

      if (reviewResponse?.success) {
        localStorage.removeItem("saved-quiz");
        localStorage.removeItem("saved-answers");
        localStorage.removeItem("saved-time");
        if (localStorage.getItem("examName")) {
          localStorage.removeItem("examName")
        }
      }
    } catch (err) {
      console.error("Error submitting quiz:", err);
    }
  };

  if (!shuffledQuizData) return <div className="p-8 text-center">Loading quiz...</div>;

  const totalQuestions = shuffledQuizData.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const analyticsData = shuffledQuizData.questions.map((q, i) => ({
    name: `Q${i + 1}`,
    Correct: selectedAnswers[i] === q.correctAnswer ? 1 : 0,
    Incorrect: selectedAnswers[i] && selectedAnswers[i] !== q.correctAnswer ? 1 : 0,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b overflow-auto from-blue-50 to-blue-100 w-full">
      <div className="w-full pt-12 pb-8">
        <div className="w-full max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            {!quizFinished
              ? `${shuffledQuizData.title}`
              : postQuizTab === "review"
              ? "Answer Review"
              : postQuizTab === "analytics"
              ? "Performance Analytics"
              : "Quiz Completed"}
          </h1>
          {!quizFinished && (
            <div className="flex justify-center items-center gap-6 mt-4 flex-wrap">
              <span
                onClick={() => {
                  navigate(-1);
                  localStorage.removeItem(`quiz-answers-${shuffledQuizData._id}`);
                  localStorage.removeItem(`quiz-time-${shuffledQuizData._id}`);
                  localStorage.removeItem("saved-quiz");
                  localStorage.removeItem("saved-answers");
                  localStorage.removeItem("saved-time");
                }}
                className="text-blue-500 cursor-pointer"
              >
                Back
              </span>
              <span className="text-lg text-blue-700">
                Question {currentQuestion + 1} of {totalQuestions}
              </span>
              <span
                className={`text-lg font-semibold ${
                  timeLeft <= 30 ? "text-red-600" : "text-green-600"
                }`}
              >
                Time Left: {formatTime(timeLeft)}
              </span>
              <span className="text-lg text-blue-700">
                Answered: {answeredCount} | Left: {totalQuestions - answeredCount}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full px-4 pb-16">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
          {!quizFinished ? (
            <>
              <div className="flex-1 bg-white rounded-xl shadow-lg border border-blue-100">
                <div className="p-6 max-h-[75vh] overflow-y-auto">
                    {shuffledQuizData.questions[currentQuestion]?.image && (
                      <img
                        src={shuffledQuizData.questions[currentQuestion].image}
                        alt="Question Visual"
                        className="mb-4 w-full max-h-64 object-contain mx-auto rounded"
                      />
                    )}
                    <h3 className="font-semibold text-blue-900 mb-4">
                      Q{currentQuestion + 1}:
                      <span
                        className="ml-2"
                        dangerouslySetInnerHTML={{ __html: shuffledQuizData.questions[currentQuestion]?.question }}
                      />
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {shuffledQuizData.questions[currentQuestion]?.answers.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleOptionSelect(option)}
                          className={`py-3 px-4 rounded-lg text-base font-medium transition-all w-full text-left ${
                            selectedAnswers[currentQuestion] === option
                              ? "bg-blue-600 text-white"
                              : "bg-blue-50 text-blue-800 hover:bg-blue-100"
                          }`}
                        >
                          <span dangerouslySetInnerHTML={{ __html: option }} />
                        </button>
                      ))}

                    </div>
              </div>

                <div className="bg-blue-50 px-6 py-4 flex justify-between border-t border-blue-100">
                  <button
                    onClick={prevQuestion}
                    disabled={currentQuestion === 0}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      currentQuestion === 0
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}
                  >
                    Previous
                  </button>
                  {currentQuestion === totalQuestions - 1 ? (
                    <button
                      onClick={() => {
                        handleScoreSubmit(shuffledQuizData._id || shuffledQuizData.id);
                        setQuizFinished(true);
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <button
                      onClick={nextQuestion}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                    >
                      Next Question
                    </button>
                  )}
                </div>
              </div>

              <div className="w-full lg:w-64 bg-white rounded-xl shadow-md border border-blue-100 p-4 h-fit self-start">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Navigate</h3>
                <div className="flex flex-wrap gap-2">
                  {shuffledQuizData.questions.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => jumpToQuestion(idx)}
                      className={`w-10 h-10 rounded-full text-sm font-medium ${
                        currentQuestion === idx
                          ? "bg-blue-600 text-white"
                          : selectedAnswers[idx]
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* ── POST-QUIZ RESULT SCREEN ─────────────────────────────────── */
            <div className="w-full max-w-4xl mx-auto">

              {/* Tab bar */}
              <div className="flex gap-1 mb-6 bg-blue-50 rounded-xl p-1">
                {[
                  { key: "summary", label: "Summary" },
                  { key: "analytics", label: "Analytics" },
                  ...(shuffledQuizData.allowQuizReview ? [{ key: "review", label: "Review Answers" }] : []),
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setPostQuizTab(tab.key)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                      postQuizTab === tab.key
                        ? "bg-white text-blue-800 shadow"
                        : "text-blue-500 hover:text-blue-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ── SUMMARY TAB ──────────────────────────────────────────── */}
              {postQuizTab === "summary" && (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  {shuffledQuizData.displayScores ? (
                    <>
                      {/* Score ring */}
                      <div className="relative w-36 h-36 mx-auto mb-6">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="50" fill="none" stroke="#EFF6FF" strokeWidth="12" />
                          <circle
                            cx="60" cy="60" r="50" fill="none"
                            stroke={Math.round((calculateScore() / totalQuestions) * 100) >= 50 ? "#16A34A" : "#DC2626"}
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 50}`}
                            strokeDashoffset={`${2 * Math.PI * 50 * (1 - calculateScore() / totalQuestions)}`}
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-blue-900">
                            {Math.round((calculateScore() / totalQuestions) * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* Stat row */}
                      <div className="flex justify-center gap-8 mb-6 flex-wrap">
                        <div>
                          <p className="text-2xl font-bold text-green-600">{calculateScore()}</p>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Correct</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-red-500">
                            {Object.values(selectedAnswers).filter((a, i) => a !== shuffledQuizData.questions[i]?.correctAnswer).length}
                          </p>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Incorrect</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-400">
                            {totalQuestions - Object.keys(selectedAnswers).length}
                          </p>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Unanswered</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{totalQuestions}</p>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="mb-6 py-8">
                      <p className="text-xl font-semibold text-blue-900 mb-2">Quiz Completed</p>
                      <p className="text-gray-500">Results will be released in due time.</p>
                    </div>
                  )}

                  <p className="text-gray-600 mb-1">
                    Congratulations{" "}
                    <span className="font-semibold text-blue-900">
                      {jwtDecode(localStorage.getItem("token")).firstName}{" "}
                      {jwtDecode(localStorage.getItem("token")).lastName}
                    </span>
                  </p>
                  <p className="text-gray-500 mb-8 text-sm">
                    You completed <span className="font-medium">{shuffledQuizData.title}</span>
                  </p>

                  {/* Navigation */}
                  <div className="flex justify-center gap-3 flex-wrap mb-8">
                    {trackSlug ? (
                      <button
                        onClick={() => navigate(`/track/${trackSlug}`, { state: { tab: "exams" } })}
                        className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-medium text-sm"
                      >
                        Back to {trackName || "Track"}
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate("/overview")}
                        className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-medium text-sm"
                      >
                        Return to Dashboard
                      </button>
                    )}
                    <button
                      onClick={() => navigate("/history")}
                      className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm"
                    >
                      My assessment history
                    </button>
                  </div>

                  {/* Feedback form */}
                  <div className="border-t border-gray-100 pt-6 max-w-lg mx-auto text-left">
                    <label className="block mb-2 text-sm font-medium text-blue-800">
                      Share your feedback on this quiz
                    </label>
                    <form onSubmit={handleFeedBackSubmit}>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows="3"
                        className="w-full p-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none"
                        placeholder="Let us know what you think..."
                      />
                      <button
                        type="submit"
                        className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm"
                      >
                        Submit feedback
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ── ANALYTICS TAB ────────────────────────────────────────── */}
              {postQuizTab === "analytics" && (
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-8">

                  {/* Top stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Score", value: shuffledQuizData.displayScores ? `${Math.round((calculateScore() / totalQuestions) * 100)}%` : "—", color: "text-blue-700" },
                      { label: "Correct", value: calculateScore(), color: "text-green-600" },
                      { label: "Incorrect", value: totalQuestions - calculateScore() - (totalQuestions - Object.keys(selectedAnswers).length), color: "text-red-500" },
                      { label: "Unanswered", value: totalQuestions - Object.keys(selectedAnswers).length, color: "text-gray-400" },
                    ].map((s) => (
                      <div key={s.label} className="bg-gray-50 rounded-xl p-4 text-center">
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Per-question bar chart */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
                      Result per question
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={analyticsData} barSize={14} barGap={2}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} domain={[0, 1]} ticks={[0, 1]} />
                        <Tooltip
                          formatter={(value, name) => [value === 1 ? "Yes" : "No", name]}
                          contentStyle={{ fontSize: 12, borderRadius: 8 }}
                        />
                        <Bar dataKey="Correct" fill="#16A34A" radius={[4, 4, 0, 0]} name="Correct" />
                        <Bar dataKey="Incorrect" fill="#DC2626" radius={[4, 4, 0, 0]} name="Incorrect" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-600 inline-block" /> Correct</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-600 inline-block" /> Incorrect</span>
                    </div>
                  </div>

                  {/* Question-level breakdown list */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                      Question breakdown
                    </h3>
                    <div className="space-y-2">
                      {shuffledQuizData.questions.map((q, i) => {
                        const answered = selectedAnswers[i] !== undefined
                        const correct = selectedAnswers[i] === q.correctAnswer
                        return (
                          <div key={i} className={`flex items-center gap-3 p-3 rounded-lg text-sm ${
                            !answered ? "bg-gray-50 text-gray-400"
                            : correct ? "bg-green-50 text-green-800"
                            : "bg-red-50 text-red-800"
                          }`}>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              !answered ? "bg-gray-200 text-gray-500"
                              : correct ? "bg-green-600 text-white"
                              : "bg-red-500 text-white"
                            }`}>
                              {!answered ? "—" : correct ? "✓" : "✗"}
                            </span>
                            <span className="line-clamp-1 flex-1" dangerouslySetInnerHTML={{ __html: `Q${i + 1}: ${q.question}` }} />
                            <span className="shrink-0 font-medium">
                              {!answered ? "Skipped" : correct ? "Correct" : "Incorrect"}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex justify-center gap-3 pt-2 flex-wrap">
                    {trackSlug ? (
                      <button
                        onClick={() => navigate(`/track/${trackSlug}`, { state: { tab: "exams" } })}
                        className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-medium text-sm"
                      >
                        Back to {trackName || "Track"}
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate("/overview")}
                        className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-medium text-sm"
                      >
                        Return to Dashboard
                      </button>
                    )}
                    <button
                      onClick={() => navigate("/history")}
                      className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm"
                    >
                      My assessment history
                    </button>
                  </div>
                </div>
              )}

              {/* ── REVIEW TAB (gated by allowQuizReview) ────────────────── */}
              {postQuizTab === "review" && shuffledQuizData.allowQuizReview && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="space-y-6">
                    {shuffledQuizData.questions.map((q, i) => {
                      const cleanQuestion = q.question.replace(/<[^>]*>?/gm, "")
                      const cleanSelected = (selectedAnswers[i] || "").replace(/<[^>]*>?/gm, "")
                      const cleanCorrect = q.correctAnswer.replace(/<[^>]*>?/gm, "")
                      const cleanExplanation = q.explanation ? q.explanation.replace(/<[^>]*>?/gm, "") : ""
                      const isCorrect = selectedAnswers[i] === q.correctAnswer
                      const isAnswered = selectedAnswers[i] !== undefined

                      return (
                        <div
                          key={i}
                          className={`p-4 rounded-xl border-2 ${
                            !isAnswered ? "border-gray-200 bg-gray-50"
                            : isCorrect ? "border-green-400 bg-green-50"
                            : "border-red-300 bg-red-50"
                          }`}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                              !isAnswered ? "bg-gray-300 text-gray-600"
                              : isCorrect ? "bg-green-600 text-white"
                              : "bg-red-500 text-white"
                            }`}>
                              {!isAnswered ? "—" : isCorrect ? "✓" : "✗"}
                            </span>
                            <h3 className="font-semibold text-blue-900 text-sm leading-snug">
                              Q{i + 1}: {cleanQuestion}
                            </h3>
                          </div>

                          {q.image && (
                            <img
                              src={q.image}
                              alt={`Q${i + 1}`}
                              className="mb-3 w-full max-h-48 object-contain rounded"
                            />
                          )}

                          <div className="ml-10 space-y-1 text-sm">
                            <p>
                              <span className="font-medium text-gray-700">Your answer: </span>
                              <span className={isCorrect ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
                                {cleanSelected || <em className="text-gray-400">Not answered</em>}
                              </span>
                            </p>
                            {!isCorrect && (
                              <p>
                                <span className="font-medium text-gray-700">Correct answer: </span>
                                <span className="text-green-700 font-medium">{cleanCorrect}</span>
                              </p>
                            )}
                            {cleanExplanation && (
                              <p className="mt-2 text-gray-600 bg-white/70 rounded-lg p-2 border border-gray-200">
                                <span className="font-medium text-gray-700">Explanation: </span>
                                {cleanExplanation}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex justify-center gap-3 mt-8 flex-wrap">
                    {trackSlug ? (
                      <button
                        onClick={() => navigate(`/track/${trackSlug}`, { state: { tab: "exams" } })}
                        className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-medium text-sm"
                      >
                        Back to {trackName || "Track"}
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate("/overview")}
                        className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-medium text-sm"
                      >
                        Return to Dashboard
                      </button>
                    )}
                    <button
                      onClick={() => navigate("/history")}
                      className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm"
                    >
                      My assessment history
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;

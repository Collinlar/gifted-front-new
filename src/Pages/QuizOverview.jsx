import { getTokenUserId } from "../lib/auth";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchQuizReview, getExam } from "../lib/api";
import {
  ArrowLeft, Clock, ListChecks, RotateCcw, CheckCircle2,
  AlertTriangle, Play, Info,
} from "lucide-react";

const NAVY = "#003366";
const MID  = "#336699";

// Shown only when the assessment carries no instructions of its own. Previously
// this list rendered on every quiz regardless, alongside whatever the admin had
// written, so every paper appeared to have the same three rules.
const FALLBACK_INSTRUCTIONS = [
  "Make sure you have a stable internet connection before you begin.",
  "Once you move on, you cannot return to a previous question.",
  "Your answers are saved as you go.",
];

export default function QuizOverview() {
  const [quizReview, setQuizReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // The object handed over in router state is whatever the list held when it
  // was last fetched, which can be minutes or hours old. Treat it as a first
  // paint only and refetch the assessment by id, so an edit made in admin shows
  // up without the student having to reload the page they came from.
  const passedQuiz = location.state?.questions || {};
  const [quizData, setQuizData] = useState(passedQuiz);
  const quizId = passedQuiz._id || passedQuiz.id;
  const trackSlug = location.state?.trackSlug;
  const trackName = location.state?.trackName;
  const userName  = localStorage.getItem("examName");

  useEffect(() => {
    let alive = true;

    const load = async () => {
      // Refresh the assessment and the attempt history together
      const [fresh, review] = await Promise.allSettled([
        getExam(quizId),
        localStorage.getItem("token")
          ? fetchQuizReview(getTokenUserId(), quizId)
          : Promise.resolve({ review: { attemptsMade: 0 } }),
      ]);

      if (!alive) return;

      // Keep the passed object if the refetch fails, so a network blip shows a
      // slightly stale page rather than nothing at all.
      if (fresh.status === "fulfilled" && fresh.value?.exam) setQuizData(fresh.value.exam);
      else if (fresh.status === "rejected") console.error("Could not refresh this assessment:", fresh.reason);

      setQuizReview(
        review.status === "fulfilled" ? review.value.review || { attemptsMade: 0 } : { attemptsMade: 0 }
      );
      setLoading(false);
    };

    if (quizId) load(); else setLoading(false);
    return () => { alive = false };
  }, [quizId]);

  const startQuiz = () =>
    navigate("/quiz-questions", { state: { questions: quizData, trackSlug, trackName } });

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: "#F0F4F8" }}>
        <p className="text-sm" style={{ color: MID }}>Loading this assessment...</p>
      </div>
    );
  }

  const attemptsMade  = quizReview?.attemptsMade ?? 0;
  const attemptsLimit = Number(quizData.attemptsAllowed) || 0;
  // 0 or missing means the admin did not cap attempts
  const attemptsExhausted = attemptsLimit > 0 && attemptsMade >= attemptsLimit;

  const questionCount = quizData.questions?.length ?? quizData.numberOfQuestions ?? 0;
  const instructions  = Array.isArray(quizData.instructions)
    ? quizData.instructions.filter(Boolean)
    : [];
  const shownInstructions = instructions.length ? instructions : FALLBACK_INSTRUCTIONS;

  const description = String(quizData.description || "").trim();
  const isLong = description.length > 320;

  return (
    <div className="min-h-screen w-full py-8 px-4" style={{ backgroundColor: "#F0F4F8" }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-3xl mx-auto"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium mb-5 hover:opacity-80"
          style={{ color: MID }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 sm:px-8 pt-7 pb-6 border-b border-gray-100">
            {userName && (
              <p className="text-sm mb-1" style={{ color: MID }}>Welcome, {userName}</p>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: NAVY }}>
              {quizData.title}
            </h1>
            {trackName && (
              <p className="text-xs mt-2 uppercase tracking-wide" style={{ color: MID }}>{trackName}</p>
            )}
          </div>

          {/* Facts. Only what is actually configured, so a blank value can no
              longer appear next to a label the way "Attempts Allowed:" did. */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
            <Fact icon={ListChecks} label="Questions" value={questionCount || "—"} />
            <Fact icon={Clock} label="Time limit"
              value={quizData.time ? `${quizData.time} min` : "No limit"} />
            <Fact icon={RotateCcw} label="Attempts"
              value={attemptsLimit > 0 ? `${attemptsMade} of ${attemptsLimit}` : `${attemptsMade} made`} />
            <Fact icon={CheckCircle2} label="Marks shown"
              value={quizData.displayScores ? "Right away" : "Later"} />
          </div>

          {/* Description */}
          {description && (
            <div className="px-6 sm:px-8 py-6 border-b border-gray-100">
              <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: MID }}>
                About this assessment
              </h2>
              <div
                className="text-[15px] leading-relaxed whitespace-pre-line"
                style={{ color: "#374151" }}
              >
                {isLong && !showFullDescription
                  ? description.slice(0, 320).trimEnd() + "…"
                  : description}
              </div>
              {isLong && (
                <button
                  onClick={() => setShowFullDescription((v) => !v)}
                  className="mt-3 text-sm font-semibold hover:underline"
                  style={{ color: MID }}
                >
                  {showFullDescription ? "Show less" : "Read the full description"}
                </button>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="px-6 sm:px-8 py-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-1.5" style={{ color: MID }}>
              <Info size={13} /> Before you begin
            </h2>
            <ul className="space-y-2.5">
              {shownInstructions.map((line, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold"
                    style={{ backgroundColor: "#E6F0F9", color: NAVY }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[15px] leading-relaxed" style={{ color: "#374151" }}>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action */}
          <div className="px-6 sm:px-8 py-6 bg-gray-50 border-t border-gray-100">
            {attemptsExhausted ? (
              <div className="flex items-start gap-3 rounded-xl px-4 py-3.5 bg-red-50 border border-red-200">
                <AlertTriangle size={17} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">You have used all your attempts</p>
                  <p className="text-sm text-red-700 mt-0.5">
                    This assessment allows {attemptsLimit} attempt{attemptsLimit === 1 ? "" : "s"} and you have made {attemptsMade}.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={startQuiz}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: NAVY }}
                >
                  <Play size={16} /> Start assessment
                </button>
                <p className="text-xs mt-3" style={{ color: MID }}>
                  {quizData.time
                    ? `Your ${quizData.time} minute timer starts as soon as you begin.`
                    : "There is no time limit on this assessment."}
                </p>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Fact({ icon: Icon, label, value }) {
  return (
    <div className="px-4 py-4 text-center">
      <Icon size={15} className="mx-auto mb-1.5" style={{ color: MID }} />
      <p className="text-base font-bold leading-none" style={{ color: NAVY }}>{value}</p>
      <p className="text-[11px] mt-1.5 uppercase tracking-wide" style={{ color: MID }}>{label}</p>
    </div>
  );
}

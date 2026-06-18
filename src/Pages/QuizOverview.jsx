import { getTokenUserId } from "../lib/auth";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchQuizReview } from "../lib/api";
import {jwtDecode} from "jwt-decode";

export default function QuizOverview() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizReview, setQuizReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isDescriptionOverflowing, setIsDescriptionOverflowing] = useState(false);
  const descriptionRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const quizData = location.state.questions;
  const quizId = quizData._id || quizData.id;
  const trackSlug = location.state?.trackSlug;
  const trackName = location.state?.trackName;
  const userName = localStorage.getItem("examName");

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const userId = getTokenUserId();
        const response = await fetchQuizReview(userId, quizId);
        const review = response.review || {attemptsMade:0};
        setQuizReview(review);
        
      } catch (error) {
        console.error("Error fetching quiz review:", error);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) fetchAssessment();
  }, [quizId]);

  useEffect(() => {
    const checkOverflow = () => {
      if (!descriptionRef.current) return;
      const el = descriptionRef.current;
      const isOverflow = el.scrollHeight > el.clientHeight + 1; // tolerance for sub-pixel
      setIsDescriptionOverflowing(isOverflow);
    };

    // Run after first render and whenever description toggles
    checkOverflow();

    // Recalculate on resize
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [showFullDescription, quizData?.description]);

  const startQuiz = () => {
    setQuizStarted(true);
    navigate("/quiz-questions", { state: { questions: quizData, trackSlug, trackName } });
  };

  const Card = ({ children }) => (
    <div className="w-full shadow-2xl rounded-3xl bg-white p-8 text-gray-900">{children}</div>
  );

  const Button = ({ children, onClick }) => (
    <button
      onClick={onClick}
      className="bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-3 px-6 rounded-xl shadow-lg transition-transform transform hover:scale-105"
    >
      {children}
    </button>
  );

  if (loading || !quizReview) {
    return <div className="text-white text-center mt-10 text-xl">Loading quiz details...</div>;
  }

  const attemptsExhausted = quizReview.attemptsMade >= quizData.attemptsAllowed;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 p-6 w-full text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        <Card>
          {userName && (
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Welcome, <span className="font-black">{userName}</span>!</h1>
            </div>
          )}
          <h2 className="text-3xl font-bold mb-4 text-center">{quizData.title}</h2>

          {quizData.description && (
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description:</h3>
              <div className="text-gray-700 leading-relaxed">
                <div className="relative">
                  <div
                    ref={descriptionRef}
                    className={showFullDescription ? "whitespace-pre-wrap" : "whitespace-pre-wrap overflow-hidden"}
                    style={showFullDescription ? undefined : { maxHeight: "12rem" }}
                  >
                    {quizData.description}
                  </div>
                  {!showFullDescription && isDescriptionOverflowing && (
                    <div
                      className="pointer-events-none absolute bottom-0 left-0 right-0 h-12"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(249,250,251,0), rgba(249,250,251,1))" // from transparent to bg-gray-50
                      }}
                    />
                  )}
                </div>
                {isDescriptionOverflowing && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-3 text-blue-600 hover:text-blue-800 font-medium text-sm underline transition-colors"
                  >
                    {showFullDescription ? "Show less" : "See more"}
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="mb-6 space-y-2 text-gray-800">
            <p><strong>Number of Questions:</strong> {quizData.questions.length}</p>
            <p><strong>Attempts Allowed:</strong> {quizData.attemptsAllowed}</p>
            <p><strong>Time Limit:</strong> {quizData.time} minutes</p>
            <p><strong>Attempts Made:</strong> {quizReview.attemptsMade}</p>
          </div>

          {quizData.instructions && quizData.instructions.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Instructions:</h3>
              <div className="text-blue-800 whitespace-pre-wrap">{quizData.instructions}</div>
            </div>
          )}

          {attemptsExhausted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-red-100 text-red-700 p-4 rounded-md mb-6 shadow-md"
            >
              <strong>Warning:</strong> You have exhausted all your attempts for this quiz.
            </motion.div>
          )}

          {!attemptsExhausted && !quizStarted && (
            <div className="mt-4 text-center">
              <p className="text-gray-700 mb-4">
                Please read the instructions carefully before you begin:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6">
                <li>Ensure a stable internet connection.</li>
                <li>You cannot go back to previous questions.</li>
                <li>Each question has a time limit.</li>
              </ul>
              <Button onClick={startQuiz}>Start Quiz</Button>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

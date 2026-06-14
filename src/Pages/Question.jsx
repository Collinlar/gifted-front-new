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
  const [showReview, setShowReview] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const savedQuiz = localStorage.getItem("saved-quiz");
    const savedAnswers = localStorage.getItem("saved-answers");
    const savedTime = localStorage.getItem("saved-time");

    if (savedQuiz) {
      const parsedQuiz = JSON.parse(savedQuiz);
      setShuffledQuizData(parsedQuiz);
      setSelectedAnswers(savedAnswers ? JSON.parse(savedAnswers) : {});
      setTimeLeft(savedTime ? parseInt(savedTime, 10) : parsedQuiz.time * 60);
    } else if (location.state?.questions) {
      const original = location.state.questions;
      const shuffledQuestions = shuffleArray(
        original.questions.map((q) => ({
          ...q,
          answers: shuffleArray(q.answers),
        }))
      );
      const newQuizData = { ...original, questions: shuffledQuestions };
      setShuffledQuizData(newQuizData);
      setSelectedAnswers({});
      setTimeLeft(newQuizData.time * 60);
      localStorage.setItem("saved-quiz", JSON.stringify(newQuizData));
    }
  }, [location.state]);

 useEffect(() => {
  if (!shuffledQuizData || quizFinished) return;

  if (timeLeft <= 0) {
    handleScoreSubmit(shuffledQuizData._id);
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
        },
      };

      const reviewData = {
        userId,
        quizId: shuffledQuizData._id,
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

        await addExamRecord(userId, {quizId:shuffledQuizData._id,name:user.name,grade:user.grade,school:user.school,score:fractionScore})
        
      }

      

      await saveQuizReview(reviewData);
      console.log(reviewData)

      if (reviewResponse.data.success) {
        localStorage.removeItem("saved-quiz");
        localStorage.removeItem("saved-answers");
        localStorage.removeItem("saved-time");
        if(localStorage.getItem("examName")){
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
              : showReview
              ? "Review Answers"
              : showAnalytics
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
                        handleScoreSubmit(shuffledQuizData._id);
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
          ) : showReview ? (
            /* REVIEW SECTION HERE */
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">Answer Review</h2>
            <div className="space-y-8 text-left">
              {shuffledQuizData.questions.map((q, i) => {
                const cleanQuestion = q.question.replace(/<[^>]*>?/gm, "");
                const cleanSelected = (selectedAnswers[i] || "").replace(/<[^>]*>?/gm, "");
                const cleanCorrect = q.correctAnswer.replace(/<[^>]*>?/gm, "");
                const cleanExplanation = q.explanation ? q.explanation.replace(/<[^>]*>?/gm, "") : "";

                const isCorrect = selectedAnswers[i] === q.correctAnswer;

                return (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border-2 ${
                      isCorrect ? "border-green-400 bg-green-50" : "border-red-300 bg-red-50"
                    }`}
                  >
                    <h3 className="font-semibold text-lg text-blue-900 mb-2">
                      Q{i + 1}: {cleanQuestion}
                    </h3>
                    {q.image && (
                      <img
                        src={q.image}
                        alt={`Question ${i + 1}`}
                        className="mb-3 w-full max-h-64 object-contain rounded"
                      />
                    )}

                    <p className="mb-1">
                      <span className="font-medium text-gray-800">Your answer:</span>{" "}
                      <span className={`${isCorrect ? "text-green-700" : "text-red-700"}`}>
                        {cleanSelected || "No answer"}
                      </span>
                    </p>

                    <p className="mb-1">
                      <span className="font-medium text-gray-800">Correct answer:</span>{" "}
                      <span className="text-green-700">{cleanCorrect}</span>
                    </p>

                    {cleanExplanation && (
                      <p className="text-gray-700 mt-2">
                        <span className="font-medium text-gray-800">Explanation:</span>{" "}
                        {cleanExplanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => setShowAnalytics(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                View Analytics
              </button>
              <button
                onClick={() => navigate("/overview")}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
              >
                Return to Dashboard
              </button>
            </div>
          </div>

          ) : showAnalytics ? (
            /* ANALYTICS SECTION HERE */
            <div className="text-center">Analytics go here</div>
          ) : (
            /* QUIZ COMPLETED + FEEDBACK */
            <div className="text-center">
              <p className="text-lg text-blue-900 mb-4 space-y-1">
                {shuffledQuizData.displayScores && (
                  <p>
                    You scored <span className="font-semibold">{calculateScore()}</span> out of{" "}
                    <span className="font-semibold">{totalQuestions}</span>
                  </p>
                )}
                {!shuffledQuizData.displayScores && (
                  <p>
                      Quiz Completed, the results will be released in due time
                  </p>
                )}
                <p>
                  Congratulations {jwtDecode(localStorage.getItem("token")).firstName}{" "}
                  {jwtDecode(localStorage.getItem("token")).lastName}
                </p>
                <p>You have successfully completed the {shuffledQuizData.title} quiz</p>
              </p>
              <div className="flex justify-center gap-4">
                {shuffledQuizData.allowQuizReview && (
                  <button
                    onClick={() => setShowReview(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                  >
                    Review Answers
                  </button>
                )}
                <button
                  onClick={() => navigate("/overview")}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                >
                  Return to dashboard
                </button>
              </div>
              <form onSubmit={handleFeedBackSubmit} className="mt-8 max-w-xl mx-auto">
                <label className="block mb-2 text-sm font-medium text-blue-800">
                  We value your feedback:
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows="4"
                  className="w-full p-3 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Let us know what you think about the quiz..."
                ></textarea>
                <button
                  type="submit"
                  className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
                >
                  Submit Feedback
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;

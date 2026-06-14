import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Timer,
  Star
} from 'lucide-react';
import { getTimedChallenge, addScore } from "../lib/api"
import { jwtDecode } from 'jwt-decode'

function TimedChallenge() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // Will be set when questions load
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [questions,setQuestions]= useState([])


  // Mock quiz data
  const questionss = [
    {
      id: 1,
      question: "What is the capital of France?",
      options: ["London", "Paris", "Berlin", "Madrid"],
      correct: 1
    },
    {
      id: 2,
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      correct: 1
    },
    {
      id: 3,
      question: "Who wrote 'Romeo and Juliet'?",
      options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"],
      correct: 1
    },
    {
      id: 4,
      question: "What is the largest planet?",
      options: ["Earth", "Mars", "Jupiter", "Saturn"],
      correct: 2
    },
    {
      id: 5,
      question: "What is the chemical symbol for gold?",
      options: ["Go", "Au", "Ag", "Gd"],
      correct: 1
    }
  ];

    useEffect(()=>{
      const fetchFlashCard = async()=>{
        try{
          const response = await getTimedChallenge(localStorage.getItem("courseId"))
          const fetchedQuestions = response.challenge;
          setQuestions(fetchedQuestions)
          if (fetchedQuestions.length > 0) {
            const timeInMinutes = fetchedQuestions[0].time || 5; // Default to 5 minutes if no time property
            setTimeLeft(timeInMinutes * 60)
          }
        }catch(error){
          console.log(error)
        }
      }
      fetchFlashCard()
    },[])

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameStarted && !gameEnded && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setGameEnded(true);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameEnded, timeLeft]);

  const startGame = () => {
    if (questions.length === 0) return;
    
    setGameStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    const timeInMinutes = questions[0].time || 5; // Default to 5 minutes if no time property
    setTimeLeft(timeInMinutes * 60);
    setGameEnded(false);
    hasPostedRef.current = false;
    startTimeRef.current = Date.now();
  };

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    
    if (answerIndex === questions[currentQuestion].correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setGameEnded(true);
      }
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Post score once when the game ends
  const hasPostedRef = useRef(false);
  const startTimeRef = useRef(null);
  useEffect(() => {
    const postScore = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const decoded = jwtDecode(token);
        const userId = decoded?.id;
        const firstName = decoded?.firstName || '';
        const lastName = decoded?.lastName || '';
        const userName = `${firstName} ${lastName}`.trim();
        const courseId = localStorage.getItem("courseId");
        const totalCorrectAnswers = score;
        const totalNumberOfQuestions = questions.length || 1;
        const timeTaken = startTimeRef.current
          ? Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000))
          : 0;
        const payload = {
          userId,
          userName,
          courseId,
          score: `${totalCorrectAnswers} / ${totalNumberOfQuestions}`,
          timeTaken
        };
        await addScore(payload);
      } catch (error) {
        console.log(error);
      }
    };

    if (gameEnded && gameStarted && !hasPostedRef.current) {
      hasPostedRef.current = true;
      postScore();
    }
  }, [gameEnded, gameStarted, questions.length, score]);

  if (!gameStarted || gameEnded) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 w-full">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => navigate('/flashcards')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft size={20} />
              Back to Study Modes
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Timed Challenge</h1>
            <p className="text-gray-600">Test your knowledge against the clock</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            {!gameStarted ? (
              <>
                <Timer className="text-orange-600 mx-auto mb-4" size={48} />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready for the Challenge?</h2>
                <p className="text-gray-600 mb-6">
                  {`You have ${questions.length > 0 && questions[0].time ? questions[0].time : 5} minutes to answer ${questions.length} questions.`}
                  Each correct answer earns you points!
                </p>
                <button
                  onClick={startGame}
                  disabled={questions.length === 0}
                  className={`px-8 py-4 rounded-lg text-lg font-semibold ${
                    questions.length === 0 
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  {questions.length === 0 ? 'Loading Questions...' : 'Start Challenge'}
                </button>
              </>
            ) : (
              <>
                <Star className="text-yellow-500 mx-auto mb-4" size={48} />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Challenge Complete!</h2>
                <p className="text-gray-600 mb-6">
                  You scored {score} out of {questions.length} questions correct!
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={startGame}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/flashcards')}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Back to Menu
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 w-full">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/flashcards')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Study Modes
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Timed Challenge</h1>
          <p className="text-gray-600">Answer quickly and accurately</p>
        </div>

        {/* Timer and Score */}
        <div className="flex justify-between items-center mb-8">
          <div className="bg-white rounded-lg px-6 py-4 shadow-md">
            <div className="text-sm text-gray-500">Time Remaining</div>
            <div className="text-2xl font-bold text-orange-600">{formatTime(timeLeft)}</div>
          </div>
          <div className="bg-white rounded-lg px-6 py-4 shadow-md">
            <div className="text-sm text-gray-500">Score</div>
            <div className="text-2xl font-bold text-green-600">{score}/{questions.length}</div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <div className="text-sm text-gray-500 mb-2">Question {currentQuestion + 1} of {questions.length}</div>
            <h2 className="text-2xl font-bold text-gray-900">
              {questions[currentQuestion].question}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedAnswer === null 
                    ? 'border-gray-200 hover:border-orange-300 hover:bg-orange-50' 
                    : selectedAnswer === index
                      ? index === questions[currentQuestion].correct
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : index === questions[currentQuestion].correct
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimedChallenge;
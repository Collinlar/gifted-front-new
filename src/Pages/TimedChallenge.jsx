import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Timer,
  Star
} from 'lucide-react';
import { getTimedChallenge, addScore } from "../lib/api"
import { getTokenUserId, getStoredProfile } from '../lib/auth'

function TimedChallenge() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state || {};
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [challengeTitle, setChallengeTitle] = useState('');
  // Seconds allowed on each question, set by whoever authored the challenge
  const [perQuestion, setPerQuestion] = useState(30);
  const [loadState, setLoadState] = useState('loading'); // loading | ready | none | failed


  // Same scope the flashcards page hands to Classic mode: whatever set the
  // student opened. A course first, a track otherwise.
  useEffect(() => {
    const loadChallenge = async () => {
      try {
        const courseId = locationState.id || locationState._id || localStorage.getItem("courseId")
        const trackId  = locationState.trackId || localStorage.getItem("flashcardTrackId")
        const { challenge } = await getTimedChallenge({ courseId, trackId })

        if (!challenge || challenge.questions.length === 0) {
          setLoadState('none')
          return
        }
        setQuestions(challenge.questions)
        setChallengeTitle(challenge.title)
        setPerQuestion(challenge.secondsPerQuestion)
        setLoadState('ready')
      } catch (error) {
        console.error("Could not load the timed challenge:", error)
        setLoadState('failed')
      }
    }
    loadChallenge()
  }, [])

  // Moving on is the same whether the student answered or the clock beat
  // them to it, so both go through here.
  const advance = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setTimeLeft(perQuestion);
    } else {
      setGameEnded(true);
    }
  };

  // The clock runs per question, which is what "seconds per question" means
  // where the challenge is authored. Running out costs you that question, it
  // does not end the challenge. It also pauses while the answer is revealed,
  // so the second spent seeing you were right is not taken off the next one.
  useEffect(() => {
    if (!gameStarted || gameEnded || selectedAnswer !== null) return;
    if (timeLeft <= 0) { advance(); return; }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [gameStarted, gameEnded, timeLeft, selectedAnswer]);

  const startGame = () => {
    if (questions.length === 0) return;

    setGameStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setTimeLeft(perQuestion);
    setGameEnded(false);
    hasPostedRef.current = false;
    startTimeRef.current = Date.now();
  };

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);

    if (answerIndex === questions[currentQuestion].correct) {
      setScore(score + 1);
    }

    setTimeout(advance, 1000);
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
        // A Supabase JWT carries `sub` and nothing else useful: no id, no
        // first or last name. Every score posted from here went up with an
        // undefined user and a blank name. The id comes from the token, the
        // name from the profile row cached at sign in.
        const userId = getTokenUserId();
        if (!userId) return;
        const profile = getStoredProfile();
        const firstName = profile.firstName || '';
        const lastName = profile.lastName || '';
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

                {loadState === 'loading' && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Setting up your questions</h2>
                    <p className="text-gray-600 mb-6">One moment.</p>
                  </>
                )}

                {/* Previously this sat on "Loading Questions..." forever when
                    a set had no challenge attached, which read as a hang. */}
                {loadState === 'none' && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No timed challenge for this set yet</h2>
                    <p className="text-gray-600 mb-6">
                      Your tutors have not put one together for this topic. Classic cards are ready if you want to study now.
                    </p>
                    <button
                      onClick={() => navigate('/flashcards/classic', { state: locationState })}
                      className="px-8 py-4 rounded-lg text-lg font-semibold bg-orange-600 text-white hover:bg-orange-700"
                    >
                      Study the cards instead
                    </button>
                  </>
                )}

                {loadState === 'failed' && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">We could not reach the challenge</h2>
                    <p className="text-gray-600 mb-6">Check your connection and tap again.</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-8 py-4 rounded-lg text-lg font-semibold bg-orange-600 text-white hover:bg-orange-700"
                    >
                      Try loading it again
                    </button>
                  </>
                )}

                {loadState === 'ready' && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{challengeTitle}</h2>
                    <p className="text-gray-600 mb-6">
                      {questions.length} question{questions.length === 1 ? '' : 's'}, {perQuestion} seconds on each.
                      Run out of time on one and it moves on without you.
                    </p>
                    <button
                      onClick={startGame}
                      className="px-8 py-4 rounded-lg text-lg font-semibold bg-orange-600 text-white hover:bg-orange-700"
                    >
                      Start the challenge
                    </button>
                  </>
                )}
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
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Clock, 
  Zap, 
  Star, 
  Target, 
  Crown, 
  Timer, 
  Award, 
  ArrowRight,
  ArrowLeft,
  Flame,
  CheckCircle,
  XCircle,
  RotateCcw,
  Home,
  TrendingUp,
  Medal,
  Sparkles,
  ChevronRight,
  Users,
  Calendar
} from 'lucide-react';
import { useLocation , useNavigate} from 'react-router-dom';
import { addScore } from "../lib/api"


// Brand colors
const brandColors = {
  primary: "#003366",
  secondary: "#336699", 
  accent: "#6699CC",
  background: "#F0F4F8",
  text: "#333333",
  white: "#FFFFFF",
  contest: "#FF6B35",
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
  success: "#10B981",
  error: "#EF4444"
};

// Star Sprinkling Animation Component
const StarSprinkling = () => {
  const stars = Array.from({ length: 20 }, (_, i) => i);
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map((star) => (
        <motion.div
          key={star}
          className="absolute"
          initial={{
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 50,
            scale: 0,
            rotate: 0
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: -50,
            scale: [0, 1, 0],
            rotate: 360
          }}
          transition={{
            duration: 3,
            delay: Math.random() * 2,
            repeat: Infinity,
            repeatDelay: Math.random() * 3 + 2
          }}
        >
          <Star 
            size={Math.random() * 20 + 10} 
            className="text-yellow-400"
            style={{ 
              filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.8))',
              opacity: 0.8
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

// Knockout Animation Component for Legendary Master
const KnockoutAnimation = () => {
  const knockoutElements = Array.from({ length: 15 }, (_, i) => i);
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {knockoutElements.map((element) => (
        <motion.div
          key={element}
          className="absolute"
          initial={{
            x: '50%',
            y: '50%',
            scale: 0,
            rotate: 0
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: [0, 1.5, 0],
            rotate: [0, 720, 1440]
          }}
          transition={{
            duration: 2,
            delay: Math.random() * 0.5,
            repeat: Infinity,
            repeatDelay: Math.random() * 2 + 1
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: Math.random() * 0.5
            }}
            className="text-6xl"
            style={{
              filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.9))'
            }}
          >
            {element % 3 === 0 ? '💥' : element % 3 === 1 ? '⚡' : '🔥'}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

// Firecracker Animation Component for Perfect Champion
const FirecrackerAnimation = () => {
  const firecrackers = Array.from({ length: 12 }, (_, i) => i);
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {firecrackers.map((firecracker) => (
        <motion.div
          key={firecracker}
          className="absolute"
          initial={{
            x: '50%',
            y: '50%',
            scale: 0,
            rotate: 0
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: [0, 1, 0],
            rotate: [0, 360]
          }}
          transition={{
            duration: 1.5,
            delay: Math.random() * 0.8,
            repeat: Infinity,
            repeatDelay: Math.random() * 1.5 + 0.5
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [1, 0.8, 1]
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              repeatDelay: Math.random() * 0.3
            }}
            className="text-4xl"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(255, 100, 0, 0.8))'
            }}
          >
            {firecracker % 4 === 0 ? '🎆' : firecracker % 4 === 1 ? '✨' : firecracker % 4 === 2 ? '🎇' : '💫'}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

// Sample contest questions
const contestQuestions = [
  {
    id: 1,
    question: "What is 15 × 8?",
    options: ["110", "120", "115", "125"],
    correct: 1,
    estimatedTime: 30,
    difficulty: "easy",
    explanation: "15 × 8 = 120. You can think of it as (10 × 8) + (5 × 8) = 80 + 40 = 120."
  },
  {
    id: 2,
    question: "If a triangle has angles of 60°, 70°, what is the third angle?",
    options: ["40°", "50°", "60°", "45°"],
    correct: 1,
    timeLimit: 25,
    difficulty: "medium",
    explanation: "The sum of angles in a triangle is always 180°. So 180° - 60° - 70° = 50°."
  },
  {
    id: 3,
    question: "What is the square root of 144?",
    options: ["11", "12", "13", "14"],
    correct: 1,
    timeLimit: 20,
    difficulty: "easy",
    explanation: "12 × 12 = 144, so √144 = 12."
  },
  {
    id: 4,
    question: "If 3x + 7 = 22, what is x?",
    options: ["4", "5", "6", "7"],
    correct: 1,
    timeLimit: 35,
    difficulty: "medium",
    explanation: "3x + 7 = 22, so 3x = 15, therefore x = 5."
  },
  {
    id: 5,
    question: "What is 2⁴?",
    options: ["8", "12", "16", "24"],
    correct: 2,
    timeLimit: 15,
    difficulty: "easy",
    explanation: "2⁴ = 2 × 2 × 2 × 2 = 16."
  }
];

export default function ContestPage() {
  const locator = useLocation()
  const contest = locator.state.contest
  const navigate = useNavigate()

  // Helper function to strip HTML tags
  const stripHtmlTags = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  };

  const questions = contest.questions


  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [contestTimer, setContestTimer] = useState(parseInt(contest.estimatedTime)* 60); // 10 minutes total
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [contestComplete, setContestComplete] = useState(false);
  const [bonusPoints, setBonusPoints] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [rank, setRank] = useState(0);
  const [achievement, setAchievement] = useState(null);

  

  // Timer effects
  useEffect(() => {
    if (contestComplete) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
      
      setContestTimer(prev => {
        if (prev <= 1) {
          handleContestEnd(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, contestComplete]);

  const handleTimeUp = () => {
    if (!selectedAnswer) {
      handleAnswer(null, true);
    }
  };

  const handleAnswer = (answerIndex, timeUp = false) => {
    const question = questions[currentQuestion];
    const responseTime = (Date.now() - questionStartTime) / 1000;
    const isCorrect = answerIndex === question.answers.indexOf(question.correctAnswer);
    console.log(answerIndex)
    console.log(question.answers.indexOf(question.correctAnswer))
    
    let points = 0;
    let bonus = 0;
    
    if (isCorrect) {
      points = parseInt(contest.pointsPerQuestion); // base points
      // Time bonus - more points for faster answers
      if (responseTime <= 30 * 0.3) {
        bonus = 5;
      } else if (responseTime <= 30 * 0.6) {
        bonus = 3;
      } else if (responseTime <= 30 * 0.8) {
        bonus = 1;
      }
      
      setStreak(prev => prev + 1);
      // Streak bonus
      if (streak >= 2) {
        bonus += Math.min(streak, 5);
      }
    } else {
      setStreak(0);
    }

    const totalPoints = points + bonus;
    const newScore = score + totalPoints; // Calculate new score immediately
    setScore(newScore);
    setBonusPoints(bonus);

    const answerData = {
      questionId: question.id,
      selectedAnswer: answerIndex,
      isCorrect,
      points: totalPoints,
      responseTime: Math.round(responseTime),
      timeUp
    };

    setAnswers(prev => [...prev, answerData]);
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    // Auto advance after showing result
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        nextQuestion();
      } else {
        handleContestEnd(newScore); // Pass the calculated score
      }
    }, 2500);
  };

  const nextQuestion = () => {
    setCurrentQuestion(prev => prev + 1);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(questions[currentQuestion + 1]?.estimatedTime || 30);
    setQuestionStartTime(Date.now());
    setBonusPoints(0);
  };

  // Achievement calculation function
  const calculateAchievement = (finalScore, perfectStreak) => {
    const totalPossibleScore = parseInt(contest.pointsPerQuestion) * questions.length;
    const scorePercentage = (finalScore / totalPossibleScore) * 100;
    
    // Perfect streak with score greater than total possible (with bonuses)
    if (perfectStreak && finalScore > totalPossibleScore) {
      return {
        title: "🌟 LEGENDARY MASTER",
        description: "Perfect streak with bonus points! You're absolutely legendary!",
        color: "#FFD700", // Gold
        bgColor: "from-yellow-400 to-orange-500",
        hasAnimation: true,
        level: "legendary"
      };
    }
    
    // Perfect streak with score equal to total possible
    if (perfectStreak && finalScore === totalPossibleScore) {
      return {
        title: "🏆 PERFECT CHAMPION",
        description: "Flawless victory! Every answer was correct!",
        color: "#C0C0C0", // Silver
        bgColor: "from-gray-300 to-gray-500",
        hasAnimation: true,
        level: "perfect"
      };
    }
    
    // 80% to 99% of total score
    if (scorePercentage >= 80 && scorePercentage < 100) {
      return {
        title: "⭐ EXCELLENT SCHOLAR",
        description: "Outstanding performance! You're in the top tier!",
        color: "#FF6B35", // Orange
        bgColor: "from-orange-400 to-red-500",
        hasAnimation: false,
        level: "excellent"
      };
    }
    
    // 70% to 79% of total score
    if (scorePercentage >= 70 && scorePercentage < 80) {
      return {
        title: "🎯 SKILLED ACHIEVER",
        description: "Great job! You're well above average!",
        color: "#10B981", // Green
        bgColor: "from-green-400 to-emerald-500",
        hasAnimation: false,
        level: "skilled"
      };
    }
    
    // Below 70%
    return {
      title: "📚 LEARNING EXPLORER",
      description: "Good effort! Keep practicing to improve!",
      color: "#3B82F6", // Blue
      bgColor: "from-blue-400 to-indigo-500",
      hasAnimation: false,
      level: "learning"
    };
  };

  const sendScoreData = async (finalScore) => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) {
        console.error('No user data found');
        return;
      }
      
      const user = JSON.parse(userData);
      const totalTime = parseInt(contest.estimatedTime) * 60;
      const timeTaken = Math.max(0, totalTime - contestTimer); // Ensure non-negative
      
      // Calculate if user has perfect streak
      const perfectStreak = answers.length > 0 && answers.every(answer => answer.isCorrect);
      
      // Calculate achievement
      const achievement = calculateAchievement(finalScore, perfectStreak);
      
      const scoreData = {
        userId: user._id,
        userName: user.userName,
        courseId: contest._id,
        score: finalScore.toString(),
        timeTaken: timeTaken.toString(),
        achievement: achievement,
        grade: JSON.parse(localStorage.getItem("user")).grade
      };

      console.log('Final score being sent:', finalScore)
      console.log('Achievement:', achievement)
      const response = await addScore(scoreData)
      if (!response.success) {
        console.error('Failed to submit score');
        
      }
      setRank(response.data.rank)
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };

  const handleContestEnd = (finalScore) => {
    // Calculate achievement before sending data
    const perfectStreak = answers.length > 0 && answers.every(answer => answer.isCorrect);
    const calculatedAchievement = calculateAchievement(finalScore, perfectStreak);
    setAchievement(calculatedAchievement);
    
    sendScoreData(finalScore);
    setContestComplete(true);
  };

  const getTimeBonus = () => {
    const question = questions[currentQuestion];
    const percentLeft = (timeLeft / 30) * 100;
    if (percentLeft > 70) return 5;
    if (percentLeft > 40) return 3;
    if (percentLeft > 20) return 1;
    return 0;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateFinalRank = () => {
    // Simulate ranking based on score
    if (score >= 45) return { rank: 1, total: 234, percentile: 99 };
    if (score >= 35) return { rank: 7, total: 234, percentile: 95 };
    if (score >= 25) return { rank: 23, total: 234, percentile: 85 };
    return { rank: 67, total: 234, percentile: 70 };
  };

  if (contestComplete) {
    const finalRank = calculateFinalRank();
    const accuracy = answers.length > 0 ? Math.round((answers.filter(a => a.isCorrect).length / answers.length) * 100) : 0;
    
    return (
      <div className="w-full h-full overflow-scroll" style={{ backgroundColor: brandColors.background }}>
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-y-auto">
          <div className="absolute -top-4 -right-4 w-72 h-72 rounded-full opacity-10" 
               style={{ backgroundColor: brandColors.contest }} />
          <div className="absolute -bottom-4 -left-4 w-96 h-96 rounded-full opacity-5" 
               style={{ backgroundColor: brandColors.gold }} />
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full opacity-5"
            style={{ backgroundColor: brandColors.accent }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 pb-16 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            {/* Trophy Header */}
            <div className="text-center mb-8">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-4"
              >
                <Trophy size={80} className="text-yellow-500" />
              </motion.div>
              
              <h1 className="text-4xl font-bold mb-2" style={{ color: brandColors.primary }}>
                Contest Complete!
              </h1>
              <p className="text-xl text-gray-600">Great job on finishing {contest.title}</p>
            </div>

            {/* Results Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Score Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6 text-center"
              >
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                     style={{ backgroundColor: `${brandColors.contest}20` }}>
                  <Target size={32} style={{ color: brandColors.contest }} />
                </div>
                <h3 className="font-bold text-2xl mb-1" style={{ color: brandColors.primary }}>
                  {score}
                </h3>
                <p className="text-gray-600">Total Points</p>
                <div className="mt-2 text-sm" style={{ color: brandColors.contest }}>
                  {accuracy}% Accuracy
                </div>
              </motion.div>

              {/* Rank Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-6 text-center"
              >
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500">
                  <Crown size={32} className="text-white" />
                </div>
                <h3 className="font-bold text-2xl mb-1" style={{ color: brandColors.primary }}>
                  #{rank}
                </h3>
                <p className="text-gray-600">Your Rank</p>
                <div className="mt-2 text-sm text-green-600">
                  Top {finalRank.percentile}%
                </div>
              </motion.div>

              {/* Time Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-lg p-6 text-center"
              >
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                     style={{ backgroundColor: `${brandColors.accent}20` }}>
                  <Clock size={32} style={{ color: brandColors.accent }} />
                </div>
                <h3 className="font-bold text-2xl mb-1" style={{ color: brandColors.primary }}>
                  {formatTime(Math.max(0, (parseInt(contest.estimatedTime) * 60) - contestTimer))}
                </h3>
                <p className="text-gray-600">Time Taken</p>
                <div className="mt-2 text-sm" style={{ color: brandColors.accent }}>
                  {Math.max(0, streak)} streak
                </div>
              </motion.div>
            </div>

            {/* Detailed Results */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-8"
            >
              <h3 className="font-bold text-xl mb-4" style={{ color: brandColors.primary }}>
                Question Breakdown
              </h3>
              
              <div className="space-y-4">
                {answers.map((answer, index) => {
                  const question = contestQuestions[index];
                  return (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          answer.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {answer.isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Question {index + 1}</p>
                          <p className="text-sm text-gray-600">{answer.responseTime}s response time</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{ color: answer.isCorrect ? brandColors.success : brandColors.error }}>
                          +{answer.points} pts
                        </p>
                        {answer.points > 10 && (
                          <p className="text-xs text-yellow-600">Bonus included!</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-all"
                style={{ backgroundColor: brandColors.contest, color: brandColors.white }}
                onClick={() => window.location.reload()}
              >
                <RotateCcw size={24} />
                Try Again
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-all border-2"
                style={{ 
                  borderColor: brandColors.primary,
                  color: brandColors.primary,
                  backgroundColor: brandColors.white
                }}
                onClick={()=>{navigate("/overview")}}
              >
                <Home size={24} />
                Back to Home
              </motion.button>
            </div>

            {/* Achievement Display */}
            {achievement && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                className="mt-8 relative"
              >
                {/* Special celebration animations for top achievements */}
                {achievement.level === 'legendary' && <KnockoutAnimation />}
                {achievement.level === 'perfect' && <FirecrackerAnimation />}
                {achievement.hasAnimation && achievement.level !== 'legendary' && achievement.level !== 'perfect' && <StarSprinkling />}
                
                <div className={`bg-gradient-to-r ${achievement.bgColor} rounded-2xl p-8 text-white text-center relative overflow-hidden`}>
                  {/* Background sparkle effect for animated achievements */}
                  {achievement.hasAnimation && (
                    <div className="absolute inset-0">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                      />
                    </div>
                  )}
                  
                  {/* Special background effects for knockout and firecracker */}
                  {achievement.level === 'legendary' && (
                    <div className="absolute inset-0">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 bg-gradient-radial from-yellow-400 via-transparent to-transparent"
                      />
                    </div>
                  )}
                  
                  {achievement.level === 'perfect' && (
                    <div className="absolute inset-0">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.05, 1],
                          opacity: [0.1, 0.2, 0.1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-gradient-radial from-orange-400 via-transparent to-transparent"
                      />
                    </div>
                  )}
                  
                  <div className="relative z-10">
                    <motion.div
                      animate={achievement.hasAnimation ? { 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="mb-4"
                    >
                      <Sparkles size={50} className="mx-auto" />
                    </motion.div>
                    
                    <motion.h4 
                      className="font-bold text-3xl mb-3 text-shadow-lg"
                      animate={achievement.hasAnimation ? {
                        scale: [1, 1.05, 1],
                        textShadow: [
                          '0 0 10px rgba(255,255,255,0.5)',
                          '0 0 20px rgba(255,255,255,0.8)',
                          '0 0 10px rgba(255,255,255,0.5)'
                        ]
                      } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {achievement.title}
                    </motion.h4>
                    
                    <p className="text-lg mb-4 opacity-90">
                      {achievement.description}
                    </p>
                    
                    {/* Achievement level indicator */}
                    <div className="flex justify-center items-center gap-2">
                      <motion.div 
                        className={`w-3 h-3 rounded-full ${
                          achievement.level === 'legendary' ? 'bg-yellow-300' :
                          achievement.level === 'perfect' ? 'bg-gray-300' :
                          achievement.level === 'excellent' ? 'bg-orange-300' :
                          achievement.level === 'skilled' ? 'bg-green-300' :
                          'bg-blue-300'
                        }`}
                        animate={achievement.hasAnimation ? {
                          scale: [1, 1.2, 1],
                          opacity: [1, 0.7, 1]
                        } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <span className="text-sm font-medium uppercase tracking-wider">
                        {achievement.level} Achievement
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }
 

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: brandColors.background }}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-4 -right-4 w-72 h-72 rounded-full opacity-10"
          style={{ backgroundColor: brandColors.contest }}
        />
        <div className="absolute -bottom-4 -left-4 w-96 h-96 rounded-full opacity-5" 
             style={{ backgroundColor: brandColors.accent }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Progress */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Trophy size={24} style={{ color: brandColors.contest }} />
                  <span className="font-bold text-lg" style={{ color: brandColors.primary }}>
                    {contest.title}
                  </span>
                </div>
                
                <div className="hidden md:block">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Question {currentQuestion + 1} of {questions.length}</span>
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: brandColors.contest }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-lg font-bold" style={{ color: brandColors.primary }}>
                    {score}
                  </div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold" style={{ color: brandColors.contest }}>
                    {streak}
                  </div>
                  <div className="text-xs text-gray-500">Streak</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {formatTime(contestTimer)}
                  </div>
                  <div className="text-xs text-gray-500">Time Left</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 container mx-auto px-4 py-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {!showResult ? (
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Question Timer */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: brandColors.primary }}>
                        Question Timer
                      </span>
                      <span className="text-sm font-bold flex items-center gap-1">
                        <Timer size={16} />
                        {timeLeft}s
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ 
                          backgroundColor: timeLeft > 10 ? brandColors.success : timeLeft > 5 ? '#FFA500' : brandColors.error
                        }}
                        initial={{ width: '100%' }}
                        animate={{ width: `${(timeLeft / parseInt(question.estimatedTime)) * 100}%` }}
                        transition={{ duration: 0.1, ease: "linear" }}
                      />
                    </div>
                  </div>

                  {/* Bonus Indicator */}
                  {getTimeBonus() > 0 && (
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2"
                    >
                      <Zap size={20} className="text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        Speed Bonus Available: +{getTimeBonus()} points!
                      </span>
                    </motion.div>
                  )}

                  {/* Question Card */}
                  <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium px-3 py-1 rounded-full"
                                style={{ 
                                  backgroundColor: `${brandColors.accent}20`,
                                  color: brandColors.accent
                                }}>
                            Question {currentQuestion + 1}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold ${
                            question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {question.difficulty}
                          </span>
                        </div>
                        
                        <h2 className="text-2xl font-bold mb-4" style={{ color: brandColors.primary }}>
                          {stripHtmlTags(question.question)}
                        </h2>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: brandColors.contest }}>
                          {`${contest.pointsPerQuestion} pts`}
                        </div>
                        <div className="text-xs text-gray-500">Base Score</div>
                      </div>
                    </div>

                    {/* Answer Options */}
                    <div className="grid gap-4">
                      {question.answers.map((option, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {handleAnswer(index)}}
                          disabled={showResult}
                          className={`p-4 rounded-xl text-left font-medium transition-all border-2 ${
                            selectedAnswer === index
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                              selectedAnswer === index
                                ? 'border-blue-500 bg-blue-500 text-white'
                                : 'border-gray-300 text-gray-600'
                            }`}>
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span style={{ color: brandColors.text }}>
                              {stripHtmlTags(option)}
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Results Screen */
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
                    {answers[currentQuestion]?.isCorrect ? (
                      <div>
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 0.6 }}
                          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                          <CheckCircle size={40} className="text-green-600" />
                        </motion.div>
                        <h3 className="text-3xl font-bold text-green-600 mb-2">Correct!</h3>
                        <p className="text-xl mb-4" style={{ color: brandColors.primary }}>
                          +{answers[currentQuestion]?.points || 10} points
                        </p>
                        {bonusPoints > 0 && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <Zap size={20} className="text-yellow-600 mx-auto mb-1" />
                            <p className="text-yellow-800 font-medium">
                              Speed Bonus: +{bonusPoints} points!
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <XCircle size={40} className="text-red-600" />
                        </div>
                        <h3 className="text-3xl font-bold text-red-600 mb-2">Incorrect</h3>
                        <p className="text-lg mb-2" style={{ color: brandColors.primary }}>
                          The correct answer was: <strong>{stripHtmlTags(question.correctAnswer)}</strong>
                        </p>
                      </div>
                    )}
                    
                    <div className="bg-blue-50 rounded-lg p-4 mt-6">
                      <p className="text-sm font-medium text-blue-900 mb-2">Explanation:</p>
                      <p className="text-blue-800">{stripHtmlTags(question.explanation)}</p>
                    </div>
                    
                    <div className="flex justify-center mt-6">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Auto-advancing in 3 seconds...</span>
                        <div className="flex gap-1">
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{ 
                                duration: 0.6, 
                                repeat: Infinity, 
                                delay: i * 0.2 
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

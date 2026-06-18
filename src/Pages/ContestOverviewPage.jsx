import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Trophy, 
  Clock, 
  Users, 
  Zap, 
  Star, 
  Target, 
  Crown, 
  Timer, 
  Award, 
  ArrowRight,
  Flame,
  Medal,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { fetchContestLeaderboard, getUserContestAttempts } from '../lib/api';
import { getTokenUserId } from '../lib/auth';

// Brand colors matching your existing design
const brandColors = {
  primary: "#003366",
  secondary: "#336699",
  accent: "#6699CC",
  background: "#F0F4F8",
  text: "#333333",
  white: "#FFFFFF",
  contest: "#FF6B35",
  contestLight: "#FFE5DC",
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32"
};

// Sample contest data - replace with props from your navigation
const contestData = {
  id: 'contest-1',
  title: "Math Contest",
  description: "Test your mathematical skills in this exciting contest!",
  image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop",
  type: 'contest',
  contestType: '',
  pointsPerQuestion: 10,
  bonusTimeLimit: 30,
  difficulty: 'medium',
  questionCount: 5,
  estimatedTime: "10 minutes",
  participants: 234,
  isActive: true,
  endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
  maxAttempts: 3,
  grade: [7, 8, 9],
  totalPoints: 50,
  timeBonus: "Extra points for quick answers",
  rules: [
    "Answer all questions to the best of your ability",
    "Each question has a time limit for bonus points",
    "You cannot go back to previous questions",
    "Contest ends automatically when time runs out"
  ],
  prizes: {
    first: "100 bonus points + Gold Badge",
    second: "75 bonus points + Silver Badge", 
    third: "50 bonus points + Bronze Badge"
  }
};

export default function ContestOverview() {
  const navigate = useNavigate()
  // const [contest] = useState(contestData);
  const [countdown, setCountdown] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [userScore, setUserScore] = useState(null);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [userAttempts, setUserAttempts] = useState(0);
  const [isAttemptsExhausted, setIsAttemptsExhausted] = useState(false);
  const [leaderBoardData,setLeaderboardData] = useState([])
  const [currentUserEntry, setCurrentUserEntry] = useState({})
  const locator = useLocation()
  
  const contest = {
    ...locator.state.contest,
    questionCount: (locator.state.contest.questions || []).length,
    rules: [
    "Answer all questions to the best of your ability",
    "Each question has a time limit for bonus points",
    "You cannot go back to previous questions",
    "Contest ends automatically when time runs out"
  ],
  prizes: {
    first: "100 bonus points + Gold Badge",
    second: "75 bonus points + Silver Badge", 
    third: "50 bonus points + Bronze Badge"
  },
  timeBonus: "Extra points for quick answers",
}

  // Function to fetch leaderboard data
  const fetchLeaderboard = async (contestId) => {
    setIsLoadingLeaderboard(true);
    setLeaderboardError(null);
    
    try {
      const response = await fetchContestLeaderboard(contestId);
      
      const currentUserId = getTokenUserId();
      
      // exam_scores columns: id, mongo_id, quiz_id, grade, score, user_id, display_name (resolved via public.users)
      const transformedData = response.leaderboard.map((item, index) => ({
        rank: index + 1,
        name: item.display_name || 'Anonymous',
        score: parseInt(item.score) || 0,
        time: '—',
        userId: item.user_id,
        isCurrentUser: currentUserId && item.user_id === currentUserId,
        attemptsMade: 1,
        achievement: null,
        grade: item.grade ? (String(item.grade).match(/\d+/) || [''])[0] : '',
      }));
      
      // Sort by score (descending) and then by time (ascending for same scores)
      const sortedData = transformedData.sort((a, b) => {
        if (a.score !== b.score) {
          return b.score - a.score; // Higher score first
        }
        return parseInt(a.time.replace(':', '')) - parseInt(b.time.replace(':', '')); // Lower time first for same scores
      });
      
      // Update ranks after sorting
      const rankedData = sortedData.map((item, index) => ({
        ...item,
        rank: index + 1
      }));

      const leaderBoardData = rankedData.map((item) => ({
        rank: item.rank,
        name: item.name,
        score: item.score,
        time: item.time,
        attemptsMade: item.attemptsMade,
        isCurrentUser: item.isCurrentUser,
        badge: item.achievement?.title,
        grade: item.grade,
      }))
      setLeaderboardData(leaderBoardData)
      
      // Find current user's rank and score
      const currentUserEntry = rankedData.find(item => item.isCurrentUser)
      setCurrentUserEntry(currentUserEntry)
      if (currentUserEntry) {
        setUserRank(currentUserEntry.rank);
        setUserScore(currentUserEntry.score);
        const attemptsMade = currentUserEntry.attemptsMade || 0
        setUserAttempts(attemptsMade)
        setIsAttemptsExhausted(attemptsMade >= getAttemptsAllowed())
        console.log("User rank:", currentUserEntry.rank, "User score:", currentUserEntry.score);
      } else {
        setUserRank(null);
        setUserScore(null);
        console.log("Current user not found in leaderboard");
      }
      
      setTotalParticipants(rankedData.length);
      setLeaderboard(rankedData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      const msg = error?.message || error?.details || JSON.stringify(error) || "Unknown error";
      setLeaderboardError(`DB error: ${msg}`);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  // Helper function to format time from seconds to MM:SS format
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Function to fetch user attempts for this contest
  const fetchUserAttempts = async (contestId) => {
    try {
      const currentUserId = getTokenUserId();
      if (!currentUserId) return;

      // Try to fetch user attempts from API
      const response = await getUserContestAttempts(contestId, currentUserId);
      const attempts = response.attempts?.length || 0;
      setUserAttempts(attempts);
      
      // Check if attempts are exhausted - when userAttempts equals attemptsAllowed
      const attemptsAllowed = getAttemptsAllowed();
      const isExhausted = attempts === attemptsAllowed;
      setIsAttemptsExhausted(isExhausted);
      
      console.log(`[DEBUG] User attempts: ${attempts}, Allowed: ${attemptsAllowed}, Exhausted: ${isExhausted}`);
      console.log(`[DEBUG] Contest object:`, { attemptsAllowed: contest.attemptsAllowed, maxAttempts: contest.maxAttempts });
    } catch (error) {
      console.error("Error fetching user attempts:", error);
      const attempts = 0;
      setUserAttempts(attempts);
      
      const attemptsAllowed = getAttemptsAllowed();
      const isExhausted = attempts === attemptsAllowed;
      setIsAttemptsExhausted(isExhausted);
      
      console.log(`[DEBUG FALLBACK] User attempts: ${attempts}, Allowed: ${attemptsAllowed}, Exhausted: ${isExhausted}`);
    }
  };


  // Fetch leaderboard data and user attempts when component mounts
  const contestId = contest.id || contest._id
  useEffect(() => {
    if (contestId) {
      fetchLeaderboard(contestId);
      fetchUserAttempts(contestId);
    }
  }, [contestId]);

  // Countdown timer
  useEffect(() => {
    const endDate = contest.endTime ? new Date(contest.endTime) : null;
    const timer = setInterval(() => {
      if (!endDate || isNaN(endDate.getTime())) {
        setCountdown("No end date set");
        return;
      }
      const timeLeft = endDate.getTime() - Date.now();
      if (timeLeft > 0) {
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setCountdown("Contest Ended");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [contest.endTime]);

  const handleStartContest = () => {
    // Check if attempts are exhausted before allowing navigation
    if (isAttemptsExhausted) {
      console.log("Attempts exhausted, cannot start contest");
      alert(`You have used all ${getAttemptsAllowed()} attempts for this contest. You cannot participate further.`);
      return;
    }
    
    console.log("Starting contest:", contest);
    navigate('/contest-page', {state:{contest}});
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return brandColors.accent;
      case 'medium': return brandColors.contest;
      case 'hard': return '#e74c3c';
      default: return brandColors.secondary;
    }
  };

  const getContestTypeInfo = (type) => {
    switch (type) {
      case 'daily-challenge':
        return { icon: <Star size={20} />, label: "Daily Challenge", color: brandColors.gold };
      case 'speed-round':
        return { icon: <Zap size={20} />, label: "Speed Round", color: "#9b59b6" };
      case 'topic-battle':
        return { icon: <Trophy size={20} />, label: "Topic Battle", color: brandColors.contest };
      default:
        return { icon: <Trophy size={20} />, label: "Contest", color: brandColors.contest };
    }
  };

  const typeInfo = getContestTypeInfo(contest.contestType);

  // Helper function to get attempts allowed
  const getAttemptsAllowed = () => {
    return contest.attempts_allowed || contest.attemptsAllowed || contest.maxAttempts || 0;
  };

  return (
    <div className="w-full overflow-auto" style={{ 
      backgroundColor: brandColors.background
    }}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-4 -right-4 w-72 h-72 rounded-full opacity-10" 
             style={{ backgroundColor: brandColors.contest }} />
        <div className="absolute -bottom-4 -left-4 w-96 h-96 rounded-full opacity-5" 
             style={{ backgroundColor: brandColors.accent }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back navigation */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-6 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: brandColors.primary }}
          >
            <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back
          </button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div 
                className="p-2 rounded-full"
                style={{ backgroundColor: `${typeInfo.color}20`, color: typeInfo.color }}
              >
                {typeInfo.icon}
              </div>
              <span className="text-lg font-semibold" style={{ color: typeInfo.color }}>
                {typeInfo.label}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: brandColors.primary }}>
              {contest.title}
            </h1>
            
            <p className="text-xl max-w-2xl mx-auto" style={{ color: brandColors.secondary }}>
              {contest.description}
            </p>

          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Contest Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1"
            >
              {/* Contest Image */}
              <div className="relative h-64 overflow-hidden rounded-2xl mb-8">
                <img
                  src={contest.image}
                  alt={contest.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 rounded-xl bg-white shadow-md" style={{ borderLeft: `4px solid ${brandColors.accent}` }}>
                  <BookOpen size={28} className="mx-auto mb-2" style={{ color: brandColors.accent }} />
                  <div className="font-bold text-xl" style={{ color: brandColors.primary }}>
                    {contest.questionCount}
                  </div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
                
                <div className="text-center p-4 rounded-xl bg-white shadow-md" style={{ borderLeft: `4px solid ${brandColors.contest}` }}>
                  <Timer size={28} className="mx-auto mb-2" style={{ color: brandColors.contest }} />
                  <div className="font-bold text-xl" style={{ color: brandColors.primary }}>
                    {contest.time || contest.estimatedTime ? `${contest.time || contest.estimatedTime} min` : '—'}
                  </div>
                  <div className="text-sm text-gray-600">Duration</div>
                </div>

                <div className="text-center p-4 rounded-xl bg-white shadow-md border-l-4 border-green-500">
                  <Target size={28} className="mx-auto mb-2 text-green-600" />
                  <div className="font-bold text-xl" style={{ color: brandColors.primary }}>
                    {contest.points_per_question || contest.pointsPerQuestion || '—'}
                  </div>
                  <div className="text-sm text-gray-600">Pts / Question</div>
                </div>
                
                <div className="text-center p-4 rounded-xl bg-white shadow-md" style={{ borderLeft: `4px solid ${getDifficultyColor(contest.difficulty)}` }}>
                  <Award size={28} className="mx-auto mb-2" style={{ color: getDifficultyColor(contest.difficulty) }} />
                  <div className="font-bold text-xl capitalize" style={{ color: brandColors.primary }}>
                    {contest.difficulty}
                  </div>
                  <div className="text-sm text-gray-600">Level</div>
                </div>
              </div>

              {/* Contest Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <Info size={24} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-3 text-lg">Contest Instructions</h3>
                    <ul className="text-blue-800 space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        {contest.timeBonus}
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        Grade {contest.grade.join(', ')} competition
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        Maximum {getAttemptsAllowed()} attempts allowed
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        Contest ends in {countdown}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Attempts Status */}
              <div className="mb-6">
                {isAttemptsExhausted ? (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-red-50 border-2 border-red-300 rounded-xl p-6 shadow-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-100 rounded-full">
                        <AlertTriangle size={24} className="text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-red-900 mb-2 text-xl">⚠️ Attempts Exhausted</h3>
                        <p className="text-red-800 mb-4 text-lg">
                          You have used all <strong>{getAttemptsAllowed()}</strong> attempts for this contest. 
                          <br />
                          <span className="font-semibold">You cannot participate further in this contest.</span>
                        </p>
                        <div className="bg-red-100 rounded-lg p-3 border border-red-200">
                          <div className="text-sm text-red-800">
                            <strong>Your attempts:</strong> <span className="font-bold text-lg">{userAttempts}</span> / <span className="font-bold text-lg">{getAttemptsAllowed()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle size={24} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-green-900 mb-2 text-lg">Attempts Available</h3>
                        <p className="text-green-800 mb-3">
                          You have {getAttemptsAllowed() - userAttempts} attempt(s) remaining for this contest.
                        </p>
                        <div className="text-sm text-green-700">
                          <strong>Your attempts:</strong> {userAttempts} / {getAttemptsAllowed()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ready Checkbox */}
              {/* <div className="mb-6 bg-white rounded-xl shadow-md p-6">
                <label className="flex items-center gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isReady}
                    onChange={(e) => setIsReady(e.target.checked)}
                    className="w-6 h-6 rounded"
                    style={{ accentColor: brandColors.contest }}
                  />
                  <span className="text-lg" style={{ color: brandColors.text }}>
                    I understand the rules and I'm ready to compete
                  </span>
                </label>
              </div> */}

              {/* Start Contest Button */}
              <motion.button
                onClick={isAttemptsExhausted ? undefined : handleStartContest}
                whileHover={!isAttemptsExhausted ? { scale: 1.02 } : {}}
                whileTap={!isAttemptsExhausted ? { scale: 0.98 } : {}}
                className={`w-full py-6 rounded-xl font-bold text-xl transition-all duration-300 flex items-center justify-center gap-4 shadow-lg transform ${
                  isAttemptsExhausted 
                    ? 'opacity-50 cursor-not-allowed bg-gray-400' 
                    : 'hover:shadow-xl hover:-translate-y-1'
                }`}
                style={{
                  backgroundColor: isAttemptsExhausted ? '#9CA3AF' : brandColors.contest,
                  color: brandColors.white
                }}
                disabled={isAttemptsExhausted}
                title={isAttemptsExhausted ? `You have used all ${getAttemptsAllowed()} attempts for this contest` : 'Click to start the contest'}
              >
                {isAttemptsExhausted ? <AlertTriangle size={28} /> : <Zap size={28} />}
                {isAttemptsExhausted ? 'Attempts Exhausted - Cannot Start' : 'Join Contest Now'}
                {!isAttemptsExhausted && <ArrowRight size={28} />}
              </motion.button>
            </motion.div>
            

            {/* Leaderboard Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-80 flex-shrink-0"
            >
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-2">
                  <h4 className="font-bold mb-3 flex items-center gap-2" style={{ color: brandColors.primary }}>
                    <Star size={18} />
                    Your Best Score
                  </h4>
                  <div className="text-center p-4 rounded-lg bg-blue-50">
                    {isLoadingLeaderboard ? (
                      <div className="py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <div className="text-sm text-gray-600">Loading your score...</div>
                      </div>
                    ) : userRank && userScore !== null ? (
                      <>
                        <div className="text-2xl font-bold text-blue-700 mb-1">{`Total Score : ${userScore}`}</div>
                        {/* <div className="text-sm text-blue-600 mb-2">out of {contest.questionCount * contest.pointsPerQuestion}</div> */}
                        <div className="text-2xl font-bold text-blue-700 mb-1">Rank #{userRank} of {totalParticipants}</div>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-gray-400 mb-1">--</div>
                        <div className="text-sm text-gray-500 mb-2">No score yet</div>
                        <div className="text-xs text-gray-500">Complete the contest to see your rank!</div>
                      </>
                    )}
                  </div>
                  <div className="mt-3 text-xs text-center text-gray-600">
                    {userRank ? "Beat your score to climb the leaderboard!" : "Join the contest to get ranked!"}
                  </div>
                </div>
              <div className="space-y-4">
                {/* Current Leaderboard */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 text-white">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Trophy size={20} />
                       Leaderboard
                    </h3>
                    <p className="text-sm opacity-90">Grade {contest.grade.join(', ')} Rankings</p>
                  </div>
                  
                  <div className="p-4">
                    {isLoadingLeaderboard ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading leaderboard...</p>
                      </div>
                    ) : leaderboardError ? (
                      <div className="text-center py-8">
                        <div className="text-red-500 mb-2">⚠️</div>
                        <p className="text-red-600">{leaderboardError}</p>
                        <button 
                          onClick={() => contest._id && fetchLeaderboard(contest._id)}
                          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    ) : leaderboard.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">📊</div>
                        <p className="text-gray-600">No leaderboard data available yet</p>
                      </div>
                    ) : (
                      <>
                        {/* Top 3 with special styling */}
                        <div className="space-y-3 mb-4">
                          {leaderboard.slice(0, 3).map((player, index) => {
                            const badges = ["👑", "🥈", "🥉"];
                            const bgColors = [
                              "bg-gradient-to-r from-yellow-100 to-yellow-50",
                              "bg-gradient-to-r from-gray-100 to-gray-50", 
                              "bg-gradient-to-r from-orange-100 to-orange-50"
                            ];
                            const textColors = [
                              "text-yellow-800",
                              "text-gray-700",
                              "text-orange-700"
                            ];
                            
                            // If current user is in top 3, add special highlighting
                            const isCurrentUser = player.isCurrentUser;
                            const currentUserStyle = isCurrentUser ? "border-2 border-blue-300 shadow-lg" : "";
                            
                            return (
                              <motion.div
                                key={player.rank}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: player.rank * 0.1 }}
                                className={`${bgColors[index]} ${currentUserStyle} rounded-lg p-3 border-2 border-transparent hover:border-current transition-all`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="text-xl">{badges[index]}</div>
                                    <div>
                                      <div className={`font-bold text-sm ${textColors[index]} ${isCurrentUser ? 'underline' : ''}`}>
                                        {isCurrentUser ? 'You' : player.name}
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        {player.time}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`font-bold text-lg ${textColors[index]}`}>
                                      {player.score}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      pts
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>

                        {/* Rest of leaderboard */}
                        {leaderboard.length > 3 && (
                          <div className="space-y-2">
                            {leaderboard.slice(3).map((player) => (
                              <motion.div
                                key={player.rank}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + (player.rank - 4) * 0.1 }}
                                className={`flex items-center justify-between py-2 px-3 rounded-lg transition-all ${
                                  player.isCurrentUser 
                                    ? 'bg-blue-50 border-2 border-blue-200' 
                                    : 'hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div 
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                      player.isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}
                                  >
                                    {player.rank}
                                  </div>
                                  <div>
                                    <div className={`text-sm font-medium ${
                                      player.isCurrentUser ? 'text-blue-700' : 'text-gray-800'
                                    }`}>
                                      {player.isCurrentUser ? 'You' : player.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {player.time}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`font-bold ${
                                    player.isCurrentUser ? 'text-blue-700' : 'text-gray-700'
                                  }`}>
                                    {player.score}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    pts
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {/* View full leaderboard */}
                    {leaderboard.length > 0 && (
                      <button 
                        className="w-full mt-4 py-2 text-center text-sm font-medium rounded-lg transition-all hover:bg-gray-50"
                        style={{ color: brandColors.contest }}
                        onClick={()=>{navigate("/leaderboard",{state:{contest, leaderBoardData, currentUserEntry}})}}
                      >
                        View Full Leaderboard ({leaderboard.length} players)
                      </button>
                    )}
                  </div>
                </div>

                {/* Your Best Score */}
                

                {/* Warning */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-amber-900 text-sm mb-1">
                        Contest Mode
                      </h4>
                      <p className="text-xs text-amber-800">
                        Once started, you cannot pause or restart. Make sure you have a stable internet connection.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

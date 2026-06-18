import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Medal
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
// import { max } from 'moment';

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

// Mock leaderboard data
const mockLeaderboardData = [
  {
    rank: 1,
    name: "Alex Chen",
    score: 95,
    time: "4:32",
    userId: "user1",
    isCurrentUser: false,
    attemptsMade: 1,
    grade: 8,
    badge: "Gold"
  },
  {
    rank: 2,
    name: "Sarah Johnson",
    score: 92,
    time: "5:15",
    userId: "user2",
    isCurrentUser: false,
    attemptsMade: 2,
    grade: 7,
    badge: "Silver"
  },
  {
    rank: 3,
    name: "You",
    score: 88,
    time: "6:02",
    userId: "currentUser",
    isCurrentUser: true,
    attemptsMade: 1,
    grade: 8,
    badge: "Bronze"
  },
  {
    rank: 4,
    name: "Michael Rodriguez",
    score: 85,
    time: "5:45",
    userId: "user4",
    isCurrentUser: false,
    attemptsMade: 3,
    grade: 9,
    badge: "Bronze"
  },
  {
    rank: 5,
    name: "Emma Wilson",
    score: 82,
    time: "7:12",
    userId: "user5",
    isCurrentUser: false,
    attemptsMade: 2,
    grade: 7,
    badge: "Bronze"
  },
  {
    rank: 6,
    name: "David Kim",
    score: 78,
    time: "6:58",
    userId: "user6",
    isCurrentUser: false,
    attemptsMade: 1,
    grade: 8,
    badge: "Bronze"
  },
  {
    rank: 7,
    name: "Lisa Thompson",
    score: 75,
    time: "8:30",
    userId: "user7",
    isCurrentUser: false,
    attemptsMade: 2,
    grade: 9,
    badge: "Bronze"
  },
  {
    rank: 8,
    name: "James Brown",
    score: 72,
    time: "7:45",
    userId: "user8",
    isCurrentUser: false,
    attemptsMade: 1,
    grade: 7,
    badge: "Bronze"
  },
  {
    rank: 9,
    name: "Maria Garcia",
    score: 68,
    time: "9:15",
    userId: "user9",
    isCurrentUser: false,
    attemptsMade: 3,
    grade: 8,
    badge: "Bronze"
  },
  {
    rank: 10,
    name: "Kevin Lee",
    score: 65,
    time: "8:42",
    userId: "user10",
    isCurrentUser: false,
    attemptsMade: 2,
    grade: 9,
    badge: "Bronze"
  }
];

// Mock contest data
const mockContestData = {
  id: 'contest-1',
  title: "Math Master Challenge",
  description: "Test your mathematical skills in this exciting contest!",
  image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop",
  type: 'contest',
  contestType: 'speed-round',
  pointsPerQuestion: 10,
  bonusTimeLimit: 30,
  difficulty: 'medium',
  questionCount: 10,
  estimatedTime: "15 minutes",
  participants: 234,
  isActive: true,
  endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
  maxAttempts: 3,
  grade: [7, 8, 9],
  totalPoints: 100,
  timeBonus: "Extra points for quick answers"
};

export default function Leaderboard() {
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(null);

  const locator = useLocation()

  // All hooks must run before any conditional return
  useEffect(() => {
    if (!locator.state?.contest) return
    setIsLoadingLeaderboard(true);
    const timer = setTimeout(() => setIsLoadingLeaderboard(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!locator.state?.contest) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        No leaderboard data. Return to a contest to view rankings.
      </div>
    )
  }

  const participants = locator.state.leaderBoardData?.length ?? 0
  const currentUserEntry = locator.state.currentUserEntry
  const rawContest = locator.state.contest
  const contest = {
    ...rawContest,
    totalPoints: ((rawContest.points_per_question || rawContest.pointsPerQuestion || 10) * (rawContest.questions?.length || 0)),
    maxAttempts: rawContest.attempts_allowed || rawContest.attemptsAllowed || rawContest.maxAttempts || 0,
    participants,
  }
  const leaderboard = locator.state.leaderBoardData || []
  const gradeLabel = Array.isArray(rawContest.grade)
    ? rawContest.grade.join(', ')
    : (rawContest.grade || '')

  return (
    <div className="w-full h-full" style={{ 
      backgroundColor: brandColors.background
    }}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-4 -right-4 w-72 h-72 rounded-full opacity-10" 
             style={{ backgroundColor: brandColors.contest }} />
        <div className="absolute -bottom-4 -left-4 w-96 h-96 rounded-full opacity-5" 
             style={{ backgroundColor: brandColors.accent }} />
      </div>

      <div className="relative z-10 h-full flex">
        {/* Main Leaderboard Table - Takes up most of the screen */}
        <div className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="h-full"
          >
            {/* Leaderboard Header */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white rounded-t-2xl">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Trophy size={32} />
                {contest.title} - Leaderboard
              </h1>
              <p className="text-lg opacity-90 mt-2">Grade {gradeLabel} Rankings</p>
            </div>
            
            {/* Full Leaderboard Table */}
            <div className="bg-white rounded-b-2xl shadow-lg overflow-hidden h-full">
              {isLoadingLeaderboard ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading leaderboard...</p>
                  </div>
                </div>
              ) : leaderboardError ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                    <p className="text-red-600 text-lg">{leaderboardError}</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-gray-400 text-4xl mb-4">📊</div>
                    <p className="text-gray-600 text-lg">No leaderboard data available yet</p>
                  </div>
                </div>
              ) : (
                <div className="h-full">
                  {/* Top 3 with special styling */}
                  <div className="p-6">
                    <div className="space-y-4 mb-8">
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
                        
                        const isCurrentUser = player.isCurrentUser;
                        const currentUserStyle = isCurrentUser ? "border-2 border-blue-300 shadow-lg" : "";
                        
                        return (
                          <motion.div
                            key={player.rank}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: player.rank * 0.1 }}
                            className={`${bgColors[index]} ${currentUserStyle} rounded-xl p-6 border-2 border-transparent hover:border-current transition-all`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="text-3xl">{badges[index]}</div>
                                <div>
                                  <div className={`font-bold text-xl ${textColors[index]} ${isCurrentUser ? 'underline' : ''}`}>
                                    {isCurrentUser ? 'You' : player.name}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {player.time} • Grade {player.grade || currentUserEntry?.grade || ''} • {player.attemptsMade} attempt{player.attemptsMade > 1 ? 's' : ''}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`font-bold text-2xl ${textColors[index]}`}>
                                  {player.score}
                                </div>
                                <div className="text-sm text-gray-500">
                                  points
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Rest of leaderboard */}
                    {leaderboard.length > 3 && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Other Participants</h3>
                        {leaderboard.slice(3).map((player) => (
                          <motion.div
                            key={player.rank}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + (player.rank - 4) * 0.1 }}
                            className={`flex items-center justify-between py-4 px-6 rounded-lg transition-all ${
                              player.isCurrentUser 
                                ? 'bg-blue-50 border-2 border-blue-200' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                  player.isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                                }`}
                              >
                                {player.rank}
                              </div>
                              <div>
                                <div className={`text-lg font-medium ${
                                  player.isCurrentUser ? 'text-blue-700' : 'text-gray-800'
                                }`}>
                                  {player.isCurrentUser ? 'You' : player.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {player.time} • Grade {player.grade} • {player.attemptsMade} attempt{player.attemptsMade > 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold text-xl ${
                                player.isCurrentUser ? 'text-blue-700' : 'text-gray-700'
                              }`}>
                                {player.score}
                              </div>
                              <div className="text-sm text-gray-500">
                                points
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar with Contest Details and Badges */}
        <div className="w-80 flex-shrink-0 p-6 space-y-6">
          {/* Contest Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h4 className="font-bold text-xl mb-4 flex items-center gap-2" style={{ color: brandColors.primary }}>
              <Trophy size={20} />
              Contest Details
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Questions:</span>
                <span className="font-medium">{contest.questionCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Points per Question:</span>
                <span className="font-medium">{contest.pointsPerQuestion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Points:</span>
                <span className="font-medium">{contest.totalPoints}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{contest.estimatedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Difficulty:</span>
                <span className="font-medium capitalize">{contest.difficulty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Attempts:</span>
                <span className="font-medium">{contest.maxAttempts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Participants:</span>
                <span className="font-medium">{contest.participants}</span>
              </div>
            </div>
          </motion.div>

          {/* Achievement Badges */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h4 className="font-bold text-xl mb-4 flex items-center gap-2" style={{ color: brandColors.primary }}>
              <Medal size={20} />
              Your Badges
            </h4>
            <div className="flex flex-wrap gap-3">
              {currentUserEntry?.achievement?.title && (
                <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-full text-sm font-medium">
                  🥉 {currentUserEntry.achievement.title}
                </div>
              )}
              {currentUserEntry?.rank <= 10 && (
                <div className="bg-purple-100 text-purple-800 px-3 py-2 rounded-full text-sm font-medium">
                  🏆 Top 10
                </div>
              )}
              {!currentUserEntry?.achievement?.title && !currentUserEntry?.rank && (
                <p className="text-sm text-gray-500">Complete the contest to earn badges.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

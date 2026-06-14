"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Trophy, Clock, Users, Target, Zap, Star, Award, Medal, 
  Crown, Flame, Timer, BookOpen, ArrowRight, ArrowLeft,
  CheckCircle, AlertTriangle, Info, Play, TrendingUp,
  Brain, Lightning, Shield, Sword, Eye
} from "lucide-react"

// Brand colors (matching your existing theme)
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
  bronze: "#CD7F32",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444"
}

// Mock contest data (this would come from props/API)
const contestData = {
  id: 'contest-2',
  title: "Speed Coding Challenge",
  description: "How fast can you solve these programming puzzles? Race against time and other participants!",
  image: "/api/placeholder/600/300",
  type: 'contest',
  contestType: 'speed-round',
  pointsPerQuestion: 15,
  bonusTimeLimit: 20,
  difficulty: 'hard',
  questionCount: 8,
  estimatedTime: "15 minutes",
  participants: 156,
  isActive: true,
  endTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
  maxAttempts: 1,
  grade: [9, 10, 11],
  category: "Computer Science",
  prizePool: 500,
  entryFee: 0,
  rules: [
    "Each question has a time limit of 90 seconds",
    "Bonus points awarded for answers within 20 seconds",
    "No external resources or help allowed", 
    "One attempt only - make it count",
    "Late submissions receive reduced points"
  ],
  rewards: [
    { place: "1st", points: 500, badge: "Gold Champion", color: brandColors.gold },
    { place: "2nd", points: 300, badge: "Silver Runner-up", color: brandColors.silver },
    { place: "3rd", points: 200, badge: "Bronze Medalist", color: brandColors.bronze },
    { place: "Top 10", points: 100, badge: "Elite Performer", color: brandColors.contest }
  ]
}

// Mock leaderboard data
const mockLeaderboard = [
  { rank: 1, name: "CodeMaster_99", points: 2850, avatar: "👨‍💻", status: "online" },
  { rank: 2, name: "AlgorithmQueen", points: 2790, avatar: "👩‍🎓", status: "online" },
  { rank: 3, name: "ByteWarrior", points: 2650, avatar: "⚔️", status: "competing" },
  { rank: 4, name: "LogicNinja", points: 2580, avatar: "🥷", status: "online" },
  { rank: 5, name: "DataWizard", points: 2340, avatar: "🧙‍♂️", status: "offline" }
]

export default function ContestJoinPage() {
  const [timeLeft, setTimeLeft] = useState("")
  const [isJoined, setIsJoined] = useState(false)
  const [currentTab, setCurrentTab] = useState("overview")
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [userStats] = useState({ rank: 42, points: 1250, contestsWon: 3 })

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const timeRemaining = contestData.endTime - now
      
      if (timeRemaining > 0) {
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60))
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)
        
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      } else {
        setTimeLeft("Contest Ended")
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleJoinContest = () => {
    setShowConfirmModal(true)
  }

  const confirmJoin = () => {
    setIsJoined(true)
    setShowConfirmModal(false)
  }

  const startContest = () => {
    // Navigate to actual contest/quiz page
    console.log("Starting contest...")
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.background }}>
      {/* Hero Header */}
      <div 
        className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-red-900 text-white overflow-hidden"
        style={{ minHeight: "400px" }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-20"
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Contest Status Badge */}
            <motion.div
              className="inline-flex items-center gap-2 bg-red-500 px-4 py-2 rounded-full mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="font-bold">LIVE CONTEST</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {contestData.title}
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              {contestData.description}
            </p>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                whileHover={{ scale: 1.05 }}
              >
                <Users className="mx-auto mb-2" size={24} />
                <div className="text-2xl font-bold">{contestData.participants}</div>
                <div className="text-sm opacity-75">Participants</div>
              </motion.div>
              
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                whileHover={{ scale: 1.05 }}
              >
                <Target className="mx-auto mb-2" size={24} />
                <div className="text-2xl font-bold">{contestData.questionCount * contestData.pointsPerQuestion}</div>
                <div className="text-sm opacity-75">Max Points</div>
              </motion.div>
              
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                whileHover={{ scale: 1.05 }}
              >
                <Clock className="mx-auto mb-2" size={24} />
                <div className="text-2xl font-bold">{contestData.estimatedTime}</div>
                <div className="text-sm opacity-75">Duration</div>
              </motion.div>
              
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                whileHover={{ scale: 1.05 }}
              >
                <Trophy className="mx-auto mb-2" size={24} />
                <div className="text-2xl font-bold">{contestData.prizePool}</div>
                <div className="text-sm opacity-75">Prize Pool</div>
              </motion.div>
            </div>

            {/* Countdown Timer */}
            <motion.div
              className="bg-black/30 backdrop-blur-md rounded-2xl p-6 inline-block"
              animate={{ boxShadow: ["0 0 20px rgba(255,107,53,0.3)", "0 0 40px rgba(255,107,53,0.5)", "0 0 20px rgba(255,107,53,0.3)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-sm mb-2 opacity-75">Contest Ends In</div>
              <div className="text-4xl md:text-5xl font-mono font-bold text-orange-400">
                {timeLeft}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-2 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-wrap">
                {[
                  { id: "overview", label: "Overview", icon: <Eye size={18} /> },
                  { id: "rules", label: "Rules & Scoring", icon: <BookOpen size={18} /> },
                  { id: "rewards", label: "Rewards", icon: <Award size={18} /> },
                  { id: "leaderboard", label: "Live Leaderboard", icon: <TrendingUp size={18} /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                      currentTab === tab.id
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {currentTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <ContestOverview />
                </motion.div>
              )}

              {currentTab === "rules" && (
                <motion.div
                  key="rules"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <RulesAndScoring />
                </motion.div>
              )}

              {currentTab === "rewards" && (
                <motion.div
                  key="rewards"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <RewardsSection />
                </motion.div>
              )}

              {currentTab === "leaderboard" && (
                <motion.div
                  key="leaderboard"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <LiveLeaderboard />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Actions & Stats */}
          <div className="space-y-6">
            {/* User Stats Card */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: brandColors.primary }}>
                Your Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Rank</span>
                  <span className="font-bold text-xl" style={{ color: brandColors.contest }}>
                    #{userStats.rank}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Points</span>
                  <span className="font-bold text-xl" style={{ color: brandColors.primary }}>
                    {userStats.points}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Contests Won</span>
                  <span className="font-bold text-xl text-green-600">
                    {userStats.contestsWon}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Action Button */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {!isJoined ? (
                <motion.button
                  onClick={handleJoinContest}
                  className="w-full py-4 rounded-xl font-bold text-lg text-white transition-all transform hover:scale-105 shadow-lg"
                  style={{ backgroundColor: brandColors.contest }}
                  whileHover={{ boxShadow: "0 10px 30px rgba(255,107,53,0.3)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Sword size={20} />
                    JOIN CONTEST
                  </div>
                </motion.button>
              ) : (
                <div className="space-y-4">
                  <motion.div
                    className="flex items-center justify-center gap-2 text-green-600 font-medium"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <CheckCircle size={20} />
                    You're In!
                  </motion.div>
                  
                  <motion.button
                    onClick={startContest}
                    className="w-full py-4 rounded-xl font-bold text-lg text-white transition-all transform hover:scale-105 shadow-lg bg-gradient-to-r from-green-500 to-emerald-600"
                    whileHover={{ boxShadow: "0 10px 30px rgba(34,197,94,0.3)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Play size={20} />
                      START CONTEST
                    </div>
                  </motion.button>
                </div>
              )}
              
              {!isJoined && (
                <div className="mt-4 text-sm text-gray-600 text-center">
                  Free entry • {contestData.maxAttempts} attempt only
                </div>
              )}
            </motion.div>

            {/* Quick Tips */}
            <motion.div
              className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: brandColors.primary }}>
                <Brain size={20} />
                Quick Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Lightning size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                  Speed matters - bonus points for quick answers
                </li>
                <li className="flex items-start gap-2">
                  <Shield size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  Read questions carefully before answering
                </li>
                <li className="flex items-start gap-2">
                  <Target size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  Focus on accuracy over speed initially
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="text-center">
                <motion.div
                  className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Trophy size={32} style={{ color: brandColors.contest }} />
                </motion.div>
                
                <h3 className="text-2xl font-bold mb-4" style={{ color: brandColors.primary }}>
                  Ready to Compete?
                </h3>
                
                <p className="text-gray-600 mb-6">
                  You're about to join "{contestData.title}". Once you start, you'll have {contestData.estimatedTime} to complete {contestData.questionCount} questions.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmJoin}
                    className="flex-1 py-3 rounded-xl text-white font-bold transition-all transform hover:scale-105"
                    style={{ backgroundColor: brandColors.contest }}
                  >
                    Join Contest
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Tab Content Components
function ContestOverview() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6" style={{ color: brandColors.primary }}>
        Contest Overview
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="font-semibold mb-3 text-gray-800">Contest Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium">{contestData.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Difficulty:</span>
              <span className="font-medium capitalize">{contestData.difficulty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Grade Level:</span>
              <span className="font-medium">Grade {contestData.grade.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Contest Type:</span>
              <span className="font-medium">Speed Round</span>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-3 text-gray-800">Scoring System</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Points:</span>
              <span className="font-medium">{contestData.pointsPerQuestion} per question</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Speed Bonus:</span>
              <span className="font-medium">+50% if under {contestData.bonusTimeLimit}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Max Score:</span>
              <span className="font-medium">{contestData.questionCount * contestData.pointsPerQuestion * 1.5} points</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Attempts:</span>
              <span className="font-medium">{contestData.maxAttempts} only</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Info size={24} className="text-orange-500 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-orange-800 mb-2">What to Expect</h4>
            <p className="text-orange-700 text-sm">
              This is a fast-paced coding challenge focusing on algorithmic thinking and problem-solving speed. 
              Questions will cover data structures, algorithms, and computational complexity. 
              The faster you answer correctly, the more bonus points you earn!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function RulesAndScoring() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6" style={{ color: brandColors.primary }}>
        Rules & Scoring
      </h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield size={20} style={{ color: brandColors.contest }} />
            Contest Rules
          </h3>
          <div className="space-y-3">
            {contestData.rules.map((rule, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: brandColors.contest }}
                >
                  {index + 1}
                </div>
                <p className="text-gray-700 text-sm">{rule}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target size={20} style={{ color: brandColors.primary }} />
            Scoring Breakdown
          </h3>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-800">Base Scoring</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Correct Answer:</span>
                    <span className="font-semibold text-green-600">+{contestData.pointsPerQuestion} pts</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Wrong Answer:</span>
                    <span className="font-semibold text-red-500">0 pts</span>
                  </li>
                  <li className="flex justify-between">
                    <span>No Answer:</span>
                    <span className="font-semibold text-gray-500">0 pts</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-gray-800">Speed Bonus</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Under 20s:</span>
                    <span className="font-semibold text-orange-600">+50% bonus</span>
                  </li>
                  <li className="flex justify-between">
                    <span>20-60s:</span>
                    <span className="font-semibold text-blue-600">Full points</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Over 60s:</span>
                    <span className="font-semibold text-gray-500">-25% penalty</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RewardsSection() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6" style={{ color: brandColors.primary }}>
        Rewards & Recognition
      </h2>
      
      <div className="space-y-6">
        {contestData.rewards.map((reward, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-gray-200 transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: reward.color }}
            >
              {index < 3 ? <Crown size={20} /> : <Star size={20} />}
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-lg" style={{ color: brandColors.primary }}>
                {reward.place} Place
              </h3>
              <p className="text-sm text-gray-600">{reward.badge}</p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: reward.color }}>
                {reward.points}
              </div>
              <div className="text-sm text-gray-500">points</div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <Trophy size={24} className="text-yellow-600" />
          <h4 className="font-semibold text-yellow-800">Additional Benefits</h4>
        </div>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• All participants earn achievement badges</li>
          <li>• Top performers get featured on the leaderboard</li>
          <li>• Contest history tracked in your profile</li>
          <li>• Special recognition for improvement streaks</li>
        </ul>
      </motion.div>
    </div>
  )
}

function LiveLeaderboard() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: brandColors.primary }}>
          Live Leaderboard
        </h2>
        <motion.div
          className="flex items-center gap-2 text-green-500"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium">Live Updates</span>
        </motion.div>
      </div>
      
      <div className="space-y-3">
        {mockLeaderboard.map((player, index) => (
          <motion.div
            key={player.rank}
            className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Rank */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                 style={{ 
                   backgroundColor: 
                     player.rank === 1 ? brandColors.gold :
                     player.rank === 2 ? brandColors.silver :
                     player.rank === 3 ? brandColors.bronze :
                     brandColors.secondary
                 }}>
              {player.rank <= 3 ? <Crown size={16} /> : player.rank}
            </div>
            
            {/* Player Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{player.avatar}</span>
                <div>
                  <h4 className="font-semibold" style={{ color: brandColors.primary }}>
                    {player.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      player.status === 'online' ? 'bg-green-500' :
                      player.status === 'competing' ? 'bg-orange-500 animate-pulse' :
                      'bg-gray-400'
                    }`}></div>
                    <span className="text-xs text-gray-500 capitalize">{player.status}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Points */}
            <div className="text-right">
              <div className="text-lg font-bold" style={{ color: brandColors.contest }}>
                {player.points.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">points</div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.div
        className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-sm text-gray-600 mb-2">
          Think you can climb the ranks?
        </p>
        <div className="text-lg font-bold" style={{ color: brandColors.primary }}>
          Your Current Rank: #{userStats.rank}
        </div>
      </motion.div>
    </div>
  )
}

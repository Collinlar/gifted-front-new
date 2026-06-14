"use client"
import { getTokenUserId } from "../lib/auth";

import React from "react"

import { useState , useEffect} from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Search, BookOpen, Clock, ArrowRight, Trophy, Star, Zap, Users, Timer, Award, Medal, Flame, Crown, Target, Filter } from "lucide-react"

// Import images
import computer from "../Components/images/7922055.jpg"
import DataScience from "../Components/images/18141.jpg"
import Physics from "../Components/images/physics6.jpg"
import Engineering from "../Components/images/5131615.jpg"
import Mathematics from "../Components/images/4542742.jpg"
import AI from "../Components/images/AI.jpg"
import CyberSecurity from "../Components/images/3849223.jpg"
import Renewable from "../Components/images/7314.jpg"
import { getAllExams } from "../lib/api"
import { jwtDecode } from "jwt-decode"

// Brand colors
const brandColors = {
  primary: "#003366",
  secondary: "#336699",
  accent: "#6699CC",
  background: "#F0F4F8",
  text: "#333333",
  white: "#FFFFFF",
  contest: "#FF6B35", // Orange for contests
  contestLight: "#FFE5DC", // Light orange
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32"
}

// Mock contest data removed - now using only actual contests from API

// Categories and difficulties for filters
const categories = ["All", "Computer Science", "Data Science", "Physics", "Engineering", "Mathematics", "AI", "Cyber Security", "Renewable Energy"]
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"]

let quizzes = [
  {
    title: "Introduction to Computer Science",
    description: "Test your knowledge of computer science fundamentals.",
    image: computer,
    category: "Computer Science",
    difficulty: "Beginner",
    questionCount: 10,
    estimatedTime: "15 minutes",
    participants: 1245,
    questions: [
      {
        question: "What is the time complexity of binary search?",
        options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
        answer: "O(log n)",
      },
      {
        question: "Who is considered the father of computing?",
        options: ["Alan Turing", "Charles Babbage", "Dennis Ritchie", "Tim Berners-Lee"],
        answer: "Charles Babbage",
      },
    ],
  },
  {
    title: "Data Science & Machine Learning",
    description: "Evaluate your understanding of data science and ML.",
    image: DataScience,
    category: "Data Science",
    difficulty: "Intermediate",
    questionCount: 15,
    estimatedTime: "20 minutes",
    participants: 982,
    questions: [
      {
        question: "What is the purpose of a confusion matrix?",
        options: ["To store data", "To evaluate model performance", "To normalize data", "To generate predictions"],
        answer: "To evaluate model performance",
      },
      {
        question: "Which algorithm is used for supervised learning?",
        options: ["K-Means", "Linear Regression", "Apriori", "DBSCAN"],
        answer: "Linear Regression",
      },
    ],
  },
  // ... other assessment quizzes
]

export default function AssessmentManagement() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("assessments")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")
  const [showFilters, setShowFilters] = useState(false) // Added this missing state
  const [visibleQuizzes, setVisibleQuizzes] = useState([])
  const [visibleContests, setVisibleContests] = useState([])
  const [quizQuestions, setQuizzes] = useState([])
  const [userCategory, setUserCategory] = useState(null)
  const [isStudent, setIsStudent] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userPoints, setUserPoints] = useState(1250) // Mock user points
  const [userRank, setUserRank] = useState(42) // Mock user rank

  // Check user category on component mount — read from localStorage profile,
  // not from JWT (Supabase JWTs don't carry category/grade)
  useEffect(() => {
    try {
      const profile = JSON.parse(localStorage.getItem('user') || '{}')
      const category = profile.category || profile.Category || ''
      setUserCategory(category)
      setIsStudent(category === 'Student')
    } catch (error) {
      console.error("Error reading user profile:", error)
      setIsStudent(false)
    }
  }, [])

  useEffect(() => {
    const LoadQuizzes = async() => {
      setIsLoading(true)
      try {
        const response = await getAllExams()
        const token = localStorage.getItem("token")
        const id = getTokenUserId()

        const paidQuizzes = response.exams.filter(item =>
          item.registered?.includes(id)
        );
        console.log("Paid quizzes:", paidQuizzes)
        
        const allExams = response.exams || []
        setQuizzes(allExams)

      } catch (error) {
        console.error("Error loading quizzes:", error)
      } finally {
        setIsLoading(false)
      }
    }
    LoadQuizzes()
  }, [])

  // Normalize any grade representation (e.g., "Grade 7", "grade 7", 7, "7") to a number
  const toGradeNumber = (value) => {
    if (value === null || value === undefined) return null
    const match = String(value).match(/\d+/)
    return match ? Number(match[0]) : null
  }

  const startQuiz = (quiz) => {
    navigate("/quiz-overview", { state: { questions: quiz } })
    console.log(quiz)
  }

  const startContest = (contest) => {
    localStorage.removeItem("saved-quiz");
    localStorage.removeItem("saved-answers");
    localStorage.removeItem("saved-time");
    // Navigate to contest overview instead of quiz overview
    navigate("/contest-overview", { state: { contest: contest, isContest: true } })
    console.log("Starting contest:", contest)
  }

  // Filter quizzes based only on user's grade
  const filterQuizzes = () => {
    let filtered = quizQuestions

    // Only include quizzes where the user's grade exists in item.grade (array or single) after normalization
    try {
      const profile = JSON.parse(localStorage.getItem('user') || '{}')
      const userGrade = profile.grade || profile.Grade || ''
      const userGradeNumber = toGradeNumber(userGrade)

      if (userGradeNumber !== null) {
          filtered = filtered?.filter((quiz) => {
            const quizGrades = Array.isArray(quiz.grade) ? quiz.grade : [quiz.grade]

            // Check if user's grade number exists in quiz.grade array (after normalization)
            const hasMatchingGrade = quizGrades.some((grade) => {
              const quizGradeNumber = toGradeNumber(grade)
              console.log("Comparing user grade number:", userGradeNumber, "with quiz grade:", grade, "-> parsed:", quizGradeNumber)
              return quizGradeNumber !== null && quizGradeNumber === userGradeNumber
            })
            
            console.log("Quiz:", quiz.title, "Grade match:", hasMatchingGrade)
            return hasMatchingGrade
          })
        }
    } catch (error) {
      console.error("Error filtering by grade:", error)
    }

    // Apply simple text search on title/description
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      console.log(query)
      filtered = filtered?.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(query) ||
          quiz.description.toLowerCase().includes(query)
      )
    }

    console.log("Filtered quizzes count:", filtered?.length || 0)
    setVisibleQuizzes(() => { return [...filtered] })
  }

  // Filter contests based on user's grade and contest: true
  const filterContests = () => {
    console.log("filterContests called, quizQuestions length:", quizQuestions.length)
    console.log("quizQuestions data:", quizQuestions)
    
    let filtered = []
    
    if (quizQuestions.length > 0) {
      // Filter quizQuestions array for items where contest is true (handle both boolean and string)
      filtered = quizQuestions.filter(quiz => {
        const isContest = quiz.contest === true || quiz.contest === "true" || quiz.contest === 1
        console.log("Quiz:", quiz.title, "contest field:", quiz.contest, "type:", typeof quiz.contest, "isContest:", isContest)
        return isContest
      })
      console.log(filtered)
    } else {
      console.log("No quizQuestions data available")
    }
    
    console.log("After contest filter, count:", filtered.length)

    // Temporarily skip grade filtering to test contest filtering
    console.log("Skipping grade filtering for now to test contest filtering")
    
    // try {
    //   const token = localStorage.getItem("token")
    //   if (token) {
    //     const decoded = jwtDecode(token)
    //     const userGrade = decoded?.grade
    //     const userGradeNumber = toGradeNumber(userGrade)
    //     console.log("User grade:", userGrade, "parsed:", userGradeNumber)
        
    //     if (userGradeNumber !== null) {
    //       filtered = filtered.filter((contest) => {
    //         const contestGrades = Array.isArray(contest.grade) ? contest.grade : [contest.grade]
    //         const hasMatchingGrade = contestGrades.some((grade) => {
    //           const contestGradeNumber = toGradeNumber(grade)
    //           return contestGradeNumber !== null && contestGradeNumber === userGradeNumber
    //         })
    //         console.log("Contest:", contest.title, "grade match:", hasMatchingGrade)
    //         return hasMatchingGrade
    //       })
    //     }
    //   }
    // } catch (error) {
    //   console.error("Error filtering contests by grade:", error)
    // }

    // Apply text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter((contest) =>
        String(contest.title || "").toLowerCase().includes(q) ||
        String(contest.description || "").toLowerCase().includes(q)
      )
    }

    console.log("Final filtered contests count:", filtered.length)
    
    // Only show actual contests from API data - no fallback to mock contests
    setVisibleContests(filtered)
  }

  // Update filters when search, category, or difficulty changes
  React.useEffect(() => {
    console.log("useEffect triggered - activeTab:", activeTab, "quizQuestions.length:", quizQuestions.length)
    if (activeTab === "assessments" && quizQuestions.length > 0) {
      console.log("Triggering filterQuizzes, quizQuestions length:", quizQuestions.length)
      filterQuizzes();
    } else if (activeTab === "contests" && quizQuestions.length > 0) {
      console.log("Triggering filterContests, quizQuestions length:", quizQuestions.length)
      filterContests();
    } else if (activeTab === "contests") {
      console.log("Contest tab active but no quizQuestions data yet")
    }
  }, [quizQuestions, searchQuery, activeTab])

  // If user is not a student, show access denied message
  if (!isStudent) {
    return (
      <div className="min-h-screen w-full overflow-auto" style={{ backgroundColor: brandColors.background }}>
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div
              className="inline-block mb-3 rounded-full px-4 py-1 text-sm font-medium"
              style={{ backgroundColor: `${brandColors.accent}30`, color: brandColors.primary }}
            >
              Access Restricted
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: brandColors.primary }}>
              {activeTab === "assessments" ? "Assessments" : "Contests"} Not Available
            </h1>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: brandColors.secondary }}>
              {activeTab === "assessments" ? "Assessments" : "Contests"} are only available for students. Your current category is: <strong>{userCategory || 'Unknown'}</strong>
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full overflow-auto" style={{ backgroundColor: brandColors.background }}>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section with Contest Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div
            className="inline-block mb-3 rounded-full px-4 py-1 text-sm font-medium"
            style={{ 
              backgroundColor: activeTab === "assessments" 
                ? `${brandColors.accent}30` 
                : `${brandColors.contest}30`, 
              color: activeTab === "assessments" 
                ? brandColors.primary 
                : brandColors.contest 
            }}
          >
            {activeTab === "assessments" ? "Test Your Knowledge" : "Compete & Win"}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: brandColors.primary }}>
            {activeTab === "assessments" ? "STEM Assessments" : "STEM Contests"}
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: brandColors.secondary }}>
            {activeTab === "assessments" 
              ? "Challenge yourself with our curated collection of STEM quizzes and assess your skills"
              : "Compete with others, earn points, and climb the leaderboards in exciting STEM challenges"
            }
          </p>
          
          {/* Contest Stats Bar */}
          {activeTab === "contests" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 bg-white rounded-2xl shadow-md p-4 max-w-md mx-auto"
            >
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: brandColors.contest }}>
                    {userPoints}
                  </div>
                  <div className="text-sm text-gray-600">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: brandColors.primary }}>
                    #{userRank}
                  </div>
                  <div className="text-sm text-gray-600">Rank</div>
                </div>
                {/* <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {visibleContests.length}
                  </div>
                  <div className="text-sm text-gray-600">Live</div>
                </div> */}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white rounded-2xl p-1 shadow-md">
            <div className="flex">
              <button
                onClick={() => setActiveTab("assessments")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === "assessments"
                    ? "text-white shadow-md"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                style={{
                  backgroundColor: activeTab === "assessments" ? brandColors.accent : "transparent"
                }}
              >
                <BookOpen size={18} />
                Assessments
              </button>
              <button
                onClick={() => {
                  console.log("Contest tab clicked, quizQuestions length:", quizQuestions.length)
                  setActiveTab("contests")
                  // Force filter contests when tab is clicked
                  console.log("Manually calling filterContests from tab click")
                  filterContests()
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === "contests"
                    ? "text-white shadow-md"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                style={{
                  backgroundColor: activeTab === "contests" ? brandColors.contest : "transparent"
                }}
              >
                <Trophy size={18} />
                Contests
              </button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="mb-10 bg-white rounded-2xl shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-1/2">
              <div
                className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
                style={{ color: brandColors.secondary }}
              >
                <Search size={18} />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                placeholder={`Search ${activeTab === "assessments" ? "assessments" : "contests"} by title or description...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  borderColor: `${brandColors.secondary}30`,
                  backgroundColor: brandColors.white,
                  boxShadow: `0 0 0 2px ${brandColors.accent}00`,
                }}
              />
            </div>
            
            {/* Filter toggle button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border transition-all hover:shadow-md"
              style={{
                borderColor: showFilters ? brandColors.accent : `${brandColors.secondary}30`,
                backgroundColor: showFilters ? `${brandColors.accent}10` : brandColors.white,
                color: showFilters ? brandColors.accent : brandColors.secondary
              }}
            >
              <Filter size={18} />
              Advanced Filters
            </button>
          </div>
          
          <div className="mt-4 text-sm" style={{ color: brandColors.secondary }}>
            {isLoading ? (
              <span>Loading {activeTab === "assessments" ? "assessments" : "contests"}...</span>
            ) : (
              <>
                Showing <span className="font-semibold">
                  {activeTab === "assessments" ? visibleQuizzes.length : visibleContests.length}
                </span> {activeTab === "assessments" ? "assessments" : "contests"}
              </>
            )}
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div
                  className="pt-4 mt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4"
                  style={{ borderColor: `${brandColors.secondary}20` }}
                >
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: brandColors.secondary }}>
                      Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className="px-3 py-1 rounded-full text-sm transition-all"
                          style={{
                            backgroundColor:
                              selectedCategory === category ? brandColors.primary : `${brandColors.secondary}10`,
                            color: selectedCategory === category ? brandColors.white : brandColors.secondary,
                          }}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: brandColors.secondary }}>
                      Difficulty
                    </label>
                    <div className="flex gap-3">
                      {difficulties.map((difficulty) => (
                        <button
                          key={difficulty}
                          onClick={() => setSelectedDifficulty(difficulty)}
                          className="px-3 py-1 rounded-full text-sm transition-all"
                          style={{
                            backgroundColor:
                              selectedDifficulty === difficulty ? brandColors.primary : `${brandColors.secondary}10`,
                            color: selectedDifficulty === difficulty ? brandColors.white : brandColors.secondary,
                          }}
                        >
                          {difficulty}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Content based on active tab */}
        <AnimatePresence mode="wait">
          {activeTab === "assessments" ? (
            <motion.div
              key="assessments"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {isLoading ? (
                <LoadingGrid />
              ) : (
                <>
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    variants={{
                      hidden: { opacity: 0 },
                      show: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.1,
                        },
                      },
                    }}
                    initial="hidden"
                    animate="show"
                  >
                    {visibleQuizzes.map((quiz, index) => (
                      <QuizCard key={index} quiz={quiz} startQuiz={startQuiz} />
                    ))}
                  </motion.div>

                  {visibleQuizzes.length === 0 && (
                    <NoResultsMessage type="assessments" />
                  )}
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="contests"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {isLoading ? (
                <LoadingGrid />
              ) : (
                <>
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    variants={{
                      hidden: { opacity: 0 },
                      show: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.1,
                        },
                      },
                    }}
                    initial="hidden"
                    animate="show"
                  >
                    {visibleContests.map((contest, index) => (
                      <ContestCard key={contest.id} contest={contest} startContest={startContest} />
                    ))}
                  </motion.div>

                  {visibleContests.length === 0 && (
                    <NoResultsMessage type="contests" />
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// No Results Component
function NoResultsMessage({ type }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl p-8 text-center mt-8"
    >
      <div
        className="mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${brandColors.accent}20` }}
      >
        <Search size={24} style={{ color: brandColors.accent }} />
      </div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: brandColors.primary }}>
        No {type} found
      </h3>
      <p style={{ color: brandColors.secondary }}>Try adjusting your search criteria</p>
    </motion.div>
  )
}

// Loading Skeletons
function LoadingGrid() {
  const skeletonItems = Array.from({ length: 8 })
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {skeletonItems.map((_, index) => (
        <LoadingSkeletonCard key={index} />
      ))}
    </div>
  )
}

function LoadingSkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md overflow-hidden"
      style={{ border: `1px solid ${brandColors.accent}10` }}
    >
      <div className="h-40 w-full animate-pulse" style={{ backgroundColor: `${brandColors.accent}20` }} />
      <div className="p-5">
        <div className="h-5 w-2/3 mb-3 rounded animate-pulse" style={{ backgroundColor: `${brandColors.accent}20` }} />
        <div className="h-4 w-full mb-2 rounded animate-pulse" style={{ backgroundColor: `${brandColors.accent}20` }} />
        <div className="h-4 w-5/6 mb-4 rounded animate-pulse" style={{ backgroundColor: `${brandColors.accent}20` }} />
        <div className="flex justify-between items-center mt-4">
          <div className="h-8 w-24 rounded animate-pulse" style={{ backgroundColor: `${brandColors.accent}20` }} />
          <div className="h-4 w-24 rounded animate-pulse" style={{ backgroundColor: `${brandColors.accent}20` }} />
        </div>
      </div>
    </motion.div>
  )
}

// Quiz Card Component (for Assessments)
function QuizCard({ quiz, startQuiz }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -8, boxShadow: "0 15px 30px -10px rgba(0, 51, 102, 0.15)" }}
      className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 flex flex-col h-full"
      style={{ border: `1px solid ${brandColors.accent}10` }}
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={quiz.image || "/placeholder.svg"}
          alt={quiz.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex justify-between items-center">
            <span
              className="text-xs font-semibold text-white px-2 py-1 rounded-full"
              style={{ backgroundColor: brandColors.accent }}
            >
              Assessment
            </span>
            <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white">
              {quiz.grade}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <div className="flex-grow">
          <h3 className="text-lg font-bold mb-2" style={{ color: brandColors.primary }}>
            {quiz.title}
          </h3>
          <p className="text-sm mb-4 line-clamp-2" style={{ color: brandColors.text }}>
            {quiz.description}
          </p>

          <div className="flex items-center gap-4 mb-4 text-xs" style={{ color: brandColors.secondary }}>
            <div className="flex items-center gap-1">
              <BookOpen size={14} />
              <span>{quiz.questions.length} {`${quiz.questions.length == 1 ? "question" : "questions"}`}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{quiz.time}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => { startQuiz(quiz) }}
            className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{
              backgroundColor: brandColors.accent,
              color: brandColors.white,
            }}
          >
            Start Quiz
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Contest Card Component (for Contests)
function ContestCard({ contest, startContest }) {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return brandColors.accent
      case 'medium': return brandColors.contest
      case 'hard': return '#e74c3c'
      default: return brandColors.secondary
    }
  }

  const getContestTypeIcon = (type) => {
    switch (type) {
      case 'daily-challenge': return <Star size={14} />
      case 'speed-round': return <Zap size={14} />
      case 'topic-battle': return <Trophy size={14} />
      default: return <Trophy size={14} />
    }
  }

  const formatTimeRemaining = (endTime) => {
    if (!endTime) return "Ongoing"
    const now = new Date()
    const timeLeft = new Date(endTime) - now
    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) return `${hours}h ${minutes}m left`
    if (minutes > 0) return `${minutes}m left`
    return "Ending soon"
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -8, boxShadow: `0 15px 30px -10px ${brandColors.contest}30` }}
      className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 flex flex-col h-full relative"
      style={{ border: `1px solid ${brandColors.contest}30` }}
    >
      {/* Contest Badge */}
      <div className="absolute top-3 left-3 z-10">
        {/* <div
          className="px-2 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1"
          style={{ backgroundColor: brandColors.contest }}
        >
          {getContestTypeIcon(contest.contestType)}
          Contest
        </div> */}
      </div>

      {/* Live indicator for active contests */}
      {contest.isActive && (
        <div className="absolute top-3 right-3 z-10">
          {/* <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            LIVE
          </div> */}
        </div>
      )}

      <div className="relative h-40 overflow-hidden">
        <img
          src={contest.image || "/placeholder.svg"}
          alt={contest.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex justify-between items-center">
            <span
              className="text-xs font-semibold text-white px-2 py-1 rounded-full flex items-center gap-1"
              style={{ backgroundColor: getDifficultyColor(contest.difficulty) }}
            >
              <Award size={12} />
              {contest.difficulty}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white">
              Grade {Array.isArray(contest.grade) ? contest.grade.join(', ') : contest.grade}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold" style={{ color: brandColors.primary }}>
              {contest.title}
            </h3>
            {/* <div className="text-xs text-red-500 font-medium">
              {formatTimeRemaining(contest.endTime)}
            </div> */}
          </div>
          
          <p className="text-sm mb-4 line-clamp-2" style={{ color: brandColors.text }}>
            {contest.description}
          </p>

          {/* Contest Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
            <div className="flex items-center gap-1" style={{ color: brandColors.secondary }}>
              <Timer size={12} />
              <span>{contest.estimatedTime || contest.time + ' minutes'}</span>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <Target size={12} />
              <span>{contest.pointsPerQuestion || '10'}pts/question</span>
            </div>
            <div className="flex items-center gap-1" style={{ color: brandColors.secondary }}>
              <BookOpen size={12} />
              <span>{contest.numberOfQuestions || contest.questions?.length || 0} questions</span>
            </div>
            {contest.contestType && (
              <div className="flex items-center gap-1" style={{ color: brandColors.contest }}>
                <Trophy size={12} />
                <span>{contest.contestType}</span>
              </div>
            )}
          </div>

          {/* Contest Features */}
          {/* <div className="flex flex-wrap gap-1 mb-4">
            {contest.bonusTimeLimit && (
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                Time Bonus: {contest.bonusTimeLimit}s
              </span>
            )}
            {contest.maxAttempts > 1 && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                {contest.maxAttempts} attempts
              </span>
            )}
          </div> */}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => startContest(contest)}
            className="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 hover:shadow-lg transform hover:scale-105"
            style={{
              backgroundColor: brandColors.contest,
              color: brandColors.white,
            }}
          >
            Join Contest
            <Zap size={16} />
          </button>
          
          <div className="text-right">
            <div className="text-xs text-gray-500">Max Points</div>
            <div className="font-bold text-lg" style={{ color: brandColors.contest }}>
              {(contest.numberOfQuestions || contest.questions?.length || 0) * (parseInt(contest.pointsPerQuestion) || 10)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

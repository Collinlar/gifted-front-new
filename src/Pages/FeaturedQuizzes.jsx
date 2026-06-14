"use client"
import { getTokenUserId } from "../lib/auth";

import React from "react"

import { useState , useEffect} from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Search, Filter, ChevronDown, BookOpen, Clock, Users, ArrowRight } from "lucide-react"

// Import images
import computer from "../Components/images/7922055.jpg"
import DataScience from "../Components/images/18141.jpg"
import Physics from "../Components/images/physics6.jpg"
import Engineering from "../Components/images/5131615.jpg"
import Mathematics from "../Components/images/4542742.jpg"
import AI from "../Components/images/AI.jpg"
import CyberSecurity from "../Components/images/3849223.jpg"
import Renewable from "../Components/images/7314.jpg"
import { getFeaturedExams } from "../lib/api"
import { jwtDecode } from "jwt-decode"

// Brand colors
const brandColors = {
  primary: "#003366",
  secondary: "#336699",
  accent: "#6699CC",
  background: "#F0F4F8",
  text: "#333333",
  white: "#FFFFFF",
}

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
  {
    title: "Physics Fundamentals",
    description: "Challenge yourself with physics questions.",
    image: Physics,
    category: "Physical Sciences",
    difficulty: "Intermediate",
    questionCount: 12,
    estimatedTime: "18 minutes",
    participants: 756,
    questions: [
      {
        question: "What is Newton's second law of motion?",
        options: ["F = ma", "E = mc^2", "V = IR", "P = IV"],
        answer: "F = ma",
      },
      {
        question: "What is the speed of light?",
        options: ["3.00 x 10^8 m/s", "1.50 x 10^8 m/s", "3.00 x 10^6 m/s", "9.81 m/s^2"],
        answer: "3.00 x 10^8 m/s",
      },
    ],
  },
  {
    title: "Engineering Basics",
    description: "Test your engineering knowledge.",
    image: Engineering,
    category: "Engineering",
    difficulty: "Beginner",
    questionCount: 10,
    estimatedTime: "15 minutes",
    participants: 1089,
    questions: [
      {
        question: "What is the primary material used in civil engineering structures?",
        options: ["Concrete", "Wood", "Plastic", "Glass"],
        answer: "Concrete",
      },
      {
        question: "Which law states that voltage is equal to current times resistance?",
        options: ["Ohm's Law", "Newton's Law", "Faraday's Law", "Kirchhoff's Law"],
        answer: "Ohm's Law",
      },
    ],
  },
  {
    title: "Mathematics for Scientists",
    description: "Solve math problems and test your skills.",
    image: Mathematics,
    category: "Mathematics",
    difficulty: "Advanced",
    questionCount: 20,
    estimatedTime: "30 minutes",
    participants: 678,
    questions: [
      {
        question: "What is the derivative of sin(x)?",
        options: ["cos(x)", "-cos(x)", "tan(x)", "sec^2(x)"],
        answer: "cos(x)",
      },
      {
        question: "What is the value of π (pi) to two decimal places?",
        options: ["3.14", "3.16", "3.12", "3.18"],
        answer: "3.14",
      },
    ],
  },
  {
    title: "Artificial Intelligence",
    description: "Test your knowledge of AI concepts.",
    image: AI,
    category: "Computer Science",
    difficulty: "Intermediate",
    questionCount: 15,
    estimatedTime: "25 minutes",
    participants: 1567,
    questions: [
      {
        question: "Which type of AI mimics human cognitive abilities?",
        options: ["Strong AI", "Weak AI", "Reactive AI", "None"],
        answer: "Strong AI",
      },
      {
        question: "What is a neural network composed of?",
        options: ["Neurons", "Nodes", "Weights", "All of the above"],
        answer: "All of the above",
      },
    ],
  },
  {
    title: "Cybersecurity Essentials",
    description: "Evaluate your cybersecurity awareness.",
    image: CyberSecurity,
    category: "Computer Science",
    difficulty: "Beginner",
    questionCount: 12,
    estimatedTime: "20 minutes",
    participants: 892,
    questions: [
      {
        question: "What does HTTPS stand for?",
        options: [
          "HyperText Transfer Protocol Secure",
          "High-Tech Transfer Protocol System",
          "Hyperlink Text Transfer System",
          "Home Transfer Text Protocol",
        ],
        answer: "HyperText Transfer Protocol Secure",
      },
      {
        question: "Which of the following is a common cybersecurity attack?",
        options: ["Phishing", "DDoS", "Malware", "All of the above"],
        answer: "All of the above",
      },
    ],
  },
  {
    title: "Renewable Energy Technologies",
    description: "Test your knowledge of sustainable energy.",
    image: Renewable,
    category: "Engineering",
    difficulty: "Intermediate",
    questionCount: 15,
    estimatedTime: "22 minutes",
    participants: 745,
    questions: [
      {
        question: "Which of the following is NOT a renewable energy source?",
        options: ["Solar", "Wind", "Coal", "Hydropower"],
        answer: "Coal",
      },
      {
        question: "What device converts sunlight into electricity?",
        options: ["Wind turbine", "Solar panel", "Battery", "Generator"],
        answer: "Solar panel",
      },
    ],
  },
]

export default function FeaturedQuizzes() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")
  const [visibleQuizzes, setVisibleQuizzes] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [quizQuestions, setQuizzes]= useState([])
  const [update,setUpdate]= useState(false)

  useEffect(()=>{
    const LoadQuizzes = async()=>{
      const response = await getFeaturedExams()
      const token = localStorage.getItem("token")
      const id = getTokenUserId()
      const paidQuizzes = response.exams.filter(item =>
        item.registered?.includes(id)
      );
      console.log(paidQuizzes)
      setUpdate(!update)      
      setQuizzes(()=>{return [...response.data.featuredQuizzes]})
      // quizzes = quizQuestions
      console.log(quizQuestions)
    }
    LoadQuizzes()

  },[update])

  const categories = ["All", ...Array.from(new Set(quizzes.map((quiz) => quiz.category)))]
  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"]

  const startQuiz = (quiz) => {
    navigate("/quiz-overview", { state: { questions: quiz } })
    console.log(quiz)
  }

  // Filter quizzes based on search, category, and difficulty
  const filterQuizzes = () => {
    let filtered = quizQuestions

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(query) ||
          quiz.description.toLowerCase().includes(query) ||
          quiz.category.toLowerCase().includes(query),
      )
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((quiz) => quiz.category === selectedCategory)
    }

    if (selectedDifficulty !== "All") {
      filtered = filtered.filter((quiz) => quiz.difficulty === selectedDifficulty)
    }

    setVisibleQuizzes(()=>{return [...filtered]})
  }

  // Update filters when search, category, or difficulty changes
  React.useEffect(() => {
    filterQuizzes();
  }, [searchQuery, selectedCategory, selectedDifficulty, quizQuestions]); 
  return (
    <div className="min-h-screen w-full overflow-auto" style={{ backgroundColor: brandColors.background }}>
    <div className="text-blue-500 font-semibold cursor-pointer ml-9 mt-7" onClick={()=>navigate(-1)}>Back</div>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div
            className="inline-block mb-3 rounded-full px-4 py-1 text-sm font-medium"
            style={{ backgroundColor: `${brandColors.accent}30`, color: brandColors.primary }}
          >
            Test Your Knowledge
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: brandColors.primary }}>
            Featured STEAM Quizzes
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: brandColors.secondary }}>
            Challenge yourself with our curated collection of STEM quizzes and assess your skills
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="mb-10 bg-white rounded-2xl shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
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
                placeholder="Search quizzes by title, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  borderColor: `${brandColors.secondary}30`,
                  backgroundColor: brandColors.white,
                  boxShadow: `0 0 0 2px ${brandColors.accent}00`,
                }}
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border transition-all"
              style={{
                borderColor: `${brandColors.secondary}30`,
                color: brandColors.secondary,
              }}
            >
              <Filter size={18} />
              Filters
              <ChevronDown size={16} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>

            {/* Results Count */}
            <div className="ml-auto text-sm" style={{ color: brandColors.secondary }}>
              Showing <span className="font-semibold">{visibleQuizzes.length}</span> of{" "}
              <span className="font-semibold">{quizQuestions.length}</span> quizzes
            </div>
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

        {/* Quizzes Grid */}
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

        {/* No Results */}
        {visibleQuizzes.length === 0 && (
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
              No quizzes found
            </h3>
            <p style={{ color: brandColors.secondary }}>Try adjusting your search or filter criteria</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Quiz Card Component
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
              {quiz.title}
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
              <span>{quiz.questions.length} {`${quiz.questions.length==1?"question":"questions"}`}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{quiz.time}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => startQuiz(quiz)}
            className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{
              backgroundColor: brandColors.accent,
              color: brandColors.white,
            }}
          >
            Start Quiz
            <ArrowRight size={16} />
          </button>
          {/* <div className="flex items-center gap-1">
            <Users size={14} style={{ color: brandColors.secondary }} />
            <span className="text-xs" style={{ color: brandColors.secondary }}>
              {quiz.participants.toLocaleString()} participants
            </span>
          </div> */}
        </div>
      </div>
    </motion.div>
  )
}


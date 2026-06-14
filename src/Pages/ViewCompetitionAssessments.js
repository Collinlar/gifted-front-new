import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getExam } from '../lib/api'
import { motion } from "framer-motion"
import { ArrowRight, BookOpen, Clock } from "lucide-react"

const ViewCompetitionAssessments = () => {
  const locator = useLocation()
  const assessment = locator.state.assessment
  const [assessmentDetails, setAssessmentDetails] = useState([])
  const navigate = useNavigate()

  const startQuiz = (quiz) => {
    navigate("/quiz-overview", { state: { questions: quiz } })
    console.log(quiz)
  }

  useEffect(() => {
    const fetchAssessments = async () => {
      for (let id of assessment) {
        const response = await getExam(id)
        setAssessmentDetails((prev) => [...prev, response.exam])
      }
    }
    fetchAssessments()
  }, [assessment])

  return (
    <div className="grid gap-4">
      {assessmentDetails.map((quiz, index) => (
        <QuizCard startQuiz={startQuiz} quiz={quiz} key={index} />
      ))}
    </div>
  )
}

export default ViewCompetitionAssessments


// Quiz Card Component
function QuizCard({ quiz, startQuiz }) {
  const brandColors = {
    accent: "#2563eb",
    primary: "#1e293b",
    secondary: "#64748b",
    text: "#475569",
    white: "#ffffff"
  }

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
              <span>{quiz.questions.length} {quiz.questions.length === 1 ? "question" : "questions"}</span>
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
        </div>
      </div>
    </motion.div>
  )
}

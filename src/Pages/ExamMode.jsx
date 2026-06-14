"use client"

import React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate, useParams } from "react-router-dom"
import { Search, BookOpen, Clock, ArrowRight, FileText, List, Timer } from "lucide-react"
import { getExam } from "../lib/api"
import { jwtDecode } from "jwt-decode"

// Brand colors
const brandColors = {
  primary: "#003366",
  secondary: "#336699",
  accent: "#6699CC",
  background: "#F0F4F8",
  text: "#333333",
  white: "#FFFFFF"
}

export default function ExamModePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [exam, setExam] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchExam = async () => {
      if (!id) {
        setError("No exam ID provided")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await getExam(id)
        if (response.exam) {
          setExam(response.exam)
        } else {
          setError("Exam not found")
        }
      } catch (error) {
        console.error("Error loading exam:", error)
        setError("Failed to load exam details")
      } finally {
        setIsLoading(false)
      }
    }
    fetchExam()
  }, [id])

  const startExam = () => {
    if (exam) {
      navigate("/exam-login", { state: { exam: exam } })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full overflow-auto" style={{ backgroundColor: brandColors.background }}>
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: brandColors.primary }}></div>
              <p style={{ color: brandColors.secondary }}>Loading exam details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen w-full overflow-auto" style={{ backgroundColor: brandColors.background }}>
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColors.accent}20` }}>
                <FileText size={24} style={{ color: brandColors.accent }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: brandColors.primary }}>
                {error}
              </h3>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: brandColors.accent,
                  color: brandColors.white,
                }}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full overflow-auto" style={{ backgroundColor: brandColors.background }}>
      <div className="container mx-auto px-4 py-12">
        {exam && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            {/* Exam Header */}
            <div className="text-center mb-8">
              <div
                className="inline-block mb-3 rounded-full px-4 py-1 text-sm font-medium"
                style={{ backgroundColor: `${brandColors.accent}30`, color: brandColors.primary }}
              >
                Exam Details
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: brandColors.primary }}>
                {exam.title}
              </h1>
            </div>

            {/* Exam Details Card */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="p-8">
                {/* Description */}
                {exam.description && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2" style={{ color: brandColors.primary }}>
                      <FileText size={20} />
                      Description
                    </h3>
                    <p className="text-lg leading-relaxed" style={{ color: brandColors.text }}>
                      {exam.description}
                    </p>
                  </div>
                )}

                {/* Exam Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: `${brandColors.accent}10` }}>
                    <div className="p-2 rounded-lg" style={{ backgroundColor: brandColors.accent }}>
                      <BookOpen size={20} style={{ color: brandColors.white }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: brandColors.secondary }}>Questions</p>
                      <p className="text-2xl font-bold" style={{ color: brandColors.primary }}>
                        {exam.questions?.length || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: `${brandColors.accent}10` }}>
                    <div className="p-2 rounded-lg" style={{ backgroundColor: brandColors.accent }}>
                      <Timer size={20} style={{ color: brandColors.white }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: brandColors.secondary }}>Time Limit</p>
                      <p className="text-2xl font-bold" style={{ color: brandColors.primary }}>
                        {exam.time || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                {exam.instructions && exam.instructions.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: brandColors.primary }}>
                      <List size={20} />
                      Instructions
                    </h3>
                    <div className="space-y-3">
                      {exam.instructions.map((instruction, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: `${brandColors.background}` }}>
                          <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: brandColors.accent, color: brandColors.white }}>
                            {index + 1}
                          </div>
                          <p className="text-base" style={{ color: brandColors.text }}>
                            {instruction}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Start Exam Button */}
                <div className="text-center">
                  <motion.button
                    onClick={startExam}
                    className="px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-3 mx-auto"
                    style={{
                      backgroundColor: brandColors.accent,
                      color: brandColors.white,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Exam
                    <ArrowRight size={20} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}



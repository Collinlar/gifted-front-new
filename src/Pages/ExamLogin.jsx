"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"
import { User, Lock, ArrowRight, AlertCircle } from "lucide-react"
import axios from "axios"

// Brand colors (matching ExamView.jsx)
const brandColors = {
  primary: "#003366",
  secondary: "#336699",
  accent: "#6699CC",
  background: "#F0F4F8",
  text: "#333333",
  white: "#FFFFFF"
}

export default function ExamLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    name: "",
    password: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Get exam title from location state
  const exam = location.state?.exam

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await axios.post(
        `https://gifted-exams.onrender.com/api/v1/exam-login/${exam.title}`,
        {
          name: formData.name,
          password: formData.password
        }
      )

      if (response.data.success) {
        // Navigate to quiz overview on successful login
        localStorage.setItem("user", JSON.stringify(response.data.user))
        localStorage.getItem("examMode",true)
        navigate("/quiz-questions", { state: {questions: location.state.exam} })
      } else {
        setError("Login failed. Please check your credentials.")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(
        error.response?.data?.message || 
        "Login failed. Please check your credentials and try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full overflow-auto" style={{ backgroundColor: brandColors.background }}>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div
            className="inline-block mb-3 rounded-full px-4 py-1 text-sm font-medium"
            style={{ backgroundColor: `${brandColors.accent}30`, color: brandColors.primary }}
          >
            Exam Access
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: brandColors.primary }}>
            Login to {exam.title}
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: brandColors.secondary }}>
            login to start {exam.title}
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: brandColors.primary }}>
                Name
              </label>
              <div className="relative">
                <div
                  className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
                  style={{ color: brandColors.secondary }}
                >
                  <User size={18} />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                  placeholder="Enter your name"
                  required
                  style={{
                    borderColor: error ? "#ef4444" : `${brandColors.secondary}30`,
                    backgroundColor: brandColors.white,
                    boxShadow: error ? "0 0 0 2px #ef444420" : `0 0 0 2px ${brandColors.accent}00`,
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: brandColors.primary }}>
                Password
              </label>
              <div className="relative">
                <div
                  className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
                  style={{ color: brandColors.secondary }}
                >
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                  placeholder="Enter your password"
                  required
                  style={{
                    borderColor: error ? "#ef4444" : `${brandColors.secondary}30`,
                    backgroundColor: brandColors.white,
                    boxShadow: error ? "0 0 0 2px #ef444420" : `0 0 0 2px ${brandColors.accent}00`,
                  }}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-lg"
                style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}
              >
                <AlertCircle size={16} style={{ color: "#ef4444" }} />
                <span className="text-sm" style={{ color: "#dc2626" }}>
                  {error}
                </span>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isLoading ? brandColors.secondary : brandColors.accent,
                color: brandColors.white,
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Login to Exam
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: brandColors.secondary }}>
              Make sure you have the correct exam credentials before proceeding
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

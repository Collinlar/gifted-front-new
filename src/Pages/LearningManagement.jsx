"use client"

import React, { useEffect, useState } from "react"
import { BookOpen, Clock, Star, Filter } from "lucide-react"
import axios from "axios"
import { getAllCoursesInfo, getAllCompetitions, fetchCourseProgress as fetchCourseProgressApi, makePayment } from "../lib/api"
import {jwtDecode} from "jwt-decode"
import { useNavigate } from "react-router-dom"

// Brand colors
const brandColors = {
  primary: "#003366",
  secondary: "#336699",
  accent: "#6699CC",
  background: "#F0F4F8",
  text: "#333333",
  white: "#FFFFFF",
}

export default function LearningManagement() {
  const [courses, setCourses] = useState([])
  const [courseProgress, setCourseProgress] = useState({})
  const [programs, setPrograms] = useState([])
  const [selectedProgram, setSelectedProgram] = useState("")
  const [user, setUser] = useState(null)

  // Email popup states
  const [showEmailPopup, setShowEmailPopup] = useState(false)
  const [emailInput, setEmailInput] = useState("")
  const [courseToRegister, setCourseToRegister] = useState(null)

  const [phoneNumber, setPhoneNumber] = useState("");
  const navigate = useNavigate()

  // decode token and set user
  useEffect(() => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return
      const decoded = jwtDecode(token)
      // decoded is assumed to have fields like id, firstName, lastName, mobile, email
      setUser(decoded)
    } catch (err) {
      console.error("Failed to decode token:", err)
    }
  }, [])

  // Load courses
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await getAllCoursesInfo()
        setCourses(response.courses || [])
      } catch (error) {
        console.error("Error loading courses:", error)
      }
    }
    loadCourses()
  }, [])

  // Load programs
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const response = await getAllCompetitions()
        setPrograms(response.AllCompetitions || [])
      } catch (error) {
        console.error("Error loading programs:", error)
      }
    }
    loadPrograms()
  }, []) 

  // Function to fetch course progress for a course
  const fetchCourseProgress = async (courseId) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return false
      const decoded = jwtDecode(token)
      const userId = decoded.id
      const response = await fetchCourseProgressApi(userId, courseId)
      return (
        response.progress &&
        response.progress.moduleStatus &&
        response.progress.moduleStatus.some((module) => module.completed === true)
      )
    } catch (error) {
      console.error("Error fetching course progress:", error)
      return false
    }
  }

  // Load course progress for all courses when courses change
  useEffect(() => {
    const loadCourseProgress = async () => {
      if (courses.length === 0) return
      const progressData = {}
      // sequential fetch to avoid overwhelming backend; you can parallelize if you prefer
      for (const course of courses) {
        try {
          const hasProgress = await fetchCourseProgress(course._id || course.id)
          progressData[course._id || course.id] = hasProgress
        } catch (err) {
          progressData[course._id || course.id] = false
        }
      }
      setCourseProgress(progressData)
    }
    loadCourseProgress()
  }, [courses])

  const hasCourseProgress = (courseId) => {
    return !!courseProgress[courseId]
  }

  const handleCourseClick = (course) => {
    navigate("/course-view", { state: course })
    try {
      localStorage.setItem("courseId", course._id || course.id)
    } catch (err) {
      // ignore storage errors
    }
  }

  // Determine registered vs unregistered courses (using decoded user id)
  const userId = user?.id

  const registeredCourses = courses.filter((c) => {
    if (!userId) return false
    if (!c) return false
    const reg = c.registered
    return Array.isArray(reg) && reg.includes(userId)
  })

  const unregisteredCourses = courses.filter((c) => {
    if (!userId) return true // if user unknown, show all in "Other"
    const reg = c.registered
    return !Array.isArray(reg) || !reg.includes(userId)
  })

  // When user clicks "Register" on a course card
  const handleRegisterCourse = (course) => {
    setCourseToRegister(course)
    localStorage.setItem("course",course._id)
    // pre-fill email if user has one
    setEmailInput(user?.email || "")
    setShowEmailPopup(true)
  }

  // Complete registration payment — calls /make-payment
  const completeRegistrationPayment = async (id) => {
    if (!courseToRegister || !user) {
      // try to still send but user info required per your payload
      console.error("Missing course or user information for payment")
      setShowEmailPopup(false)
      return
    }
    console.log(courseToRegister)

    try {
      const payload = {
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "",
        mobile: phoneNumber || "",
        feetypecode: "Course",
        currency: "GHS",
        email: emailInput || "",
        amount: parseInt(courseToRegister.cost) || 0,
        order_desc: `Payment for registration for ${courseToRegister.title || courseToRegister.name || ""}`,
      }

      const response = await makePayment(user.id, payload)

      localStorage.setItem("n", response.payment?.trans_ref_no)
      if (response.payment?.redirect_url) window.location.href = response.payment.redirect_url
      // response.data.data.redirect_url

      // Optimistically mark course as registered locally (so UI changes immediately)
      setCourses((prev) =>
        prev.map((c) => {
          if ((c._id || c.id) === (courseToRegister._id || courseToRegister.id)) {
            const reg = Array.isArray(c.registered) ? [...c.registered] : []
            if (userId && !reg.includes(userId)) {
              reg.push(userId)
            }
            return { ...c, registered: reg }
          }
          return c
        })
      )

      setShowEmailPopup(false)
      setCourseToRegister(null)
      setEmailInput("")
    } catch (error) {
      console.error("Payment error:", error)
      // keep popup open so user can retry or cancel
    }
  }

  // Filter courses based on selected program (applies to both lists)
  const filterByProgram = (list) => {
    if (!selectedProgram) return list
    return list.filter(
      (course) =>
        course.program &&
        Array.isArray(course.program) &&
        course.program.includes(selectedProgram)
    )
  }

  const filteredRegistered = filterByProgram(registeredCourses)
  const filteredUnregistered = filterByProgram(unregisteredCourses)

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-auto" style={{ backgroundColor: brandColors.background }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>
            STEM Learning Hub
          </h1>
          <p className="text-xl" style={{ color: brandColors.secondary }}>
            Discover our comprehensive STEM courses
          </p>
        </div>

        {/* Filter Section */}
        <div className="mb-6 flex justify-center">
          <div className="flex items-center gap-3 bg-white rounded-lg shadow-md px-4 py-3">
            <Filter size={20} style={{ color: brandColors.secondary }} />
            <label htmlFor="program-filter" className="font-medium" style={{ color: brandColors.primary }}>
              Filter by Program:
            </label>
            <select
              id="program-filter"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: brandColors.accent,
                color: brandColors.text,
              }}
            >
              <option value="">All Programs</option>
              {programs.map((program, index) => (
                <option key={program._id || index} value={program.name}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* REGISTERED COURSES */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: brandColors.primary }}>
            Registered Courses
          </h2>

          {filteredRegistered.length === 0 ? (
            <div className="text-center py-6 bg-white rounded-lg shadow-sm p-6">
              <BookOpen size={48} className="mx-auto mb-4" style={{ color: brandColors.secondary }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: brandColors.primary }}>
                No registered courses
              </h3>
              <p style={{ color: brandColors.secondary }}>
                Register for courses from the list below.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRegistered.map((course, index) => (
                <CourseCard
                  key={course._id || index}
                  course={course}
                  hasCourseProgress={hasCourseProgress}
                  onClick={() => handleCourseClick(course)}
                  isRegistered={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* OTHER COURSES */}
        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: brandColors.primary }}>
            Other Courses
          </h2>

          {filteredUnregistered.length === 0 ? (
            <div className="text-center py-6 bg-white rounded-lg shadow-sm p-6">
              <BookOpen size={48} className="mx-auto mb-4" style={{ color: brandColors.secondary }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: brandColors.primary }}>
                No courses available
              </h3>
              <p style={{ color: brandColors.secondary }}>
                Check back later for new courses
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredUnregistered.map((course, index) => (
                <CourseCard
                  key={course._id || index}
                  course={course}
                  hasCourseProgress={hasCourseProgress}
                  isRegistered={false}
                  onRegister={(e) => {
                    // the CourseCard will pass event if needed; but we handle here
                    handleRegisterCourse(course)
                  }}
                  // Do not pass onClick here because clicking the card should go to view only for unregistered? 
                  // We let CourseCard handle card click via onClick prop if desired.
                  onClick={() => handleCourseClick(course)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Email Popup Modal */}
      {showEmailPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Payment Information
            </h2>
            <h3 className="text-lg font-bold mb-3">Enter Email (optional)</h3>

            <input
              type="email"
              placeholder="Enter email (optional)"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
            />

             <label className="block mb-2 font-medium">Phone Number</label>
            <input
              type="text"
              required
              className="w-full border p-2 rounded mb-4"
              placeholder="This will be the number used to make payment"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />

            <div className="flex justify-between">
              <button
                onClick={() => {
                  // Skip option: keep email empty and proceed
                  setEmailInput("")
                  completeRegistrationPayment()
                }}
                className="px-4 py-2 border rounded bg-gray-100"
              >
                Skip
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowEmailPopup(false)
                    setCourseToRegister(null)
                    setEmailInput("")
                  }}
                  className="px-4 py-2 border rounded bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  onClick={completeRegistrationPayment}
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Course Card Component
function CourseCard({ course, hasCourseProgress, onClick, isRegistered = false, onRegister }) {
  // protect access to brandColors from outer scope
  const progress = hasCourseProgress ? hasCourseProgress(course._id || course.id) : false

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      style={{ border: `1px solid ${brandColors.accent}10` }}
      onClick={onClick}
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={course.thumbnail || course.image || "/placeholder.svg"}
          alt={course.title || course.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <span
            className="text-xs font-semibold text-white px-2 py-1 rounded-full"
            style={{ backgroundColor: brandColors.accent }}
          >
            {/* category could be array or string */}
            {Array.isArray(course.category) ? course.category[0] : course.category}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-center mb-2">
          <span
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{ backgroundColor: `${brandColors.primary}15`, color: brandColors.primary }}
          >
            {course.level}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium" style={{ color: brandColors.secondary }}>
            <Star size={12} fill={brandColors.accent} /> {course.rating || 4.5}
          </span>
        </div>

        <h3 className="text-lg font-bold mb-2" style={{ color: brandColors.primary }}>
          {course.title || course.name}
        </h3>
        <p className="text-sm mb-4 line-clamp-2" style={{ color: brandColors.text }}>
          {course.description}
        </p>

        <div className="flex justify-between items-center">
          {isRegistered ? (
            <button
              onClick={(e) => {
                // clicking continue should not bubble up if there is any parent click; prevent double
                e.stopPropagation()
                if (typeof onClick === "function") onClick()
              }}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: brandColors.accent,
                color: brandColors.white,
              }}
            >
              {progress ? "Continue" : "View Course"}
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation() // prevent card click
                if (typeof onRegister === "function") onRegister(e)
              }}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: brandColors.primary,
                color: brandColors.white,
              }}
            >
              Register
            </button>
          )}

          <span className="text-xs flex items-center gap-1" style={{ color: brandColors.secondary }}>
            <Clock size={12} />
            {course.duration}
          </span>
        </div>
      </div>
    </div>
  )
}

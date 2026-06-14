import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { fetchCourseProgress as fetchCourseProgressApi, fetchCourseInfo } from '../lib/api'
import { motion } from "framer-motion"
import { ArrowRight, BookOpen, Clock } from "lucide-react"

const CompetitionAssessments = () => {
  const locator = useLocation()
  const course = locator.state.course
  const [courseDetails, setcourseDetails] = useState([])
  const navigate = useNavigate()
  const [courseProgress, setCourseProgress] = useState({})
  



  // Function to fetch course progress
    const fetchCourseProgress = async (courseId) => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return false
        
        const userId = jwtDecode(token).id
        const response = await fetchCourseProgressApi(userId, courseId)
        return response.progress?.moduleStatus &&
               response.progress.moduleStatus.some(module => module.completed === true)
      } catch (error) {
        console.error("Error fetching course progress:", error)
        return false
      }
    }
  
    // Function to check if user has progress in a course
    const hasCourseProgress = (courseId) => {
      return courseProgress[courseId] || false
    }

    useEffect(() => {
    const loadCourseProgress = async () => {
      if (courseDetails.length === 0) return
      
      const progressData = {}
      for (const course of courseDetails) {
        const hasProgress = await fetchCourseProgress(course._id)
        progressData[course._id] = hasProgress
      }
      setCourseProgress(progressData)
    }

    loadCourseProgress()
  }, [courseDetails])
  
//   const startQuiz = (quiz) => {
//     navigate("/quiz-overview", { state: { questions: quiz } })
//     console.log(quiz)
//   }


  

  useEffect(() => {
    const fetchCourseDetails = async () => {
      for (let id of course) {
        const response = await fetchCourseInfo(id)
        setcourseDetails((prev) => [...prev, response.course])
      }
    }
    fetchCourseDetails()
  }, [courseDetails])

  return (
    <div className="grid gap-4">
      {courseDetails.map((course, index) => (
        <FeaturedCourseCard key={index} course={course} index={index} hasCourseProgress={hasCourseProgress} />

      ))}
    </div>
  )
}

export default CompetitionAssessments



// Featured Course Card Component
function FeaturedCourseCard({ course, index, hasCourseProgress }) {
  const navigate = useNavigate()
  const hasProgress = hasCourseProgress(course._id)
  
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8, boxShadow: "0 20px 40px -15px rgba(0, 51, 102, 0.15)" }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden">
        <div
          className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: brandColors.primary, color: brandColors.white }}
        >
          Featured
        </div>
        <img
          src={course.thumbnail || "/placeholder.svg"}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
          <span
            className="text-xs font-semibold text-white px-3 py-1 rounded-full"
            style={{ backgroundColor: brandColors.accent }}
          >
            {course.category}
          </span>
          <span className="flex items-center gap-1 text-white text-xs font-medium px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm">
            <Star size={12} fill="white" /> {course.rating}
          </span>
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <div className="flex-grow">
          <h3 className="text-xl font-bold mb-2" style={{ color: brandColors.primary }}>
            {course.title}
          </h3>
          <p className="text-sm mb-4" style={{ color: brandColors.text }}>
            {course.description}
          </p>
        </div>

        <div className="flex items-center gap-4 mb-4 text-xs" style={{ color: brandColors.secondary }}>
          <div className="flex items-center gap-1">
            <Users size={14} />
            {/* <span>{course.registered.length.toLocaleString()-1} {`${course.registered.length-1==1?"student":"students"}`}</span> */}
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{course.duration}</span>
          </div>
        </div>

        {/* <div className="flex flex-wrap gap-2 mb-4">
          {course.tags.map((tag, i) => (
            <span
              key={i}
              className="text-xs px-2 py-1 rounded-full"
              style={{ backgroundColor: `${brandColors.accent}15`, color: brandColors.secondary }}
            >
              {tag}
            </span>
          ))}
        </div> */}

        <button
          className="w-full py-3 rounded-xl font-medium transition-colors text-center"
          style={{
            backgroundColor: brandColors.primary,
            color: brandColors.white,
          }}
          onClick={()=>{ navigate("/course-view",{state: course});localStorage.setItem("courseId",course._id)}}
        >
          {hasProgress ? "Continue" : "Enroll Now"}
        </button>
      </div>
    </motion.div>
  )
}

// Regular Course Card Component
function CourseCard({ course, index, hasCourseProgress }) {
  const hasProgress = hasCourseProgress(course._id)
  
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
          src={course.image || "/placeholder.svg"}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <span
            className="text-xs font-semibold text-white px-2 py-1 rounded-full"
            style={{ backgroundColor: brandColors.accent }}
          >
            {course.category}
          </span>
        </div>
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-2">
            <span
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{ backgroundColor: `${brandColors.primary}15`, color: brandColors.primary }}
            >
              {course.level}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium" style={{ color: brandColors.secondary }}>
              <Star size={12} fill={brandColors.accent} /> {course.rating}
            </span>
          </div>

          <h3 className="text-lg font-bold mb-2" style={{ color: brandColors.primary }}>
            {course.title}
          </h3>
          <p className="text-sm mb-4 line-clamp-2" style={{ color: brandColors.text }}>
            {course.description}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <button
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: brandColors.accent,
              color: brandColors.white,
            }}
          >
            {hasProgress ? "Continue" : "Enroll Now"}
          </button>
          <span className="text-xs flex items-center gap-1" style={{ color: brandColors.secondary }}>
            <Clock size={12} />
            {course.duration}
          </span>
        </div>
      </div>
    </motion.div>
  )
}


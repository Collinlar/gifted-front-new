"use client"
import { getTokenUserId } from "../lib/auth";

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BookOpen, ChevronRight, Clock, Search, Star, Users } from "lucide-react"
import { getCourse } from "../lib/api"
import { jwtDecode } from "jwt-decode"
import { useNavigate, useLocation} from "react-router-dom"
// Brand colors
const brandColors = {
  primary: "#003366",
  secondary: "#336699",
  accent: "#6699CC",
  background: "#F0F4F8",
  text: "#333333",
  white: "#FFFFFF",
}

// Course data
const coursess = [
  {
    title: "Introduction to Computer Science",
    description: "Learn the basics of computer science and programming.",
    image: "/placeholder.svg?height=400&width=600",
    category: "Computer Science",
    rating: 4.8,
    students: 1245,
    duration: "8 weeks",
    level: "Beginner",
    featured: true,
    tags: ["Programming", "Algorithms", "Data Structures"],
  },
  {
    title: "Data Science & Machine Learning",
    description: "Explore data analysis and machine learning algorithms.",
    image: "/placeholder.svg?height=400&width=600",
    category: "Data Science",
    rating: 4.9,
    students: 982,
    duration: "10 weeks",
    level: "Intermediate",
    featured: true,
    tags: ["Python", "Statistics", "Neural Networks"],
  },
  {
    title: "Physics Fundamentals",
    description: "Understand the core concepts of physics and their applications in the real world.",
    image: "/placeholder.svg?height=400&width=600",
    category: "Physical Sciences",
    rating: 4.7,
    students: 756,
    duration: "12 weeks",
    level: "Beginner",
    featured: false,
    tags: ["Mechanics", "Thermodynamics", "Electromagnetism"],
  },
  {
    title: "Engineering Basics",
    description: "Learn essential engineering principles and applications for modern technology.",
    image: "/placeholder.svg?height=400&width=600",
    category: "Engineering",
    rating: 4.6,
    students: 1089,
    duration: "9 weeks",
    level: "Beginner",
    featured: false,
    tags: ["Mechanics", "Materials", "Design"],
  },
  {
    title: "Mathematics for Scientists",
    description: "Strengthen your mathematical foundation with advanced concepts and problem-solving.",
    image: "/placeholder.svg?height=400&width=600",
    category: "Mathematics",
    rating: 4.5,
    students: 678,
    duration: "14 weeks",
    level: "Advanced",
    featured: false,
    tags: ["Calculus", "Linear Algebra", "Probability"],
  },
  {
    title: "Artificial Intelligence",
    description: "Discover the fundamentals of AI, deep learning, and neural networks.",
    image: "/placeholder.svg?height=400&width=600",
    category: "Computer Science",
    rating: 4.9,
    students: 1567,
    duration: "12 weeks",
    level: "Intermediate",
    featured: true,
    tags: ["Machine Learning", "Neural Networks", "Computer Vision"],
  },
  {
    title: "Cybersecurity Essentials",
    description: "Learn how to protect digital systems and networks from cyber threats.",
    image: "/placeholder.svg?height=400&width=600",
    category: "Computer Science",
    rating: 4.7,
    students: 892,
    duration: "8 weeks",
    level: "Intermediate",
    featured: false,
    tags: ["Network Security", "Cryptography", "Ethical Hacking"],
  },
  {
    title: "Renewable Energy Technologies",
    description: "Explore sustainable energy solutions for a greener future.",
    image: "/placeholder.svg?height=400&width=600",
    category: "Engineering",
    rating: 4.8,
    students: 745,
    duration: "10 weeks",
    level: "Intermediate",
    featured: false,
    tags: ["Solar", "Wind", "Hydroelectric"],
  },
]

export default function InvoiceCourse() {
  const [activeFilter, setActiveFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [courses, setCourses]= useState([])
  const [visibleCourses, setVisibleCourses] = useState(courses)
  const [selectedLevel, setSelectedLevel] = useState("All Levels")
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const categories = ["All", ...Array.from(new Set(courses.map((course) => course.category)))]
  const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"]

  const locator = useLocation()

  useEffect(()=>{
    const LoadCourses = async()=>{
      const response = await getCourse(locator.state.name, locator.state.grade)
      const token = localStorage.getItem("token")
      const id = getTokenUserId()
      const paidCourses = [response.course].filter(item =>
        item?.registered?.includes(id)
      );
      console.log(paidCourses)
      
      setCourses(()=>{return [...response.data.course]})
      // quizzes = quizQuestions
      console.log(courses)
    }
    LoadCourses()

  },[])

  useEffect(() => {
    let filtered = courses

    // Apply category filter
    if (activeFilter !== "All") {
      filtered = filtered.filter((course) => course.category === activeFilter)
    }

    // Apply level filter
    if (selectedLevel !== "All Levels") {
      filtered = filtered.filter((course) => course.level === selectedLevel)
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    setVisibleCourses(filtered)
  }, [activeFilter, searchQuery, selectedLevel,courses])

  return (
    <div className="min-h-screen w-full flex-1 bg-gray-50 overflow-auto relative z-10" style={{ backgroundColor: brandColors.background }}>
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
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: brandColors.primary }}>
          {`Course materials for ${locator.state.name}`}
            
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: brandColors.secondary }}>
          {`Grade ${locator.state.grade}`}

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
            <div className="relative w-full md:w-1/3">
              <motion.div
                className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
                animate={{
                  scale: isSearchFocused ? 1.1 : 1,
                  color: isSearchFocused ? brandColors.accent : brandColors.secondary,
                }}
              >
                <Search size={18} />
              </motion.div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                placeholder="Search courses, topics, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                style={{
                  borderColor: `${brandColors.secondary}30`,
                  backgroundColor: isSearchFocused ? brandColors.white : `${brandColors.background}50`,
                  boxShadow: isSearchFocused ? `0 0 0 2px ${brandColors.accent}30` : "none",
                }}
              />
            </div>

            {/* Level Filter */}
            <div className="w-full md:w-auto">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full md:w-auto px-4 py-3 rounded-xl border appearance-none bg-no-repeat focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: `${brandColors.secondary}30`,
                  backgroundImage:
                    'url(\'data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23336699" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>\')',
                  backgroundPosition: "right 10px center",
                  paddingRight: "2.5rem",
                }}
              >
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="ml-auto text-sm" style={{ color: brandColors.secondary }}>
              Showing <span className="font-semibold">{visibleCourses.length}</span> of{" "}
              <span className="font-semibold">{courses.length}</span> courses
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setActiveFilter(category)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: activeFilter === category ? brandColors.primary : brandColors.white,
                  color: activeFilter === category ? brandColors.white : brandColors.primary,
                  border: `1px solid ${activeFilter === category ? brandColors.primary : brandColors.secondary}30`,
                }}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Featured Courses */}
        {visibleCourses.some((course) => course.featured) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: brandColors.primary }}>
                Featured Courses
              </h2>
              <a href="#" className="flex items-center text-sm font-medium" style={{ color: brandColors.accent }}>
                View all <ChevronRight size={16} />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleCourses
                .filter((course) => course.featured)
                .slice(0, 3)
                .map((course, index) => (
                  <FeaturedCourseCard key={index} course={course} index={index} />
                ))}
            </div>
          </motion.div>
        )}

        {/* All Courses Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6" style={{ color: brandColors.primary }}>
            {searchQuery ? "Search Results" : "All Courses"}
          </h2>

          {visibleCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl p-8 text-center"
            >
              <div
                className="mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${brandColors.accent}20` }}
              >
                <Search size={24} style={{ color: brandColors.accent }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: brandColors.primary }}>
                No courses found
              </h3>
              <p style={{ color: brandColors.secondary }}>Try adjusting your search or filter criteria</p>
            </motion.div>
          ) : (
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
              {visibleCourses.map((course, index) => (
                <CourseCard key={index} course={course} index={index} />
              ))}
            </motion.div>
          )}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mt-20 p-8 md:p-12 rounded-2xl text-center relative overflow-hidden"
          style={{ backgroundColor: brandColors.primary }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute top-0 left-0 w-40 h-40 rounded-full"
              style={{ backgroundColor: brandColors.accent, filter: "blur(60px)" }}
            ></div>
            <div
              className="absolute bottom-0 right-0 w-60 h-60 rounded-full"
              style={{ backgroundColor: brandColors.secondary, filter: "blur(80px)" }}
            ></div>
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${brandColors.white}20` }}
            >
              <BookOpen size={28} color={brandColors.white} />
            </motion.div>

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Can't find what you're looking for?</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              We're constantly adding new courses based on student requests and industry trends. Let us know what you'd
              like to learn!
            </p>

            <motion.button
              className="px-6 py-3 rounded-xl font-medium transition-all"
              whileHover={{ scale: 1.05, backgroundColor: brandColors.white, color: brandColors.primary }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: brandColors.accent,
                color: brandColors.white,
              }}
            >
              Request a Course
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Featured Course Card Component
function FeaturedCourseCard({ course, index }) {
  const navigate = useNavigate()
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
          src={course.image || "/placeholder.svg"}
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
            <span>{course.registered.length.toLocaleString()-1} {`${course.registered.length-1==1?"student":"students"}`}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{course.duration}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {course.tags.map((tag, i) => (
            <span
              key={i}
              className="text-xs px-2 py-1 rounded-full"
              style={{ backgroundColor: `${brandColors.accent}15`, color: brandColors.secondary }}
            >
              {tag}
            </span>
          ))}
        </div>

        <button
          className="w-full py-3 rounded-xl font-medium transition-colors text-center"
          style={{
            backgroundColor: brandColors.primary,
            color: brandColors.white,
          }}
          onClick={()=>{ navigate("/course-view",{state: course})}}
        >
          Enroll Now
        </button>
      </div>
    </motion.div>
  )
}

// Regular Course Card Component
function CourseCard({ course, index }) {
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
            Enroll Now
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


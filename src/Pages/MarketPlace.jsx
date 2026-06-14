import { useState,useEffect } from "react"
import { Link } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import {
  Trophy,
  Search,
  Filter,
  Star,
  ShoppingCart,
  Eye,
  BookOpen,
  FileText,
  Brain,
  Headphones,
  Video,
  Download,
  Users,
  Clock,
  Award,
  X,
  ChevronLeft,
  ChevronRight,
  Menu,
  Heart,
  Share2,
  Play,
  CheckCircle,
  ArrowRight,
  RotateCcw
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getAllCoursesInfo, getAllExams } from "../lib/api"

// Price formatting utility
const formatPrice = (price) => {
  return `GH₵${price.toFixed(2)}`
}

const ModernFilter = ({ 
  selectedCategory, 
  setSelectedCategory, 
  priceRange, 
  setPriceRange,
  minRating,
  setMinRating,
  showFilters,
  setShowFilters,
  assets
}) => {
  // Calculate actual counts for each category
  const getCategoryCount = (categoryName) => {
    if (categoryName === "All") {
      return assets.length
    }
    return assets.filter(asset => asset.category === categoryName).length
  }

  // Categories for filtering with dynamic counts
  const categories = [
    { name: "All", icon: <Trophy className="w-4 h-4" />, count: getCategoryCount("All") },
    { name: "Assessment", icon: <FileText className="w-4 h-4" />, count: getCategoryCount("Assessment") },
    { name: "Learning", icon: <Brain className="w-4 h-4" />, count: getCategoryCount("Learning") },
    { name: "Digital Books", icon: <BookOpen className="w-4 h-4" />, count: getCategoryCount("Digital Books") },
    { name: "Video Courses", icon: <Video className="w-4 h-4" />, count: getCategoryCount("Video Courses") },
    { name: "Audio Lessons", icon: <Headphones className="w-4 h-4" />, count: getCategoryCount("Audio Lessons") },
    { name: "Practice Tests", icon: <Award className="w-4 h-4" />, count: getCategoryCount("Practice Tests") }
  ]

  const handlePriceChange = (e, type) => {
    const value = parseInt(e.target.value)
    if (type === 'min') {
      setPriceRange([Math.min(value, priceRange[1] - 5), priceRange[1]])
    } else {
      setPriceRange([priceRange[0], Math.max(value, priceRange[0] + 5)])
    }
  }

  const resetFilters = () => {
    setSelectedCategory("All")
    setPriceRange([0, 100])
    setMinRating(0)
  }

  const RatingSelector = ({ value, onChange }) => {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Minimum Rating</span>
          <span className="text-sm text-gray-500">{value > 0 ? `${value}+` : 'Any'}</span>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onChange(star === value ? 0 : star)}
              className={`p-1 rounded transition-colors ${
                star <= value 
                  ? 'text-yellow-400 hover:text-yellow-500' 
                  : 'text-gray-300 hover:text-gray-400'
              }`}
            >
              <Star 
                className={`w-6 h-6 ${star <= value ? 'fill-current' : ''}`} 
              />
            </button>
          ))}
        </div>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
            style={{
              background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${(value/5)*100}%, #e5e7eb ${(value/5)*100}%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Any</span>
            <span>5★</span>
          </div>
        </div>
      </div>
    )
  }

  const PriceRangeSlider = ({ range, onChange }) => {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Price Range</span>
          <span className="text-sm font-semibold text-sky-600">
            GH₵{range[0]} - GH₵{range[1] >= 100 ? '100+' : range[1]}
          </span>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={range[0]}
            onChange={(e) => onChange(e, 'min')}
            className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb z-10"
            style={{ background: 'transparent' }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={range[1]}
            onChange={(e) => onChange(e, 'max')}
            className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
          />
          <div 
            className="absolute h-2 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg"
            style={{
              left: `${(range[0]/100)*100}%`,
              width: `${((range[1] - range[0])/100)*100}%`
            }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-400">
          <span>Free</span>
          <span>GH₵100+</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div>
            <label className="text-xs text-gray-500">Min Price</label>
            <input
              type="number"
              min="0"
              max="100"
              value={range[0]}
              onChange={(e) => onChange(e, 'min')}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Max Price</label>
            <input
              type="number"
              min="0"
              max="100"
              value={range[1]}
              onChange={(e) => onChange(e, 'max')}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="lg:w-1/4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-sky-600" />
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetFilters}
                className="p-1.5 rounded-lg hover:bg-white/50 transition-colors text-gray-500 hover:text-gray-700"
                title="Reset filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-white/50 transition-colors"
              >
                <X className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-45' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        <div className={`p-6 space-y-8 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-sky-500 rounded-full"></span>
              Categories
            </h4>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-all duration-200 group ${
                    selectedCategory === category.name
                      ? 'bg-gradient-to-r from-sky-100 to-blue-100 text-sky-700 font-medium shadow-sm border border-sky-200'
                      : 'hover:bg-gray-50 text-gray-600 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`transition-colors ${
                      selectedCategory === category.name ? 'text-sky-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`}>
                      {category.icon}
                    </div>
                    <span>{category.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    selectedCategory === category.name 
                      ? 'bg-sky-200 text-sky-700' 
                      : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'
                  }`}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Price Range
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <PriceRangeSlider range={priceRange} onChange={handlePriceChange} />
            </div>
          </div>

          {/* Rating */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              Rating
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <RatingSelector value={minRating} onChange={setMinRating} />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg p-4 border border-sky-100">
            <h4 className="font-semibold text-gray-700 mb-3">Quick Stats</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Items:</span>
                <span className="font-medium text-gray-900">{assets.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Free Resources:</span>
                <span className="font-medium text-green-600">{assets.filter(asset => asset.price === 0).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Premium:</span>
                <span className="font-medium text-sky-600">{assets.filter(asset => asset.price > 0).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #0ea5e9;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        
        .slider-thumb::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #0ea5e9;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}

const Marketplace = () => {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 100])
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState("Popular")
  const [currentPage, setCurrentPage] = useState(1)
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card")
  const [favorites, setFavorites] = useState(new Set())
  const [assets, setAssets] = useState([])
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const itemsPerPage = 12

  // Sample marketplace assets
  const assetss = [
    {
      id: 1,
      title: "Advanced Mathematics Olympiad Preparation",
      category: "Learning",
      price: 49.99,
      originalPrice: 79.99,
      rating: 4.8,
      reviews: 127,
      image: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=400&h=250",
      instructor: "Dr. Sarah Chen",
      duration: "12 weeks",
      students: 2834,
      level: "Advanced",
      description: "Comprehensive preparation for international mathematics olympiads with advanced problem-solving techniques.",
      features: ["70+ Video Lessons", "500+ Practice Problems", "Mock Competitions", "Certificate of Completion"],
      preview: "Get ready to excel in mathematics olympiads with our comprehensive training program...",
      tags: ["Mathematics", "Olympiad", "Advanced", "Problem Solving"],
      bestseller: true
    },
    {
      id: 2,
      title: "Physics Olympiad Assessment Pack",
      category: "Assessment",
      price: 29.99,
      rating: 4.9,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=400&h=250",
      instructor: "Prof. Michael Kumar",
      duration: "Self-paced",
      students: 1245,
      level: "Intermediate",
      description: "Complete assessment package with detailed solutions and performance analytics.",
      features: ["25 Practice Tests", "Detailed Solutions", "Performance Analytics", "Progress Tracking"],
      preview: "Test your physics knowledge with our comprehensive assessment package...",
      tags: ["Physics", "Assessment", "Practice Tests"]
    },
    {
      id: 3,
      title: "Chemistry Fundamentals Digital Textbook",
      category: "Digital Books",
      price: 24.99,
      originalPrice: 39.99,
      rating: 4.7,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&h=250",
      instructor: "Dr. Emma Rodriguez",
      duration: "Lifetime Access",
      students: 3421,
      level: "Beginner",
      description: "Interactive digital textbook covering all fundamental chemistry concepts with animations.",
      features: ["Interactive Diagrams", "Video Explanations", "Practice Exercises", "Mobile Compatible"],
      preview: "Master chemistry fundamentals with our interactive digital textbook...",
      tags: ["Chemistry", "Textbook", "Interactive", "Fundamentals"]
    },
    {
      id: 4,
      title: "Biology Olympiad Video Course Series",
      category: "Video Courses",
      price: 59.99,
      rating: 4.8,
      reviews: 203,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=250",
      instructor: "Dr. James Wilson",
      duration: "16 weeks",
      students: 1876,
      level: "Advanced",
      description: "Complete video course series preparing students for national and international biology olympiads.",
      features: ["100+ HD Videos", "Lab Simulations", "Expert Interviews", "Study Materials"],
      preview: "Dive deep into advanced biology concepts with our expert-led video series...",
      tags: ["Biology", "Video Course", "Olympiad", "Advanced"]
    },
    {
      id: 5,
      title: "Computer Science Algorithm Audio Course",
      category: "Audio Lessons",
      price: 34.99,
      rating: 4.6,
      reviews: 78,
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&h=250",
      instructor: "Alex Thompson",
      duration: "8 weeks",
      students: 967,
      level: "Intermediate",
      description: "Learn complex algorithms through engaging audio lessons perfect for on-the-go learning.",
      features: ["50+ Audio Lessons", "Code Examples", "Downloadable Resources", "Q&A Sessions"],
      preview: "Master computer science algorithms with our comprehensive audio course...",
      tags: ["Computer Science", "Algorithms", "Audio", "Programming"]
    },
    {
      id: 6,
      title: "Mathematical Reasoning Practice Tests",
      category: "Practice Tests",
      price: 19.99,
      rating: 4.9,
      reviews: 234,
      image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&h=250",
      instructor: "Dr. Lisa Park",
      duration: "Self-paced",
      students: 2156,
      level: "All Levels",
      description: "Comprehensive practice test series with detailed explanations and scoring.",
      features: ["30 Practice Tests", "Instant Scoring", "Detailed Explanations", "Progress Reports"],
      preview: "Perfect your mathematical reasoning skills with our extensive practice test series...",
      tags: ["Mathematics", "Practice Tests", "Reasoning", "All Levels"],
      trending: true
    },
    {
      id: 7,
      title: "English Literature Analysis Masterclass",
      category: "Learning",
      price: 44.99,
      rating: 4.7,
      reviews: 112,
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=400&h=250",
      instructor: "Prof. Victoria Hall",
      duration: "10 weeks",
      students: 1543,
      level: "Advanced",
      description: "Deep dive into literary analysis techniques for competitive examinations.",
      features: ["Literary Theory", "Text Analysis", "Writing Workshops", "Peer Reviews"],
      preview: "Enhance your literary analysis skills with expert guidance...",
      tags: ["English", "Literature", "Analysis", "Writing"]
    },
    {
      id: 8,
      title: "Astronomy Observation Guide",
      category: "Digital Books",
      price: 18.99,
      rating: 4.8,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=400&h=250",
      instructor: "Dr. Robert Space",
      duration: "Lifetime Access",
      students: 756,
      level: "Beginner",
      description: "Complete guide to astronomical observations and celestial mechanics.",
      features: ["Star Charts", "Observation Tips", "Equipment Guide", "Seasonal Calendar"],
      preview: "Explore the cosmos with our comprehensive astronomy guide...",
      tags: ["Astronomy", "Observation", "Space", "Beginner"]
    }
  ]

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Get user's grade from JWT token
        let userGrade = null
        try {
          const token = localStorage.getItem("token")
          if (token) {
            const decoded = jwtDecode(token)
            userGrade = decoded.grade
            console.log("User grade from token:", userGrade)
          }
        } catch (tokenError) {
          console.warn("Could not decode token or get user grade:", tokenError)
        }

        // Fetch courses from /all-courses-info
        const coursesResponse = await getAllCoursesInfo()
        const courses = coursesResponse.courses.map(course => ({
          id: course._id || `course-${Math.random()}`,
          title: course.title || "Untitled Course",
          category:  "Learning",
          price: parseFloat(course.cost) || 0,
          rating: 4.5, // Default rating since not in schema
          reviews: Math.floor(Math.random() * 200) + 50, // Random reviews
          image: course.thumbnail || "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=400&h=250",
          instructor: course.instructor || "Instructor", // Default since not in schema
          duration: course.duration || "Self-paced",
          students: Math.floor(Math.random() * 3000) + 500, // Random students
          level: course.level || "Beginner",
          description: course.description || "No description available",
          features: course.features || ["Course Content", "Certificate"],
          preview: course.description || "No preview available",
          tags: course.tags || [],
          publish: course.publish || false,
          grade: course.grade || [],
          program: course.program || [],
          createdAt: course.createdAt,
          updatedAt: course.updatedAt
        }))
        console.log("Loaded courses:", courses)
        console.log("Courses with publish status:", courses.map(c => ({ title: c.title, publish: c.publish, grade: c.grade })))

        // Fetch assessments from /all-exam
        const assessmentsResponse = await getAllExams()
        const assessmentsData = assessmentsResponse.exams.map(assessment => ({
          id: assessment._id || `assessment-${Math.random()}`,
          title: assessment.title || "Untitled Assessment",
          category: "Assessment",
          price: parseFloat(assessment.cost) || 0,
          rating: 4.5, // Default rating
          reviews: Math.floor(Math.random() * 100) + 20, // Random reviews
          image: assessment.image || "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=400&h=250",
          instructor: assessment.instructor || "Instructor",
          duration: `${assessment.time || 60} minutes`,
          students: Math.floor(Math.random() * 1000) + 100, // Random students
          level: assessment.level || "Beginner",
          description: assessment.description || "No description available",
          features: assessment.features || [`${assessment.numberOfQuestions || 0} Questions`, "Instant Results"],
          preview: assessment.description || "No preview available",
          tags: assessment.tags || [],
          publish: assessment.publish || false,
          grade: assessment.grade || [],
          programs: assessment.programs || [],
          numberOfQuestions: assessment.numberOfQuestions || 0,
          attemptsAllowed: assessment.attemptsAllowed || 1,
          allowQuizReview: assessment.allowQuizReview || false,
          questions: assessment.questions || [],
          featured: assessment.featured || false,
          displayScores: assessment.displayScores || true,
          showFeedBackForm: assessment.showFeedBackForm || false,
          registered: assessment.registered || [],
          type: assessment.type || "Quiz",
          shuffleQuestions: assessment.shuffleQuestions || false,
          createdAt: assessment.createdAt,
          updatedAt: assessment.updatedAt
        }))

        // Filter function to check if item matches user's grade
        const matchesUserGrade = (item) => {
          // Helper to extract the first numeric part of a grade string, e.g., "Grade 7" -> "7"
          const extractGradeNumber = (value) => {
            if (value === null || value === undefined) return null
            const str = value.toString()
            const match = str.match(/\d+/)
            return match ? match[0] : null
          }
          // If no user grade, show all items
          if (!userGrade) {
            console.log("No user grade found, showing all items")
            return true
          }
          
          // If item has no grade array or empty grade array, show it (universal)
          if (!item.grade || item.grade.length === 0) {
            console.log(`Item "${item.title}" has no grade restrictions, showing to user grade ${userGrade}`)
            return true
          }
          
          // Check if user's grade is in the item's grade array by comparing only numbers
          const gradeMatch = item.grade.some(grade => {
            const userNum = extractGradeNumber(userGrade)
            const itemNum = extractGradeNumber(grade)
            if (userNum && itemNum) {
              return userNum === itemNum
            }
            // Fallback to previous normalization if numbers aren't present
            const normalizedUserGrade = userGrade.toString().toLowerCase().trim()
            const normalizedItemGrade = grade.toString().toLowerCase().trim()
            if (normalizedUserGrade === normalizedItemGrade) return true
            const userGradeNumber = normalizedUserGrade.replace('grade', '').trim()
            const itemGradeNumber = normalizedItemGrade.replace('grade', '').trim()
            return userGradeNumber === itemGradeNumber
          })
          
          console.log(`Item "${item.title}" grade array: [${item.grade}], user grade: ${userGrade}, match: ${gradeMatch}`)
          return gradeMatch
        }

        // Combine courses and assessments, filter by publish status and user grade
        const allAssets = [
          ...courses.filter(course => course.publish !== false && matchesUserGrade(course)),
          ...assessmentsData.filter(assessment => assessment.publish !== false && matchesUserGrade(assessment))
        ]

        console.log("Final allAssets after grade filtering:", allAssets)
        console.log("Assets by category:", allAssets.reduce((acc, asset) => {
          acc[asset.category] = (acc[asset.category] || 0) + 1;
          return acc;
        }, {}))

        setAssets(allAssets)
        setAssessments(assessmentsData.filter(assessment => assessment.publish !== false && matchesUserGrade(assessment)))
        
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Failed to load courses and assessments. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])
  

  // Filter and search logic
  const filteredAssets = assets.filter(asset => {
    const matchesCategory = selectedCategory === "All" || asset.category === selectedCategory
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (asset.instructor && asset.instructor.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (asset.tags && asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    
    // Temporarily disable price and rating filters for Learning category to debug
    const matchesPrice = selectedCategory === "Learning" ? true : (asset.price >= priceRange[0] && asset.price <= priceRange[1])
    const matchesRating = selectedCategory === "Learning" ? true : (minRating === 0 || asset.rating >= minRating)
    
    // Debug logging for Learning category
    if (selectedCategory === "Learning") {
      console.log(`Asset "${asset.title}":`, {
        category: asset.category,
        matchesCategory,
        matchesSearch,
        matchesPrice,
        matchesRating,
        price: asset.price,
        priceRange,
        rating: asset.rating,
        minRating
      })
    }
    
    return matchesCategory && matchesSearch && matchesPrice && matchesRating
  })

  // Debug: Log filtered assets count
  console.log(`Filtered assets for "${selectedCategory}":`, filteredAssets.length)
  console.log("Filtered assets:", filteredAssets.map(a => ({ title: a.title, category: a.category })))

  // Sort logic
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    switch (sortBy) {
      case "Price Low to High":
        return a.price - b.price
      case "Price High to Low":
        return b.price - a.price
      case "Rating":
        return b.rating - a.rating
      case "Newest":
        return b.id - a.id
      default: // Popular
        return b.students - a.students
    }
  })

  // Pagination
  const totalPages = Math.ceil(sortedAssets.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedAssets = sortedAssets.slice(startIndex, startIndex + itemsPerPage)

  const toggleFavorite = (assetId) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(assetId)) {
      newFavorites.delete(assetId)
    } else {
      newFavorites.add(assetId)
    }
    setFavorites(newFavorites)
  }

  const handleBuyNow = (asset) => {
    setSelectedAsset(asset)
    setShowBuyModal(true)
  }

  const handleCompletePurchase = () => {
    setShowBuyModal(false)
    alert(`Purchase successful! You now have access to "${selectedAsset?.title}"`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 w-full">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 md:h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-sky-600 to-blue-700 shadow-md">
              <Trophy className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
              Gifted 
            </span>
          </Link>

          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search courses, books, assessments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white/90 backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-sky-100 transition-colors">
              <ShoppingCart className="h-6 w-6 text-sky-600" />
            </button>
            <Link to="/overview" className="text-sky-600 hover:text-sky-700 font-medium">
              Back to Home
            </Link>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search marketplace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white/90"
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Modern Filter Component */}
          <ModernFilter
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            minRating={minRating}
            setMinRating={setMinRating}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            assets={assets}
          />

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedCategory === "All" ? "All Resources" : selectedCategory}
                </h2>
                <p className="text-gray-600">
                  {filteredAssets.length} results found
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option>Popular</option>
                    <option>Price Low to High</option>
                    <option>Price High to Low</option>
                    <option>Rating</option>
                    <option>Newest</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
                <span className="ml-3 text-gray-600">Loading courses and assessments...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="text-red-600 mb-2">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Content</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Asset Grid */}
            {!loading && !error && (
              <>
                {displayedAssets.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Results Found</h3>
                    <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {displayedAssets.map((asset) => (
                      <AssetCard
                        key={asset.id}
                        asset={asset}
                        onViewMore={() => setSelectedAsset(asset)}
                        onBuyNow={() => handleBuyNow(asset)}
                        isFavorite={favorites.has(asset.id)}
                        onToggleFavorite={() => toggleFavorite(asset.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentPage === index + 1
                        ? 'bg-sky-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Asset Detail Modal */}
      <AnimatePresence>
        {selectedAsset && !showBuyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAsset(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={selectedAsset.image}
                  alt={selectedAsset.title}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                {selectedAsset.bestseller && (
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Bestseller
                  </span>
                )}
                {selectedAsset.trending && (
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Trending
                  </span>
                )}
              </div>

              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="lg:w-2/3">
                    <h2 className="text-2xl font-bold mb-4">{selectedAsset.title || "Untitled"}</h2>
                    <p className="text-gray-600 mb-6">{selectedAsset.description || "No description available"}</p>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">What you'll get:</h3>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {(selectedAsset.features || []).map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                        {(!selectedAsset.features || selectedAsset.features.length === 0) && (
                          <div className="text-gray-500 text-sm">No features listed</div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {(selectedAsset.tags || []).map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                      {(!selectedAsset.tags || selectedAsset.tags.length === 0) && (
                        <span className="text-gray-500 text-sm">No tags available</span>
                      )}
                    </div>
                  </div>

                  <div className="lg:w-1/3">
                    <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                      <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="text-3xl font-bold text-sky-600">
                            {formatPrice(selectedAsset.price || 0)}
                          </span>
                          {selectedAsset.originalPrice && (
                            <span className="text-lg text-gray-500 line-through">
                              {formatPrice(selectedAsset.originalPrice)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-center gap-1 mb-4">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{selectedAsset.rating || 4.5}</span>
                          <span className="text-gray-600">({selectedAsset.reviews || 0} reviews)</span>
                        </div>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Instructor:</span>
                          <span className="font-medium">{selectedAsset.instructor || "Not specified"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{selectedAsset.duration || "Self-paced"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Students:</span>
                          <span className="font-medium">{(selectedAsset.students || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Level:</span>
                          <span className="font-medium">{selectedAsset.level || "Beginner"}</span>
                        </div>
                        {selectedAsset.category === "Assessment" && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Questions:</span>
                              <span className="font-medium">{selectedAsset.numberOfQuestions || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Attempts:</span>
                              <span className="font-medium">{selectedAsset.attemptsAllowed || 1}</span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="space-y-3">
                        <button
                          onClick={() => handleBuyNow(selectedAsset)}
                          className="w-full bg-gradient-to-r from-sky-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-sky-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="h-5 w-5" />
                          Buy Now
                        </button>
                        <button className="w-full border border-sky-600 text-sky-600 py-3 rounded-lg font-semibold hover:bg-sky-50 transition-colors">
                          Add to Cart
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleFavorite(selectedAsset.id)}
                            className={`flex-1 p-3 rounded-lg border transition-colors ${
                              favorites.has(selectedAsset.id)
                                ? 'border-red-500 text-red-500 bg-red-50'
                                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <Heart className={`h-5 w-5 mx-auto ${favorites.has(selectedAsset.id) ? 'fill-current' : ''}`} />
                          </button>
                          <button className="flex-1 p-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
                            <Share2 className="h-5 w-5 mx-auto" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buy Now Modal */}
      <AnimatePresence>
        {showBuyModal && selectedAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Complete Purchase</h3>
                  <button
                    onClick={() => setShowBuyModal(false)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium mb-2">Purchasing:</h4>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={selectedAsset.image}
                      alt={selectedAsset.title}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div>
                      <h5 className="font-medium">{selectedAsset.title || "Untitled"}</h5>
                      <p className="text-gray-600 text-sm">{selectedAsset.instructor || "Not specified"}</p>
                      <p className="font-bold text-sky-600 mt-1">{formatPrice(selectedAsset.price || 0)}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium mb-3">Payment Method</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-sky-500">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={selectedPaymentMethod === "card"}
                        onChange={() => setSelectedPaymentMethod("card")}
                        className="h-4 w-4 text-sky-600 focus:ring-sky-500"
                      />
                      <div>
                        <span className="font-medium">Credit/Debit Card</span>
                        <p className="text-sm text-gray-500">Pay with Visa, Mastercard, etc.</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-sky-500">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={selectedPaymentMethod === "paypal"}
                        onChange={() => setSelectedPaymentMethod("paypal")}
                        className="h-4 w-4 text-sky-600 focus:ring-sky-500"
                      />
                      <div>
                        <span className="font-medium">PayPal</span>
                        <p className="text-sm text-gray-500">Pay with your PayPal account</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium mb-3">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span>{formatPrice(selectedAsset.price || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span>{formatPrice((selectedAsset.price || 0) * 0.1)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>{formatPrice((selectedAsset.price || 0) * 1.1)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCompletePurchase}
                  className="w-full bg-gradient-to-r from-sky-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-sky-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Complete Purchase
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Asset Card Component
const AssetCard = ({ asset, onViewMore, onBuyNow, isFavorite, onToggleFavorite }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={asset.image}
          alt={asset.title}
          className="w-full h-48 object-cover"
        />
        {asset.bestseller && (
          <span className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Bestseller
          </span>
        )}
        {asset.trending && (
          <span className="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Trending
          </span>
        )}
        <button
          onClick={onToggleFavorite}
          className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
            isFavorite ? 'text-red-500 bg-white/90' : 'text-gray-400 bg-white/90 hover:text-red-500'
          }`}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium px-2 py-1 bg-sky-100 text-sky-700 rounded-full">
            {asset.category || "Learning"}
          </span>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{asset.rating || 4.5}</span>
            <span className="text-xs text-gray-500">({asset.reviews || 0})</span>
          </div>
        </div>

        <h3 className="font-bold mb-2 line-clamp-2">{asset.title || "Untitled"}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{asset.preview || asset.description || "No description available"}</p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-600">{(asset.students || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-600">{asset.duration || "Self-paced"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-sky-600">{formatPrice(asset.price || 0)}</span>
            {asset.originalPrice && (
              <span className="text-xs text-gray-500 line-through ml-1">{formatPrice(asset.originalPrice)}</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onViewMore}
              className="p-2 text-sky-600 hover:bg-sky-100 rounded-full transition-colors"
              title="View details"
            >
              <Eye className="h-5 w-5" />
            </button>
            <button
              onClick={onBuyNow}
              className="p-2 bg-sky-600 text-white hover:bg-sky-700 rounded-full transition-colors"
              title="Buy now"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Marketplace

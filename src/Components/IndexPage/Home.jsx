import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import {
  Trophy,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Menu,
  X,
  Award,
  Zap,
  Star,
  Calendar,
  CheckCircle,
  Globe,
  GraduationCap,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  ArrowUp,
  BookOpen,
  ChevronDown,
  Send,
  MessageCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"

const Home = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [currentHero, setCurrentHero] = useState(0)
  const [openFAQ, setOpenFAQ] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    program: '',
    message: ''
  })
  const [isFormSubmitted, setIsFormSubmitted] = useState(false)
  const contactRef = useRef(null);

  const navigate = useNavigate()

// Hero content that rotates
  const heroContent = [
    {
      title: "Excel in SASMO Mathematics",
      subtitle: "Math Olympiad",
      description: "Comprehensive preparation for SASMO competitions with structured problem-solving techniques and advanced mathematical concepts.",
      image: "/math.jpg",
      service: "Mathematics"
    },
    {
      title: "Master Computer Science", 
      subtitle: "Featured STEM Learning Course",
      description: "Dive deep into programming, algorithms, and computational thinking with our comprehensive computer science curriculum.",
      image: "/us.jpg",
      service: "Technology"
    },
    {
      title: "HIPPO English Excellence",
      subtitle: "Language Arts Competition Prep", 
      description: "Develop advanced English language skills and critical thinking abilities for HIPPO English competitions and beyond.",
      image: "/eng.png",
      service: "English"
    },
    {
      title: "Join Various Communities",
      subtitle: "Connect & Collaborate",
      description: "Join specialized groups to discuss, learn, and collaborate with peers in your field. Build lasting connections in our vibrant STEAM community.",
      image: "/stem.jpg",
      service: "Community"
    }
  ]

  // Programs array
  const programs = [
    {
      title: "Mathematics Olympiad",
      description: "Advanced problem-solving techniques for mathematical competitions at all levels.",
      icon: <Award className="w-8 h-8 md:w-10 md:h-10 text-sky-600" />,
      category: "math",
      features: ["Number Theory", "Algebra", "Geometry", "Combinatorics"],
    },
    {
      title: "Physics Olympiad",
      description: "Conceptual understanding and practical application of physics principles for competitions.",
      icon: <Zap className="w-8 h-8 md:w-10 md:h-10 text-sky-600" />,
      category: "physics",
      features: ["Mechanics", "Electromagnetism", "Thermodynamics", "Modern Physics"],
    },
    {
      title: "Chemistry Olympiad",
      description: "Comprehensive preparation for theoretical and practical chemistry challenges.",
      icon: <Globe className="w-8 h-8 md:w-10 md:h-10 text-sky-600" />,
      category: "chemistry",
      features: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Analytical Methods"],
    },
    {
      title: "Informatics Olympiad",
      description: "Algorithm design, programming skills, and computational thinking for coding competitions.",
      icon: <Trophy className="w-8 h-8 md:w-10 md:h-10 text-sky-600" />,
      category: "informatics",
      features: ["Algorithms", "Data Structures", "Problem Solving", "Competitive Programming"],
    },
    {
      title: "Biology Olympiad",
      description: "Exploration of molecular, cellular, and ecological concepts for biology competitions.",
      icon: <GraduationCap className="w-8 h-8 md:w-10 md:h-10 text-sky-600" />,
      category: "biology",
      features: ["Molecular Biology", "Genetics", "Ecology", "Human Physiology"],
    },
    {
      title: "Astronomy Olympiad",
      description: "Deep dive into celestial mechanics, astrophysics, and observational astronomy.",
      icon: <Star className="w-8 h-8 md:w-10 md:h-10 text-sky-600" />,
      category: "astronomy",
      features: ["Celestial Mechanics", "Astrophysics", "Cosmology", "Observational Techniques"],
    },
  ]

  // Testimonials array
  const testimonials = [
    {
      name: "Alex Chen",
      achievement: "International Math Olympiad Gold Medalist",
      quote: "The structured approach and challenging problems helped me develop the critical thinking skills needed to excel at IMO.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150",
      university: "MIT",
    },
    {
      name: "Sophia Wang",
      achievement: "National Physics Olympiad Silver Medalist",
      quote: "The instructors' expertise and personalized feedback transformed my understanding of complex physics concepts.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&h=150",
      university: "Stanford University",
    },
    {
      name: "Michael Kim",
      achievement: "International Chemistry Olympiad Bronze Medalist",
      quote: "The laboratory practice sessions and problem sets were instrumental in my success at the international level.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150",
      university: "Harvard University",
    },
    {
      name: "Aisha Patel",
      achievement: "International Informatics Olympiad Finalist",
      quote: "The algorithmic thinking skills I developed through this program continue to serve me in my computer science career.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150",
      university: "UC Berkeley",
    },
  ]

  // FAQ Data
  const faqCategories = [
    {
      category: "General Information",
      questions: [
        {
          question: "What age groups do you cater to?",
          answer: "Our programs are designed for students from Grade 2 to Grade 12, with different tracks based on experience level rather than age. We have beginner, intermediate, and advanced courses in each discipline."
        },
    
        {
          question: "What makes Gifted different from other educational centers?",
          answer: "Our instructors are former Olympiad medalists and our curriculum is specifically designed for competitive excellence. We focus on deep conceptual understanding rather than just test preparation."
        }
      ]
    },
    {
      category: "Programs & Curriculum",
      questions: [
        {
          question: "How are the classes structured?",
          answer: "Classes include theoretical lectures, problem-solving sessions, practical labs (for Physics and Chemistry), and mock competitions. Our approach combines conceptual understanding with extensive practice."
        },
        {
          question: "What olympiad subjects do you offer?",
          answer: "We offer training for Mathematics, Physics, Chemistry, Informatics, Biology, and Astronomy Olympiads at national and international levels."
        },
        {
          question: "How long are the programs?",
          answer: "Program duration varies from 3-month intensive courses to year-long comprehensive programs. We also offer summer camps and weekend workshops."
        }
      ]
    }
  ]

  // Contact Info
  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Phone",
      details: ["+233201856818"],
      subtitle: "Mon-Fri: 9AM-6PM"
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      details: ["programs@atdp.africa"],
      subtitle: "We reply within 24 hours"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Address",
      details: [
        "No. 23 Okpelor Abloh Annang Street",
        "Adjiringanor, East Legon - Accra, Ghana.",
      ],
      subtitle: "Visit our campus"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Office Hours",
      details: ["Monday - Friday: 9AM - 6PM", "Saturday: 10AM - 4PM"],
      subtitle: "Sunday: Closed"
    }
  ]

  const programOptions = [
    "Mathematics Olympiad",
    "Physics Olympiad", 
    "Chemistry Olympiad",
    "Informatics Olympiad",
    "Biology Olympiad",
    "Astronomy Olympiad",
    "General Inquiry"
  ]

  // Brand colors with enhanced gradients
  const brandColors = {
    primary: "from-sky-600 to-blue-700",
    secondary: "from-cyan-500 to-sky-600",
    accent: "from-blue-500 to-cyan-500",
    background: "from-slate-50 to-sky-50",
    text: "#1e293b",
    white: "#FFFFFF",
    cardGradient: "from-white to-slate-50",
    heroGradient: "from-sky-600 via-blue-600 to-cyan-600",
    success: "from-emerald-500 to-teal-600",
    contactCard: "from-white/90 via-sky-50/90 to-white/90"
  }

  // Auto-rotate hero content with smooth transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroContent.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowScrollButton(true)
      } else {
        setShowScrollButton(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
    setMobileMenuOpen(false)
  }

  const toggleFAQ = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`
    setOpenFAQ(openFAQ === key ? null : key)
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsFormSubmitted(true)
    setTimeout(() => {
      setIsFormSubmitted(false)
    }, 3000)
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      program: '',
      message: ''
    })
  }

  // Enhanced stats section
  const stats = [
    { value: "15k", label: "Members" },
    { value: "200+", label: "Learning Resources" }, 
    { value: "500+", label: "Assessments Completed" },
    { value: "20+", label: "Communities" },
  ]

  const navItems = [
    { name: "Home", id: "home" },
    { name: "About Us", id: "about-us" },
    // { name: "Programs", id: "programs" },
    // { name: "Success Stories", id: "success-stories" },
    { name: "FAQ", id: "faq" },
    { name: "Contact", id: "contact" }
  ]

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const overflowStyles = `
  body, html {
    overflow-x: hidden;
  }
  * {
    box-sizing: border-box;
  }
  `

  useEffect(() => {
  // Inject CSS to prevent horizontal scrolling
  const style = document.createElement('style')
  style.textContent = `
    body { 
      overflow-x: hidden; 
      max-width: 100vw;
    }
    html {
      overflow-x: hidden;
      max-width: 100vw;
    }
  `
  document.head.appendChild(style)
  
  return () => {
    document.head.removeChild(style)
  }
}, [])

  return (
    <div className="relative flex min-h-screen flex-col w-full bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50">
  {/* Floating particles background - full width with proper stacking */}
  <div className="fixed inset-0 w-screen h-full overflow-hidden pointer-events-none z-0">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-sky-200/30"
        initial={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          width: Math.random() * 10 + 2,
          height: Math.random() * 10 + 2,
          opacity: Math.random() * 0.5 + 0.1
        }}
        animate={{
          y: [0, Math.random() * 100 - 50],
          x: [0, Math.random() * 100 - 50],
          transition: {
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: "reverse"
          }
        }}
      />
    ))}
  </div>


      {/* Header with glass morphism effect */}
         {/* Header with glass morphism effect */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-lg shadow-sm w-full overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex h-16 md:h-20 items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <div className="p-2 rounded-full bg-gradient-to-r from-sky-600 to-blue-700 shadow-md">
              <Trophy className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
              Gifted
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center flex-1 mx-8">
            <div className="flex items-center gap-6 lg:gap-8">
              {navItems.map((item, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => scrollToSection(item.id)}
                  className="text-sm font-medium text-gray-700 hover:text-transparent hover:bg-gradient-to-r hover:from-sky-600 hover:to-blue-700 hover:bg-clip-text transition-all duration-300 cursor-pointer px-3 py-2 rounded-md whitespace-nowrap"
                >
                  {item.name}
                </motion.button>
              ))}
            </div>
          </nav>

          {/* Enhanced Sign In/Sign Up Buttons with subtle animations */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/login">
                <button className="px-4 py-2 lg:px-5 lg:py-2.5 text-sm font-semibold rounded-lg border-2 border-transparent bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-padding text-transparent bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text hover:shadow-lg transition-all duration-300 hover:scale-105 hover:from-sky-700 hover:to-blue-800">
                  Sign In
                </button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link to="/sign-up">
                <button className="px-4 py-2 lg:px-5 lg:py-2.5 text-sm font-bold text-white rounded-lg bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 hover:shadow-xl transition-all duration-300 hover:scale-105 ring-2 ring-offset-2 ring-transparent hover:ring-sky-200">
                  Sign Up 
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Mobile menu button with animation */}
          <motion.button
            className="md:hidden p-2 rounded-md hover:bg-gradient-to-r hover:from-sky-50 hover:to-blue-50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            whileTap={{ scale: 0.9 }}
          >
            {mobileMenuOpen ? (
              <X size={20} className="text-sky-600" />
            ) : (
              <Menu size={20} className="text-sky-600" />
            )}
          </motion.button>
        </div>

        {/* Mobile Navigation Menu with slide animation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden w-full bg-white/95 backdrop-blur-md shadow-lg overflow-hidden"
            >
              <div className="px-4 py-3 space-y-2">
                {navItems.map((item, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => scrollToSection(item.id)}
                    className="block w-full py-2 px-3 text-sm font-medium hover:bg-gradient-to-r hover:from-sky-50 hover:to-blue-50 rounded-md transition-colors cursor-pointer text-left"
                  >
                    {item.name}
                  </motion.button>
                ))}
                {/* Mobile Sign In/Sign Up */}
                <div className="flex items-center gap-2 pt-2 px-3">
                  <Link to="/login" className="flex-1">
                    <button className="w-full px-3 py-2 text-sm font-semibold rounded-lg border-2 border-sky-600 text-sky-600 hover:bg-gradient-to-r hover:from-sky-50 hover:to-blue-50 transition-colors">
                      Sign In
                    </button>
                  </Link>
                  <Link to="/sign-up" className="flex-1">
                    <button className="w-full px-3 py-2 text-sm font-bold text-white rounded-lg bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 transition-colors">
                      Sign Up
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Dynamic Hero Section with enhanced animations */}
      <section
        id="home"
        className="w-full py-12 md:py-20 lg:py-28 relative overflow-hidden bg-gradient-to-br from-sky-600 via-blue-600 to-cyan-600"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-600/30 via-blue-600/30 to-cyan-600/30 animate-gradient-shift"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left Column: Dynamic Text Content */}
            <div className="lg:w-7/12 text-white mb-8 lg:mb-0">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-block px-3 py-1 rounded-full text-xs md:text-sm font-medium mb-4 bg-white/20 border border-white/30 backdrop-blur-sm"
              >
                {heroContent[currentHero].service} Excellence
              </motion.div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentHero}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 md:mb-6">
                    {heroContent[currentHero].title}
                  </h1>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 text-sky-100">
                    {heroContent[currentHero].subtitle}
                  </h2>
                  <p className="text-base md:text-lg lg:text-xl mb-6 md:mb-8 text-gray-100 max-w-2xl">
                    {heroContent[currentHero].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-3 mb-6"
              >
                <button
                  onClick={() =>{navigate("/login")}}
                  className="px-6 py-3 md:px-7 md:py-4 text-sm md:text-base font-bold rounded-lg flex items-center gap-2 group transition-all duration-300 hover:shadow-xl hover:scale-105 bg-white text-sky-700 hover:bg-gradient-to-r hover:from-sky-50 hover:to-blue-50"
                >
                  Sign In
                  <ChevronRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => {navigate("/sign-up")}}
                  className="px-6 py-3 md:px-7 md:py-4 text-sm md:text-base font-semibold bg-white/10 border-2 border-white/30 rounded-lg hover:bg-white/20 transition-all duration-300 text-white hover:scale-105 backdrop-blur-sm"
                >
                  Sign Up
                </button>
              </motion.div>
              
              {/* Progress indicators */}
              <div className="flex gap-2">
                {heroContent.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentHero(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentHero ? 'w-8 bg-white' : 'w-2 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right Column: Dynamic Image with parallax effect */}
            <div className="lg:w-5/12">
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                {/* Enhanced image container with 3D tilt effect */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 rounded-2xl overflow-hidden transform transition-all duration-500 hover:shadow-2xl bg-gradient-to-r from-sky-400 to-cyan-500 p-1"
                >
                  <div className="w-full h-full rounded-2xl overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentHero}
                        src={heroContent[currentHero].image}
                        alt={`${heroContent[currentHero].service} training`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full object-cover"
                      />
                    </AnimatePresence>
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                  </div>
                </motion.div>

                {/* Floating badge with animation */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  className="absolute -bottom-4 -right-4 p-3 bg-gradient-to-r from-cyan-500 to-sky-500 rounded-full shadow-lg z-20 transition-all duration-300"
                >
                  <BookOpen className="h-6 w-6 text-white" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section with animated counters */}
      <section className="w-full py-16 md:py-20 bg-gradient-to-r from-white to-sky-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
              Our Impact in Numbers
            </h2>
            <div className="w-20 h-1 mx-auto mb-6 bg-gradient-to-r from-sky-600 to-blue-700 rounded-full"></div>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                variants={fadeIn}
                className="text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="relative">
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300 bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-base text-gray-600 font-medium">{stat.label}</div>
                  {/* Animated underline with gradient */}
                  <div className="w-0 h-0.5 mx-auto mt-2 group-hover:w-full transition-all duration-300 bg-gradient-to-r from-cyan-400 to-sky-500 rounded-full"></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Us Section with enhanced animations */}
      <section id="about-us" className="w-full py-12 md:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-sky-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            className="flex flex-col md:flex-row items-center gap-8 lg:gap-12"
          >
            <motion.div 
              variants={fadeIn}
              className="md:w-1/2"
            >
              <div className="relative">
                <motion.div 
                  whileHover={{ rotate: -2 }}
                  className="absolute inset-0 bg-gradient-to-br from-blue-200/50 to-purple-200/50 rounded-lg transform -rotate-2"
                ></motion.div>
                <motion.img
                  src="4.avif"
                  alt="Our campus and facilities"
                  className="relative rounded-lg shadow-xl z-10 w-full"
                  whileHover={{ scale: 1.02 }}
                />
              </div>
            </motion.div>

            <motion.div 
              variants={fadeIn}
              className="md:w-1/2"
            >
              <div className="inline-block px-3 py-1 text-sm font-medium rounded-full mb-4 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700">
                About Gifted
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">Cultivating Excellence in Academic Competitions</h2>
              <p className="text-gray-600 mb-6">
                Founded by former Olympiad medalists and passionate educators, Gifted is dedicated to
                nurturing the next generation of academic talent through specialized training, personalized coaching,
                and a supportive learning environment.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  {
                    title: "Expert Instruction",
                    description: "Our faculty consists of former Olympiad medalists, university professors, and industry leaders."
                  },
                  {
                    title: "Proven Methodology", 
                    description: "Our structured curriculum builds both conceptual understanding and problem-solving skills."
                  },
                  {
                    title: "Global Network",
                    description: "Connect with like-minded peers and alumni studying at prestigious universities worldwide."
                  }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    variants={fadeIn}
                    className="flex items-start gap-3"
                  >
                    <div className="p-1 rounded-full bg-gradient-to-r from-green-400 to-blue-500">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section with enhanced animations */}
      <section id="faq" className="w-full py-12 md:py-20 lg:py-24 bg-gradient-to-r from-white to-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <div className="inline-block px-3 py-1 text-sm font-medium rounded-full mb-4 bg-gradient-to-r from-sky-100 to-blue-100 text-sky-700">
              Questions & Answers
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">Frequently Asked Questions</h2>
            <div className="w-20 h-1 mx-auto mb-6 bg-gradient-to-r from-sky-600 to-blue-700 rounded-full"></div>
            <p className="max-w-3xl mx-auto text-gray-600">
              Find answers to common questions about our programs, admissions, and more.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            {faqCategories.map((category, categoryIndex) => (
              <motion.div 
                key={categoryIndex}
                variants={fadeIn}
                className="mb-12"
              >
                <h3 className="text-xl md:text-2xl font-bold mb-6 bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
                  {category.category}
                </h3>
                
                <div className="space-y-4">
                  {category.questions.map((faq, questionIndex) => {
                    const isOpen = openFAQ === `${categoryIndex}-${questionIndex}`
                    
                    return (
                      <motion.div 
                        key={questionIndex}
                        variants={fadeIn}
                        className="bg-gradient-to-br from-white to-slate-50 rounded-lg shadow-md overflow-hidden border border-sky-100"
                      >
                        <button
                          onClick={() => toggleFAQ(categoryIndex, questionIndex)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gradient-to-r hover:from-sky-50 hover:to-blue-50 transition-colors"
                        >
                          <h4 className="text-lg font-semibold pr-4">{faq.question}</h4>
                          <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                          >
                            <ChevronDown className="h-5 w-5 text-sky-600" />
                          </motion.div>
                        </button>
                        
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: isOpen ? 'auto' : 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-4">
                            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                          </div>
                        </motion.div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="w-full py-12 md:py-20 lg:py-24 bg-gradient-to-br from-sky-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 text-sm font-medium rounded-full mb-4 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700">
              Get in Touch
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Contact Us</h2>
            <div className="w-20 h-1 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full"></div>
            <p className="max-w-3xl mx-auto text-gray-600">
              Ready to start your academic journey? We're here to help you every step of the way.
            </p>
          </div>

          {/* Contact Information Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-sky-50 rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow border border-sky-100">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 bg-gradient-to-r from-sky-100 to-blue-100">
                  <div className="text-sky-600">
                    {info.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2 text-sky-700">{info.title}</h3>
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-gray-600 text-sm">{detail}</p>
                ))}
                <p className="text-xs text-gray-500 mt-2">{info.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          {/* <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-lg shadow-lg p-8 border border-sky-100">
              <h3 className="text-xl md:text-2xl font-bold mb-6 text-center bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
                Send us a Message
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                      placeholder="+233201856818"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-2">
                      Program of Interest
                    </label>
                    <select
                      id="program"
                      name="program"
                      value={formData.program}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    >
                      <option value="">Select a program</option>
                      {programOptions.map((program, index) => (
                        <option key={index} value={program}>{program}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors resize-none"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="px-8 py-3 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 mx-auto"
                  >
                    <Send className="h-5 w-5" />
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div> */}
        </div>
      </section>

      {/* Enhanced Footer with gradients */}
      <footer className="w-full text-white py-12 md:py-16 bg-gradient-to-br from-gray-900 via-sky-900 to-blue-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* About Gifted */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-600">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-sky-300 to-cyan-300 bg-clip-text text-transparent">Gifted</span>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Empowering students to achieve academic excellence through specialized olympiad training and personalized coaching.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gradient-to-r hover:from-sky-600 hover:to-cyan-600">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gradient-to-r hover:from-sky-600 hover:to-cyan-600">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gradient-to-r hover:from-sky-600 hover:to-cyan-600">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gradient-to-r hover:from-sky-600 hover:to-cyan-600">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-4 bg-gradient-to-r from-sky-300 to-cyan-300 bg-clip-text text-transparent">Quick Links</h3>
              <ul className="space-y-2">
                {navItems.map((item, index) => (
                  <li key={index}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className="text-gray-300 hover:text-white transition-colors cursor-pointer text-sm hover:bg-gradient-to-r hover:from-sky-600 hover:to-cyan-600 hover:bg-clip-text hover:text-transparent"
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Programs */}
            {/* <div>
              <h3 className="font-bold text-lg mb-4 bg-gradient-to-r from-cyan-300 to-sky-300 bg-clip-text text-transparent">Programs</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Mathematics Olympiad</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Physics Olympiad</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Chemistry Olympiad</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Informatics Olympiad</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Biology Olympiad</a></li>
              </ul>
            </div> */}

            {/* Contact Details */}
            <div>
              <h3 className="font-bold text-lg mb-4 bg-gradient-to-r from-sky-300 to-blue-300 bg-clip-text text-transparent">Contact Details</h3>
              <ul className="space-y-3 text-gray-300 text-sm">
                <li className="flex items-center gap-3">
                  <div className="p-1 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500">
                    <Phone className="h-3 w-3 text-white" />
                  </div>
                  <span>+233201856818</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-1 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500">
                    <Mail className="h-3 w-3 text-white" />
                  </div>
                  <span>programs@atdp.africa</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-1 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <span>
                    No. 23 Okpelor Abloh Annang Street, Adjiringanor, East Legon - Accra, Ghana.
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-1 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500">
                    <Clock className="h-3 w-3 text-white" />
                  </div>
                  <span>Mon-Fri: 9AM-6PM</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Gifted. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button with gradient */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 p-3 rounded-full shadow-lg transition-all duration-300 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white ${showScrollButton ? "opacity-100 visible" : "opacity-0 invisible"}`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  )
}

// Program Card Component with gradient enhancements
const ProgramCard = ({ program, brandColors }) => {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group border border-gray-100 h-full hover:scale-105">
      <div className="p-6 h-full flex flex-col">
        <div className="mb-4 transform group-hover:scale-110 transition-transform p-3 rounded-full bg-gradient-to-r from-sky-100 to-cyan-100 w-fit">
          {program.icon}
        </div>
        <h3 className="text-xl font-bold mb-3 group-hover:bg-gradient-to-r group-hover:from-sky-600 group-hover:to-blue-700 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">{program.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{program.description}</p>
        <div className="mb-4 mt-auto">
          <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Key Topics</h4>
          <div className="grid grid-cols-2 gap-2">
            {program.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-sky-500 to-cyan-600"></div>
                <span className="text-xs text-gray-600">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        <button className="inline-flex items-center font-medium text-sm group-hover:underline mt-2 text-sky-600 hover:bg-gradient-to-r hover:from-sky-600 hover:to-blue-700 hover:bg-clip-text hover:text-transparent transition-all duration-300">
          Learn more <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}

export default Home

"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, ChevronRight, Eye, EyeOff, CheckCircle, Shield, Zap, AlertCircle } from "lucide-react"
import headerImage from "../Components/images/lp10.jpg";
import { loginUser } from "../lib/auth"
import { supabase } from "../lib/supabase"


// Brand colors
const brandColors = {
  primary: "#003366", // Dark blue
  secondary: "#336699", // Medium blue
  accent: "#6699CC", // Light blue
  background: "#F0F4F8", // Light background
  text: "#333333", // Dark text
  white: "#FFFFFF", // White
}

// Custom Button component
const Button = ({ children, onClick, isPrimary, disabled, type = "button", className = "", isLoading = false }) => {
  return (
    <motion.button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base shadow-sm hover:shadow-md flex items-center justify-center gap-2 ${
        isPrimary ? "text-white hover:brightness-110" : "hover:bg-gray-100"
      } ${disabled || isLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      style={{
        backgroundColor: isPrimary ? brandColors.primary : "transparent",
        color: isPrimary ? brandColors.white : brandColors.primary,
        borderColor: brandColors.primary,
        border: isPrimary ? "none" : "1px solid",
      }}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Logging in...
        </>
      ) : (
        children
      )}
    </motion.button>
  )
}

// Custom input field component with floating labels
const InputField = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  required = false,
  placeholder = "",
  icon,
  error = null,
  onForgotPassword = null,
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const actualType = type === "password" && showPassword ? "text" : type

  return (
    <div className="flex flex-col mb-5 relative">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700 ml-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {type === "password" && onForgotPassword && (
          <button type="button" onClick={onForgotPassword} className="text-sm text-blue-600 hover:underline">
            Forgot Password?
          </button>
        )}
      </div>
      <div className="relative">
        <div className="absolute left-3 top-3.5 text-gray-500">{icon}</div>
        <input
          type={actualType}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`pl-10 pr-${type === "password" ? "10" : "4"} py-3 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all ${
            error ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
          }`}
          style={{
            caretColor: brandColors.primary,
          }}
        />
        {type === "password" && (
          <button
            type="button"
            className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center mt-1 text-red-500 text-xs">
          <AlertCircle size={12} className="mr-1" />
          {error}
        </div>
      )}
    </div>
  )
}

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => {
  return (
    <motion.div
      className="flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 hover:bg-white/10"
      whileHover={{ x: 5 }}
    >
      <div className="bg-blue-700 p-2 rounded-full">{icon}</div>
      <div>
        <h3 className="font-semibold text-xl">{title}</h3>
        <p className="opacity-80 mt-1">{description}</p>
      </div>
    </motion.div>
  )
}

// Animated background shapes
const AnimatedBackground = () => {
  return (
    <>
      <motion.div
        className="absolute top-20 right-20 w-64 h-64 rounded-full bg-blue-500 filter blur-3xl opacity-20"
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 15,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-purple-500 filter blur-3xl opacity-20"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 20,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-cyan-500 filter blur-3xl opacity-10"
        animate={{
          x: [0, 50, 0],
          y: [0, 50, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 18,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </>
  )
}

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [migratedEmail, setMigratedEmail] = useState(null)

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    if (!formData.emailOrUsername) {
      newErrors.emailOrUsername = "Email or Username is required"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    // Determine if input is email or username
    const isEmail = /\S+@\S+\.\S+/.test(formData.emailOrUsername)
    
    // Prepare request body with appropriate fields
    const requestBody = {
      password: formData.password,
      ...(isEmail ? { email: formData.emailOrUsername } : { userName: formData.emailOrUsername })
    }

    const response = await loginUser(requestBody)
    if (response.success) {
      setTimeout(() => {
        setIsLoading(false)
        navigate("/overview")
      }, 2000)
    } else {
      // Check if this is a migrated user whose account hasn't been claimed yet
      const isEmail = /\S+@\S+\.\S+/.test(formData.emailOrUsername)
      if (isEmail) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('email')
          .eq('email', formData.emailOrUsername)
          .single()

        if (existingUser) {
          setMigratedEmail(formData.emailOrUsername)
          setIsLoading(false)
          return
        }
      }

      setErrors({ general: response.message || "Incorrect email or password. Try again." })
      setIsLoading(false)
    }
  }

  // Handle forgot password
  const handleForgotPassword = () => {
    navigate("/forgot-password")
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full" style={{ backgroundColor: brandColors.background }}>
      {/* Left side - Branding & Information (visible on medium screens and above) */}
      <div className="hidden md:flex md:w-1/3 lg:w-2/5 text-white flex-col justify-between relative overflow-hidden">
        {/* Background gradient with overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-700 z-0"></div>

        {/* Animated background elements */}
        <AnimatedBackground />

        {/* Main image */}
        <div
          className="absolute inset-0 z-10 opacity-20 bg-center bg-cover"
          style={{
            backgroundImage: `url(${headerImage})`,
            mixBlendMode: "overlay",
          }}
        ></div>

        {/* Content */}
        <div className="p-8 relative z-20 flex-1 flex flex-col">
          <div>
            <div className="flex items-center mb-12">
              <div className="bg-white p-2 rounded-lg mr-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill={brandColors.primary} />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke={brandColors.primary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke={brandColors.primary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">Gifted</h2>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h1 className="text-3xl lg:text-4xl font-bold mb-6">Welcome Back!</h1>
              <p className="text-lg mb-12 opacity-90">
                Sign in to access your personalized dashboard and continue your academic journey.
              </p>
            </motion.div>

            <div className="space-y-6 mt-8">
              <FeatureCard
                icon={<CheckCircle className="h-5 w-5" />}
                title="Track Your Progress"
                description="Monitor your performance and see your improvement over time"
              />

              <FeatureCard
                icon={<Shield className="h-5 w-5" />}
                title="Access Resources"
                description="Unlock exclusive study materials and practice problems"
              />

              <FeatureCard
                icon={<Zap className="h-5 w-5" />}
                title="Join Competitions"
                description="Participate in upcoming olympiads and academic contests"
              />
            </div>
          </div>

          <div className="mt-auto relative z-20">
            <p className="opacity-70 text-sm">
              Don't have an account?{" "}
              <Link to="/sign-up" className="font-medium underline">
                Sign up
              </Link>
            </p>
            <p className="opacity-70 text-sm mt-4">© 2025 Gifted. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: brandColors.primary }}>
              Sign In
            </h1>
            <p className="text-gray-600">Welcome back! Please enter your details</p>
          </div>

          {migratedEmail && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg border"
              style={{ backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: "#1E40AF" }}>
                Your account needs a new password
              </p>
              <p className="text-sm mb-3" style={{ color: "#1D4ED8" }}>
                We moved to a new system. Your scores, courses, and history are safe. Use the phone number you registered with to claim your account.
              </p>
              <button
                type="button"
                onClick={() => navigate("/claim-account")}
                className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white transition-all"
                style={{ backgroundColor: "#1D4ED8" }}
              >
                Claim my account
              </button>
              <button
                type="button"
                onClick={() => setMigratedEmail(null)}
                className="w-full mt-2 py-1.5 text-sm text-center"
                style={{ color: "#6B7280" }}
              >
                Dismiss
              </button>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <InputField
              label="Email or Username"
              type="text"
              name="emailOrUsername"
              value={formData.emailOrUsername}
              onChange={handleChange}
              required
              placeholder="Enter your email or username"
              icon={<Mail size={18} />}
              error={errors.emailOrUsername}
            />

            <InputField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              icon={<Lock size={18} />}
              error={errors.password}
              onForgotPassword={handleForgotPassword}
            />

            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg flex items-center">
                <AlertCircle size={16} className="mr-2" />
                {errors.general}
              </div>
            )}

            <Button isPrimary type="submit" className="w-full mb-4" isLoading={isLoading}>
              Sign In <ChevronRight size={18} />
            </Button>

            {/* Sign-up link (only visible on mobile where branding section is hidden) */}
            <div className="mt-6 text-center md:hidden">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/sign-up" className="font-medium" style={{ color: brandColors.primary }}>
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default Login

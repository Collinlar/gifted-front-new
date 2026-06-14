"use client"

import { useState , useContext , useEffect, useRef, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Shield,
  User,
  Mail,
  Lock,
  Calendar,
  MapPin,
  Phone,
  Globe,
} from "lucide-react"
import headerImage from "../Components/images/lp10.jpg";
import { storeContext } from "../Context";
import { Country } from "country-state-city";

// import { useContext } from "react";

// Brand colors
const brandColors = {
  primary: "#003366", // Dark blue
  secondary: "#336699", // Medium blue
  accent: "#6699CC", // Light blue
  background: "#F0F4F8", // Light background
  text: "#333333", // Dark text
  white: "#FFFFFF", // White
  error: "#DC2626", // Red for errors
  success: "#10B981", // Green for success
  warning: "#F59E0B", // Yellow for warnings
}
let buttonClicked = false
// Custom Button component with improved accessibility
const Button = ({ 
  children, 
  onClick, 
  isPrimary, 
  disabled, 
  type = "button", 
  className = "",
  ariaLabel,
}) => {
  // const [buttonClicked,setButtonClicked]= useState(false)
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel || (typeof children === 'string' ? children : 'Button')}
      className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base shadow-sm hover:shadow-md flex items-center justify-center gap-2 ${
        isPrimary 
          ? "text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-offset-2" 
          : "hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
      } ${
        disabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
      style={{
        backgroundColor: isPrimary ? brandColors.primary : "transparent",
        color: isPrimary ? brandColors.white : brandColors.primary,
        borderColor: brandColors.primary,
        border: isPrimary ? "none" : "1px solid",
      }}
    >
      {children}
    </button>
  )
}

// Enhanced InputField component with persistent placeholders
const InputField = ({ 
  label, 
  type = "text", 
  name, 
  value, 
  onChange, 
  required = false, 
  placeholder = "", 
  icon,
  error,
  onBlur,
  autoComplete,
}) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="flex flex-col mb-5 relative">
      <label
        htmlFor={name}
        className={`absolute left-10 transition-all duration-200 pointer-events-none ${
          isFocused || value ? "top-1 text-xs text-gray-500" : "top-4 text-sm text-gray-700"
        }`}
      >
        {label} {required && (
          <span className="text-red-500">*</span>
        )}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-3.5 text-gray-500" aria-hidden="true">
          {icon}
        </div>
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false)
            if (onBlur) onBlur(e)
          }}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all invalid:border-gray-300 invalid:ring-0"
          style={{
            caretColor: brandColors.primary,
            borderColor: error ? brandColors.error : "#D1D5DB",
          }}
        />
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => {
  return (
    <article className="flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 hover:bg-white/10">
      <div 
        className="bg-blue-700 p-2 rounded-full flex-shrink-0" 
        aria-hidden="true"
      >
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-lg md:text-xl">{title}</h3>
        <p className="opacity-80 mt-1 text-sm md:text-base">{description}</p>
      </div>
    </article>
  )
}

const SignUp = () => {
  const navigate = useNavigate()
  // const navigate = useNavigate()
  const {formData, setFormData, setButtonClicked,buttonClicked} = useContext(storeContext)
  let fieldsCompleted =false

  // Form state with validation
  useEffect(()=>{
    console.log(formData)
  },[formData])
  
  // // Accessibility: magnifier and screen reader
  const contentRef = useRef(null)
  const [zoom, setZoom] = useState(1)

  const countries = useMemo(() => Country.getAllCountries() || [], [])

  const [errors, setErrors] = useState({})
  const [touchedFields, setTouchedFields] = useState({})
  const [currentStep, setCurrentStep] = useState(1)
  const [countrySearch, setCountrySearch] = useState("")
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherPWD, setOtherPWD] = useState("");
  const [PWD, setPWD] = useState("");
  const [nextClicked,setNextClicked]= useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)

  const filteredCountries = useMemo(
    () =>
      countries.filter((c) =>
        c.name.toLowerCase().includes((countrySearch || "").toLowerCase())
      ),
    [countries, countrySearch]
  )

  // const [buttonClicked, setButtonClicked]= useState(false)


  // Debug: log touched/error state for step-3 fields
  useEffect(() => {
    console.log('Step 3 states:', {
      touched: {
        mobileNumber: touchedFields.mobileNumber,
        password: touchedFields.password,
        confirmPassword: touchedFields.confirmPassword,
      },
      errors: {
        mobileNumber: errors.mobileNumber,
        password: errors.password,
        confirmPassword: errors.confirmPassword,
      }
    })
  }, [
    touchedFields.password,
    errors.password,
    touchedFields.confirmPassword,
    errors.confirmPassword,
    touchedFields.mobileNumber,
    errors.mobileNumber,
  ])

  const handlePWDChange = (e) => {
    const value = e.target.value;
    if (value === "Other") {
      setShowOtherInput(true);
      setPWD(""); // Clear current PWD until Other is filled
      
    } else {
      setShowOtherInput(false);
      setOtherPWD("");
      setPWD(value);
      setFormData((prev)=>{return {...prev, PWD:value}})
    }
  };

  const handleOtherChange = (e) => {
    const value = e.target.value
    setOtherPWD(e.target.value);
    setPWD(e.target.value);
    setFormData((prev)=>{return {...prev, PWD:value}})
    

  };
  
  
  const totalSteps = 3

  // Ensure step 3 fields don't show errors immediately upon entering the step
  useEffect(() => {
    if (currentStep === 3) {
      setErrors((prev) => ({
        ...(prev || {}),
        mobileNumber: false,
        password: false,
        confirmPassword: false,
      }))
      setTouchedFields((prev) => ({
        ...(prev || {}),
        mobileNumber: false,
        password: false,
        confirmPassword: false,
      }))
    }
  }, [currentStep])

  // Load saved country and phone number from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const savedCountry = localStorage.getItem("country")
      const savedPhoneNumber = localStorage.getItem("phoneNumber")
      if (savedCountry || savedPhoneNumber) {
        setFormData((prev) => ({
          ...prev,
          ...(savedCountry ? { country: savedCountry } : {}),
          ...(savedPhoneNumber ? { mobileNumber: savedPhoneNumber } : {}),
        }))
        if (savedCountry) {
          setCountrySearch(savedCountry)
        }
      }
    } catch (e) {
      console.error("Error reading from localStorage", e)
    }
  }, [setFormData])

  // Persist country and phone number to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      if (formData.country) {
        localStorage.setItem("country", formData.country)
      }
      if (formData.mobileNumber) {
        localStorage.setItem("phoneNumber", formData.mobileNumber)
      }
    } catch (e) {
      console.error("Error writing to localStorage", e)
    }
  }, [formData.country, formData.mobileNumber])

  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  // Validate mobile number format
  const validateMobileNumber = (number) => {
    const re = /^\+?[\d\s-]{10,}$/
    return re.test(number)
  }

  // Handle input changes with validation
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleCountrySearchChange = (e) => {
    const value = e.target.value
    setCountrySearch(value)
    setIsCountryDropdownOpen(true)

    if (errors.country) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.country
        return newErrors
      })
    }
  }

  const selectCountry = (selectedCountry) => {
    if (!selectedCountry) return

    const selectedName = selectedCountry.name
    setCountrySearch(selectedName)

    setFormData((prev) => {
      let newMobileNumber = prev.mobileNumber
      const dialCode = selectedCountry && selectedCountry.phonecode
        ? `+${selectedCountry.phonecode}`
        : ""

      // If user hasn't typed a full phone yet, or it's just a previous dial code, replace with new dial code
      if (
        !prev.mobileNumber ||
        prev.mobileNumber === dialCode ||
        (prev.mobileNumber.startsWith("+") && prev.mobileNumber.replace(/[^\d]/g, "").length <= 5)
      ) {
        newMobileNumber = dialCode
      }

      return {
        ...prev,
        country: selectedName,
        mobileNumber: newMobileNumber,
      }
    })

    setTouchedFields((prev) => ({ ...prev, country: true }))

    if (errors.country) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.country
        return newErrors
      })
    }

    setIsCountryDropdownOpen(false)
  }

  // Handle field blur (mark as touched and validate)
  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouchedFields((prev) => ({ ...prev, [name]: true }))

    // Validate required fields
    if (!value && (name === 'firstName' || name === 'lastName' || name === 'email' || 
                   name === 'country' || name === 'dob' || name === 'mobileNumber' || 
                   name === 'password' || name === 'confirmPassword'|| name==='PWD')) {
      setErrors((prev) => ({ ...prev, [name]: 'This field is required' }))
      return
    }

    // Specific field validations
    if (name === 'email' && value && !validateEmail(value)) {
      setErrors((prev) => ({ ...prev, [name]: 'Please enter a valid email address' }))
    } else if (name === 'mobileNumber' && value && !validateMobileNumber(value)) {
      setErrors((prev) => ({ ...prev, [name]: 'Please enter a valid phone number' }))
    } else if (name === 'password' && value && passwordStrength.strength < 2) {
      setErrors((prev) => ({ ...prev, [name]: 'Password is too weak' }))
    } else if (name === 'confirmPassword' && value && value !== formData.password) {
      setErrors((prev) => ({ ...prev, [name]: 'Passwords do not match' }))
    }
  }

  // Handle radio button change
  const handleGenderChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      gender: value,
    }))
    // Clear gender error if any
    if (errors.gender) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.gender
        return newErrors
      })
    }
  }

  // Handle interest selection
  const handleInterestChange = (interest) => {
    setFormData((prevData) => {
      const interests = [...prevData.interests]
      if (interests.includes(interest)) {
        return {
          ...prevData,
          interests: interests.filter((i) => i !== interest),
        }
      } else {
        return {
          ...prevData,
          interests: [...interests, interest],
        }
      }
    })
  }

  // Move to next step with validation
  const nextStep = () => {
    let isValid = true
    // Validate current step before proceeding
    const stepErrors = {}
    setNextClicked(true)
    

    if (currentStep === 1) {
      if (!formData.firstName) {
        stepErrors.firstName = 'First name is required'
        isValid = false
      }
      if (!formData.lastName) {
        stepErrors.lastName = 'Last name is required'
        isValid = false
      }
      if (!formData.email) {
        stepErrors.email = 'Email is required'
        isValid = false
      } else if (!validateEmail(formData.email)) {
        stepErrors.email = 'Please enter a valid email address'
        isValid = false
      }
    } else if (currentStep === 2) {
      // setButtonClicked(true)
      if (!formData.country) {
        stepErrors.country = 'Country is required'
        isValid = false
      }
      if (!formData.dob) {
        stepErrors.dob = 'Date of birth is required'
        isValid = false
      }
      if (!formData.gender) {
        stepErrors.gender = 'Gender is required'
        isValid = false
      }
      if(!PWD){
        stepErrors.PWD= 'PWD field is required'
        isValid=false
      }
    }

    if (!isValid) {
      setErrors(stepErrors)
      // Mark all fields as touched to show errors
      const newTouchedFields = {}
      Object.keys(stepErrors).forEach(key => {
        newTouchedFields[key] = true
      })
      setTouchedFields((prev) => ({ ...prev, ...newTouchedFields }))
      return
    }

    const targetStep = currentStep + 1
    if (targetStep === 3) {
      setErrors((prev) => ({
        ...(prev || {}),
        mobileNumber: false,
        password: false,
        confirmPassword: false,
      }))
      setTouchedFields((prev) => ({
        ...(prev || {}),
        mobileNumber: false,
        password: false,
        confirmPassword: false,
      }))
    }
    setCurrentStep(targetStep)
    // Scroll to top of form on step change
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Move to previous step
  const prevStep = () => {
    setCurrentStep((prev) => prev - 1)
    // Scroll to top of form on step change
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Password strength indicator
  const passwordStrength = (() => {
    if (!formData.password) return { strength: 0, text: "", color: "" }

    let strength = 0
    if (formData.password.length >= 8) strength += 1
    if (/[A-Z]/.test(formData.password)) strength += 1
    if (/[0-9]/.test(formData.password)) strength += 1
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1

    const strengthMap = {
      1: { text: "Weak", color: brandColors.error },
      2: { text: "Fair", color: brandColors.warning },
      3: { text: "Good", color: brandColors.success },
      4: { text: "Strong", color: brandColors.primary },
    }

    return {
      strength,
      ...(strengthMap[strength] || { text: "", color: "" }),
    }
  })()

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    const finalErrors = {}
    // setSubmitClicked(true)
    
    // Final validation
    let isValid = true

    if (!formData.mobileNumber) {
      // finalErrors.mobileNumber = 'Mobile number is required'
      isValid = false
    } else if (!validateMobileNumber(formData.mobileNumber)) {
      // finalErrors.mobileNumber = 'Please enter a valid phone number'
      isValid = false
    }
    if(!formData.PWD){
      finalErrors.PWD ="Please fill this side"
      isValid=false
    }

    if (!formData.password) {
      // finalErrors.password = 'Password is required'
      isValid = false
    } else if (passwordStrength.strength < 2) {
      finalErrors.password = 'Password is too weak'
      isValid = false
    }

    if (!formData.confirmPassword) {
      // finalErrors.confirmPassword = 'Please confirm your password'
      isValid = false
    } else if (formData.password !== formData.confirmPassword) {
      finalErrors.confirmPassword = 'Passwords do not match'
      isValid = false
    }

    if (!isValid) {
      setErrors(finalErrors)
      // Mark all fields as touched to show errors
      const newTouchedFields = {}
      Object.keys(finalErrors).forEach(key => {
        newTouchedFields[key] = true
      })
      setTouchedFields((prev) => ({ ...prev, ...newTouchedFields }))
      return
    }

    // In a real app, you would save this data to your backend
    console.log("Form submitted:", formData)

    // Navigate to next page
    navigate("/select-category")
  }

  // Render progress bar with better accessibility
  const ProgressBar = () => {
    return (
      <div className="w-full mb-6 md:mb-10 overflow-auto">
        <div className="flex justify-between mb-3" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps}>
          {[...Array(totalSteps)].map((_, index) => (
            <div key={index} className="flex flex-col items-center relative">
              <div
                className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full text-xs md:text-sm font-medium shadow-sm transition-all duration-300 ${
                  currentStep === index + 1 ? "scale-110" : "scale-100"
                }`}
                style={{
                  backgroundColor:
                    currentStep > index + 1
                      ? brandColors.success
                      : currentStep === index + 1
                        ? brandColors.secondary
                        : brandColors.background,
                  color: currentStep >= index + 1 ? brandColors.white : "#6B7280",
                }}
                aria-current={currentStep === index + 1 ? "step" : undefined}
              >
                {currentStep > index + 1 ? (
                  <span aria-hidden="true">✓</span>
                ) : (
                  <span aria-hidden="true">{index + 1}</span>
                )}
                <span className="sr-only">
                  {currentStep > index + 1
                    ? `Completed step ${index + 1}`
                    : currentStep === index + 1
                      ? `Current step ${index + 1}`
                      : `Step ${index + 1}`}
                </span>
              </div>
              <span
                className="text-xs md:text-sm mt-1 md:mt-2 font-medium"
                style={{
                  color: currentStep === index + 1 ? brandColors.primary : "#6B7280",
                }}
              >
                {index === 0 ? "Account" : index === 1 ? "Personal" : "Security"}
              </span>

              {/* Connect lines between steps */}
              {index < totalSteps - 1 && (
                <div
                  className="absolute h-1 top-4 md:top-5 left-8 md:left-10 w-full -z-10"
                  style={{
                    backgroundColor: currentStep > index + 1 ? brandColors.success : brandColors.background,
                  }}
                  aria-hidden="true"
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Available interests
  const interests = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "Robotics",
    "Astronomy",
    "Literature",
  ]

  return (
    <div className="relative w-full overflow-auto">
      {/* Main content (scaled for magnifier) */}
      <div
        ref={contentRef}
        className="min-h-screen flex flex-col md:flex-row w-full"
        style={{ 
          backgroundColor: brandColors.background,
          transform: zoom !== 1 ? `scale(${zoom})` : undefined,
          transformOrigin: 'top left',
          width: zoom !== 1 ? `${100/zoom}%` : undefined,
        }}
      >
      {/* Left side - Branding & Information (visible on medium screens and above) */}
      <div className="hidden md:flex md:w-1/3 lg:w-2/5 text-white flex-col justify-between relative overflow-hidden">
        {/* Background gradient with overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-700 z-0"></div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>

        {/* Main image */}
        <div
          className="absolute inset-0 z-10 opacity-20 bg-top bg-cover"
          style={{
            backgroundImage:  `url(${headerImage})`,
            // mixBlendMode: "overlay",
          }}
          aria-hidden="true"
        ></div>

        {/* Content */}
        <div className="p-8 relative z-20 flex-1 flex flex-col overflow-auto">
          <div>
            <div className="flex items-center mb-12">
              <div className="bg-white p-2 rounded-lg mr-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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

            <h1 className="text-3xl lg:text-4xl font-bold mb-6">Unlock Your Academic Potential</h1>
            <p className="text-lg mb-12 opacity-90">
              Join our community of talented students and prepare for academic competitions at the highest level.
            </p>

            <div className="space-y-6 mt-8">
              <FeatureCard
                icon={<CheckCircle className="h-5 w-5" />}
                title="Expert Instruction"
                description="Learn from former Olympiad medalists and experienced educators"
              />

              <FeatureCard
                icon={<Shield className="h-5 w-5" />}
                title="Personalized Learning"
                description="Customized study plans based on your strengths and goals"
              />
{/* 
              <FeatureCard
                icon={<Globe className="h-5 w-5" />}
                title="Global Community"
                description="Connect with like-minded peers from around the world"
              /> */}
            </div>
          </div>

          <div className="mt-auto relative z-20">
            <p className="opacity-70 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="font-medium underline hover:no-underline">
                Sign in
              </Link>
            </p>
            <p className="opacity-70 text-sm mt-4">© 2025 Gifted. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-xl">
          <form onSubmit={handleSubmit} noValidate>
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: brandColors.primary }}>
                Create Your Account
              </h1>
              <p className="text-gray-600">
                Step {currentStep} of {totalSteps}:{" "}
                {currentStep === 1 ? "Account Details" : currentStep === 2 ? "Personal Information" : "Security Setup"}
              </p>
            </div>

            <ProgressBar />

            {/* Step 1: Account Information */}
            {currentStep === 1 && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    placeholder="Enter your first name"
                    icon={<User size={18} />}
                    error={touchedFields.firstName && errors.firstName}
                    autoComplete="given-name"
                  />
                  <InputField
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    placeholder="Enter your last name"
                    icon={<User size={18} />}
                    error={touchedFields.lastName && errors.lastName}
                    autoComplete="family-name"
                  />
                </div>
                <InputField
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Enter your email address"
                  icon={<Mail size={18} />}
                  error={touchedFields.email && errors.email}
                  autoComplete="email"
                />
              </div>
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
              <div className="space-y-3">
                <div className="flex flex-col mb-5 relative">
                  <label className="mb-2 text-sm font-medium text-gray-700 ml-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2 relative">
                    <div className="relative">
                      <div className="absolute left-3 top-3.5 text-gray-500" aria-hidden="true">
                        <MapPin size={18} />
                      </div>
                      <input
                        type="text"
                        value={countrySearch}
                        onChange={handleCountrySearchChange}
                        onFocus={() => setIsCountryDropdownOpen(true)}
                        onBlur={() => {
                          setIsCountryDropdownOpen(false)
                          // Trigger validation based on the actual selected country
                          handleBlur({ target: { name: "country", value: formData.country || "" } })
                        }}
                        placeholder="Start typing your country"
                        className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                        style={{
                          caretColor: brandColors.primary,
                          borderColor: (touchedFields.country && errors.country) ? brandColors.error : "#D1D5DB",
                        }}
                        autoComplete="country-name"
                        aria-invalid={!!(touchedFields.country && errors.country)}
                        aria-describedby={(touchedFields.country && errors.country) ? "country-error" : undefined}
                      />
                    </div>
                    {isCountryDropdownOpen && filteredCountries.length > 0 && (
                      <ul className="absolute z-20 mt-1 max-h-48 w-full bg-white border border-gray-300 rounded-md shadow-lg overflow-auto text-sm">
                        {filteredCountries.map((c) => (
                          <li
                            key={c.isoCode}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            // onMouseDown so selection happens before input blur
                            onMouseDown={() => selectCountry(c)}
                          >
                            {c.name} {c.phonecode ? `(+${c.phonecode})` : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {(touchedFields.country && errors.country) && (
                    <p id="country-error" className="mt-1 text-xs text-red-600">
                      {errors.country}
                    </p>
                  )}
                </div>

                <div className="flex flex-col mb-5 relative">
                  <label htmlFor="dob" className="mb-2 text-sm font-medium text-gray-700 ml-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3.5 text-gray-500" aria-hidden="true">
                      <Calendar size={18} />
                    </div>
                    <input
                      id="dob"
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      onBlur={handleBlur}

                      max="2018-12-31"
                      
                      required
                      className="pl-10 pr-16 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                      style={{ 
                        caretColor: brandColors.primary,
                        borderColor: errors.dob ? brandColors.error : "#D1D5DB",
                      }}
                      aria-invalid={!!errors.dob}
                      aria-describedby={errors.dob ? "dob-error" : undefined}
                    />
                    {!formData.dob && (
                      <span className="absolute left-10 top-3.5 text-gray-400 pointer-events-none">
                        {/* Select your date of birth */}
                      </span>
                    )}
                  </div>
                  {errors.dob && (
                    <p id="dob-error" className="mt-1 text-xs text-red-600">
                      {errors.dob}
                    </p>
                  )}
                </div>

                <div className="mb-5">
                  <label className="block mb-2 text-sm font-medium text-gray-700 ml-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      role="radio"
                      aria-checked={formData.gender === "Male"}
                      tabIndex={0}
                      className={`flex items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${
                        formData.gender === "Male" ? "border-2" : "border"
                      }`}
                      style={{
                        borderColor: errors.gender ? brandColors.error : (formData.gender === "Male" ? brandColors.primary : "#D1D5DB"),
                        backgroundColor: formData.gender === "Male" ? brandColors.background : brandColors.white,
                      }}
                      onClick={() => handleGenderChange("Male")}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleGenderChange("Male")
                        }
                      }}
                    >
                      <input
                        type="radio"
                        className="w-4 h-4 mr-2"
                        checked={formData.gender === "Male"}
                        onChange={() => {}}
                        style={{ accentColor: brandColors.primary }}
                        tabIndex={-1}
                      />
                      <span>Male</span>
                    </div>
                    <div
                      role="radio"
                      aria-checked={formData.gender === "Female"}
                      tabIndex={0}
                      className={`flex items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${
                        formData.gender === "Female" ? "border-2" : "border"
                      }`}
                      style={{
                        borderColor: errors.gender ? brandColors.error : (formData.gender === "Female" ? brandColors.primary : "#D1D5DB"),
                        backgroundColor: formData.gender === "Female" ? brandColors.background : brandColors.white,
                      }}
                      onClick={() => handleGenderChange("Female")}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleGenderChange("Female")
                        }
                      }}
                    >
                      <input
                        type="radio"
                        className="w-4 h-4 mr-2"
                        checked={formData.gender === "Female"}
                        onChange={() => {}}
                        style={{ accentColor: brandColors.primary }}
                        tabIndex={-1}
                      />
                      <span>Female</span>
                    </div>
                  </div>
                  {errors.gender && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.gender}
                    </p>
                  )}
                </div>
                <label className="block mb-2 text-sm font-medium text-gray-700 ml-2">Do you have any disability or special need that we should be aware of to better support your participation? <span className="text-red-500">*</span></label>
                <select
                  id="pwd-select"
                  onChange={handlePWDChange}
                  defaultValue=""
                  name="PWD"
                  value={PWD}
                  
                  className= " block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  style={{ borderColor: ((!PWD && buttonClicked) || errors.PWD) ? brandColors.error : "#D1D5DB" }}
                  aria-invalid={!!((!PWD && buttonClicked) || errors.PWD)}
                  aria-describedby={((!PWD && buttonClicked) || errors.PWD) ? "pwd-error" : undefined}
                >
                  <option value="" disabled>Select an option</option>
                  <option value="No">No</option>
                  <option value="Visual impairment">Visual impairment</option>
                  <option value="Hearing impairment">Hearing impairment</option>
                  <option value="Physical/mobility impairment">Physical/mobility impairment</option>
                  <option value="Learning difficulty or neurodivergent condition">
                    Learning difficulty or neurodivergent condition
                  </option>
                  <option value="Other">Other</option>
                </select>

                {showOtherInput && (
                  <div className="mt-4">
                    <label htmlFor="other-pwd" className="block text-sm font-medium text-gray-700 mb-1">
                      Please specify: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="other-pwd"
                      value={otherPWD}
                      onChange={handleOtherChange}
                      placeholder="Type your response here"
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      style={{ borderColor: ((!otherPWD && buttonClicked) || ((!PWD && buttonClicked) || errors.PWD)) ? brandColors.error : "#D1D5DB" }}
                    />
                  </div>
                )}

                <div className="mt-6 text-sm text-gray-600">
                  <strong>Selected:</strong> {PWD || "None selected"}
                </div>
                
             
                {
                  (!PWD&&buttonClicked)&&<span id="pwd-error" className={`mt-1 text-xs text-red-600`}>PWD field is required</span>
                }
                
          
              </div>
            )}

            {/* Step 3: Security Information */}
            {currentStep === 3 && (
              <div className="space-y-3">
                <InputField
                  label="Mobile Number"
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Enter your phone number"
                  icon={<Phone size={18} />}
                  error={touchedFields.mobileNumber && errors.mobileNumber}
                  autoComplete="tel"
                />

                <div className="flex flex-col mb-5 relative">
                  <label htmlFor="password" className="mb-2 text-sm font-medium text-gray-700 ml-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3.5 text-gray-500" aria-hidden="true">
                      <Lock size={18} />
                    </div>
                    <input
                      id="password"
                      type={isPasswordVisible ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Create a password"
                      className="pl-10 pr-16 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all invalid:border-gray-300 invalid:ring-0"
                      style={{
                        borderColor: (touchedFields.password && errors.password) ? brandColors.error : "#D1D5DB",
                      }}
                      aria-invalid={!!(touchedFields.password && errors.password)}
                      aria-describedby={(touchedFields.password && errors.password) ? "password-error" : undefined}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setIsPasswordVisible((v) => !v)}
                      className="absolute right-3 top-2.5 text-sm text-gray-600 hover:text-gray-800"
                      aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                    >
                      {isPasswordVisible ? "Hide" : "Show"}
                    </button>
                  </div>

                  {(touchedFields.password && formData.password) && (
                    <div className="mt-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
                          {passwordStrength.text}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${passwordStrength.strength * 25}%`,
                            backgroundColor: passwordStrength.color,
                          }}
                        ></div>
                      </div>

                      <ul className="text-xs text-gray-500 mt-2 space-y-1">
                        <li className={formData.password.length >= 8 ? "text-green-500" : ""}>
                          • At least 8 characters
                        </li>
                        <li className={/[A-Z]/.test(formData.password) ? "text-green-500" : ""}>
                          • At least 1 uppercase letter
                        </li>
                        <li className={/[0-9]/.test(formData.password) ? "text-green-500" : ""}>• At least 1 number</li>
                        <li className={/[^A-Za-z0-9]/.test(formData.password) ? "text-green-500" : ""}>
                          • At least 1 special character
                        </li>
                      </ul>
                    </div>
                  )}
                  {(touchedFields.password && errors.password) && (
                    <p id="password-error" className="mt-1 text-xs text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex flex-col mb-5 relative">
                  <label htmlFor="confirmPassword" className="mb-2 text-sm font-medium text-gray-700 ml-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3.5 text-gray-500" aria-hidden="true">
                      <Lock size={18} />
                    </div>
                    <input
                      id="confirmPassword"
                      type={isConfirmPasswordVisible ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Confirm your password"
                      className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all invalid:border-gray-300 invalid:ring-0"
                      style={{
                        borderColor: (touchedFields.confirmPassword && errors.confirmPassword) ? brandColors.error : "#D1D5DB",
                      }}
                      aria-invalid={!!(touchedFields.confirmPassword && errors.confirmPassword)}
                      aria-describedby={(touchedFields.confirmPassword && errors.confirmPassword) ? "confirmPassword-error" : undefined}
                  autoComplete="new-password"
                />
                    <button
                      type="button"
                      onClick={() => setIsConfirmPasswordVisible((v) => !v)}
                      className="absolute right-3 top-2.5 text-sm text-gray-600 hover:text-gray-800"
                      aria-label={isConfirmPasswordVisible ? "Hide confirm password" : "Show confirm password"}
                    >
                      {isConfirmPasswordVisible ? "Hide" : "Show"}
                    </button>
                  </div>
                  {(touchedFields.confirmPassword && errors.confirmPassword) && (
                    <p id="confirmPassword-error" className="mt-1 text-xs text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 md:mt-10">
              {currentStep > 1 ? (
                <Button 
                  onClick={prevStep} 
                  className="px-4 sm:px-5"
                  ariaLabel="Go back to previous step"
                >
                  <ChevronLeft size={18} /> Back
                </Button>
              ) : (
                <div></div> // Empty div to maintain spacing with flex justify-between
              )}

              {currentStep < totalSteps ? (
                <Button 
                  isPrimary 
                  onClick={()=>{nextStep(); if(currentStep==2){setButtonClicked(true)}}} 
                  // disabled={!!Object.keys(errors).length}
                  className="px-4 sm:px-5"
                  ariaLabel="Continue to next step"
                >
                  Continue <ChevronRight size={18} />
                </Button>
              ) : (
                <Button 
                  isPrimary 
                  type="submit" 
                  disabled={Object.values(errors).some(Boolean)}
                  className="px-5 sm:px-6"
                  ariaLabel="Create account"
                >
                  Proceed
                </Button>
              )}
            </div>

            {/* Sign-in link (only visible on mobile where branding section is hidden) */}
            <div className="mt-6 text-center md:hidden">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="font-medium hover:underline" style={{ color: brandColors.primary }}>
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      </div>
      
    </div>
  )
}

export default SignUp
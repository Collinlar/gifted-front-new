"use client"

// Core React/Next.js imports
import { useState, useEffect, useRef } from "react"

// UI/Animation libraries
import { motion } from "framer-motion"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Edit2, 
  Save, 
  X, 
  Camera, 
  Calendar, 
  BookOpen, 
  Zap, 
  Clock, 
  Star,
  Lock,
  Settings,
  Activity,
  Edit,
  GraduationCap,
  Target,
  Key
} from "lucide-react"

// Custom Components
import Sidebar from "../Components/common/Sidebar"; // Import the Sidebar
import { jwtDecode } from "jwt-decode";

// Brand colors - matching sidebar for consistency (Ideally, centralize these)
const brandColors = {
  primary: "#003366",
  primaryLight: "#004080",
  secondary: "#336699",
  secondaryLight: "#4080BF",
  accent: "#6699CC",
  accentLight: "#85B8E5",
  background: "#F0F4F8",
  text: "#333333",
  white: "#FFFFFF",
  gray: "#E5E7EB",
  success: "#4CAF50",
  warning: "#FFC107",
  error: "#F44336"
}
import { getUserDetails, updateUserDetails, updateProfilePicture, updateCoverImage } from "../lib/api"
import { resetPassword, getTokenUserId } from "../lib/auth"

// const user =  ||{}

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  
  console.log(months);
  
// Mock user data - in a real app this would come from auth context or API


// const userProfile = {
//   name: `${tokenDisplay().firstName} ${tokenDisplay().lastName}`,
//   role: `${tokenDisplay().category}`,
//   email: `${tokenDisplay().category}`,
//   phone: `${tokenDisplay().mobile}`,
//   location: `${tokenDisplay().location}`,
//   joined: `${tokenDisplay().joined?.split("-")[2].split("T")[0]}-${months[tokenDisplay().joined?.split("-")[1]-1]}-${tokenDisplay().joined?.split("-")[0]}`,
//   avatarUrl: null,
//   bio: "Passionate about cognitive development and advanced learning techniques. I enjoy solving complex problems and exploring new educational concepts.",
//   skills: ["Critical Thinking", "Creative Problem Solving", "Mathematical Reasoning", "Spatial Recognition", "Pattern Analysis"],
//   achievements: [
//     { id: 1, title: "Logic Master", description: "Completed all logic puzzles with 100% accuracy", date: "March 2024", icon: "Zap" },
//     { id: 2, title: "Consistent Learner", description: "Maintained a 30-day learning streak", date: "January 2024", icon: "Clock" },
//     { id: 3, title: "Top Contributor", description: "Ranked in the top 5% of community contributors", date: "February 2024", icon: "Star" }
//   ],
//   stats: {
//     programsCompleted: 7,
//     assessmentsTaken: 12,
//     averageScore: 92,
//     hoursSpent: 48,
//     streak: 14
//   },
//   recentActivities: [
//     { id: 1, type: "assessment", title: "Completed Spatial Reasoning Assessment", date: "2 days ago" },
//     { id: 2, type: "program", title: "Started Advanced Pattern Recognition", date: "4 days ago" },
//     { id: 3, type: "community", title: "Posted a solution to 'Logical Paradox Challenge'", date: "1 week ago" },
//     { id: 4, type: "learning", title: "Completed Module 3: Abstract Reasoning", date: "1 week ago" }
//   ],
//   recommendedPrograms: [
//     { id: 1, title: "Advanced Mathematical Thinking", completion: 0, match: 98 },
//     { id: 2, title: "Creative Problem-Solving Workshop", completion: 0, match: 95 },
//     { id: 3, title: "Visual-Spatial Intelligence Development", completion: 0, match: 92 }
//   ]
// }

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({})
  const [tempProfile, setTempProfile] = useState({})
  const [activeTab, setActiveTab] = useState("overview")
  const [editingField, setEditingField] = useState(null)
  const [formData, setFormData] = useState({})
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [userDetails, setUserDetails] = useState({})
  const [showRegistered, setShowRegistered] = useState(false)
  const [showAddOns, setShowAddOns] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const [showPaid, setShowPaid] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [profileImageLoading, setProfileImageLoading] = useState(true)

  const profileInputRef = useRef(null)
  const coverInputRef = useRef(null)


  // setUpdate(true)
 
 

 
  useEffect(() => {
    const LoadUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = getTokenUserId();
        const response = await getUserDetails(userId);
        if (response.success) {
          setUserDetails(response.user);
        }
      } catch (err) {
        console.error("Error loading user details:", err);
      }
    };

    LoadUserDetails();
    fetchProfileImage();
  }, [editingField]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    const decoded = token ? jwtDecode(token) : null;
    const performance = JSON.parse(localStorage.getItem("performance")) || [];
    const learning = JSON.parse(localStorage.getItem("learning")) || [];

    const createdAt = storedUser?.createdAt;
    const formattedDate = createdAt
      ? new Date(createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "";

    const recent = performance.map((item, id) => ({
      id,
      type: "assessment",
      title: item.title,
      date: item.date,
    }));

    const learningAnalytics = learning.map((item, id) => ({
      id,
      type: "program",
      title: item.title,
      date: item.date,
      completed: item.completed,
    }));

    const recentActivities = [...recent, ...learningAnalytics];

    const performanceAchievement = performance.filter((item) => item.score === 100);
    const learningAchievement = learningAnalytics.filter((item) => item.completed === true);

    const performanceArray = performanceAchievement.map((item, id) => ({
      id,
      description: `A perfect score in ${item.title} assessment`,
      title: "Score Master",
      date: item.date,
      icon: "Star",
    }));

    const learningArray = learningAchievement.map((item, id) => ({
      id,
      description: `Completed a course in ${item.title}`,
      title: "Study Master",
      date: item.date,
      icon: "Star",
    }));

    const achievements = [...learningArray, ...performanceArray];

    const skills = Array.isArray(storedUser?.purposeOfRegistrations) ? storedUser.purposeOfRegistrations : [];

    const userProfile = {
      name: storedUser?.firstName || storedUser?.lastName ? `${storedUser?.firstName || ""} ${storedUser?.lastName || ""}`.trim() : decoded ? `${decoded.firstName || ""} ${decoded.lastName || ""}`.trim() : "",
      email: storedUser?.email || decoded?.email || "",
      role: storedUser?.Category || decoded?.category || "",
      phone: storedUser?.mobileNumber || decoded?.mobile || "",
      location: storedUser?.country || decoded?.location || "",
      joined: formattedDate ? formattedDate.replace(/ /g, "-") : "",
      skills,
      recentActivities,
      achievements,
      recommendedPrograms: [
        { id: 1, title: "Advanced Mathematical Thinking", completion: 0, match: 98 },
        { id: 2, title: "Creative Problem-Solving Workshop", completion: 0, match: 95 },
        { id: 3, title: "Visual-Spatial Intelligence Development", completion: 0, match: 92 },
      ],
      stats: {
        programsCompleted: 7,
        assessmentsTaken: 12,
        averageScore: 92,
        hoursSpent: 48,
        streak: 14,
      },
    };

    setTempProfile(userProfile);
    setProfile(userProfile);
  }, []);
  
  

  // --- State Handlers ---
  const handleInputChange = async(field, value) => {
    const token = localStorage.getItem("token")
    const userId = getTokenUserId()
    setTempProfile(prev => ({ ...prev, [field]: value }))

    await updateUserDetails(userId, tempProfile);

  }

  const handleSkillChange = (index, value) => {
    const newSkills = [...tempProfile.skills]
    newSkills[index] = value
    setTempProfile(prev => ({ ...prev, skills: newSkills }))
  }

  const addSkill = () => {
    setTempProfile(prev => ({ ...prev, skills: [...prev.skills, ""] }))
  }

  const removeSkill = (index) => {
    const newSkills = [...tempProfile.skills]
    newSkills.splice(index, 1)
    setTempProfile(prev => ({ ...prev, skills: newSkills }))
  }

  const saveChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = getTokenUserId();
      
      // Check if email has changed
      if (tempProfile.email !== profile.email) {
        await updateUserDetails(userId, { email: tempProfile.email });
        alert('Email updated successfully!');
      }
      
      // Update local state
      console.log("Saving profile:", tempProfile);
      setProfile(tempProfile);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert('Failed to update profile. Please try again.');
    }
  }

  const cancelEditing = () => {
    setTempProfile(profile) // Reset temp state to original profile
    setIsEditing(false)
  }

  // User Details Editing Functions
  const openEditModal = (fieldName) => {
    setFormData(fieldName === "password"
      ? { oldPassword: "", newPassword: "", confirmPassword: "" }
      : { [fieldName]: userDetails[fieldName] || "" });
    setEditingField(fieldName);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Fetch profile image
  const fetchProfileImage = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = getTokenUserId();
      const response = await getUserDetails(userId);
      if (response.user?.profile_picture) {
        setProfileImage(response.user.profile_picture);
      }
    } catch (err) {
      console.error("Error fetching profile image:", err);
    } finally {
      setProfileImageLoading(false);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    const userId = getTokenUserId();

    if (editingField === "password") {
      const { oldPassword, newPassword, confirmPassword } = formData;
      if (!oldPassword || !newPassword || !confirmPassword) return alert("All password fields are required.");
      if (newPassword !== confirmPassword) return alert("New passwords do not match.");

      try {
        const res = await resetPassword({ password: newPassword });
        alert(res.message);
        setEditingField(null);
      } catch (err) {
        alert("Failed to update password.");
      }
      return;
    }

    const updatedFields = {};
    if (formData[editingField] && formData[editingField] !== userDetails[editingField]) {
      updatedFields[editingField] = formData[editingField];
    }
    if (Object.keys(updatedFields).length === 0) {
      alert("No changes detected.");
      setEditingField(null);
      return;
    }

    try {
      await updateUserDetails(userId, updatedFields);
      setEditingField(null);
    } catch (err) {
      alert("An error occurred while updating your info.");
    }
  };

  const renderEditButton = (fieldName) => (
    <button
      className="ml-2 px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow"
      onClick={() => openEditModal(fieldName)}
    >
      Edit
    </button>
  );

  // --- Helper Functions ---
  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2) // Ensure max 2 initials
      .join('')
      .toUpperCase()
  }

  const getIconComponent = (iconName, defaultIcon = Award) => {
    const iconMap = { Zap, Clock, Star, Activity, BookOpen, User, Lock, Settings };
    return iconMap[iconName] || defaultIcon;
  }

  const getAchievementIcon = (iconName) => getIconComponent(iconName, Award);
  const getActivityIcon = (type) => {
    const typeMap = { assessment: Activity, program: BookOpen, community: User, learning: Zap };
    return typeMap[type] || Clock;
  };

  // --- Render Logic ---
  return (
    // Parent container using Flexbox for Sidebar + Main Content layout
    <div className="flex min-h-screen w-full" style={{ backgroundColor: brandColors.background }}>
      {/* Sidebar Component */}
      {/* The Sidebar component needs to be compatible with this layout. */}
      {/* It should handle its own width and responsiveness. */}
      {/* Assuming the Sidebar component is correctly set up for flex layout (fixed width or relative) */}
      <Sidebar /> 

      {/* Main Content Area */}
      {/* `flex-1` makes this take the remaining width */}
      {/* `overflow-y-auto` allows content scrolling independently of the sidebar */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          
          {/* Header section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900" style={{ color: brandColors.primary }}>My Profile</h1>
            <p className="mt-2 text-gray-600">Manage your personal information and track your progress</p>
          </div>
          
          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex space-x-8" aria-label="Tabs">
              {["overview","userDetails","preferences","security"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ease-in-out ${
                    activeTab === tab 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  style={
                    activeTab === tab 
                      ? { borderColor: brandColors.accent, color: brandColors.primary } 
                      : { color: brandColors.secondary }
                  }
                  aria-current={activeTab === tab ? 'page' : undefined}
                >
                  {tab === "userDetails" ? "User Details" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Tab Content - Render based on activeTab */}

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div // Wrap tab content in motion.div for potential tab transition animations
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left column - Main profile information */}
              <div className="lg:col-span-1 space-y-6">
                {/* Profile Card */}
                <motion.div 
                  className="bg-white rounded-lg shadow overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Cover photo / header */}
                  <div 
                    className="h-32 w-full relative"
                    style={{ 
                      backgroundImage: profile.coverImage 
                        ? `url(${profile.coverImage}?t=${Date.now()})` 
                        : `linear-gradient(to right, ${brandColors.primary}, ${brandColors.accent})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <button 
                      className="absolute bottom-2 right-2 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors border-2 border-gray-200"
                      title="Change cover photo"
                      aria-label="Change cover photo"
                      onClick={() => coverInputRef.current && coverInputRef.current.click()}
                    >
                      <Camera size={20} className="text-gray-600" />
                    </button>
                    {/* Hidden input for cover image upload */}
                    <input
                      type="file"
                      accept="image/*"
                      ref={coverInputRef}
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files && e.target.files[0]
                        if (!file) return
                        try {
                          const token = localStorage.getItem("token")
                          const userId = getTokenUserId()
                          const res = await updateCoverImage(userId, file)
                          if (res.url) {
                            setProfile((prev) => ({ ...prev, coverImage: res.url }))
                            setTempProfile((prev) => ({ ...prev, coverImage: res.url }))
                            alert('Cover image updated successfully!')
                          }
                        } catch (err) {
                          console.error('Error updating cover image', err)
                          alert('Failed to update cover image. Please try again.')
                        } finally {
                          e.target.value = ''
                        }
                      }}
                    />
                  </div>
                  
                  {/* Profile section */}
                  <div className="px-4 pt-0 pb-5 relative">
                    {/* Avatar */}
                    <div className="relative -mt-16 mb-4">
                      <div 
                        className="w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center relative text-white overflow-hidden"
                        style={{ 
                          backgroundColor: profileImage ? brandColors.gray : brandColors.accent,
                          borderColor: brandColors.white
                        }}
                      >
                        {profileImageLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                          </div>
                        ) : profileImage ? (
                          <img 
                            src={`${profileImage}?t=${Date.now()}`} 
                            alt={`${profile.name}'s avatar`} 
                            className="w-full h-full rounded-full object-cover"
                            onError={() => setProfileImage(null)}
                          />
                        ) : (
                          <span className="text-4xl font-bold">{getInitials(profile.name)}</span>
                        )}
                        
                        <button 
                          className="absolute bottom-0 right-0 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors border-2 border-gray-200"
                          title="Change profile picture"
                          aria-label="Change profile picture"
                          onClick={() => profileInputRef.current && profileInputRef.current.click()}
                        >
                          <Camera size={20} className="text-gray-600" />
                        </button>
                        {/* Hidden input for profile image upload */}
                        <input
                          type="file"
                          accept="image/*"
                          ref={profileInputRef}
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files && e.target.files[0]
                            if (!file) return
                            try {
                              const token = localStorage.getItem("token")
                              const userId = getTokenUserId()
                              const res = await updateProfilePicture(userId, file)
                              if (res.url) {
                                setProfile((prev) => ({ ...prev, avatarUrl: res.url }))
                                setTempProfile((prev) => ({ ...prev, avatarUrl: res.url }))
                                setProfileImage(`${res.url}?t=${Date.now()}`)
                                alert('Profile image updated successfully!')
                              }
                            } catch (err) {
                              console.error('Error updating profile image', err)
                              alert('Failed to update profile image. Please try again.')
                            } finally {
                              e.target.value = ''
                            }
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Edit/Save buttons */}
                    <div className="absolute top-4 right-4 flex space-x-2">
                      {isEditing ? (
                        <>
                          <motion.button 
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={saveChanges}
                            className="p-2 rounded-md text-white shadow"
                            style={{ backgroundColor: brandColors.success }}
                            title="Save changes" aria-label="Save changes"
                          >
                            <Save size={16} />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={cancelEditing}
                            className="p-2 rounded-md text-white shadow"
                            style={{ backgroundColor: brandColors.error }}
                            title="Cancel editing" aria-label="Cancel editing"
                          >
                            <X size={16} />
                          </motion.button>
                        </>
                      ) : (
                        <motion.button 
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => setIsEditing(true)}
                          className="p-2 rounded-md text-white shadow"
                          style={{ backgroundColor: brandColors.secondary }}
                          title="Edit profile" aria-label="Edit profile"
                        >
                          <Edit2 size={16} />
                        </motion.button>
                      )}
                    </div>
                    
                    {/* Name and role */}
                    <div className="text-center mb-4 mt-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={tempProfile.name}
                          onChange={(e) => handleInputChange('userName', e.target.value)}
                          className="text-xl font-bold text-center w-full mb-1 p-1 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 rounded-t-md"
                          style={{ color: brandColors.text }}
                          aria-label="Edit name"
                        />
                      ) : (
                        <h2 className="text-xl font-bold" style={{ color: brandColors.text }}>{profile.name}</h2>
                      )}
                      
                      {isEditing ? (
                        <input
                          type="text"
                          value={tempProfile.role}
                          onChange={(e) => handleInputChange('Category', e.target.value)}
                          className="text-sm text-center w-full p-1 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 rounded-t-md"
                          style={{ color: brandColors.secondary }}
                           aria-label="Edit role"
                        />
                      ) : (
                        <p className="text-sm" style={{ color: brandColors.secondary }}>{profile.role}</p>
                      )}
                    </div>
                    
                    {/* Contact information */}
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Mail size={16} className="text-gray-400 mr-3 flex-shrink-0" />
                        {isEditing ? (
                          <input
                            type="email"
                            value={tempProfile.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="flex-1 p-1 border-b border-gray-300 focus:outline-none focus:border-blue-500 min-w-0"
                            aria-label="Edit email"
                          />
                        ) : (
                          <span className="truncate">{profile.email}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Phone size={16} className="text-gray-400 mr-3 flex-shrink-0" />
                        {isEditing ? (
                          <input
                            type="tel"
                            value={tempProfile.phone}
                            onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                            className="flex-1 p-1 border-b border-gray-300 focus:outline-none focus:border-blue-500 min-w-0"
                             aria-label="Edit phone number"
                          />
                        ) : (
                          <span className="truncate">{profile.phone}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <MapPin size={16} className="text-gray-400 mr-3 flex-shrink-0" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={tempProfile.location}
                            onChange={(e) => handleInputChange('country', e.target.value)}
                            className="flex-1 p-1 border-b border-gray-300 focus:outline-none focus:border-blue-500 min-w-0"
                             aria-label="Edit location"
                          />
                        ) : (
                          <span className="truncate">{profile.location}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Calendar size={16} className="text-gray-400 mr-3 flex-shrink-0" />
                        <span>Member since {profile.joined}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Bio Section */}
                {/* <motion.div 
                  className="bg-white rounded-lg shadow p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <h3 className="text-lg font-medium mb-3" style={{ color: brandColors.primary }}>About Me</h3>
                  {isEditing ? (
                    <textarea
                      value={tempProfile.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-700"
                      rows={5}
                      aria-label="Edit bio"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 leading-relaxed">{profile.bio || "No bio provided."}</p>
                  )}
                </motion.div> */}
                
                {/* Skills Section */}
                {/* <motion.div 
                  className="bg-white rounded-lg shadow p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <h3 className="text-lg font-medium mb-3" style={{ color: brandColors.primary }}>Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(isEditing ? tempProfile.skills : profile.skills).map((skill, index) => (
                      <div 
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm flex items-center group ${ isEditing ? 'border border-dashed border-transparent hover:border-gray-300' : '' }`}
                        style={{ 
                          backgroundColor: brandColors.accent + '20',
                          color: brandColors.primary
                        }}
                      >
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              value={skill}
                              onChange={(e) => handleSkillChange(index, e.target.value)}
                              className="bg-transparent focus:outline-none w-auto max-w-[150px] mr-1 p-0 text-sm"
                              style={{ color: brandColors.primary }}
                              placeholder="New skill"
                              aria-label={`Edit skill ${index + 1}`}
                            />
                            <button 
                              onClick={() => removeSkill(index)}
                              className="ml-1 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label={`Remove skill ${skill || 'New skill'}`}
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          skill
                        )}
                      </div>
                    ))}
                    
                    {isEditing && (
                      <button
                        onClick={addSkill}
                        className="px-3 py-1 rounded-full text-sm border border-dashed hover:bg-gray-50 transition-colors"
                        style={{
                          borderColor: brandColors.accent,
                          color: brandColors.accent
                        }}
                         aria-label="Add a new skill"
                      >
                        + Add Skill
                      </button>
                    )}
                  </div>
                </motion.div> */}
                
                {/* Security and Settings link cards */}
                {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.button 
                    className="bg-white rounded-lg shadow p-4 flex items-center text-left hover:shadow-md transition-shadow w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    onClick={() => setActiveTab("security")}
                    aria-label="Go to Security Settings"
                  >
                    <div className="p-3 rounded-lg mr-3 flex-shrink-0" style={{ backgroundColor: brandColors.primary + '15' }}>
                      <Lock size={20} style={{ color: brandColors.primary }} />
                    </div>
                    <div>
                      <h3 className="font-medium" style={{ color: brandColors.primary }}>Security</h3>
                      <p className="text-xs text-gray-500">Password & 2FA</p>
                    </div>
                  </motion.button>
                  
                  <motion.button 
                    className="bg-white rounded-lg shadow p-4 flex items-center text-left hover:shadow-md transition-shadow w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    onClick={() => setActiveTab("preferences")}
                    aria-label="Go to Preferences"
                  >
                    <div className="p-3 rounded-lg mr-3 flex-shrink-0" style={{ backgroundColor: brandColors.primary + '15' }}>
                      <Settings size={20} style={{ color: brandColors.primary }} />
                    </div>
                    <div>
                      <h3 className="font-medium" style={{ color: brandColors.primary }}>Preferences</h3>
                      <p className="text-xs text-gray-500">App & Learning</p>
                    </div>
                  </motion.button>
                </div> */}
              </div>
              
              {/* Right column - Stats, achievements, activities */}
              <div className="lg:col-span-2 space-y-6">
                {/* Stats cards */}
                {/* <motion.div 
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {[
                      { label: "Programs", value: profile.stats.programsCompleted, color: brandColors.primary },
                      { label: "Assessments", value: profile.stats.assessmentsTaken, color: brandColors.primary },
                      { label: "Avg. Score", value: `${profile.stats.averageScore}%`, color: brandColors.primary },
                      { label: "Hours", value: profile.stats.hoursSpent, color: brandColors.primary },
                      { label: "Streak", value: `${profile.stats.streak} days`, color: brandColors.success },
                  ].map(stat => (
                      <div key={stat.label} className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition-shadow">
                        <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-xl sm:text-2xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
                      </div>
                  ))}
                </motion.div> */}
                
                {/* Achievements */}
                <motion.div 
                  className="bg-white rounded-lg shadow p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <h3 className="text-lg font-medium mb-4" style={{ color: brandColors.primary }}>Achievements</h3>
                  {profile.achievements && profile.achievements.length > 0 ? (
                    <div className="space-y-4">
                      {profile.achievements.map((achievement) => {
                        const AchievementIcon = getAchievementIcon(achievement.icon)
                        return (
                          <div key={achievement.id} className="flex items-start sm:items-center space-x-4">
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: brandColors.accent + '20' }}
                            >
                              <AchievementIcon size={24} style={{ color: brandColors.accent }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm sm:text-base" style={{ color: brandColors.primary }}>{achievement.title}</h4>
                              <p className="text-xs sm:text-sm text-gray-600">{achievement.description}</p>
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap pt-1 sm:pt-0">{achievement.date}</div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                     <p className="text-sm text-gray-500">No achievements earned yet.</p>
                  )}
                </motion.div>
                
                {/* Recent Activity */}
                <motion.div 
                  className="bg-white rounded-lg shadow p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <h3 className="text-lg font-medium mb-4" style={{ color: brandColors.primary }}>Recent Activity</h3>
                  {profile.recentActivities && profile.recentActivities.length > 0 ? (
                    <div className="space-y-3">
                      {profile.recentActivities.slice(0, 5).map((activity) => { // Show limited activities
                        const ActivityIcon = getActivityIcon(activity.type)
                        return (
                          <div key={activity.id} className="flex items-center py-2 border-b border-gray-100 last:border-b-0">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                              style={{ backgroundColor: brandColors.accent + '15' }}
                            >
                              <ActivityIcon size={18} style={{ color: brandColors.accent }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 truncate">{activity.title}</p>
                              <p className="text-xs text-gray-500">{activity.date}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    ) : (
                       <p className="text-sm text-gray-500">No recent activity.</p>
                    )}
                </motion.div>
                
              </div>
            </motion.div>
          )}
          
          {/* Security Tab */}
          {activeTab === "security" && (
            <motion.div 
              key="security"
              className="bg-white rounded-lg shadow p-6 lg:p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: brandColors.primary }}>Account Security</h2>
              <p className="text-gray-600 mb-8 text-sm">Manage your password, two-factor authentication, and account deletion.</p>
              
              <div className="space-y-8">
                {/* Change Password Section */}
                <section>
                  <h3 className="text-lg font-medium mb-4 border-b pb-2" style={{ color: brandColors.primary, borderColor: brandColors.gray }}>Change Password</h3>
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}> {/* Prevent default form submission */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="current-password">Current Password</label>
                      <input 
                        type="password" 
                        id="current-password"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your current password"
                        autoComplete="current-password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="new-password">New Password</label>
                      <input 
                        type="password" 
                        id="new-password"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter new password (min. 8 characters)"
                        autoComplete="new-password"
                        minLength={8} // Basic validation hint
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirm-password">Confirm New Password</label>
                      <input 
                        type="password" 
                        id="confirm-password"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                      />
                       {/* Add password confirmation logic here if needed */}
                    </div>
                    <div className="pt-2">
                      <button 
                        type="submit"
                        className="px-4 py-2 rounded-md text-sm font-medium text-white transition-colors"
                        style={{ backgroundColor: brandColors.primary }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = brandColors.primaryLight}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = brandColors.primary}
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                </section>
                
                
                {/* Danger Zone Section */}
                <section className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium mb-3" style={{ color: brandColors.error }}>Danger Zone</h3>
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <h4 className="font-medium text-red-800">Delete Account</h4>
                    <p className="text-sm text-red-700 mt-1 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
                    <button 
                      className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                      // Add onClick handler with confirmation dialog
                      onClick={() => { if(window.confirm('Are you absolutely sure you want to delete your account? This is irreversible.')) { console.log("Account deletion initiated...") } }}
                    >
                      Delete My Account
                    </button>
                  </div>
                </section>
              </div>
            </motion.div>  
          )}
          
          {/* User Details Tab */}
          {activeTab === "userDetails" && (
            <motion.div 
              key="userDetails"
              className="bg-white rounded-xl shadow-lg p-8 max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2" style={{ color: brandColors.primary }}>User Details</h2>
                <p className="text-gray-600">Manage your personal information and preferences</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-gray-600 font-medium">Username</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 font-semibold">{userDetails.userName || "Not set"}</span>
                        <button 
                          onClick={() => openEditModal("userName")}
                          className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          title="Edit username"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-gray-600 font-medium">First Name</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 font-semibold">{userDetails.firstName || "Not set"}</span>
                        <button 
                          onClick={() => openEditModal("firstName")}
                          className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          title="Edit first name"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-gray-600 font-medium">Last Name</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 font-semibold">{userDetails.lastName || "Not set"}</span>
                        <button 
                          onClick={() => openEditModal("lastName")}
                          className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          title="Edit last name"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-gray-600 font-medium">Email</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 font-semibold">{userDetails.email || "Not set"}</span>
                        <button 
                          onClick={() => openEditModal("email")}
                          className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          title="Edit email"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-gray-600 font-medium">Gender</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 font-semibold">{userDetails.gender || "Not set"}</span>
                        <button 
                          onClick={() => openEditModal("gender")}
                          className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          title="Edit gender"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-gray-600 font-medium">Mobile</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 font-semibold">{userDetails.mobileNumber || "Not set"}</span>
                        <button 
                          onClick={() => openEditModal("mobileNumber")}
                          className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          title="Edit mobile number"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-gray-600 font-medium">Country</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 font-semibold">{userDetails.country || "Not set"}</span>
                        <button 
                          onClick={() => openEditModal("country")}
                          className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          title="Edit country"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Education Information Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <GraduationCap className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Education</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-gray-600 font-medium">Level</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 font-semibold">{userDetails.educationalLevel || "Not set"}</span>
                        <button 
                          onClick={() => openEditModal("educationalLevel")}
                          className="p-1 text-green-500 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                          title="Edit educational level"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-gray-600 font-medium">School</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 font-semibold">{userDetails.School || "Not set"}</span>
                        <button 
                          onClick={() => openEditModal("School")}
                          className="p-1 text-green-500 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                          title="Edit school"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-gray-600 font-medium">Grade</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 font-semibold">{userDetails.grade || "Not set"}</span>
                        <button 
                          onClick={() => openEditModal("grade")}
                          className="p-1 text-green-500 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                          title="Edit grade"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interest & Purpose Card */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Interest & Purpose</h3>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-sm font-medium text-gray-600">Purpose of Registration</h4>
                      <button 
                        onClick={() => openEditModal("purposeOfRegistration")}
                        className="p-1 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors"
                        title="Edit purpose of registration"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                    </div>
                    {userDetails.purposeOfRegistration && userDetails.purposeOfRegistration.length > 0 ? (
                      <ul className="space-y-2">
                        {userDetails.purposeOfRegistration.map((item, i) => (
                          <li key={i} className="flex items-center">
                            <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">No purpose of registration specified.</p>
                    )}
                  </div>
                </div>

                {/* Security Card */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <Lock className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Security</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-gray-600 font-medium">Password</span>
                      <span className="text-gray-900 font-semibold">••••••••</span>
                    </div>
                    
                    <button 
                      onClick={() => openEditModal("password")}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Change Password
                    </button>
                  </div>
                </div>
              </div>


            </motion.div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <motion.div 
              key="preferences"
              className="bg-white rounded-lg shadow p-6 lg:p-8 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: brandColors.primary }}>Preferences</h2>
              <p className="text-gray-600 mb-8 text-sm">Customize your Gifted experience, including appearance, learning style, and accessibility options.</p>
              
              {/* Form for preferences */}
              <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
                {/* App Settings Section */}
                <section>
                  <h3 className="text-lg font-medium mb-4 border-b pb-2" style={{ color: brandColors.primary, borderColor: brandColors.gray }}>App Settings</h3>
                  <div className="space-y-5">
                    {/* Dark Mode Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="darkModeToggle" className="font-medium text-gray-800 cursor-pointer">Dark Mode</label>
                        <p className="text-sm text-gray-500">Switch between light and dark themes.</p>
                      </div>
                      <label htmlFor="darkModeToggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="darkModeToggle" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
                     
                        ></div>
                      </label>
                    </div>
                    {/* Add other toggles (Compact View, Auto-play Videos) similarly */}
                  </div>
                </section>
                
                 {/* Learning Preferences Section */}
                <section className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium mb-4" style={{ color: brandColors.primary }}>Learning Preferences</h3>
                  <div className="space-y-6">
                    {/* Learning Style Dropdown */}
                    <div>
                      <label htmlFor="learningStyle" className="block text-sm font-medium text-gray-700 mb-1">Preferred Learning Style</label>
                      <select id="learningStyle" className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500">
                        <option>Visual</option>
                        <option>Auditory</option>
                        <option>Kinesthetic</option>
                        <option>Reading/Writing</option>
                        <option selected>Multimodal (Default)</option> {/* Example selected */}
                      </select>
                    </div>
                    {/* Add Difficulty Level, Focus Areas, Daily Goal similarly */}
                    <div>
                        <label htmlFor="dailyGoal" className="block text-sm font-medium text-gray-700 mb-1">Daily Learning Goal</label>
                        <div className="flex space-x-2 items-center">
                        <input 
                            type="number" 
                            id="dailyGoalValue"
                            className="w-20 p-2 border border-gray-300 rounded-md" 
                            defaultValue="30" min="5" step="5"
                        />
                        <select id="dailyGoalUnit" className="p-2 border border-gray-300 rounded-md bg-white">
                            <option>minutes</option>
                            <option>modules</option>
                            <option>lessons</option>
                        </select>
                        </div>
                    </div>
                  </div>
                </section>

                {/* Language & Accessibility Section */}
                <section className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium mb-4" style={{ color: brandColors.primary }}>Language & Accessibility</h3>
                  <div className="space-y-6">
                    {/* Language Dropdown */}
                     <div>
                        <label htmlFor="languageSelect" className="block text-sm font-medium text-gray-700 mb-1">Interface Language</label>
                        <select id="languageSelect" className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500">
                            <option>English (US)</option>
                            <option>English (UK)</option>
                            {/* Add other languages */}
                        </select>
                    </div>
                    {/* Add Text Size, High Contrast Mode similarly */}
                     <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="highContrastToggle" className="font-medium text-gray-800 cursor-pointer">High Contrast Mode</label>
                        <p className="text-sm text-gray-500">Increase text contrast for better readability.</p>
                      </div>
                      <label htmlFor="highContrastToggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="highContrastToggle" className="sr-only peer" />
                         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </section>
                
                {/* Save Button */}
                <div className="flex justify-end border-t border-gray-200 pt-6">
                  <button 
                    type="submit"
                    className="px-6 py-2 rounded-md text-sm font-medium text-white transition-colors"
                    style={{ backgroundColor: brandColors.primary }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = brandColors.primaryLight}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = brandColors.primary}
                  >
                    Save Preferences
                  </button>
                </div>
              </form>
            </motion.div>
          )}
          
          {/* Notifications Tab */}
          {activeTab === "notifications" && (
             <motion.div 
              key="notifications"
              className="bg-white rounded-lg shadow p-6 lg:p-8 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
               <h2 className="text-xl font-bold mb-6" style={{ color: brandColors.primary }}>Notification Settings</h2>
              <p className="text-gray-600 mb-8 text-sm">Choose how and when you want to be notified about updates, progress, and community activity.</p>

              <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
                {/* Email Notifications Section */}
                <section>
                  <h3 className="text-lg font-medium mb-4 border-b pb-2" style={{ color: brandColors.primary, borderColor: brandColors.gray }}>Email Notifications</h3>
                  <p className="text-sm text-gray-500 mb-4">Receive important updates directly in your inbox ({profile.email}).</p>
                  <div className="space-y-5">
                    {/* Example Toggle: Program Updates */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="emailProgramUpdates" className="font-medium text-gray-800 cursor-pointer">Program Updates</label>
                        <p className="text-sm text-gray-500">New content, program changes, and recommendations.</p>
                      </div>
                      <label htmlFor="emailProgramUpdates" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="emailProgramUpdates" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    {/* Add other email toggles similarly */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="emailNewsletter" className="font-medium text-gray-800 cursor-pointer">Newsletter</label>
                        <p className="text-sm text-gray-500">Weekly learning tips, news, and platform updates.</p>
                      </div>
                      <label htmlFor="emailNewsletter" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="emailNewsletter" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </section>

                {/* Push Notifications Section */}
                <section className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium mb-4" style={{ color: brandColors.primary }}>Push Notifications</h3>
                   <p className="text-sm text-gray-500 mb-4">Get timely alerts on your device (requires app installation or browser permission).</p>
                  <div className="space-y-5">
                     {/* Example Toggle: Daily Reminders */}
                     <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="pushDailyReminders" className="font-medium text-gray-800 cursor-pointer">Daily Reminders</label>
                        <p className="text-sm text-gray-500">Gentle nudge to meet your learning goals.</p>
                      </div>
                      <label htmlFor="pushDailyReminders" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="pushDailyReminders" className="sr-only peer" defaultChecked/>
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    {/* Add other push toggles */}
                  </div>
                </section>

                 {/* Notification Schedule Section */}
                 <section className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium mb-4" style={{ color: brandColors.primary }}>Notification Schedule</h3>
                     <div className="space-y-5">
                        {/* Quiet Hours Setting */}
                         <div>
                            <p className="font-medium text-gray-800 mb-2">Quiet Hours</p>
                            <p className="text-sm text-gray-500 mb-3">Pause notifications during specific times to avoid interruptions.</p>
                            <div className="flex items-center space-x-3">
                                <label htmlFor="quietStart" className="sr-only">Quiet hours start time</label>
                                <select id="quietStart" className="p-2 border border-gray-300 rounded-md bg-white text-sm">
                                    <option>10:00 PM</option>
                                    <option>11:00 PM</option>
                                    {/* Add more times */}
                                </select>
                                <span className="text-gray-500 text-sm">to</span>
                                <label htmlFor="quietEnd" className="sr-only">Quiet hours end time</label>
                                <select id="quietEnd" className="p-2 border border-gray-300 rounded-md bg-white text-sm">
                                    <option>7:00 AM</option>
                                    <option>8:00 AM</option>
                                    {/* Add more times */}
                                </select>
                                {/* Add a toggle to enable/disable quiet hours */}
                            </div>
                        </div>
                         {/* Weekend Mode Toggle */}
                         <div className="flex items-center justify-between">
                            <div>
                                <label htmlFor="weekendMode" className="font-medium text-gray-800 cursor-pointer">Weekend Mode</label>
                                <p className="text-sm text-gray-500">Reduce notification frequency on Saturdays and Sundays.</p>
                            </div>
                            <label htmlFor="weekendMode" className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="weekendMode" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                 </section>
                
                {/* Save Button */}
                <div className="flex justify-end border-t border-gray-200 pt-6">
                  <button 
                    type="submit"
                    className="px-6 py-2 rounded-md text-sm font-medium text-white transition-colors"
                     style={{ backgroundColor: brandColors.primary }}
                     onMouseOver={(e) => e.currentTarget.style.backgroundColor = brandColors.primaryLight}
                     onMouseOut={(e) => e.currentTarget.style.backgroundColor = brandColors.primary}
                  >
                    Save Notification Settings
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Edit Modal */}
          {editingField && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 capitalize">Edit {editingField}</h2>
                {editingField === "password" ? (
                  <>
                    {["oldPassword", "newPassword", "confirmPassword"].map((field) => (
                      <input
                        key={field}
                        type={passwordVisible ? "text" : "password"}
                        name={field}
                        placeholder={field.replace(/([A-Z])/g, " $1")}
                        value={formData[field] || ""}
                        onChange={handleChange}
                        className="w-full p-2 border rounded mb-3"
                      />
                    ))}
                    <button
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="text-xs text-blue-500 underline mb-4"
                    >
                      {passwordVisible ? "Hide Passwords" : "Show Passwords"}
                    </button>
                  </>
                ) : (
                  <input
                    name={editingField}
                    value={formData[editingField] || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                )}
                <div className="flex justify-end gap-4 mt-6">
                  <button onClick={() => setEditingField(null)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Footer */}
          <footer className="mt-12 text-center text-sm text-gray-500 border-t border-gray-200 pt-6">
            <p>© {new Date().getFullYear()} Gifted Learning Platform. All rights reserved.</p>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default Profile
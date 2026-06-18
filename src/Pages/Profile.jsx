"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  User, Mail, Phone, MapPin, Edit, Camera,
  Calendar, BookOpen, Zap, Clock, Star,
  Lock, Activity, GraduationCap, Target, Key,
  Award, ArrowRight, CheckCircle, AlertCircle,
} from "lucide-react"
import { jwtDecode } from "jwt-decode"
import { getUserDetails, updateUserDetails, updateProfilePicture, updateCoverImage } from "../lib/api"
import { resetPassword, getTokenUserId } from "../lib/auth"

const brandColors = {
  primary: "#003366",
  secondary: "#336699",
  accent: "#6699CC",
  background: "#F0F4F8",
  border: "#E5E7EB",
  success: "#1D9E75",
  error: "#EF4444",
}

const TABS = ["overview", "userDetails", "security"]
const TAB_LABELS = { overview: "Overview", userDetails: "User Details", security: "Security" }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name) =>
  (name || "").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()

const getActivityIcon = (type) =>
  ({ assessment: Activity, program: BookOpen, community: User, learning: Zap })[type] || Clock

// ─── Sub-components ───────────────────────────────────────────────────────────

const DetailRow = ({ label, value, fieldName, onEdit, accentColor = "blue" }) => (
  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
    <span className="text-gray-600 font-medium">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-gray-900 font-semibold">{value || "Not set"}</span>
      <button
        onClick={() => onEdit(fieldName)}
        className="p-1 rounded transition-colors hover:bg-gray-100"
        title={`Edit ${label.toLowerCase()}`}
      >
        <Edit className="w-3 h-3 text-gray-400 hover:text-gray-700" />
      </button>
    </div>
  </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────

const Profile = () => {
  const navigate = useNavigate()
  const userId = getTokenUserId()

  const [activeTab, setActiveTab] = useState("overview")
  const [userDetails, setUserDetails] = useState({})
  const [profile, setProfile] = useState({})
  const [profileImage, setProfileImage] = useState(null)
  const [profileImageLoading, setProfileImageLoading] = useState(true)

  // Inline field editing
  const [editingField, setEditingField] = useState(null)
  const [formData, setFormData] = useState({})
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState("")

  // Password form (Security tab)
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" })
  const [pwError, setPwError] = useState("")
  const [pwSuccess, setPwSuccess] = useState("")
  const [pwSaving, setPwSaving] = useState(false)

  const profileInputRef = useRef(null)
  const coverInputRef = useRef(null)

  // Load user data
  useEffect(() => {
    if (!userId) return
    const load = async () => {
      try {
        const res = await getUserDetails(userId)
        if (res.success) {
          setUserDetails(res.user)
          setProfileImage(res.user.profile_picture || res.user.profilePicture || null)

          const token = localStorage.getItem("token")
          const decoded = token ? jwtDecode(token) : null
          const createdAt = res.user.created_at || res.user.createdAt
          const joined = createdAt
            ? new Date(createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
            : ""

          setProfile({
            name: `${res.user.firstName || ""} ${res.user.lastName || ""}`.trim() || decoded?.name || "",
            email: res.user.email || decoded?.email || "",
            role: res.user.category || res.user.Category || decoded?.category || "Student",
            phone: res.user.mobileNumber || decoded?.mobile || "",
            location: res.user.country || decoded?.location || "",
            joined,
            coverImage: res.user.cover_image || res.user.coverImage || null,
          })
        }
      } catch (err) {
        console.error("Failed to load profile:", err)
      } finally {
        setProfileImageLoading(false)
      }
    }
    load()
  }, [userId, editingField])

  // ─── Field edit modal ──────────────────────────────────────────────────────

  const openEditModal = (fieldName) => {
    setSaveError("")
    setSaveSuccess("")
    setFormData(
      fieldName === "password"
        ? { oldPassword: "", newPassword: "", confirmPassword: "" }
        : { [fieldName]: userDetails[fieldName] || "" }
    )
    setEditingField(fieldName)
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSave = async () => {
    setSaveError("")
    setSaveSuccess("")
    setSaving(true)

    if (editingField === "password") {
      const { oldPassword, newPassword, confirmPassword } = formData
      if (!oldPassword || !newPassword || !confirmPassword) {
        setSaveError("All password fields are required.")
        setSaving(false)
        return
      }
      if (newPassword !== confirmPassword) {
        setSaveError("New passwords do not match.")
        setSaving(false)
        return
      }
      try {
        const res = await resetPassword({ password: newPassword })
        setSaveSuccess(res.message || "Password updated.")
        setTimeout(() => setEditingField(null), 1500)
      } catch {
        setSaveError("Failed to update password.")
      }
      setSaving(false)
      return
    }

    const value = formData[editingField]
    if (!value || value === userDetails[editingField]) {
      setSaveError("No changes detected.")
      setSaving(false)
      return
    }

    try {
      await updateUserDetails(userId, { [editingField]: value })
      setSaveSuccess("Saved.")
      setTimeout(() => setEditingField(null), 800)
    } catch {
      setSaveError("Could not save. Try again.")
    }
    setSaving(false)
  }

  // ─── Security tab password form ────────────────────────────────────────────

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPwError("")
    setPwSuccess("")
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setPwError("All fields are required.")
      return
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError("New passwords do not match.")
      return
    }
    if (pwForm.next.length < 8) {
      setPwError("New password must be at least 8 characters.")
      return
    }
    setPwSaving(true)
    try {
      const res = await resetPassword({ password: pwForm.next })
      setPwSuccess(res.message || "Password updated successfully.")
      setPwForm({ current: "", next: "", confirm: "" })
    } catch {
      setPwError("Failed to update password. Try again.")
    }
    setPwSaving(false)
  }

  // ─── Image upload handlers ─────────────────────────────────────────────────

  const handleProfileImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res = await updateProfilePicture(userId, file)
      if (res.url) setProfileImage(res.url)
    } catch (err) {
      console.error("Profile image update failed:", err)
    }
    e.target.value = ""
  }

  const handleCoverImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res = await updateCoverImage(userId, file)
      if (res.url) setProfile((p) => ({ ...p, coverImage: res.url }))
    } catch (err) {
      console.error("Cover image update failed:", err)
    }
    e.target.value = ""
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 lg:px-8 py-8" style={{ backgroundColor: brandColors.background }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold" style={{ color: brandColors.primary }}>My Profile</h1>
          <p className="mt-1 text-gray-500">Manage your personal information and track your progress</p>
        </div>

        {/* Tabs */}
        <div className="border-b mb-8" style={{ borderColor: brandColors.border }}>
          <nav className="flex gap-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="py-3 text-sm font-medium border-b-2 transition-colors -mb-px"
                style={{
                  borderBottomColor: activeTab === tab ? brandColors.primary : "transparent",
                  color: activeTab === tab ? brandColors.primary : brandColors.secondary,
                }}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Overview Tab ──────────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Profile card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow overflow-hidden">
                {/* Cover */}
                <div
                  className="h-32 w-full relative"
                  style={{
                    backgroundImage: profile.coverImage
                      ? `url(${profile.coverImage})`
                      : `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.accent} 100%)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-colors"
                    title="Change cover photo"
                  >
                    <Camera size={16} className="text-gray-600" />
                  </button>
                  <input type="file" accept="image/*" ref={coverInputRef} className="hidden" onChange={handleCoverImageChange} />
                </div>

                {/* Avatar + info */}
                <div className="px-5 pb-5 relative">
                  <div className="relative -mt-12 mb-3 w-24 h-24 mx-auto">
                    <div
                      className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: profileImage ? "#E5E7EB" : brandColors.accent }}
                    >
                      {profileImageLoading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                      ) : profileImage ? (
                        <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" onError={() => setProfileImage(null)} />
                      ) : (
                        <span className="text-2xl font-bold text-white">{getInitials(profile.name)}</span>
                      )}
                    </div>
                    <button
                      onClick={() => profileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow hover:bg-gray-100 transition-colors border border-gray-200"
                      title="Change profile picture"
                    >
                      <Camera size={12} className="text-gray-600" />
                    </button>
                    <input type="file" accept="image/*" ref={profileInputRef} className="hidden" onChange={handleProfileImageChange} />
                  </div>

                  <div className="text-center mb-4">
                    <h2 className="text-lg font-bold" style={{ color: brandColors.primary }}>{profile.name || "—"}</h2>
                    <p className="text-sm" style={{ color: brandColors.secondary }}>{profile.role}</p>
                  </div>

                  <div className="space-y-2.5 text-sm text-gray-600">
                    {profile.email && (
                      <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400 shrink-0" /><span className="truncate">{profile.email}</span></div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400 shrink-0" /><span>{profile.phone}</span></div>
                    )}
                    {profile.location && (
                      <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-400 shrink-0" /><span>{profile.location}</span></div>
                    )}
                    {profile.joined && (
                      <div className="flex items-center gap-2"><Calendar size={14} className="text-gray-400 shrink-0" /><span>Member since {profile.joined}</span></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Achievements */}
              <div className="bg-white rounded-2xl shadow p-5">
                <h3 className="text-base font-semibold mb-4" style={{ color: brandColors.primary }}>Achievements</h3>
                <p className="text-sm text-gray-400">No achievements earned yet.</p>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold" style={{ color: brandColors.primary }}>Recent Activity</h3>
                  <button
                    onClick={() => navigate("/history")}
                    className="flex items-center gap-1 text-xs font-medium transition-colors"
                    style={{ color: brandColors.secondary }}
                  >
                    Full history <ArrowRight size={12} />
                  </button>
                </div>
                <p className="text-sm text-gray-400">
                  Your assessment results, competition registrations, and course progress are tracked in{" "}
                  <button onClick={() => navigate("/history")} className="underline font-medium" style={{ color: brandColors.secondary }}>
                    My History
                  </button>.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── User Details Tab ──────────────────────────────────────────────── */}
        {activeTab === "userDetails" && (
          <motion.div
            key="userDetails"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Personal Information */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
              </div>
              <div className="space-y-3">
                <DetailRow label="Username"   value={userDetails.userName}      fieldName="userName"      onEdit={openEditModal} />
                <DetailRow label="First Name" value={userDetails.firstName}     fieldName="firstName"     onEdit={openEditModal} />
                <DetailRow label="Last Name"  value={userDetails.lastName}      fieldName="lastName"      onEdit={openEditModal} />
                <DetailRow label="Email"      value={userDetails.email}         fieldName="email"         onEdit={openEditModal} />
                <DetailRow label="Gender"     value={userDetails.gender}        fieldName="gender"        onEdit={openEditModal} />
                <DetailRow label="Mobile"     value={userDetails.mobileNumber}  fieldName="mobileNumber"  onEdit={openEditModal} />
                <DetailRow label="Country"    value={userDetails.country}       fieldName="country"       onEdit={openEditModal} />
              </div>
            </div>

            {/* Education */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Education</h3>
              </div>
              <div className="space-y-3">
                <DetailRow label="Level"  value={userDetails.educationalLevel} fieldName="educationalLevel" onEdit={openEditModal} />
                <DetailRow label="School" value={userDetails.School}           fieldName="School"           onEdit={openEditModal} />
                <DetailRow label="Grade"  value={userDetails.grade}            fieldName="grade"            onEdit={openEditModal} />
              </div>
            </div>

            {/* Interest & Purpose */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Interest & Purpose</h3>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-medium text-gray-600">Purpose of Registration</h4>
                  <button onClick={() => openEditModal("purposeOfRegistration")} className="p-1 rounded hover:bg-gray-100 transition-colors">
                    <Edit className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
                {userDetails.purposeOfRegistration?.length > 0 ? (
                  <ul className="space-y-2">
                    {userDetails.purposeOfRegistration.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-purple-400 rounded-full shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic">Not specified.</p>
                )}
              </div>
            </div>

            {/* Change password shortcut */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Lock className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Security</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                  <span className="text-gray-600 font-medium">Password</span>
                  <span className="text-gray-900 font-semibold tracking-widest">••••••••</span>
                </div>
                <button
                  onClick={() => setActiveTab("security")}
                  className="w-full py-2 px-4 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#F97316" }}
                >
                  <Key className="w-4 h-4" /> Change Password
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Security Tab ──────────────────────────────────────────────────── */}
        {activeTab === "security" && (
          <motion.div
            key="security"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow p-6 lg:p-8 max-w-xl"
          >
            <h2 className="text-xl font-bold mb-1" style={{ color: brandColors.primary }}>Account Security</h2>
            <p className="text-sm text-gray-500 mb-8">Update your password. You will need to log in again after changing it.</p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
                <input
                  type="password"
                  value={pwForm.current}
                  onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                  className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: brandColors.border }}
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                <input
                  type="password"
                  value={pwForm.next}
                  onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                  className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: brandColors.border }}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
                <input
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                  className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: brandColors.border }}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                />
              </div>

              {pwError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
                  <AlertCircle size={14} /> {pwError}
                </div>
              )}
              {pwSuccess && (
                <div className="flex items-center gap-2 text-sm bg-green-50 rounded-xl px-3 py-2" style={{ color: brandColors.success }}>
                  <CheckCircle size={14} /> {pwSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={pwSaving}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: brandColors.primary }}
              >
                {pwSaving ? "Updating..." : "Update password"}
              </button>
            </form>

            <div className="mt-10 pt-6 border-t" style={{ borderColor: brandColors.border }}>
              <h3 className="text-base font-semibold text-red-600 mb-3">Danger Zone</h3>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h4 className="font-medium text-red-800 text-sm">Delete Account</h4>
                <p className="text-xs text-red-700 mt-1 mb-3">Permanently delete your account and all associated data. This cannot be undone.</p>
                <button
                  onClick={() => {
                    if (window.confirm("Are you absolutely sure? This action is permanent and cannot be reversed.")) {
                      console.log("Account deletion requested — needs backend implementation.")
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Delete my account
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Edit Field Modal ──────────────────────────────────────────────── */}
        {editingField && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
              <h2 className="text-lg font-bold mb-4 capitalize" style={{ color: brandColors.primary }}>
                Edit {editingField.replace(/([A-Z])/g, " $1").toLowerCase()}
              </h2>

              {editingField === "password" ? (
                <div className="space-y-3">
                  {["oldPassword", "newPassword", "confirmPassword"].map((field) => (
                    <input
                      key={field}
                      type={passwordVisible ? "text" : "password"}
                      name={field}
                      placeholder={field.replace(/([A-Z])/g, " $1").toLowerCase()}
                      value={formData[field] || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border rounded-xl text-sm"
                      style={{ borderColor: brandColors.border }}
                    />
                  ))}
                  <button onClick={() => setPasswordVisible((v) => !v)} className="text-xs underline" style={{ color: brandColors.secondary }}>
                    {passwordVisible ? "Hide" : "Show"} passwords
                  </button>
                </div>
              ) : (
                <input
                  name={editingField}
                  value={formData[editingField] || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border rounded-xl text-sm"
                  style={{ borderColor: brandColors.border }}
                  autoFocus
                />
              )}

              {saveError && <p className="mt-2 text-xs text-red-600">{saveError}</p>}
              {saveSuccess && <p className="mt-2 text-xs" style={{ color: brandColors.success }}>{saveSuccess}</p>}

              <div className="flex gap-3 mt-5">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: brandColors.primary }}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-gray-50"
                  style={{ borderColor: brandColors.border, color: brandColors.primary }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-12 text-center text-xs text-gray-400 border-t pt-6" style={{ borderColor: brandColors.border }}>
          © {new Date().getFullYear()} Gifted Learning Platform. All rights reserved.
        </footer>
      </div>
    </div>
  )
}

export default Profile

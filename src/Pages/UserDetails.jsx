import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getUserDetails, updateUserDetails } from "../lib/api"
import { resetPassword, getTokenUserId } from "../lib/auth"

function UserDetails() {
  const navigate = useNavigate()
  const userId = getTokenUserId()

  const [userDetails, setUserDetails] = useState({})
  const [editingField, setEditingField] = useState(null)
  const [formData, setFormData] = useState({})
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const res = await getUserDetails(userId)
      if (res.success) setUserDetails(res.user)
    }
    load()
  }, [editingField])

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
        setTimeout(() => setEditingField(null), 1200)
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

  const EditBtn = ({ field }) => (
    <button
      onClick={() => openEditModal(field)}
      className="ml-2 px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
    >
      Edit
    </button>
  )

  const Row = ({ label, value, field }) => (
    <p className="text-blue-900">
      <strong>{label}:</strong>{" "}
      <span>{value || <span className="text-gray-400 italic">Not set</span>}</span>
      {field && <EditBtn field={field} />}
    </p>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8 w-full overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-blue-100 p-6 sm:p-8">

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-blue-900">User Details</h1>
            <button
              onClick={() => navigate("/profile")}
              className="text-sm text-blue-600 hover:underline"
            >
              View full profile →
            </button>
          </div>

          {/* Personal Information */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Row label="Username"  value={userDetails.userName}     field="userName" />
              <Row label="First Name" value={userDetails.firstName}   field="firstName" />
              <Row label="Last Name"  value={userDetails.lastName}    field="lastName" />
              <Row label="Email"      value={userDetails.email}       field="email" />
              <Row label="Gender"     value={userDetails.gender} />
              <Row label="Mobile"     value={userDetails.mobileNumber} field="mobileNumber" />
              <Row label="Country"    value={userDetails.country} />
              <p className="text-blue-900">
                <strong>Password:</strong> <span className="tracking-widest">••••••••</span>
                <EditBtn field="password" />
              </p>
            </div>
          </section>

          {/* Education */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Education</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Row label="Level"  value={userDetails.educationalLevel} field="educationalLevel" />
              <Row label="School" value={userDetails.School}           field="School" />
              <Row label="Grade"  value={userDetails.grade}            field="grade" />
            </div>
          </section>

          {/* Interest */}
          <section>
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Interest</h2>
            {userDetails.purposeOfRegistration?.length > 0 ? (
              <ul className="list-disc pl-6 text-blue-900 space-y-1">
                {userDetails.purposeOfRegistration.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 italic text-sm">No interests recorded.</p>
            )}
          </section>

        </div>
      </div>

      {/* Edit Modal */}
      {editingField && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 capitalize">
              Edit {editingField.replace(/([A-Z])/g, " $1").toLowerCase()}
            </h2>

            {editingField === "password" ? (
              <>
                {["oldPassword", "newPassword", "confirmPassword"].map((field) => (
                  <input
                    key={field}
                    type={passwordVisible ? "text" : "password"}
                    name={field}
                    placeholder={field.replace(/([A-Z])/g, " $1").toLowerCase()}
                    value={formData[field] || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded mb-3 text-sm"
                  />
                ))}
                <button
                  onClick={() => setPasswordVisible((v) => !v)}
                  className="text-xs text-blue-500 underline mb-3"
                >
                  {passwordVisible ? "Hide passwords" : "Show passwords"}
                </button>
              </>
            ) : (
              <input
                name={editingField}
                value={formData[editingField] || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded text-sm"
                autoFocus
              />
            )}

            {saveError && <p className="mt-2 text-xs text-red-600">{saveError}</p>}
            {saveSuccess && <p className="mt-2 text-xs text-green-600">{saveSuccess}</p>}

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setEditingField(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserDetails

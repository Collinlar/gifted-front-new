import { jwtDecode } from "jwt-decode";
import { getUserDetails, updateUserDetails } from "../lib/api";
import { resetPassword, getTokenUserId } from "../lib/auth";
import React, { useState, useEffect } from "react";
import ProgramsPageWithSidebar from "./Programs";

function UserDetails() {
  const [editingField, setEditingField] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [formData, setFormData] = useState({});
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [showRegistered, setShowRegistered] = useState(false);
  const [showAddOns, setShowAddOns] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showPaid, setShowPaid] = useState(false);

  useEffect(() => {
    const LoadUserDetails = async () => {
      const response = await getUserDetails(getTokenUserId());
      if (response.success) {
        setUserDetails(() => ({ ...response.user }));
      }
      
    };
    LoadUserDetails();
  }, [editingField]);

  const openEditModal = (fieldName) => {
    setFormData(fieldName === "password"
      ? { oldPassword: "", newPassword: "", confirmPassword: "" }
      : { [fieldName]: userDetails[fieldName] || "" });
    setEditingField(fieldName);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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

  const toggleButtonClass = "text-sm bg-blue-100 text-blue-700 px-4 py-1 rounded-full hover:bg-blue-200 transition mb-2";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8 w-full overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-blue-100 p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">User Details</h1>

          {/* Personal Info */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-blue-900">
              <p><strong>Username:</strong> {userDetails.userName} {renderEditButton("userName")}</p>
              <p><strong>First Name:</strong> {userDetails.firstName} {renderEditButton("firstName")}</p>
              <p><strong>Last Name:</strong> {userDetails.lastName} {renderEditButton("lastName")}</p>
              <p><strong>Email:</strong> {userDetails.email} {renderEditButton("email")}</p>
              <p><strong>Gender:</strong> {userDetails.gender}</p>
              <p><strong>Mobile:</strong> {userDetails.mobileNumber} {renderEditButton("mobileNumber")}</p>
              <p><strong>Country:</strong> {userDetails.country}</p>
              <p><strong>Password:</strong> •••••••• {renderEditButton("password")}</p>
            </div>
          </section>

          {/* Education */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Education</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-blue-900">
              <p><strong>Level:</strong> {userDetails.educationalLevel} {renderEditButton("educationalLevel")}</p>
              <p><strong>School:</strong> {userDetails.School} {renderEditButton("school")}</p>
              <p><strong>Grade:</strong> {userDetails.grade} {renderEditButton("grade")}</p>
            </div>
          </section>

          {/* Purpose */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Interest</h2>
            <ul className="list-disc pl-6 text-blue-900">
              {userDetails.purposeOfRegistration?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Registered Items */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Registered Items</h2>
            <button onClick={() => setShowRegistered(!showRegistered)} className={toggleButtonClass}>
              {showRegistered ? "Hide Details" : "View Details"}
            </button>
            {showRegistered && (
              <ul className="list-disc pl-6 text-blue-900 mt-2">
                {userDetails.Registered?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </section>

          {/* Add-Ons */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Add-Ons</h2>
            <button onClick={() => setShowAddOns(!showAddOns)} className={toggleButtonClass}>
              {showAddOns ? "Hide Details" : "View Details"}
            </button>
            {showAddOns && (
              <ul className="list-disc pl-6 text-blue-900 mt-2">
                {userDetails.AddOns?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </section>

          {/* Invoice */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Invoice</h2>
            <button onClick={() => setShowInvoice(!showInvoice)} className={toggleButtonClass}>
              {showInvoice ? "Hide Details" : "View Details"}
            </button>
            {showInvoice && userDetails.Invoice?.map((item, i) => (
              <div key={i} className="flex justify-between border-b py-2">
                <span>{item.name}</span>
                <span className="text-blue-700 font-semibold">{item.Cost}</span>
              </div>
            ))}
          </section>

          {/* Paid */}
          <section>
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Paid Courses</h2>
            <button onClick={() => setShowPaid(!showPaid)} className={toggleButtonClass}>
              {showPaid ? "Hide Details" : "View Details"}
            </button>
            {showPaid && (
              <>
                <div className="grid grid-cols-3 font-bold text-blue-700 mt-4 mb-2">
                  <span>Course Title</span>
                  <span>Cost</span>
                  <span>Grade</span>
                </div>
                {userDetails.Paid?.map((item, i) => (
                  <div key={i} className="grid grid-cols-3 py-2 border-b">
                    <span>{item.name}</span>
                    <span>{item.Cost}</span>
                    <span>{item.grade}</span>
                  </div>
                ))}
              </>
            )}
          </section>
        </div>
      </div>

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
    </div>
  );
}

export default UserDetails;

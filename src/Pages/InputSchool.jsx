import React, { useContext, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { storeContext } from '../Context';

// Brand colors to maintain consistency
const brandColors = {
  darkBlue: '#001D3D',
  mediumBlue: '#003566',
  navy: '#000814',
  lightBlue: '#EEF2F6',
  white: '#FFFFFF',
  gray: '#F3F4F6',
};

const InputSchool = () => {
  const { educationalLevel, setSchool,school , formData, setFormData} = useContext(storeContext);
  const navigate = useNavigate()
  const [updatedFormData, setUpdatedFormData] = useState({})
  const locator = useLocation()
  const passFormData = formData

  const handleNavigation = (e) => {
    e.preventDefault();
    if (passFormData.educationalLevel === "University") {
      setFormData(()=>{return {...passFormData,School:school}})

      navigate("/purpose",{state:{updatedFormData}});
    } else if (passFormData.educationalLevel === "Primary") {
      setFormData(()=>{return {...passFormData,School:school}})

      navigate("/select-primary",{state:{updatedFormData}});
    } else if (passFormData.educationalLevel === "Junior High School" || passFormData.educationalLevel=="Senior High School") {
      setFormData(()=>{return {...passFormData,School:school}})

      navigate("/select-highschool",{state:{updatedFormData}});
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-blue-50 transition-all duration-300 hover:shadow-xl">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-3">School Information</h1>
            <p className="text-blue-700">
              Enter the name of your {passFormData.educationalLevel?.toLowerCase()} to continue
            </p>
          </div>

          {/* Input Form */}
          <form onSubmit={(e) => handleNavigation(e)}>
            <div className="mb-6">
              <label htmlFor="schoolName" className="block text-blue-900 font-semibold mb-2">
                Name of School
              </label>
              <input
                id="schoolName"
                required
                placeholder={`Enter your ${passFormData.educationalLevel?.toLowerCase()} name`}
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                onChange={(e) => setSchool(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center hover:shadow-md"
            >
              Continue
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </form>

          {/* Back Navigation */}
          <div className="mt-6 text-center">
            <Link
              to="/select-student"
              className="inline-flex items-center text-blue-700 hover:text-blue-900 font-medium transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Educational Level
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputSchool;
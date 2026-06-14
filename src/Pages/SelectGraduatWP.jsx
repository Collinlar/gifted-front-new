import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiArrowRight } from "react-icons/hi2";
import { storeContext } from '@/Context';
import axios from "axios";
import { registerUser } from "../lib/auth";
import { getAllInterests } from "../lib/api";
import { ToastContainer, toast } from 'react-toastify';
import { jwtDecode } from "jwt-decode";

// Brand colors
const brandColors = {
  darkBlue: '#001D3D',
  mediumBlue: '#003566',
  navy: '#000814',
  lightBlue: '#EEF2F6',
  white: '#FFFFFF',
  gray: '#F3F4F6',
};

const Select = ({ competitionList }) => {
  const locator = useLocation()
  const [items,setItems]= useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(()=>{
    const fetchInterest = async()=>{
      setIsLoading(true)
      try{
        const response = await getAllInterests()
        setItems(response.interests)


      }catch(error){
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchInterest()


  },[])


  const {
    studychecked,
    prepChecked,
    setUserExamination,
    userExamination,
    loadCompetitions,
    setCompetitionList,
    setLoadCompetitions,
    purposeOfRegistration,
    SetPurposeofRegistration,
    firstName,
    lastName,
    DOB,
    email,
    mobileNumber,
    category,
    password,
    gender,
    school,
    country,
    grade,
    educationalLevel,
    purposes,
    setPurposes,
    formData,
    setFormData
  } = useContext(storeContext);
  const SignUpBody = formData
  useEffect(()=>{
    console.log(SignUpBody)
  },[purposeOfRegistration])
  

  const [selectAtLeastOne, setSelectAtLeastOne] = useState("");
  
  const navigate = useNavigate();

  // useEffect(() => {
  //   console.log(SignUpBody);
  // }, [purposeOfRegistration]);

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;

    if (checked) {
      SetPurposeofRegistration((prev) =>{ if(!prev.includes(value)){return [...prev, value]}; return prev});
      setSelectAtLeastOne("");
    } else {
      SetPurposeofRegistration((prev) => prev.filter((option) => option !== value));
    }
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (purposeOfRegistration.length > 0) {
        const registerData = {
          ...formData,
          purposeOfRegistration: purposeOfRegistration
        };
        console.log(registerData)
        
        const response = await registerUser(registerData);

        if (response.success) {
          setLoadCompetitions(true);
          navigate("/overview");
          toast.success("User registered successfully");
          localStorage.removeItem("country")
          localStorage.removeItem("phoneNumber")
        } else {
          toast.error(response.message);
          // studychecked("");
          // prepChecked("");
        }
      } else {
        setSelectAtLeastOne("Please select at least one option");
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred during registration");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Hero Banner - full width */}
      <div className="w-full bg-gradient-to-r from-blue-700 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Choose Your Programs</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Select the options that best match what you would like to do
          </p>
        </div>
      </div>
      
      {/* Content Area - full width with centered content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-7xl mx-auto">
          <form onSubmit={(e) => handleSubmit(e)} className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-blue-700 text-lg font-medium">Loading competitions...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                {items.map((item, index) => (
                  <div 
                    key={index} 
                    className="bg-blue-50 hover:bg-blue-100 transition-colors duration-200 p-4 sm:p-6 rounded-lg border border-blue-100 h-full flex flex-col"
                  >
                    <label className="flex items-start space-x-3 cursor-pointer w-full">
                      <input 
                        type="checkbox" 
                        name="option" 
                        value={item.name} 
                        onChange={(e) => handleCheckboxChange(e)}
                        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 mt-1"
                      />
                      <div className="flex-1">
                        <span className="text-blue-900 font-medium block">{item.name}</span>
                        {item.description && (
                          <p className="mt-1 text-sm text-blue-700">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {selectAtLeastOne && (
              <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg text-sm">
                {selectAtLeastOne}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <button
                onClick={() => navigate(-1)}
                type="button"
                className="inline-flex items-center justify-center text-blue-700 hover:text-blue-900 font-medium order-2 sm:order-1"
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
                Back
              </button>
              
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 sm:px-8 rounded-lg transition-colors duration-200 flex items-center justify-center order-1 sm:order-2 w-full sm:w-auto"
                type="submit"
              >
                Complete Registration
                <HiArrowRight className="ml-2" />
              </button>
            </div>
          </form>

          {/* Additional Info Cards (Full Width Usage) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-600">
              <h3 className="text-lg font-bold text-blue-900 mb-2">What happens next?</h3>
              <p className="text-blue-700">
                After registration, you'll have access to your personalized dashboard where you can track your progress and access your selected activities.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-600">
              <h3 className="text-lg font-bold text-blue-900 mb-2">Need help?</h3>
              <p className="text-blue-700">
                If you have any questions about the registration process or available activities, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Select;
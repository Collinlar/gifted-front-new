import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { HiArrowRight } from 'react-icons/hi2';
import { storeContext } from '@/Context';
import axios from 'axios';
import { registerUser } from '../lib/auth';
import { getAllInterests } from '../lib/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Brand colors
const brandColors = {
  darkBlue: '#001D3D',
  mediumBlue: '#003566',
  navy: '#000814',
  lightBlue: '#EEF2F6',
  white: '#FFFFFF',
  gray: '#F3F4F6',
};

const SelectParent = () => {
  const {
    competitionList: contextCompetitionList,
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
    formData,
    SetCompetitionList
  } = useContext(storeContext);

  const navigate = useNavigate();
  const [selectAtLeastOne, setSelectAtLeastOne] = useState('');
  const [competitionList, setCompetitionList] = useState(contextCompetitionList || []);
  const [isLoading, setIsLoading] = useState(true);

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;

    if (checked) {
      // Add the value to the array
      SetPurposeofRegistration((prev) => [...prev, value]);
    } else {
      // Remove the value from the array
      SetPurposeofRegistration((prev) => prev.filter((option) => option !== value));
    }
  };

  useEffect(() => {
    console.log(purposeOfRegistration);
  }, [purposeOfRegistration]);

  useEffect(() => {
    const fetchCompetitionList = async () => {
      setIsLoading(true);
      try {
        const response = await getAllInterests();
        if (response.interests) {
          const fetchedList = response.interests;
          setCompetitionList(fetchedList);
          // Update context if SetCompetitionList is available
          if (SetCompetitionList) {
            SetCompetitionList(fetchedList);
          }
        }
      } catch (error) {
        console.error('Failed to fetch competition list:', error);
        toast.error('Failed to load competitions. Please try again.', { toastId: 'fetch-error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompetitionList();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (purposeOfRegistration.length > 0) {
      setSelectAtLeastOne('');

      const registerData = {
       ...formData,
        purpose_Of_Registration: purposeOfRegistration,
      };

      try {
        const response = await registerUser(registerData);
        if (response.success) {
          navigate('/overview');
          toast.success('User registered successfully', { toastId: '1toast' });
        } else {
          toast.error(response.message, { toastId: '1toast' });
        }
      } catch (error) {
        toast.error('An error occurred. Please try again.', { toastId: '1toast' });
      }
    } else {
      setSelectAtLeastOne('Please select at least one option');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 w-full">
      {/* Hero Section */}
      <div className="pt-16 pb-8 px-4 sm:px-6 w-full">
        <div className="w-full mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-900 mb-4">What would you like to do?</h1>
          <p className="text-lg sm:text-xl text-blue-700 max-w-2xl mx-auto">
            Select the options that best describe your goals to personalize your journey
          </p>
        </div>
      </div>

      {/* Options Cards Container */}
      <div className="w-full px-4 sm:px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-blue-700 text-lg font-medium">Loading competitions...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitionList.map((item, index) => (
              <div
                key={item._id}
                className="group bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-1 border border-blue-50"
              >
                <div className="p-6 flex flex-col items-center text-center h-full">
                  <div className="text-4xl mb-4">📚</div> {/* Icon placeholder */}
                  <h3 className="text-xl font-bold text-blue-900 mb-2">{item.name}</h3>
                  <p className="text-blue-600 mb-6">Explore opportunities in {item.name.toLowerCase()}</p>
                  <div className="mt-auto w-full">
                    <label className="flex items-center justify-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        name="option"
                        value={item.name}
                        onChange={handleCheckboxChange}
                        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="font-medium text-gray-700">Select</span>
                    </label>
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}

          {/* Error Message */}
          {selectAtLeastOne && (
            <div className="text-red-500 text-sm mt-4 text-center">{selectAtLeastOne}</div>
          )}

          {/* Submit Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSubmit}
              className="py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center justify-center"
            >
              Submit
              <HiArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Wave */}
      <div className="w-full overflow-hidden leading-none">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 text-blue-800 fill-current">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.32,118.92,163.89,106.92,321.39,56.44Z"></path>
        </svg>
      </div>

      <ToastContainer />
    </div>
  );
};

export default SelectParent;
import React, { useContext, useState } from 'react';
import { Link , useLocation, useNavigate} from 'react-router-dom';
import { storeContext } from '../Context';

// Brand colors
const brandColors = {
  darkBlue: '#001D3D',
  mediumBlue: '#003566',
  navy: '#000814',
  lightBlue: '#EEF2F6',
  white: '#FFFFFF',
  gray: '#F3F4F6',
};

const SelectHighSchool = () => {
  const { setGrade,grade,formData, setFormData} = useContext(storeContext);

  // const locator = useLocation()
  const passFormData = formData
  const navigate = useNavigate()
  // const [updatedFormData, setUpdatedFormData]= useState({})

  // const grades = [
  //   {
  //     name: "Grade 12",
  //     path: "/purpose",
  //     action: () => setGrade("Grade 12"),
  //   },
  //   {
  //     name: "Grade 11",
  //     path: "/purpose",
  //     action: () => setGrade("Grade 11"),
  //   },
  //   {
  //     name: "Grade 10",
  //     path: "/purpose",
  //     action: () => setGrade("Grade 10"),
  //   },
  // ];
  const grades = Array.from({ length: 6 }, (_, i) => {
    const gradeNumber = i + 1;
    return {
      name: `Grade ${gradeNumber}`,
      path: "/purpose",
      action: () => {setGrade(`Grade ${gradeNumber}`);setFormData(()=>{return {...passFormData,grade:gradeNumber}});navigate("/purpose")}
    };
  });
  

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Hero Section - full width with centered content */}
      <div className="w-full pt-16 pb-8">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            Select Your Grade
          </h1>
          <p className="text-lg sm:text-xl text-blue-700 max-w-2xl mx-auto">
            Choose your current grade to personalize your experience
          </p>
        </div>
      </div>

      {/* Grade Cards Container - full width with centered content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-16">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {grades.map((grade, index) => (
              <div
                // to={grade.path} 
                key={index}
                className="group block w-full"
                onClick={grade.action}
              >
                <div className="h-full bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-1 border border-blue-50 w-full">
                  <div className="p-6 flex flex-col items-center text-center h-full">
                    <h3 className="text-xl font-bold text-blue-900 mb-2">{grade.name}</h3>
                    <div className="mt-auto w-full">
                      <div className="py-3 px-4 bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200 group-hover:bg-blue-800 text-center">
                        Select
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Wave - full width */}
      <div className="w-full overflow-hidden leading-none">
        <svg 
          data-name="Layer 1" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="w-full h-16 text-blue-800 fill-current"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.32,118.92,163.89,106.92,321.39,56.44Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default SelectHighSchool;
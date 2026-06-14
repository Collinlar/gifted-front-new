import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { storeContext } from '@/Context';

const brandColors = {
  darkBlue: '#001D3D',
  mediumBlue: '#003566',
  navy: '#000814',
  lightBlue: '#EEF2F6',
  white: '#FFFFFF',
  gray: '#F3F4F6',
};

const SelectStudent = () => {
  const { setEducationalLevel, setSchool, setFormData, formData } = useContext(storeContext);
  const navigate = useNavigate();

  const educationLevels = [
    {
      names: "University",
      icon: "🎓",
      description: "Higher education students",
      path: "/input-school",
    },
    {
      names: "Senior High School",
      icon: "🏫",
      description: "Secondary education students",
      path: "/input-school",
    },
    {
      names: "Junior High School",
      icon: "🏫",
      description: "Junior High education students",
      path: "/input-school",
    },
    {
      names: "Primary",
      icon: "✏️",
      description: "Elementary education students",
      path: "/input-school",
    },
  ];

  const handleSelect = (level) => {
    const updated = { ...formData, educationalLevel: level.names };
    setEducationalLevel(level.names);
    setFormData(updated);
    navigate(level.path, { state: { formData: updated } });
    console.log(formData)
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 w-full overflow-auto">
      {/* Hero Section */}
      <div className="pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">Select Your Educational Level</h1>
          <p className="text-xl text-blue-700 max-w-2xl mx-auto">
            Choose the option that best describes your current educational status
          </p>
        </div>
      </div>

      {/* Education Level Cards Container */}
      <div className="px-4 sm:px-6 lg:px-56 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14">
          {educationLevels.map((level, index) => (
            <div
              key={index}
              className="group block cursor-pointer"
              onClick={() => handleSelect(level)}
            >
              <div className="h-full bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-1 border border-blue-50">
                <div className="p-6 flex flex-col items-center text-center h-full">
                  <div className="text-4xl mb-4">{level.icon}</div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">{level.names}</h3>
                  <p className="text-blue-600 mb-6">{level.description}</p>
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

      {/* Footer Wave */}
      <div className="w-full overflow-hidden leading-none">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120" preserveAspectRatio="none"
          className="w-full h-16 text-blue-800 fill-current">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,
            82.39-16.72,168.19-17.73,250.45-.39C823.78,31,
            906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,
            214.34,3V120H0V95.8C57.32,118.92,
            163.89,106.92,321.39,56.44Z" />
        </svg>
      </div>
    </div>
  );
};

export default SelectStudent;

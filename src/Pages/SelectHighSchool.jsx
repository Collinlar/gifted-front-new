import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeContext } from '../Context';

const SelectHighSchool = () => {
  const { setGrade, grade, formData, setFormData } = useContext(storeContext);
  const navigate = useNavigate();

  const handleGradeSelection = (gradeName) => {
    setGrade(gradeName);
    setFormData({ ...formData, grade: gradeName });
    navigate("/purpose");
  };

  const Seniorgrades = [
    "Grade 12",
    "Grade 11",
    "Grade 10"
  ];

  const Juniorgrades = [
    "Grade 9",
    "Grade 8",
    "Grade 7"
  ];

  const renderGradeCard = (gradeName, index) => (
    <div
      key={index}
      className="group block w-full cursor-pointer"
      onClick={() => handleGradeSelection(gradeName)}
    >
      <div className="h-full bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-1 border border-blue-50 w-full">
        <div className="p-6 flex flex-col items-center text-center h-full">
          <h3 className="text-xl font-bold text-blue-900 mb-2">{gradeName}</h3>
          <div className="mt-auto w-full">
            <div className="py-3 px-4 bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200 group-hover:bg-blue-800 text-center">
              Select
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Hero Section */}
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

      {/* Grade Cards */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-16">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {formData.educationalLevel === "Senior High School" &&
            Seniorgrades.map((g, i) => renderGradeCard(g, i))}
          {formData.educationalLevel === "Junior High School" &&
            Juniorgrades.map((g, i) => renderGradeCard(g, i))}
        </div>
      </div>

      {/* Footer Wave */}
      <div className="w-full overflow-hidden leading-none">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-16 text-blue-800 fill-current"
        >
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

export default SelectHighSchool;

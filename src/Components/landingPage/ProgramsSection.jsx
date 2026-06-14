// components/ProgramsSection.js
import React, { useState } from 'react';
import { ScrollLink } from 'react-scroll';
import { ChevronRight } from 'lucide-react';

const ProgramsSection = ({ programs, brandColors, activeTab, setActiveTab }) => {
  const filteredPrograms = activeTab === 'all' 
    ? programs 
    : programs.filter(program => program.category === activeTab);

  return (
    <section id="programs" className="py-24 bg-white">
      <div className="px-8">
        <div className="text-center mb-16" data-aos="fade-up">
          <div className="inline-block px-3 py-1 text-sm font-medium rounded-full mb-4"
               style={{ color: brandColors.mediumBlue, backgroundColor: `${brandColors.mediumBlue}15` }}>
            Our Offerings
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Olympiad Programs</h2>
          <div className="w-24 h-1 mx-auto mb-6" style={{ backgroundColor: brandColors.mediumBlue }}></div>
          <p className="max-w-3xl mx-auto text-gray-600">
            Specialized training for different olympiad disciplines, designed to develop deep conceptual understanding and advanced problem-solving skills.
          </p>
        </div>
        
        {/* Program Category Tabs */}
        <div className="flex justify-center mb-12 overflow-x-auto pb-4" data-aos="fade-up">
          <div className="flex space-x-2 p-1 rounded-lg bg-gray-100">
            <button 
              onClick={() => setActiveTab('all')} 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === 'all' ? 'text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'}`}
              style={{ backgroundColor: activeTab === 'all' ? brandColors.mediumBlue : 'transparent' }}
            >
              All Programs
            </button>
            <button 
              onClick={() => setActiveTab('math')} 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === 'math' ? 'text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'}`}
              style={{ backgroundColor: activeTab === 'math' ? brandColors.mediumBlue : 'transparent' }}
            >
              Mathematics
            </button>
            <button 
              onClick={() => setActiveTab('physics')} 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === 'physics' ? 'text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'}`}
              style={{ backgroundColor: activeTab === 'physics' ? brandColors.mediumBlue : 'transparent' }}
            >
              Physics
            </button>
            <button 
              onClick={() => setActiveTab('chemistry')} 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === 'chemistry' ? 'text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'}`}
              style={{ backgroundColor: activeTab === 'chemistry' ? brandColors.mediumBlue : 'transparent' }}
            >
              Chemistry
            </button>
            <button 
              onClick={() => setActiveTab('informatics')} 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === 'informatics' ? 'text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'}`}
              style={{ backgroundColor: activeTab === 'informatics' ? brandColors.mediumBlue : 'transparent' }}
            >
              Informatics
            </button>
          </div>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPrograms.map((program, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group border border-gray-100"
              data-aos="fade-up" 
              data-aos-delay={index * 100}
            >
              <div className="p-8">
                <div className="mb-6 transform group-hover:scale-110 transition-transform">{program.icon}</div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-mediumBlue transition-colors">{program.title}</h3>
                <p className="text-gray-600 mb-6">{program.description}</p>
                
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase">Key Topics</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {program.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: brandColors.mediumBlue }}></div>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <ScrollLink to={program.title.toLowerCase().replace(/\s+/g, '-')} smooth={true} duration={800} offset={-80}>
                  <button className="inline-flex items-center font-medium text-sm group-hover:underline"
                         style={{ color: brandColors.mediumBlue }}>
                    Learn more <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </ScrollLink>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
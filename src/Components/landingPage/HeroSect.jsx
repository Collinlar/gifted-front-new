// components/HeroSection.js
import React from 'react';
import { ScrollLink } from 'react-scroll';
import { ChevronRight } from 'lucide-react';
// import lpImage from '../../images/lp.jpg';

const HeroSection = ({ brandColors }) => {
  return (
    <section id="home" className="w-full py-24 md:py-32 relative overflow-hidden"
             style={{ background: `linear-gradient(135deg, ${brandColors.darkBlue}, ${brandColors.mediumBlue})` }}>
      <div className="absolute w-full h-full top-0 left-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full" style={{ backgroundColor: brandColors.navy }}></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full" style={{ backgroundColor: brandColors.navy }}></div>
      </div>
      
      <div className="px-8 relative">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-7/12 text-white mb-12 md:mb-0" data-aos="fade-right">
            <div className="inline-block py-1 rounded-full text-sm font-medium mb-6"
                style={{ backgroundColor: `rgba(255, 255, 255, 0.1)`, border: '1px solid rgba(255, 255, 255, 0.2)' }}>
              Empowering Young Minds Since 2015
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Excel in <span style={{ color: brandColors.white }}>Academic Competitions</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-100 max-w-2xl">
              Specialized training for Mathematics, Physics, Chemistry, and Informatics Olympiads designed to help students reach their full potential and compete on the world stage.
            </p>
            <div className="flex flex-wrap gap-4">
              <ScrollLink to="programs" smooth={true} duration={800} offset={-80}>
                <button className="px-6 py-3 text-base font-medium rounded-lg flex items-center gap-2 group transition-all duration-300 hover:shadow-lg hover:scale-105"
                       style={{ backgroundColor: brandColors.mediumBlue, color: brandColors.white }}>
                  Explore Programs 
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </ScrollLink>
              <ScrollLink to="success-stories" smooth={true} duration={800} offset={-80}>
                <button className="px-6 py-3 text-base font-medium bg-transparent border border-white/50 rounded-lg hover:bg-white/10 transition-all duration-300 text-white">
                  Success Stories
                </button>
              </ScrollLink>
            </div>
          </div>
          
          <div className="md:w-5/12" data-aos="fade-left">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-mediumBlue/20 to-navy/20 rounded-lg transform rotate-3 backdrop-blur-md"></div>
              {/* <img src={lpImage} alt="Students working on olympiad problems" 
                   className="relative rounded-lg shadow-2xl z-10" style={{ height: '410px', width: '400px' }} /> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
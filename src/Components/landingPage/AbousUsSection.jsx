// components/AboutUsSection.js
import React from 'react';
import { ScrollLink } from 'react-scroll';
import { CheckCircle, ArrowRight } from 'lucide-react';

const AboutUsSection = ({ brandColors }) => {
  return (
    <section id="about-us" className="py-24 bg-gray-50">
      <div className="px-8">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2" data-aos="fade-right">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-mediumBlue/20 to-navy/20 rounded-lg transform -rotate-2"></div>
              <img src="/api/placeholder/600/400" alt="Our campus and facilities" 
                   className="relative rounded-lg shadow-xl z-10" />
            </div>
          </div>
          
          <div className="md:w-1/2" data-aos="fade-left">
            <div className="inline-block px-3 py-1 text-sm font-medium rounded-full mb-4"
                 style={{ color: brandColors.mediumBlue, backgroundColor: `${brandColors.mediumBlue}15` }}>
              Our Mission
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Cultivating Excellence in Academic Competitions</h2>
            <p className="text-gray-600 mb-6">
              Founded by former Olympiad medalists and passionate educators, Olympiad Edu Center is dedicated to nurturing the next generation of academic talent through specialized training, personalized coaching, and a supportive learning environment.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CheckCircle className="h-5 w-5" style={{ color: brandColors.mediumBlue }} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Expert Instruction</h3>
                  <p className="text-gray-600">Our faculty consists of former Olympiad medalists, university professors, and industry leaders.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CheckCircle className="h-5 w-5" style={{ color: brandColors.mediumBlue }} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Proven Methodology</h3>
                  <p className="text-gray-600">Our structured curriculum builds both conceptual understanding and problem-solving skills.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CheckCircle className="h-5 w-5" style={{ color: brandColors.mediumBlue }} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Global Network</h3>
                  <p className="text-gray-600">Connect with like-minded peers and alumni studying at prestigious universities worldwide.</p>
                </div>
              </div>
            </div>
            <ScrollLink to="team" smooth={true} duration={800} offset={-80}>
              <button className="px-6 py-3 text-base font-medium rounded-lg flex items-center gap-2 group transition-all duration-300 bg-white border hover:shadow-md"
                     style={{ borderColor: brandColors.mediumBlue, color: brandColors.mediumBlue }}>
                Meet Our Team
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </ScrollLink>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
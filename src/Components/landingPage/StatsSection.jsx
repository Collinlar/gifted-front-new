// components/StatsSection.js
import React from 'react';

const StatsSection = ({ stats, brandColors }) => {
  return (
    <section className="w-full py-16 bg-white overflow-hidden">
      <div className="px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group" data-aos="fade-up" data-aos-delay={index * 100}>
              <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform"
                   style={{ color: index % 2 === 0 ? brandColors.mediumBlue : brandColors.darkBlue }}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
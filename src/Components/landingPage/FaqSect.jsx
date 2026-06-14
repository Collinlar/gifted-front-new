// components/FAQSection.js
import React from 'react';

const FAQSection = ({ faqs, brandColors }) => {
  return (
    <section id="faq" className="py-24 bg-white">
      <div className="px-8">
        <div className="text-center mb-16" data-aos="fade-up">
          <div className="inline-block px-3 py-1 text-sm font-medium rounded-full mb-4"
               style={{ color: brandColors.mediumBlue, backgroundColor: `${brandColors.mediumBlue}15` }}>
            Have Questions?
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="w-24 h-1 mx-auto mb-6" style={{ backgroundColor: brandColors.mediumBlue }}></div>
          <p className="max-w-3xl mx-auto text-gray-600">
            Find answers to common questions about our programs, admissions, and more.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
              data-aos="fade-up" 
              data-aos-delay={index * 100}
            >
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
// components/Header.js
import React, { useState } from 'react';
import { Link, ScrollLink } from 'react-scroll';
import { Trophy, Menu, X, ArrowRight } from 'lucide-react';

const Header = ({ brandColors, mobileMenuOpen, toggleMobileMenu }) => {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/50 backdrop-blur-md transition-all duration-200 shadow-sm"
            style={{ backgroundColor: brandColors.darkBlue, color: brandColors.white }}>
      <div className="flex h-20 items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-8 w-8" style={{ color: brandColors.white }} />
          <span className="text-2xl font-bold" style={{ color: brandColors.white }}>
            Gifted
          </span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {["Home", "About Us", "Programs", "Success Stories", "Events", "Contact"].map((item, index) => (
            <ScrollLink 
              key={index}
              to={item.toLowerCase().replace(/\s+/g, '-')} 
              smooth={true}
              duration={800}
              offset={-80}
              className="text-sm font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
              style={{
                color: brandColors.white, 
                ':hover': { color: brandColors.mediumBlue },
                '::after': { backgroundColor: brandColors.mediumBlue }
              }}
            >
              {item}
            </ScrollLink>
          ))}
        </nav>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
          onClick={toggleMobileMenu}
          style={{ color: brandColors.white }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <div className="hidden md:flex items-center gap-4">
          <Link to="/login">
            <button 
              className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              style={{ color: brandColors.mediumBlue, border: `1px solid ${brandColors.mediumBlue}` }}
            >
              Login
            </button>
          </Link>
          <Link to="/sign-up">
            <button 
              className="px-5 py-2 text-sm font-medium text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: brandColors.mediumBlue }}
            >
              Sign Up
            </button>
          </Link>
        </div>
      </div>
      {/* Mobile Navigation Menu */}
      <div className={`md:hidden absolute w-full bg-white/90 backdrop-blur-md shadow-lg transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="py-4 space-y-3 px-8">
          {["Home", "About Us", "Programs", "Success Stories", "Events", "Contact"].map((item, index) => (
            <ScrollLink 
              key={index}
              to={item.toLowerCase().replace(/\s+/g, '-')} 
              smooth={true}
              duration={800}
              offset={-80}
              className="block py-2 px-4 text-sm font-medium hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: brandColors.darkBlue }}
            >
              {item}
            </ScrollLink>
          ))}
          <div className="flex items-center gap-2 pt-2 px-4">
            <Link to="/login" className="w-full">
              <button 
                className="w-full px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                style={{ color: brandColors.mediumBlue, border: `1px solid ${brandColors.mediumBlue}` }}
              >
                Login
              </button>
            </Link>
            <Link to="/sign-up" className="w-full">
              <button 
                className="w-full px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                style={{ color: brandColors.mediumBlue, border: `1px solid ${brandColors.mediumBlue}` }}
              >
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
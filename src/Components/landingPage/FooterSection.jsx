// components/Footer.js
import React from 'react';
import { ScrollLink } from 'react-scroll';
import { Trophy, Phone, Mail, MapPin, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';

const defaultBrandColors = {
  darkBlue: '#0f172a',
  white: '#ffffff',
};

const Footer = ({ brandColors = defaultBrandColors }) => {
  return (
    <footer className="bg-gray-900 text-white py-12" style={{ backgroundColor: brandColors.darkBlue }}>
      <div className="px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-8 w-8" style={{ color: brandColors.white }} />
              <span className="text-xl font-bold">Olympiad Edu Center</span>
            </div>
            <p className="text-gray-400 text-sm">
              Empowering students to achieve academic excellence through specialized olympiad training.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {["Home", "About Us", "Programs", "Success Stories", "Events", "Contact"].map((item, index) => (
                <li key={index}>
                  <ScrollLink 
                    to={item.toLowerCase().replace(/\s+/g, '-')} 
                    smooth={true}
                    duration={800}
                    offset={-80}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {item}
                  </ScrollLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+233201856818</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>programs@atdp.africa</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>No. 23 Okpelor Abloh Annang Street, Adjiringanor, East Legon - Accra, Ghana.</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Follow Us</h3>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          © 2025 Olympiad Edu Center. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
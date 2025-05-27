import React from 'react';
import { Link } from 'react-router-dom';
import { RecycleIcon, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <RecycleIcon className="h-8 w-8 text-green-500" />
              <div className="ml-2">
                <div className="text-lg font-bold text-green-400">E-Waste</div>
                <div className="text-xs text-green-300">Management Platform</div>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Leading the way in responsible e-waste management and environmental sustainability. Join us in creating a cleaner, greener future.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/services" className="text-gray-400 hover:text-green-400">Residential Pickup</Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-green-400">Corporate Disposal</Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-green-400">Drop-off Centers</Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-green-400">Data Destruction</Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-green-400">E-Waste Recycling</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-green-400">About Us</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-green-400">Our Mission</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-green-400">Contact Us</Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-green-400">Careers</Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-green-400">Partner With Us</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span className="text-gray-400">
                  Swarnandhra Campus<br />
                  Narsapur, India
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-400">+91-98765-43210</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-400">contact@ewaste.org</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} E-Waste Management Platform. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="#" className="text-gray-400 hover:text-green-400 text-sm">Terms & Conditions</Link>
              <Link to="#" className="text-gray-400 hover:text-green-400 text-sm">Privacy Policy</Link>
              <Link to="#" className="text-gray-400 hover:text-green-400 text-sm">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
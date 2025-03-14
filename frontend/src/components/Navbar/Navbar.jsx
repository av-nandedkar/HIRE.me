import React, { useState } from "react";
import { FaUser, FaCaretDown, FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-4 fixed top-0 w-full z-50 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <a href="/" className="flex items-center space-x-2">
          <img src="/HIRE.me-white.png" alt="HIRE.me Logo" className="px-5 h-10 w-auto" />
        </a>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 text-lg">
          <li><a href="/" className="hover:text-blue-400 transition duration-300">Home</a></li>
          <li><a href="/login" className="hover:text-blue-400 transition duration-300">Login</a></li>
          <li><a href="/companies" className="hover:text-blue-400 transition duration-300">Job</a></li>
          <li><a href="/pricing" className="hover:text-blue-400 transition duration-300">Part-time</a></li>
          <li><a href="/contact" className="hover:text-blue-400 transition duration-300">Services</a></li>
        </ul>

        {/* Profile Dropdown */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-full hover:bg-gray-700 transition"
          >
            <FaUser className="text-lg" />
            <FaCaretDown />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 bg-gray-900/90 backdrop-blur-lg text-white rounded-lg p-3 w-44 shadow-lg border border-gray-700 transition-all duration-300">
              <a href="/dashboard" className="block px-4 py-2 hover:bg-gray-700 rounded-md transition duration-200">Dashboard</a>
              <a href="/settings" className="block px-4 py-2 hover:bg-gray-700 rounded-md transition duration-200">Settings</a>
              <a href="/logout" className="block px-4 py-2 hover:bg-gray-700 rounded-md transition duration-200">Logout</a>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden block text-gray-400 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-gray-900/90 p-5 absolute top-16 left-0 w-full flex flex-col items-center space-y-4 transition-all duration-300 ${
          menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <a href="/" className="hover:text-blue-400 transition duration-300 text-lg">Home</a>
        <a href="/login" className="hover:text-blue-400 transition duration-300 text-lg">Login</a>
        <a href="/companies" className="hover:text-blue-400 transition duration-300 text-lg">Jobs</a>
        <a href="/pricing" className="hover:text-blue-400 transition duration-300 text-lg">Part-time</a>
        <a href="/contact" className="hover:text-blue-400 transition duration-300 text-lg">Services</a>
      </div>
    </nav>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* About Us Section */}
          <div>
            <h3 className="text-sm font-semibold">About HIRE.me</h3>
            <p className="text-xs text-gray-500 mt-2">
              HIRE.me is a job-matching platform that helps businesses find skilled professionals and job seekers land their ideal roles.
            </p>
          </div>

          {/* Services Section */}
          <div>
            <h3 className="text-sm font-semibold">Services</h3>
            <ul className="mt-2 text-xs text-gray-500 space-y-2">
              <li>Job Search</li>
              <li>Freelance Opportunities</li>
              <li>Company Reviews</li>
              <li>Career Coaching</li>
            </ul>
          </div>

          {/* Resources Section */}
          <div>
            <h3 className="text-sm font-semibold">Resources</h3>
            <ul className="mt-2 text-xs text-gray-500 space-y-2">
              <li>Interview Tips</li>
              <li>Resume Writing</li>
              <li>Career Blog</li>
              <li>Salary Insights</li>
            </ul>
          </div>

          {/* Company Info */}
          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-2 text-xs text-gray-500 space-y-2">
              <li>About Us</li>
              <li>Our Team</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>

        </div>

        {/* Copyright Section */}
        <div className="text-center text-gray-500 text-sm mt-5 border-t pt-4">
          © {new Date().getFullYear()} Hire.me Inc. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};
export { Navbar, Footer };
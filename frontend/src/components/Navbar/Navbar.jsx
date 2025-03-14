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
          <li><a href="/jobs" className="hover:text-blue-400 transition duration-300">Jobs</a></li>
          <li><a href="/companies" className="hover:text-blue-400 transition duration-300">Companies</a></li>
          <li><a href="/pricing" className="hover:text-blue-400 transition duration-300">Pricing</a></li>
          <li><a href="/contact" className="hover:text-blue-400 transition duration-300">Contact</a></li>
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
        <a href="/jobs" className="hover:text-blue-400 transition duration-300 text-lg">Jobs</a>
        <a href="/companies" className="hover:text-blue-400 transition duration-300 text-lg">Companies</a>
        <a href="/pricing" className="hover:text-blue-400 transition duration-300 text-lg">Pricing</a>
        <a href="/contact" className="hover:text-blue-400 transition duration-300 text-lg">Contact</a>
      </div>
    </nav>
  );
};

export default Navbar;

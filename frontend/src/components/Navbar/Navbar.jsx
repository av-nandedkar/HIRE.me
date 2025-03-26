import React, { useState, useEffect } from "react";
import { FaUser, FaCaretDown, FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [authToken, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const userLoggedIn = localStorage.getItem("authToken");
    setIsAuthenticated(Boolean(userLoggedIn)); // true if logged in
  }, []);

  useEffect(() => {
    // Function to initialize Google Translate with the stored language
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", autoDisplay: false },
        "google_translate_element"
      );

      // Apply stored language
      const storedLang = localStorage.getItem("selectedLanguage");
      if (storedLang) {
        setTimeout(() => {
          const selectElement = document.querySelector(".goog-te-combo");
          if (selectElement) {
            selectElement.value = storedLang;
            selectElement.dispatchEvent(new Event("change"));
          }
        }, 500);
      }
    };

    // Load Google Translate script
    if (!window.googleTranslateLoaded) {
      window.googleTranslateLoaded = true;
      const script = document.createElement("script");
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    // Load Google Translate script and initialize only if language dropdown is open
    if (languageOpen && !window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { pageLanguage: "en", autoDisplay: false },
          "google_translate_element_mobile"
        );
      };

      const script = document.createElement("script");
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [languageOpen]);


  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-4 fixed top-0 w-full z-50 shadow-lg">
   {/* Navbar Container */}
<div className="container mx-auto flex justify-between items-center px-4">

{/* Logo */}
<a href="/" className="flex items-center space-x-2">
  <img src="/HIRE.me-white.png" alt="HIRE.me Logo" className="h-10 w-auto" />
</a>

{/* Desktop Menu */}
<ul className={`hidden md:flex flex-1 ${authToken ? "justify-center" : "justify-center"} space-x-8 text-lg items-center`}>
  <li>
    <a href="/" className="relative hover:text-[#ff347f] transition duration-300 
       after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] 
       after:bg-[#ff347f] after:transition-all after:duration-300 hover:after:w-full">
      Home
    </a>
  </li>
  <li>
    <a href={authToken ? "/dashboard" : "/login"}
      onClick={() => !authToken}
      className="relative hover:text-[#ff347f] transition duration-300 
       after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] 
       after:bg-[#ff347f] after:transition-all after:duration-300 hover:after:w-full">
      {authToken ? "Dashboard" : "Login"}
    </a>
  </li>
  <li>
    <a href="/jobrecommendations" className="relative hover:text-[#ff347f] transition duration-300 
       after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] 
       after:bg-[#ff347f] after:transition-all after:duration-300 hover:after:w-full">
      Jobs
    </a>
  </li>
  <li>
    <a href="/pricing" className="relative hover:text-[#ff347f] transition duration-300 
       after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] 
       after:bg-[#ff347f] after:transition-all after:duration-300 hover:after:w-full">
      Part-time
    </a>
  </li>
</ul>

{/* Language Dropdown & Profile Placeholder */}
<div className="relative flex items-center space-x-4">
         {/* Language Dropdown */}
         <div className="relative flex items-center">
            <button
               onClick={() => setLanguageOpen((prev) => !prev)}
               className="flex items-center space-x-2 bg-white text-black px-2 py-2 rounded-full shadow-md border border-gray-300 hover:bg-gray-200 transition-all"
            >
               <span className="font-medium"><strong>🌐</strong></span>
               <FaCaretDown className={`transition-transform ${languageOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            <div
               className={`absolute right-0 mt-49 w-52 bg-white shadow-lg border border-gray-300 rounded-lg p-3 transition-all duration-300 ease-in-out ${
                  languageOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
               }`}
            >
               <div id="google_translate_element" className="google_translate_element p-2 text-center"></div>
            </div>
         </div>

{/* Profile Dropdown (With Fixed Width) */}
<div className="relative hidden md:block" style={{ minWidth: "3rem" }}>
            {authToken && (
               <div>
                  <button
                     onClick={() => setDropdownOpen(!dropdownOpen)}
                     className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-full hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <FaUser className="text-lg" />
                     <FaCaretDown className={`transition-transform duration-300 ${dropdownOpen ? "rotate-180" : "rotate-0"}`} />
                  </button>

                  {dropdownOpen && (
                     <div className="absolute right-0 mt-3 w-48 origin-top-right bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg transition-all ease-out duration-300 scale-100">
                        <a href="/viewprofile" className="block px-4 py-3 text-sm text-white hover:bg-gray-700 rounded-md transition-colors">Profile</a>
                        <a href="/login" onClick={handleLogout} className="block px-4 py-3 text-sm text-red-400 hover:bg-red-700 hover:text-white rounded-md transition-colors">Logout</a>
                     </div>
                  )}
               </div>
            )}
</div>
</div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden block text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-transform duration-300 ease-in-out"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <FaTimes className="w-6 h-6 transition-transform duration-300 ease-in-out transform scale-100 hover:scale-110" />
          ) : (
            <FaBars className="w-6 h-6 transition-transform duration-300 ease-in-out transform scale-100 hover:scale-110" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden bg-gray-900/90 p-5 absolute top-16 left-0 w-full flex flex-col items-center space-y-4 transition-all duration-300 ease-in-out ${menuOpen ? "opacity-100 visible scale-100" : "opacity-0 invisible scale-95"}`}>
        <a href="/" className="hover:text-[#ff347f] transition duration-300">Home</a>  <a
          href={authToken ? "/dashboard" : "/login"}
          onClick={() => !authToken}
          className="hover:text-[#ff347f] transition duration-300"
        >
          {authToken ? "Dashboard" : "Login"}
        </a>

        <a href="/companies" className="hover:text-[#ff347f] transition duration-300">Jobs</a>
        <a href="/pricing" className="hover:text-[#ff347f] transition duration-300">Part-time</a>
        <a href="/contact" className="hover:text-[#ff347f] transition duration-300">Services</a>

        {/* Mobile Profile Dropdown */}
        {authToken && (
          <div className="relative">

            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-full hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <FaUser className="text-lg" />
              <FaCaretDown className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 origin-top-right bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg transition-all ease-out duration-300 scale-100 z-20">
                <a href="/viewprofile" className="block px-4 py-3 text-sm text-white hover:bg-gray-700 rounded-md transition-colors">Profile</a>
                {/* <a href="/settings" className="block px-4 py-3 text-sm text-white hover:bg-gray-700 rounded-md transition-colors">Settings</a> */}
                <a href="/login" onClick={handleLogout} className="block px-4 py-3 text-sm text-red-400 hover:bg-red-700 hover:text-white rounded-md transition-colors">Logout</a>
              </div>
            )}
          </div>
        )}

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
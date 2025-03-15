import React from "react";
import { ShieldCheck, Cog, Headset, Users,TrendingUp, Star,Clock } from "lucide-react";
import { Typewriter } from "react-simple-typewriter";

const Home = () => {
  return (
    <div className="pt-30 bg-gray-900  relative  text-white min-h-screen flex flex-col justify-center items-center px-6 md:px-12">
      {/* Background Overlay with Red Lines Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-60" />
      
      <div className="relative text-center z-10">
      <h2 className="text-2xl sm:text-xl md:text-4xl text-center ">
      <span className="notranslate"><Typewriter
        words={["Connecting Job Seekers & Employers Seamlessly", "Find Your Perfect Job or Hire Top Talent"]}
        loop={true}
        cursor
        cursorStyle="|"
        typeSpeed={80}
        deleteSpeed={50}
        delaySpeed={2000}
      /></span>
    </h2>
        <p className="mt-4 text-sm md:text-lg max-w-2xl mx-auto text-gray-300">
        HIRE.me bridges the gap between job seekers and employers, making hiring and job hunting effortless. Whether you're looking for work or need skilled professionals, our platform ensures the perfect match—quickly and efficiently.
        </p>
      </div>
      
      <div className="relative flex flex-wrap justify-center items-center gap-8 mt-10 z-10">
        <div className="text-center  pr-6 border-r-0 md:border-r border-gray-500">
          <span className="text-[#ff347f] text-2xl font-bold">500+</span>
          <p className="text-gray-300">Job Listings</p>
        </div>
        <div className="text-center  pr-6 border-r-0 md:border-r border-gray-500">
          <span className="text-[#ff347f] text-2xl font-bold">300+</span>
          <p className="text-gray-300">Active Employers</p>
        </div>
        <div className="text-center">
          <span className="text-[#ff347f] text-2xl font-bold">95%</span>
          <p className="text-gray-300">Job Matche</p>
        </div>
      </div>
      
      <div className="relative flex gap-4 mt-10 z-10 mb-25">
        <a href="/workproviderform"><button className="bg-[black] hover:bg-[#ff347f] cursor-pointer text-white px-6 py-3 rounded-lg font-medium transition">
          Join HIRE.me
        </button></a>
        <button className="border border-white px-6 py-3 rounded-lg font-medium transition hover:bg-gray-800 cursor-pointer">
          Contact Us
        </button>
      </div>
      
      {/* Features Section */}
        <div className="relative z-10 mt-5 w-full text-center">
        <h2 className="text-3xl font-bold">Why Choose HIRE.me?</h2>
        <p className="text-gray-300 mt-6 max-w-2xl mx-auto">
            Empowering job seekers and service providers with seamless hiring solutions, smart job recommendations, and real-time connections.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-6xl mx-auto px-4">
            <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center text-center shadow-lg">
            <Cog className="text-gray-400 w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold">AI-Powered Job Matching</h3>
            <p className="text-gray-400 mt-2">
                Get personalized job recommendations based on your skills, location, and preferences using advanced AI algorithms.
            </p>
            <a href="#" className="text-cyan-300 mt-4 font-medium">Learn more</a>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center text-center shadow-lg">
            <ShieldCheck className="text-gray-300 w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold">Hire Based on Ratings & Reviews</h3>
            <p className="text-gray-400 mt-2">
            Make informed hiring decisions by checking verified ratings and reviews from previous clients. 
                
            </p>
            <a href="#" className="text-cyan-300 mt-4 font-medium">Learn more</a>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center text-center shadow-lg">
            <Headset className="text-gray-300 w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold">Real-Time Job Alerts</h3>
            <p className="text-gray-400 mt-2">
                Never miss an opportunity! Get instant notifications for new job postings and applications. Stay ahead with real-time alerts.
            </p>
            <a href="#" className="text-cyan-300 mt-4 font-medium">Learn more</a>
            </div>
        </div>
        </div>

        {/* Testimonial Section */}
<div className="relative z-10 mt-30 w-full text-center">
  <h2 className="text-3xl font-bold">What Our Users Say</h2>
  <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
    Real experiences from job seekers and employers who found success with HIRE.me.
  </p>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-15 max-w-6xl mx-auto px-4 mb-20">
    {/* Employer Review - 1 */}
<div className="bg-gray-780 hover:bg-gray-800 transition duration-300 p-4 sm:p-6 rounded-lg shadow-[0px_1px_1px_rgba(255,255,255,0.6)] text-center cursor-pointer">
  <div className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-3 sm:mb-4">
    <img src="https://i.pravatar.cc/150?img=45" alt="Rajesh Sharma" className="rounded-full" />
  </div>
  <h3 className="text-lg sm:text-xl font-semibold">Rajesh Sharma</h3>
  <p className="text-gray-400 text-xs sm:text-sm">Small Business Owner, Mumbai</p>
  <p className="text-gray-300 mt-3 sm:mt-4 text-sm sm:text-base">
    "WorkConnect made hiring electricians and carpenters for my store so easy! The ratings and reviews helped me choose the best professionals, and the real-time alerts saved me time."
  </p>
</div>

{/* Employer Review - 2 */}
<div className="bg-gray-780 hover:bg-gray-800 transition duration-300 p-4 sm:p-6 rounded-lg shadow-[0px_1px_1px_rgba(255,255,255,0.6)] text-center cursor-pointer">
  <div className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-3 sm:mb-4">
    <img src="https://i.pravatar.cc/150?img=48" alt="Priya Verma" className="rounded-full" />
  </div>
  <h3 className="text-lg sm:text-xl font-semibold">Priya Verma</h3>
  <p className="text-gray-400 text-xs sm:text-sm">Restaurant Owner, Delhi</p>
  <p className="text-gray-300 mt-3 sm:mt-4 text-sm sm:text-base">
    "Finding skilled workers for my restaurant was always a hassle until I started using WorkConnect. The platform helped me connect with reliable staff quickly, and the process was smooth."
  </p>
</div>

{/* Employee Review */}
<div className="bg-gray-780 hover:bg-gray-800 transition duration-300 p-4 sm:p-6 rounded-lg shadow-[0px_1px_1px_rgba(255,255,255,0.6)] text-center cursor-pointer">
  <div className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-3 sm:mb-4">
    <img src="https://i.pravatar.cc/150?img=52" alt="Amit Kumar" className="rounded-full" />
  </div>
  <h3 className="text-lg sm:text-xl font-semibold">Amit Kumar</h3>
  <p className="text-gray-400 text-xs sm:text-sm">Electrician, Bangalore</p>
  <p className="text-gray-300 mt-3 sm:mt-4 text-sm sm:text-base">
    "WorkConnect helped me find jobs in my area without any middlemen. I get instant notifications about new job postings, and the rating system has helped me build trust with employers."
  </p>
</div>

  </div>
</div>


    </div>
  );
};

export default Home;

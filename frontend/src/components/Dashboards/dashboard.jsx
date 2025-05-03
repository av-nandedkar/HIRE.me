import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Briefcase,
  CalendarClock,
  FileText,
  Megaphone,
  PlusCircle,
  UserCheck,
  UserPlus,
  Users,
  LogOut,
} from "lucide-react";

const Dashboard = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");

    // console.log("Token:", token);
    // console.log("Role:", role);

    if (!token || !role) {
      console.warn("Redirecting to /login due to missing token or role.");
      navigate("/login");
    } else {
      // console.log("User authenticated as:", role);
      setUserRole(role);
    }
    setLoading(false);
  }, [navigate]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.clear(); // Removes all localStorage items
    navigate("/login");
    window.location.reload();
  };
  
  if (loading) {
    return <p className="text-gray-400">Loading...</p>;
  }

  const GlassButton = ({ onClick, children, color }) => (
    <button
      onClick={onClick}
      className={`backdrop-blur-md bg-${color}-600/70 hover:bg-${color}-700/80 p-4 rounded-2xl flex items-center justify-center gap-3 text-white shadow-md transition-transform duration-300 hover:scale-105`}
    >
      {children}
    </button>
  );
  

  return (
    <div className="min-h-screen py-30 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col items-center p-6">
  <h2 className="text-4xl font-semibold mb-4 text-center drop-shadow-md transition-all duration-500 ease-in-out">
    Welcome to Your Menu
  </h2>

  <img
    src="/1.gif"
    alt="Profile Image"
    className="h-24 mt-3 mb-6 sm:h-32 md:h-40 lg:h-48 xl:h-56 rounded-3xl object-contain transition-transform duration-500 hover:scale-105"
  />

  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-lg p-8 w-full max-w-6xl transition-all duration-700 ease-in-out">
    {userRole === "provider" ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Post a Job */}
        <GlassButton onClick={() => handleNavigation("/jobpost")} color="blue">
          <PlusCircle /> Post a Job
        </GlassButton>

        {/* View Applications */}
        <GlassButton onClick={() => handleNavigation("/providerprofile/applications")} color="green">
          <FileText /> View Applications
        </GlassButton>

        {/* Manage Listings */}
        <GlassButton onClick={() => handleNavigation("/providerprofile/joblist")} color="purple">
          <Briefcase /> Manage Listings
        </GlassButton>

        {/* History */}
        <GlassButton onClick={() => handleNavigation("/completedjobs")} color="yellow">
          <CalendarClock /> Completed Jobs
        </GlassButton>

        {/* Manage Profile */}
        <GlassButton onClick={() => handleNavigation("/providerprofile")} color="pink">
          <UserPlus /> Manage Profile
        </GlassButton>
      </div>
    ) : userRole === "seeker" ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Apply for Jobs */}
        <GlassButton onClick={() => handleNavigation("/jobrecommendations")} color="blue">
          <UserCheck /> Apply for Jobs
        </GlassButton>

        {/* View Saved Jobs */}
        <GlassButton onClick={() => handleNavigation("/viewappliedjobs")} color="green">
          <FileText /> View My Applied Jobs
        </GlassButton>

        {/* Manage Profile */}
        <GlassButton onClick={() => handleNavigation("/seekerprofile")} color="purple">
          <UserPlus /> Manage Profile
        </GlassButton>
      </div>
    ) : (
      <p className="text-gray-400 text-center">Loading...</p>
    )}
  </div>

  {/* Logout Button */}
  <button
    onClick={handleLogout}
    className="bg-red-500 hover:bg-red-700 text-white py-2 px-6 rounded-full mt-8 shadow-lg backdrop-blur-md transition-transform duration-300 hover:scale-105 flex items-center gap-2"
  >
    <LogOut /> Logout
  </button>
</div>

  );
};

export default Dashboard;

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

  return (
    <div className="min-h-screen py-25 bg-gray-900 text-white flex flex-col items-center p-6">
      <h2 className="text-3xl font-bold ">Welcome to Your Dashboard</h2>
      <img src="/1.gif" alt="Profile Image" className="h-24 mt-3 mb-3 sm:h-32 md:h-40 rounded-3xl lg:h-48 xl:h-65 object-contain" />

      {userRole === "provider" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
          {/* Post a Job */}
          <button
            className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg flex items-center justify-center gap-2"
            onClick={() => handleNavigation("/providerprofile")}
          >
            <PlusCircle /> post a job
          </button>

          {/* View Applications */}
          <button
            className="bg-green-600 hover:bg-green-700 p-4 rounded-lg flex items-center justify-center gap-2"
            onClick={() => handleNavigation("/providerprofile/applications")}
          >
            <FileText /> View Applications
          </button>

          {/* Manage Listings */}
          <button
            className="bg-purple-600 hover:bg-purple-700 p-4 rounded-lg flex items-center justify-center gap-2"
            onClick={() =>
              handleNavigation("/providerprofile/joblist")
            }
          >
            <Briefcase /> Manage Listings
          </button>

              {/* History */}
          <button
            className="bg-yellow-600 hover:bg-yellow-700 p-4 rounded-lg flex items-center justify-center gap-2"
            onClick={() =>
              handleNavigation("/pastjobs")
            }
          >
            <CalendarClock /> Past Jobs
          </button>
          
        </div>
      ) : userRole === "seeker" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
          {/* Apply for Jobs */}
          <button
            className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg flex items-center justify-center gap-2"
            onClick={() => handleNavigation("/jobsearch")}
          >
            <UserCheck /> Apply for Jobs
          </button>

          {/* View Saved Jobs */}
          <button
            className="bg-green-600 hover:bg-green-700 p-4 rounded-lg flex items-center justify-center gap-2"
            onClick={() => handleNavigation("/viewappliedjobs")}
          >
            <FileText /> View My Applied Jobs
          </button>

          {/* Manage Profile */}
          <button
            className="bg-purple-600 hover:bg-purple-700 p-4 rounded-lg flex items-center justify-center gap-2"
            onClick={() => handleNavigation("/seekerprofile")}
          >
            <UserPlus /> Manage Profile
          </button>

        </div>
      ) : (
        <p className="text-gray-400">Loading...</p>
      )}

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded-lg mt-6 flex items-center gap-2"
      >
        <LogOut /> Logout
      </button>
    </div>
  );
};

export default Dashboard;

import { useState, useEffect } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { app } from "../../firebase";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const database = getDatabase(app);

const AppliedJobs = () => {
    const navigate = useNavigate();
  const email = localStorage.getItem("email");
  const sanitizedEmail = email ? email.replace(/\./g, ",") : null;

  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sanitizedEmail) {
      toast.dismiss(); // Clear previous toasts
      toast.error("User not logged in!");
      setLoading(false);
      return;
    }
  
    const userRef = ref(database, `user-metadata/seeker/${sanitizedEmail}`);
  
    get(userRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          const appliedJobIds = userData.appliedJobs || [];
  
          if (appliedJobIds.length === 0) {
            toast.dismiss(); // Clear previous toasts
            toast("No applied jobs found.", { icon: "ℹ️" });
            setLoading(false);
            return;
          }
  
        } else {
          toast.dismiss(); // Clear previous toasts
          toast.error("User data not found!");
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching applied jobs:", error);
        toast.dismiss(); // Clear previous toasts
        toast.error("Failed to fetch applied jobs.");
        setLoading(false);
      });
  }, [sanitizedEmail]);
  
  if (loading) {
    return (
      <motion.div
        className="fixed inset-0 bg-gray-800 bg-opacity-60 flex justify-center items-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-white text-xl sm:text-2xl font-semibold">Loading...</div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen mt-18 bg-gray-900 p-6 flex flex-col items-center">
      <Toaster />
      <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-6 text-indigo-400">
        My Applied Jobs
      </h1>
  
      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : appliedJobs.length > 0 ? (
        <div className="w-full max-w-7xl bg-gray-800 shadow-xl rounded-lg p-6 border border-gray-700">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse border border-gray-700">
              <thead>
                <tr className="bg-indigo-600 text-white text-sm md:text-base">
                  <th className="py-3 px-4">Job Title</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 hidden md:table-cell">Job Type</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4 hidden md:table-cell">Budget</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Skills</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Contact</th>
                  <th className="py-3 px-4">Apply By</th>
                  <th className="py-3 px-4">Job Date</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Description</th>
                </tr>
              </thead>
              <tbody>
                {appliedJobs.map((job, index) => (
                  <tr
                    key={job.id}
                    className={`text-center text-sm md:text-base ${
                      index % 2 === 0 ? "bg-gray-700" : "bg-gray-800"
                    } text-gray-300`}
                  >
                    <td className="py-3 px-4 font-semibold text-indigo-300">{job.jobTitle || "N/A"}</td>
                    <td
                      className={`py-3 px-4 font-semibold ${
                        job.status === "Approved"
                          ? "text-green-400"
                          : job.status === "Rejected"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {job.status || "Pending"}
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-white">{job.jobType || "N/A"}</td>
<td className="py-3 px-4 text-white">{job.experienceLevel || "N/A"}</td>
<td className="py-3 px-4 hidden md:table-cell text-white">{job.budgetRange || "N/A"}</td>
<td className="py-3 px-4 text-white">{job.location || "N/A"}</td>
<td className="py-3 px-4 hidden lg:table-cell text-white">{job.skillsRequired || "N/A"}</td>
<td className="py-3 px-4 hidden lg:table-cell text-white">{job.contactPersonName || "N/A"}</td>
<td className="py-3 px-4 text-white">{job.applyBy || "N/A"}</td>
<td className="py-3 px-4 text-white">{job.jobDate || "N/A"}</td>
<td className="py-3 px-4 hidden lg:table-cell text-white">{job.description || "N/A"}</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
  
          {/* Mobile View */}
          <div className="md:hidden scale-95">
            {appliedJobs.map((job) => (
              <div key={job.id} className="bg-gray-700 rounded-lg p-4 shadow-md mb-4 border border-gray-600">
                <h2 className="text-lg font-semibold text-indigo-300">{job.jobTitle || "N/A"}</h2>
                <p className="text-sm text-white">Status: <span className={`font-semibold ${job.status === "Approved" ? "text-green-400" : job.status === "Rejected" ? "text-red-400" : "text-yellow-400"}`}>{job.status || "Pending"}</span></p>
<p className="text-sm text-white">Experience: {job.experienceLevel || "N/A"}</p>
<p className="text-sm text-white">Budget: {job.budgetRange || "N/A"}</p>
<p className="text-sm text-white">Location: {job.location || "N/A"}</p>
<p className="text-sm text-white">Apply By: {job.applyBy || "N/A"}</p>
<p className="text-sm text-white">Job Date: {job.jobDate || "N/A"}</p>

              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
       <p className="text-center text-gray-400">No applied jobs found.</p>
<button 
  onClick={() => navigate("/jobsearch")} 
  className="bg-purple-900 mt-5 text-white font-medium px-5 py-2 rounded-3xl shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-purple-500 active:scale-95"
>
  Apply a New One
</button>
</>
      )}
    </div>
  );
  
  
};

export default AppliedJobs;

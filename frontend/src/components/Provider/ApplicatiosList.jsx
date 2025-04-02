import { useState, useEffect } from "react";
import { getDatabase, ref, onValue, get, remove, update } from "firebase/database";
import { app } from "../../firebase";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

const database = getDatabase(app);

const ApplicationList = () => {
  const [jobsWithApplications, setJobsWithApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    
    const fetchJobsWithApplications = async () => {
      const jobsRef = ref(database, "jobs");
      const currentUserEmail = localStorage.getItem("email");
    
      onValue(jobsRef, async (jobsSnapshot) => {
        if (jobsSnapshot.exists() && currentUserEmail) {
          const jobsData = jobsSnapshot.val();
          const userJobs = Object.keys(jobsData)
            .map((key) => ({
              id: key,
              ...jobsData[key],
            }))
            .filter((job) => job.provideremail === currentUserEmail);
    
          const jobsWithApps = await Promise.all(
            userJobs.map(async (job) => {
              const applications = job.applications
                ? await Promise.all(
                    Object.keys(job.applications).map(async (appKey) => {
                      const appData = { id: appKey, ...job.applications[appKey] };
                      const applicantDetails = await fetchApplicantDetails(
                        appData.applicantEmail
                      );
                      return { ...appData, applicantDetails };
                    })
                  )
                : [];
    
              return { ...job, applications };
            })
          );
    
          setJobsWithApplications(jobsWithApps);
        } else {
          setJobsWithApplications([]);
        }
        setLoading(false);
      });
    };
    

    fetchJobsWithApplications();
  }, []);

  const fetchApplicantDetails = async (appId) => {
    const sanitizedEmail = appId.replace(/\./g, ",");
    const seekerRef = ref(database, `user-metadata/seeker/${sanitizedEmail}`);
  
    try {
      const seekerSnapshot = await get(seekerRef);
      return seekerSnapshot.exists() ? seekerSnapshot.val() : null;
    } catch (error) {
      console.error("Error fetching applicant details:", error);
      return null;
    }
  };
  

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
  
  // Update application status
  const handleUpdateStatus = async (jobId, appId, status) => {
    try {
      await update(ref(database, `jobs/${jobId}/applications/${appId}`), {
        status,
      });
      toast.success(status ? `Application ${status}!` : "Application Reset");
        setJobsWithApplications((prevJobs) =>
        prevJobs.map((job) => ({
          ...job,
          applications: job.applications.map((app) =>
            app.id === appId ? { ...app, status } : app
          ),
        }))
      );
      window.location.reload();
    } catch (error) {
      toast.error("Error updating status: " + error.message);
    }
  };

  const openModal = (applicant) => {
    setSelectedApplicant(applicant);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedApplicant(null);
  }; 

  if (loading) {
    return (
      <p className="text-center mt-5 text-gray-700">Loading applications...</p>
    );
  }

  return (
    <div className="pt-10 min-h-screen px-4 sm:px-8 md:px-12 lg:px-16 bg-gray-900 pb-10">
      <Toaster />
      <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-6 sm:mb-10 text-white tracking-wider pt-16 sm:pt-20">
        Applications for Your Jobs
      </h2>
  
      {/* Status Filter */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 items-center justify-center mb-6 text-white">
        <p className="text-sm sm:text-base">Select Application Status: </p>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border rounded-md bg-gray-800/90 w-full sm:w-auto"
        >
          <option value="all">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
  
      {jobsWithApplications.length === 0 ? (
  <p className="text-center text-gray-400 text-base sm:text-lg">No applications available.</p>
) : (
  <div className="space-y-5 sm:space-y-7">
    {jobsWithApplications.map((job) => (
      <motion.div
        key={job.id}
        className="bg-white shadow-xl rounded-2xl w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto p-4 sm:p-6 border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-bold text-black">{job.jobTitle}</h3>
        </div>

        {job.applications.length === 0 ? (
          <p className="text-gray-500 mt-3 sm:mt-4 text-sm">No applications yet.</p>
        ) : (
          <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
            {job.applications
              .filter((app) => filterStatus === "all" || app.status === filterStatus)
              .map((app) => (
                <motion.div
                  key={app.id}
                  className="p-4 bg-gray-100 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Applicant Info */}
                  <div className="w-full sm:w-auto flex-1">
                    <div className="text-sm sm:text-base text-black font-semibold truncate max-w-full sm:max-w-[250px] lg:max-w-[300px]">
                      {app.applicantEmail}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500">Contact: {app.contactNumber || "N/A"}</p>

                    <span
                      className={`text-xs sm:text-sm font-semibold px-2 py-1 rounded block mt-1 w-max ${
                        app.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : app.status === "Rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {app.status || "Pending"}
                    </span>
                  </div>

                  {/* Buttons & Select Menu */}
                  <div className="w-full flex flex-wrap sm:flex-nowrap gap-2 sm:gap-4">
                    <button
                      onClick={() => openModal(app.applicantDetails)}
                      className="bg-purple-900 text-white text-sm sm:text-base font-medium px-4 sm:px-5 py-2 rounded-3xl shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-purple-500 active:scale-95 w-full sm:w-auto"
                    >
                      Details
                    </button>

                    <select
                      onChange={(e) => handleUpdateStatus(job.id, app.id, e.target.value)}
                      className="bg-gray-100 border border-gray-300 px-3 py-2 rounded-md text-sm sm:text-base w-full sm:w-auto"
                    >
                      <option value="">Change</option>
                      <option value="Approved" className="text-green-600">Approve</option>
                      <option value="Rejected" className="text-red-600">Reject</option>
                      <option value="" className="text-yellow-600">Reset</option>
                    </select>
                  </div>
                </motion.div>
              ))}
          </div>
        )}
      </motion.div>
    ))}
  </div>
)}

  
      {/* Modal Content */}
      {isModalOpen && selectedApplicant && (
  <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center z-50 px-2 sm:px-4">
    <motion.div
      className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl w-full max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl shadow-gray-900 transform transition-all duration-500 scale-95 animate-fadeIn relative border border-gray-200 overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-transparent opacity-10 pointer-events-none"></div>

      {/* Profile Picture */}
      <div className="flex flex-col items-center">
        {selectedApplicant.profilePicture ? (
          <img
            src={selectedApplicant.profilePicture}
            alt="Profile"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-gray-300 shadow-md"
          />
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-300 flex items-center justify-center shadow-md">
            <span className="text-gray-600 text-xs sm:text-base">No Image</span>
          </div>
        )}
        <h2 className="text-lg sm:text-xl text-gray-900 font-semibold mt-2 sm:mt-3">
          {selectedApplicant.fullName || "N/A"}
        </h2>
      </div>

      {/* Applicant Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm md:text-base mt-3 sm:mt-4">
      <p className="text-gray-700"><strong>Name:</strong> {selectedApplicant.fullName || "N/A"}</p>
        <p className="text-gray-700"><strong>Email:</strong> {selectedApplicant.email || "N/A"}</p>
        <p className="text-gray-700"><strong>Phone:</strong> {selectedApplicant.phoneNumber || "N/A"}</p>
        <p className="text-gray-700"><strong>City:</strong> {selectedApplicant.city || "N/A"}</p>
        <p className="text-gray-700"><strong>Location:</strong> {selectedApplicant.location || "N/A"}</p>
        <p className="text-gray-700"><strong>Experience:</strong> {selectedApplicant.experienceYears || "N/A"} years</p>
        <p className="text-gray-700"><strong>Expected Pay:</strong> {selectedApplicant.expectedPayRange || "N/A"}</p>
        <p className="text-gray-700 col-span-1 sm:col-span-2">
          <strong>Skills:</strong> {selectedApplicant.skills?.join(", ") || "N/A"}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-4 sm:mt-5">
        <button
          className="bg-black text-white font-medium px-4 sm:px-5 py-2 rounded-3xl shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-purple-500 active:scale-95"
          onClick={closeModal}
        >
          Close
        </button>
      </div>
    </motion.div>
  </div>
)}

    </div>
  );
  
};

export default ApplicationList;

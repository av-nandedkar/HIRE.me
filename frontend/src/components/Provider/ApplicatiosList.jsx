import { useState, useEffect } from "react";
import { getDatabase, ref, onValue, remove, update } from "firebase/database";
import { app } from "../../firebase";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

const database = getDatabase(app);

const ApplicationList = () => {
  const [jobsWithApplications, setJobsWithApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchJobsWithApplications = async () => {
      const jobsRef = ref(database, "jobs");
      const currentUserEmail = localStorage.getItem("email");

      onValue(jobsRef, (jobsSnapshot) => {
        if (jobsSnapshot.exists() && currentUserEmail) {
          const jobsData = jobsSnapshot.val();
          const userJobs = Object.keys(jobsData)
            .map((key) => ({
              id: key,
              ...jobsData[key],
            }))
            .filter((job) => job.provideremail === currentUserEmail);

          const jobsWithApps = userJobs.map((job) => ({
            ...job,
            applications: job.applications
              ? Object.keys(job.applications).map((appKey) => ({
                  id: appKey,
                  ...job.applications[appKey],
                }))
              : [],
          }));

          setJobsWithApplications(jobsWithApps);
        } else {
          setJobsWithApplications([]);
        }
        setLoading(false);
      });
    };

    fetchJobsWithApplications();
  }, []);

  // Update application status
  const handleUpdateStatus = async (jobId, appId, status) => {
    try {
      await update(ref(database, `jobs/${jobId}/applications/${appId}`), {
        status,
      });
      toast.success(`Application ${status}!`);
      setJobsWithApplications((prevJobs) =>
        prevJobs.map((job) => ({
          ...job,
          applications: job.applications.map((app) =>
            app.id === appId ? { ...app, status } : app
          ),
        }))
      );
    } catch (error) {
      toast.error("Error updating status: " + error.message);
    }
  };

  // Delete application
  const handleDeleteApplication = async (jobId, appId) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      try {
        await remove(ref(database, `jobs/${jobId}/applications/${appId}`));
        toast.success("Application deleted successfully!");
        setJobsWithApplications((prevJobs) =>
          prevJobs.map((job) => ({
            ...job,
            applications: job.applications.filter((app) => app.id !== appId),
          }))
        );
      } catch (error) {
        toast.error("Error deleting application: " + error.message);
      }
    }
  };

  // Show application details
  const showDetails = (job) => {
    setExpandedJob(job);
  };

  // Close modal
  const closeModal = () => {
    setExpandedJob(null);
  };

  // Download resume
  const downloadResume = (base64Data, fileName) => {
    if (!base64Data) {
      toast.error("No resume available for download.");
      return;
    }
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = fileName || "resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <p className="text-center mt-5 text-gray-700">Loading applications...</p>
    );
  }

  return (
    <div className="min-h-screen p-8 sm:p-12 bg-gray-900">
      <Toaster />
      <h2 className="text-3xl font-semibold text-center mb-10 text-white tracking-wider pt-20">
        Applications for Your Jobs
      </h2>

      {/* Status Filter */}
      <div className="flex justify-center mb-6 text-white ">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border rounded-md bg-gray-800/90"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {jobsWithApplications.length === 0 ? (
        <p className="text-center text-gray-400 text-lg">
          No applications available.
        </p>
      ) : (
        <div className="space-y-8">
          {jobsWithApplications.map((job) => (
            <motion.div
              key={job.id}
              className="bg-white shadow-xl rounded-2xl w-full max-w-3xl mx-auto p-6 border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-black">{job.jobTitle}</h3>
                <button
                  onClick={() => showDetails(job)}
                  className="bg-purple-900 text-white px-4 py-2 rounded-md hover:shadow-purple-500 transition"
                >
                  View Applications
                </button>
              </div>

              {job.applications.length === 0 ? (
                <p className="text-gray-500 mt-4 text-sm">
                  No applications yet.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {job.applications
                    .filter(
                      (app) =>
                        filterStatus === "all" || app.status === filterStatus
                    )
                    .map((app) => (
                      <motion.div
                        key={app.id}
                        className="p-4 bg-gray-100 rounded-lg flex justify-between items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div>
                          <p className="text-black font-semibold">
                            {app.applicantName || "No Name"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {app.applicantEmail}
                          </p>
                          <p className="text-sm text-gray-500">
                            Contact: {app.contactNumber || "N/A"}
                          </p>
                          <span
                            className={`text-sm font-semibold px-2 py-1 rounded ${
                              app.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : app.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {app.status || "Pending"}
                          </span>
                        </div>
                        <div className="space-x-2">
                          <button
                            onClick={() =>
                              handleUpdateStatus(job.id, app.id, "approved")
                            }
                            className="bg-green-600 text-white px-3 py-1 rounded-md hover:shadow-lg"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(job.id, app.id, "rejected")
                            }
                            className="bg-red-600 text-white px-3 py-1 rounded-md hover:shadow-lg"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteApplication(job.id, app.id)
                            }
                            className="bg-gray-600 text-white px-3 py-1 rounded-md hover:shadow-lg"
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal for application details */}
      {expandedJob && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
        >
          <motion.div
            className="bg-white rounded-lg w-full max-w-2xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            <button
              className="absolute top-3 right-3 text-gray-700"
              onClick={closeModal}
            >
              ✖
            </button>
            <h3 className="text-2xl font-bold mb-4">
              Applications for {expandedJob.jobTitle}
            </h3>
            {expandedJob.applications.length === 0 ? (
              <p className="text-gray-500 text-sm">No applications found.</p>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {expandedJob.applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 bg-gray-100 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="text-black font-semibold">
                        {app.applicantName || "No Name"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {app.applicantEmail}
                      </p>
                      <p className="text-sm text-gray-500">
                        Contact: {app.contactNumber || "N/A"}
                      </p>
                      <button
                        onClick={() =>
                          downloadResume(app.resume, app.applicantName)
                        }
                        className="text-blue-500 text-sm mt-2 underline"
                      >
                        Download Resume
                      </button>
                    </div>
                    <span
                      className={`text-sm font-semibold px-2 py-1 rounded ${
                        app.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : app.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {app.status || "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ApplicationList;

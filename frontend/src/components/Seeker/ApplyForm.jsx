import { useState, useEffect } from "react";
import { getDatabase, ref, set, get, update, child } from "firebase/database";
import { useLocation } from "react-router-dom";
import { app } from "../../firebase";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const database = getDatabase(app);

const ApplyForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const jobId = queryParams.get("jobId"); // Get jobId from URL params
  const email = localStorage.getItem("email");

  const [formData, setFormData] = useState({
    applicantEmail: email || "",
    contactNumber: "",
  });

  const [resume, setResume] = useState(null); // Base64 version
  const [resumeName, setResumeName] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  // Check if the user has already applied
  useEffect(() => {
    if (!jobId || !email) return;

    const sanitizedEmail = email.replace(/\./g, ","); // Replace "." for Firebase path
    const applicationRef = ref(database, `jobs/current/${jobId}/applications/${sanitizedEmail}`);

    get(applicationRef).then((snapshot) => {
      if (snapshot.exists()) {
        setAlreadyApplied(true);
      }
    });
  }, [jobId, email]);

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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    if (!jobId) {
      toast.error("Invalid or missing job ID.");
      setLoading(false);
      return;
    }
  
    if (!formData.contactNumber.trim()) {
      toast.error("All fields are required except Resume.");
      setLoading(false);
      return;
    }
  
    if (!/^\d{10,15}$/.test(formData.contactNumber)) {
      toast.error("Enter a valid contact number (10-15 digits).");
      setLoading(false);
      return;
    }
  
    try {
      const sanitizedEmail = email.replace(/\./g, ","); // Replace "." for Firebase path
      const userRef = ref(database, `user-metadata/seeker/${sanitizedEmail}`);
  
      // Fetch user data to check appliedJobs
      const userSnapshot = await get(userRef);
      let appliedJobs = [];
  
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        appliedJobs = userData.appliedJobs || []; // Ensure appliedJobs exists as an array
  
        if (appliedJobs.includes(jobId)) {
          toast.error("You have already applied for this job!");
          setAlreadyApplied(true); // Update state
          setLoading(false);
          return;
        }
      }
  
      // Proceed with application submission
      const applicationsRef = ref(database, `jobs/current/${jobId}/applications/${sanitizedEmail}`);
      await set(applicationsRef, {
        ...formData,
        appliedAt: new Date().toISOString(),
      });
  
      // Append jobId to appliedJobs and update Firebase
      appliedJobs.push(jobId);
      await update(userRef, { appliedJobs });
  
      toast.success("Application submitted successfully! 🎉");
      setAlreadyApplied(true); // Prevent further submissions
      resetForm();
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Error submitting application. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  
  // Reset form function
  const resetForm = () => {
    setFormData({
      applicantEmail: email || "",
      contactNumber: "",
    });
    setResume(null);
    setResumeName("");
  };

  return (
    <div className="flex items-center scale-100 justify-center min-h-screen bg-gray-100 px-8">
      <Toaster />
      <div className="bg-white p-8 rounded-xl scale-80 shadow-lg w-full max-w-2xl relative">
      <h2 className="text-xl font-bold text-center mb-2 text-gray-800">
  Apply for Job
</h2>

{/* Extract Job Details */}
{jobId && (
  <div className="text-center mb-2  text-gray-600">
    <p className="text-lg font-semibold mb-2  text-blue-700">
      {jobId.split("-").slice(0, -1).join(" ")} {/* Job Title & City */}
    </p>
    <p className="text-sm text-gray-500">
      Job ID: <span className="font-mono text-gray-700">{jobId.split("-").pop()}</span>
    </p>
  </div>
)}

{alreadyApplied ? (
  <div className="flex flex-col items-center text-center">
    <p className="text-green-600 font-semibold text-lg sm:text-xl">
      ✅ You have already applied for this job!
    </p>
    <button 
      onClick={() => navigate("/viewappliedjobs")} 
      className="bg-purple-900 mt-5 text-white font-medium px-6 py-3 rounded-3xl shadow-lg 
                 transition-transform duration-300 hover:scale-105 hover:shadow-purple-500 
                 active:scale-95 w-full max-w-xs sm:max-w-md md:max-w-lg"
    >
      View Applied Jobs
    </button>
  </div>
)
 : jobId ? (
          <form onSubmit={handleSubmit}>
            {/* Contact Number */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700">
                Your Preferred Contact Number *
              </label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="mt-4 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className={`bg-green-600 text-white py-2 px-4 rounded-3xl hover:bg-green-700 transition ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Submitting..." : "Apply"}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-center text-red-500 font-semibold">
            Cannot apply without a valid Job ID. Please check the URL.
          </p>
        )}
      </div>
    </div>
  );
};

export default ApplyForm;

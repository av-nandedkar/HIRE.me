import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { getDatabase, ref, onValue, remove, update, get,set } from "firebase/database";
import { app } from "../../firebase";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';


const database = getDatabase(app);

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(null);
  const [editData, setEditData] = useState({});
  const [expandedJob, setExpandedJob] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const jobsPerPage = 6;
  const navigate = useNavigate();
  

  const fetchCoordinates = async (address, pincode) => {
    const apiKey = "9QqEQDVDfqLRFOPZzKsMqNn9tOWca999Ujqe09mN"; // Replace with your actual API key
    const requestId = uuidv4();
    const fullAddress = `${address}, ${pincode}, India`;
    const url = `https://api.olamaps.io/places/v1/geocode?address=${encodeURIComponent(fullAddress)}&language=en&api_key=${apiKey}`;

    try {
      const response = await fetch(url, {
        headers: {
          "X-Request-Id": requestId, // Replace with a unique request ID
        },
      });

      const data = await response.json();
      // console.log("object", data);
      // console.log("Nearest", data.geocodingResults[1].formatted_address);
      if (data.geocodingResults && data.geocodingResults.length > 0) {
        const latitude = data.geocodingResults[0].geometry.location.lat;
        const longitude = data.geocodingResults[0].geometry.location.lng;
        return { latitude, longitude };
      } else {
        console.error("Location not found.");
        return { latitude: null, longitude: null };
      }
    } catch (error) {
      console.error("Geocoding Error:", error);
      return { latitude: null, longitude: null };
    }
  };

  const handleMarkAsCompleted = async (jobId) => {
    const confirmed = window.confirm("Are you sure ?");
    if (!confirmed) return;
  
    try {
      const db = getDatabase();
  
      // Step 1: Read existing job data
      const jobRef = ref(db, `jobs/current/${jobId}`);
      const snapshot = await get(jobRef);
  
      if (!snapshot.exists()) {
        alert("Job not found!");
        return;
      }
  
      const jobData = snapshot.val();
  
      // Step 2: Write to completed path with 'jobCompleted: true'
      const completedJobRef = ref(db, `jobs/completed/${jobId}`);
      await set(completedJobRef, {
        ...jobData,
        jobCompleted: true,
      });
  
      // Step 3: Remove from original jobs path
      await remove(jobRef);
      toast.success("Job Completed Successfully");
      // navigate('/providerprofile/joblist');
      window.location.reload();

    } catch (error) {
      console.error("Error moving job:", error);
      alert("Failed to mark job as completed. Please try again.");
      window.location.reload();
    }
  };

  // ✅ Fetch Jobs from Firebase
  useEffect(() => {
    const jobsRef = ref(database, "jobs/current");
    const currentUserEmail = localStorage.getItem("email");

    onValue(jobsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const jobArray = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .filter((job) => job.provideremail === currentUserEmail);
        setJobs(jobArray);
      } else {
        setJobs([]);
      }
      setLoading(false);
    });
  }, []);

  // ✅ Delete Job
  const handleDelete = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await remove(ref(database, `jobs/current/${jobId}`));
        toast.success("Job deleted successfully!");
      } catch (error) {
        toast.error("Error deleting job: " + error.message);
      }
    }
  };

  // ✅ Edit Job (Enter Edit Mode)
  const handleEdit = (job) => {
    setEditMode(job.id);
    setEditData(job); // Copy all job data to editData
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditMode(null); // Exit edit mode
  };

  const handleSave = async (jobId) => {
    try {
      // Ensure all fields are filled
      if (!editData.location || !editData.pincode) {
        toast.error("Please fill the pincode field");
        return;
      }
  
      let updatedData = { ...editData };
  
      // Check if location or pincode has changed
      if (
        editData.location !== jobs.find((job) => job.id === jobId)?.location ||
        editData.pincode !== jobs.find((job) => job.id === jobId)?.pincode
      ) {
        const coordinates = await fetchCoordinates(editData.location, editData.pincode);
        updatedData.latitude = coordinates.latitude;
        updatedData.longitude = coordinates.longitude;
      }
  
      await update(ref(database, `jobs/current/${jobId}`), updatedData);
      toast.success("Job updated successfully!");
      setEditMode(null);
    } catch (error) {
      toast.error("Error updating job: " + error.message);
    }
  };
  

  // ✅ Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
  
    setEditData((prevData) => {
      if (name === "location") {
        return { ...prevData, location: value, pincode: "" }; // Reset pincode when location changes
      }
      return { ...prevData, [name]: value.trim() }; // Trim spaces to prevent empty values
    });
  };
  

  // ✅ Show Job Details
  const showDetails = (job) => {
    if (!editMode) {
      setExpandedJob(job);
    }
  };

  // ✅ Close Modal
  const closeModal = () => {
    setExpandedJob(null);
  };

  // ✅ Pagination Logic
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  return (
    
    <div
      className={`
        min-h-screen relative transition-all p-8 sm:p-12 
        ${expandedJob ? "backdrop-blur-md bg-black/60" : ""}
        bg-gray-900
      `}
    >
      <Toaster position="top-center" toastOptions={{ style: { fontSize: '1rem', padding: '10px 20px', maxWidth: '500px', borderRadius: '40px', marginTop: '70px' } }} />
      
  
      {/* ✅ Page Title */}
      <h2 className="text-3xl pt-20 font-semibold text-center mb-10 text-white tracking-wider">
        Job Listings
      </h2>
  
      {/* ✅ Skeleton Loader */}
      {loading ? (
        <div className="w-full flex flex-col items-center gap-4 mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="w-full max-w-4xl p-4 bg-gray-200 animate-pulse rounded-xl shadow-md"
              >
                <div className="h-6 w-3/4 bg-gray-300 rounded-md"></div>
                <div className="h-4 w-1/2 bg-gray-300 rounded-md mt-2"></div>
                <div className="h-4 w-1/3 bg-gray-300 rounded-md mt-2"></div>
                <div className="h-10 w-1/4 bg-gray-300 rounded-md mt-4"></div>
              </div>
            ))}
          </div>
        </div>
      ) : currentJobs.length === 0 ? (
        <p className="text-center text-gray-400 text-lg">
          No jobs available right now.
        </p>
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 transition-all ${
            expandedJob ? "blur-sm pointer-events-none" : ""
          }`}
        >
          {currentJobs.map((job) => (
            <motion.div
              key={job.id}
              className="scale-90 relative bg-white shadow-xl transition-all duration-300 rounded-2xl w-full max-w-3xl flex flex-col gap-4 p-6 border border-gray-200 transform hover:scale-92"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => showDetails(job)}
            >
              <span className="text-purple-600 font-semibold text-xs md:text-sm tracking-wide">
                {job.categories || "General"}
              </span>
              <h3 className="mt-2 text-base md:text-xl text-black font-bold">
                {job.jobTitle}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="bg-purple-100 text-purple-800 rounded-full px-3 py-1 text-xs md:text-sm font-medium shadow-md">
                  ₹{job.budgetRange}
                </span>
                <span className="text-gray-500 text-xs md:text-sm">
                  {job.city}, {job.distance}
                </span>
              </div>
              <div className="flex justify-between items-center mt-4 gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(job);
                  }}
                  className="bg-purple-900 text-white px-5 py-2 rounded-3xl hover:shadow-purple-500 transition transform hover:scale-105"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleMarkAsCompleted(job.id)}
                  className="bg-green-600 text-white px-3 py-2 rounded-3xl md:scale-90 hover:shadow-purple-500 transition transform hover:scale-95 "
                >
                  Mark As Completed
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(job.id);
                  }}
                  className="bg-purple-900 text-white px-5 py-2 rounded-3xl hover:shadow-purple-500 transition transform hover:scale-105"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
  
      {/* ✅ Pagination */}
      {!expandedJob && (
        <div className="flex justify-center mt-12">
          {Array.from({ length: Math.ceil(jobs.length / jobsPerPage) }).map(
            (_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`mx-1 px-4 py-2 rounded-full text-sm font-medium ${
                  currentPage === index + 1
                    ? "bg-purple-900 text-white shadow-md"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600 transition transform hover:scale-105"
                }`}
              >
                {index + 1}
              </button>
            )
          )}
        </div>
      )}
  
  {showEditModal && (
  <div className="fixed  inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center z-50 px-4 sm:px-0">
    <motion.div
      className="scale-90 bg-white p-6 rounded-2xl shadow-2xl max-w-lg shadow-gray-900 transform transition-all duration-500 scale-95 animate-fadeIn relative border border-gray-200 overflow-y-auto w-full max-h-[90vh]"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-transparent opacity-10 pointer-events-none"></div>

      <h3 className="text-xl sm:text-2xl text-gray-900 font-bold mb-4">Edit Job</h3>

      {/* 📝 Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
        <div className="flex flex-col">
          <label className="text-gray-700 mb-1">Job Title</label>
          <input
            name="jobTitle"
            value={editData.jobTitle || ""}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 mb-1">Job Type</label>
          <select
            name="jobType"
            value={editData.jobType || ""}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md"
          >
            <option value="">Select</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 mb-1">Location</label>
          <input
            name="location"
            value={editData.location || ""}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 mb-1">Pincode</label>
          <input
            name="pincode"
            value={editData.pincode || ""}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 mb-1">Categories</label>
          <input
            name="categories"
            value={editData.categories || ""}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 mb-1">Skills Required</label>
          <input
            name="skillsRequired"
            value={editData.skillsRequired || ""}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 mb-1">Experience Level</label>
          <input
            name="experienceLevel"
            value={editData.experienceLevel || ""}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 mb-1">Budget Range</label>
          <input
            name="budgetRange"
            value={editData.budgetRange || ""}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            name="jobDate"
            value={editData.jobDate || ""}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 mb-1">Apply By</label>
          <input
            type="date"
            name="applyBy"
            value={editData.applyBy || ""}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex flex-col sm:col-span-2">
          <label className="text-gray-700 mb-1">Contact Person</label>
          <input
            name="contactPersonName"
            value={editData.contactPersonName || ""}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md mb-2"
            placeholder="Name"
          />
          <input
            name="contactPersonPhone"
            value={editData.contactPersonPhone || ""}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md"
            placeholder="Phone"
            type="tel"
          />
        </div>

        <div className="flex flex-col sm:col-span-2">
          <label className="text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={editData.description || ""}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md min-h-[100px]"
          />
        </div>
      </div>

      {/* ✅ Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
        <button
          onClick={() => {
            handleSave(editMode);
            setShowEditModal(false);
          }}
          className="bg-purple-900 text-white font-medium px-5 py-2 rounded-3xl shadow-lg transition-transform transform hover:scale-105 hover:shadow-purple-500 active:scale-95"
        >
          Save
        </button>
        <button
          onClick={() => {
            setShowEditModal(false);
            setEditMode(null);
          }}
          className="bg-gray-700 text-white font-medium px-5 py-2 rounded-3xl shadow-lg transition-transform transform hover:scale-105 hover:shadow-purple-500 active:scale-95"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  </div>
)}

    </div>
  );
  
};

export default JobList;

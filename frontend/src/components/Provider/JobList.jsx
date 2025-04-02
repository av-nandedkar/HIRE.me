import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { getDatabase, ref, onValue, remove, update } from "firebase/database";
import { app } from "../../firebase";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

const database = getDatabase(app);

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(null);
  const [editData, setEditData] = useState({});
  const [expandedJob, setExpandedJob] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const jobsPerPage = 6;

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
      console.log("object", data);
      console.log("Nearest", data.geocodingResults[1].formatted_address);
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

  // ✅ Fetch Jobs from Firebase
  useEffect(() => {
    const jobsRef = ref(database, "jobs");
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
        await remove(ref(database, `jobs/${jobId}`));
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
  };

  const handleSave = async (jobId) => {
    try {
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
  
      await update(ref(database, `jobs/${jobId}`), updatedData);
      toast.success("Job updated successfully!");
      setEditMode(null);
    } catch (error) {
      toast.error("Error updating job: " + error.message);
    }
  };
  

  // ✅ Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value,
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

  // ✅ Loading State
  if (loading) {
    return <p className="text-center mt-5 text-gray-700">Loading jobs...</p>;
  }

  return (
    <div
    className={`
      min-h-screen relative transition-all p-8 sm:p-12 
      ${expandedJob ? "backdrop-blur-md bg-black/60" : ""}
      bg-gray-900
    `}
    >

      <Toaster />
      {/* ✅ Page Title */}
      <h2 className="text-3xl pt-20 font-semibold text-center mb-10 text-white tracking-wider">
        Job Listings
      </h2>

      {/* ✅ No Jobs Available */}
      {currentJobs.length === 0 ? (
        <p className="text-center text-gray-400 text-lg">
          No jobs available right now.
        </p>
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all ${
            expandedJob ? "blur-sm pointer-events-none" : ""
          }`}
        >
          {/* ✅ Job Cards */}
          {currentJobs.map((job) => (
            <motion.div
              key={job.id}
              className="relative bg-white shadow-xl transition-all duration-300 rounded-2xl w-full max-w-3xl flex flex-col gap-4 p-6 border border-gray-200 transform hover:scale-105"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => showDetails(job)}
            >
              {/* ✅ Edit Mode */}
              {editMode === job.id ? (
                <div>
                  <label htmlFor="">Job</label>
                  <input
                    name="jobTitle"
                    value={editData.jobTitle || ""}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md mb-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Job Title"
                  />
                  <label htmlFor="">Job type</label>
                  <input
                    name="jobType"
                    value={editData.jobType || ""}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md mb-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Job Type"
                  />
                  <label htmlFor="">Job Location</label>
                  <input
                    name="location"
                    value={editData.location || ""}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md mb-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Location"
                  />
                  <label htmlFor="">Pincode</label>
                  <input
                    name="pincode"
                    value={editData.pincode || ""}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md mb-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="pincode"
                  />
                  <label htmlFor="">Job category</label>
                  <input
                    name="categories"
                    value={editData.categories || ""}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md mb-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Categories"
                  />
                  <label htmlFor="">Skills</label>
                  <input
                    name="skillsRequired"
                    value={editData.skillsRequired || ""}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md mb-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Skills Required (comma separated)"
                  />
                  <label htmlFor="">Experience</label>
                  <input
                    name="experienceLevel"
                    value={editData.experienceLevel || ""}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md mb-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Experience Level"
                  />
                  <label htmlFor="">Budget Range</label>
                  <input
                    name="budgetRange"
                    value={editData.budgetRange || ""}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md mb-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Budget Range"
                  />
                  <label htmlFor="">Job Start date</label>
                  <input
                    name="jobDate"
                    type="date"
                    value={editData.jobDate || ""}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md mb-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <label htmlFor="">Application deadline</label>
                  <input
                    name="applyBy"
                    type="date"
                    value={editData.applyBy || ""}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md mb-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <label htmlFor="">Contact Person Name</label>
                   <input
                    name="contactPersonName"
                    value={editData.contactPersonName || ""}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md mb-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Contact Person Name"
                  />
                  <label htmlFor="">Contact Person Phone</label>
                  <input
                    name="contactPersonPhone"
                    type="tel"
                    value={editData.contactPersonPhone || ""}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md mb-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Contact Person Phone"
                  />
                  <label htmlFor="">Job description</label>
                  <textarea
                    name="description"
                    value={editData.description || ""}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md mb-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Description"
                  />
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => handleSave(job.id)}
                      className="bg-purple-900 text-white px-5 py-2 rounded-md hover:shadow-purple-500 transition transform hover:scale-105"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditMode(null)}
                      className="bg-gray-700 text-white px-5 py-2 rounded-md hover:shadow-purple-500 transition transform hover:scale-105"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* ✅ Job Info View */
                <div>
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

                  {/* ✅ Edit/Delete Buttons */}
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent opening details
                        handleEdit(job);
                      }}
                      className="bg-purple-900 text-white px-5 py-2 rounded-md hover:shadow-purple-500 transition transform hover:scale-105"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent opening details
                        handleDelete(job.id);
                      }}
                      className="bg-purple-900 text-white px-5 py-2 rounded-md hover:shadow-purple-500 transition transform hover:scale-105"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ✅ Expanded Job Modal */}
      {expandedJob && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl"
          >
            <h3 className="text-2xl font-bold mb-4">{expandedJob.jobTitle}</h3>
            <p className="text-gray-700 mb-2">
              <strong>Type:</strong> {expandedJob.jobType}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Location:</strong> {expandedJob.location}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Description:</strong> {expandedJob.description}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Date:</strong> {expandedJob.jobDate}
            </p>
            <div className="flex justify-end mt-4">
              <button
                onClick={closeModal}
                className="bg-purple-900 text-white px-5 py-2 rounded-md hover:shadow-purple-500 transition transform hover:scale-105"
              >
                Close
              </button>
            </div>
          </motion.div>
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
    </div>
  );
};

export default JobList;

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { getDatabase, ref, onValue ,set,push} from "firebase/database";
import { app } from "../../firebase";
import Select from "react-select";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const database = getDatabase(app);

const PartTimeJobs = () => {
  const [loading, setLoading] = useState(true); // Loading state
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");
  const [flipped, setFlipped] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [seekerLocation, setSeekerLocation] = useState(null);
  const [viewStartTime, setViewStartTime] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
  const seekerEmail = localStorage.getItem("email");
  setIsLoggedIn(!!seekerEmail); // Add this line

  if (seekerEmail) {
    const encodedEmail = seekerEmail.replace(/\./g, ",");
    const seekerRef = ref(database, `user-metadata/seeker/${encodedEmail}`);

    onValue(seekerRef, (snapshot) => {
      const seekerData = snapshot.val();
      if (seekerData) {
        if (!seekerData.formSubmitted) {
          navigate("/seekerprofile");
          return;
        }
        setSeekerLocation({
          latitude: parseFloat(seekerData.latitude),
          longitude: parseFloat(seekerData.longitude),
        });
      } else {
        navigate("/seekerprofile");
      }
    });
  }
}, []);
  
  
  const fetchOlaDistance = async (origin, destination) => {
    const apiKey = "9QqEQDVDfqLRFOPZzKsMqNn9tOWca999Ujqe09mN"; // Replace with your actual API key
    const requestId = uuidv4(); // Generates a unique request ID
    // console.log("b",origin,destination);
    const url = `https://api.olamaps.io/routing/v1/directions?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&api_key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "X-Request-Id": requestId, // Unique request ID
        },
      });

      const data = await response.json();
      // console.log("c", data);
      if (data.routes && data.routes.length > 0) {
        const distanceMeters = data.routes[0].legs[0].distance;
        const distanceKm = (distanceMeters / 1000).toFixed(2); // Convert meters to km
        // console.log("Exact Road Distance:", distanceKm, "km");
        return distanceKm;
      } else {
        console.error("No route found.");
        return null;
      }
    } catch (error) {
      console.error("Ola API Error:", error);
      return null;
    }
  };

  useEffect(() => {
    const jobsRef = ref(database, "jobs/current");
    onValue(jobsRef, (snapshot) => {
      const jobsData = snapshot.val();
      const seekerEmail = localStorage.getItem("email");
      const isLoggedIn = !!seekerEmail;
      
      if (jobsData) {
        let jobsArray = Object.keys(jobsData).map((key) => ({
          id: key,
          ...jobsData[key],
        }))
        .filter(job => job.jobType === "Part-time"); // Add this filter
  
        // // Sorting jobs by date before setting state
        // jobsArray.sort((a, b) => new Date(b.jobDate) - new Date(a.jobDate));
        
        // For non-logged-in users, limit to 5 most recent jobs
      if (!isLoggedIn) {
        jobsArray = jobsArray
          .sort((a, b) => new Date(b.jobDate) - new Date(a.jobDate))
          .slice(0, 5);
      }

        setJobs(jobsArray);
        setFilteredJobs(jobsArray);
      } else {
        setJobs([]);
        setFilteredJobs([]);
      }
      setLoading(false); // Stop loading after fetching
    });
  }, []);

  const skillOptions = [
    "Plumber", "Electrician", "Painter", "Electronics Repairs", "Mechanic", "Harvesting", "Feeding",
    "Housemaid", "Cleaning Worker","Weaving","Brick Molding","Wood Cutting","Milking", "Crop Maintenance","Fishing"
  ].map(skill => ({ value: skill, label: skill }));

  useEffect(() => {
    let filtered = [...jobs].filter(job => job.jobType === "Part-time"); 

    if (selectedSkill) {
      filtered = filtered.filter(job =>
        job.skillsRequired?.includes(selectedSkill.value)
      );
    }
    

    const updateJobDistances = async () => {
      const seekerLat = seekerLocation?.latitude;
      const seekerLon = seekerLocation?.longitude;

      if (!seekerLat || !seekerLon) {
        setFilteredJobs(filtered);
        return;
      }


      const updatedJobs = await Promise.all(
        filtered.map(async (job) => {
          const jobLat = parseFloat(job.latitude);
          const jobLon = parseFloat(job.longitude);

          let distance = "N/A";
          if (!isNaN(jobLat) && !isNaN(jobLon)) {
            distance = await fetchOlaDistance(
              { lat: seekerLat, lng: seekerLon },
              { lat: jobLat, lng: jobLon }

            );
            // console.log("a",seekerLat,seekerLon,jobLat,jobLon);
          }

          return { ...job, distance: distance ? `${distance} km` : "N/A" };
        })
      );

      updatedJobs.sort((a, b) => {
        if (a.distance !== "N/A" && b.distance !== "N/A") {
          return parseFloat(a.distance) - parseFloat(b.distance);
        }
        if (sortOrder === "newest") {
          return new Date(b.jobDate) - new Date(a.jobDate);
        }
        return new Date(a.jobDate) - new Date(b.jobDate);
      });

      setFilteredJobs(updatedJobs);
    };

    updateJobDistances();
  }, [selectedSkill, sortOrder, jobs, seekerLocation]);


  const openGoogleMaps = (start, end) => {
    const url = `https://www.google.com/maps/dir/${start.lat},${start.lng}/${end.lat},${end.lng}`;
    window.open(url, "_blank");
  };

  const storeTimeSpent = async (jobId, timeSpent) => {
  const db = getDatabase();
  const seekerEmail = localStorage.getItem("email").replace(/\./g, ",");
  const historyRef = ref(db, `user-metadata/seeker/${seekerEmail}/seeker-activity`);

  onValue(historyRef, (snapshot) => {
    const existingData = snapshot.val();
    let existingKey = null;

    if (existingData) {
      for (const [key, value] of Object.entries(existingData)) {
        if (value.jobId === jobId) {
          existingKey = key;
          break;
        }
      }
    }

    if (existingKey) {
      // Update timeSpent
      const existingEntryRef = ref(db, `user-metadata/seeker/${seekerEmail}/seeker-activity/${existingKey}`);
      const updatedTimeSpent = (existingData[existingKey].timeSpent || 0) + timeSpent;

      set(existingEntryRef, {
        ...existingData[existingKey],
        timeSpent: updatedTimeSpent,
        timestamp: new Date().toISOString(),
      })
        .then(() => console.log("Time spent updated:", updatedTimeSpent))
        .catch((error) => console.error("Error updating time spent:", error));
    } else {
      // Create new entry
      push(historyRef, {
        jobId,
        timeSpent,
        timestamp: new Date().toISOString(),
      })
        .then(() => console.log("New time spent recorded"))
        .catch((error) => console.error("Error storing new time spent:", error));
    }
  }, { onlyOnce: true });
};

  

  return (
    <div className="min-h-screen pt-20 bg-gray-150 p-6">
      <h1 className="text-3xl text-center mt-7 text-purple-700 font-semibold">Part-Time Jobs</h1>
      <Toaster />
      <div className="w-full flex flex-col items-center justify-center">
        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-10">
            <div className="inline-flex items-center gap-2 text-gray-500 animate-pulse">
              <svg className="animate-spin h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading Jobs...
            </div>
          </div>
        )}
        {jobs.length > 0 ? (
          <div className="w-full flex flex-col items-center pt-5 min-h-screen bg-gray-50">
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl flex flex-col items-center text-center gap-3 p-5 relative overflow-hidden border border-gray-200"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-transparent opacity-10 pointer-events-none"></div>

                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-purple-700 font-semibold text-xs md:text-sm tracking-wide">
                      {job.categories}
                    </span>
                    <h3 className="mt-2 text-base md:text-xl text-gray-800 transition-transform transform hover:scale-102">
                      {job.jobTitle}
                    </h3>

                    <div className="flex flex-wrap justify-center items-center gap-2 mt-2">
                      <span className="bg-purple-100 text-purple-800 rounded-full px-3 py-1 text-xs md:text-sm font-medium shadow-md">
                        {job.budgetRange}
                      </span>

                      <span className="text-gray-600 text-xs md:text-sm flex gap-1 items-center">
                        <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.city}
                      </span>

                      <span className="text-gray-600 text-xs md:text-sm flex gap-1 items-center">
                        <svg className="h-4 md:h-5 w-4 md:w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {job.jobDate}
                      </span>
                    </div>

                   {isLoggedIn && (
                     <div className="mt-6 md:mt-6 w-full md:w-auto">
                     <button
                       className="bg-purple-900 text-white font-medium px-4 md:px-5 py-2 rounded-3xl flex gap-2 justify-center items-center w-full md:w-auto shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-purple-500 active:scale-95 text-sm md:text-base"
                       onClick={() => {
                         setSelectedJob(job);
                       }}                      
                     >
                       View
                       <svg className="h-4 md:h-5 w-4 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                       </svg>
                     </button>
                   </div>
                   )}

                  {selectedJob && (
            <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center z-50 px-4 sm:px-0">
              <motion.div
                className="bg-white p-6 rounded-2xl shadow-2xl max-w-lg shadow-gray-900 transform transition-all duration-500 scale-95 animate-fadeIn relative border border-gray-200 overflow-hidden w-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-transparent opacity-10 pointer-events-none"></div>

                {/* Job Title */}
                <h2 className="text-xl sm:text-2xl text-gray-900 flex items-center gap-2 mb-4">
                  <strong>{selectedJob.jobTitle}</strong>
                </h2>

                {/* Job Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-base">
                  <p className="text-gray-700"><strong>Category:</strong> {selectedJob.categories}</p>
                  <p className="text-gray-700"><strong>Type:</strong> {selectedJob.jobType}</p>
                  <p className="text-gray-700"><strong>Req. Experience:</strong> {selectedJob.experienceLevel}</p>
                  <p className="text-gray-700"><strong>Budget:</strong> ₹{selectedJob.budgetRange}</p>
                  <p className="text-gray-700"><strong>Start Date:</strong> {selectedJob.jobDate}</p>
                  <p className="text-gray-700"><strong>Apply By:</strong> {selectedJob.applyBy}</p>
                  <p className="text-gray-700"><strong>Location:</strong> {selectedJob.location}</p>
                  <p className="text-gray-700"><strong>Distance:</strong> {selectedJob.distance}</p>
                  <p className="text-gray-700"><strong>City:</strong> {selectedJob.city}</p>
                  <p className="text-gray-700"><strong>Skills Required:</strong> {selectedJob.skillsRequired}</p>
                  <p className="text-gray-700"><strong>Contact:</strong> {selectedJob.contactPersonName} ({selectedJob.contactPersonPhone})</p>
                </div>

                {/* Job Description */}
                <div className="mt-4">
                  <p className="text-gray-700"><strong>Description:</strong> {selectedJob.description}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 mt-5">
                <button 
  className="text-white font-medium px-4 sm:px-5 py-2 rounded-full shadow-lg flex items-center gap-2 transform transition-transform duration-300 hover:scale-105 hover:shadow-purple-500 active:scale-95 
  w-full sm:w-auto justify-center"
  onClick={() => openGoogleMaps(
    { lat: seekerLocation?.latitude, lng: seekerLocation?.longitude },
    { lat: selectedJob.latitude, lng: selectedJob.longitude }
  )}
>
  <img src="/gmaps.png" alt="Google Maps" className="h-6 w-6 sm:h-8 sm:w-5" />
</button>


<button
  className="bg-black text-white font-medium px-5 py-2 rounded-3xl shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-purple-500 active:scale-95"
  onClick={() => {
    setSelectedJob(null);
  }}
>
  Back
</button>

                  <button
                 className="bg-purple-900 text-white font-medium px-5 py-2 rounded-3xl shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-purple-500 active:scale-95"
                 onClick={() => navigate(`/applyform?jobId=${selectedJob.id}`)} // Navigates to ApplyForm with jobId
               >
                 Apply Now
               </button>
                </div>

              </motion.div>
            </div>
          )}

                  </div>

                  {!isLoggedIn && (
                    <div className="mt-3">
                      <button
                        className="bg-purple-700 text-white px-4 py-2 rounded-full shadow-md hover:bg-purple-800 transition"
                        onClick={() => window.location.href = '/login'}
                      >
                        Login to view details
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
        )
         : (
          <div className="text-gray-600 mt-10 text-center">No part-time jobs available right now.</div>
        )}
      </div>
    </div>
  );
};

export default PartTimeJobs;

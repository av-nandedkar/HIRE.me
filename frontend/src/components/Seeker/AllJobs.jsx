import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { getDatabase, ref, onValue ,set,push} from "firebase/database";
import { app } from "../../firebase";
import Select from "react-select";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const database = getDatabase(app);

const JobSearch = () => {
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
        }));
  
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
    let filtered = [...jobs];

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
    <div className="min-h-screen pt-25 bg-gray-150 p-6">
      <Toaster />
    {/* Add this block */}
    {!isLoggedIn && (
      <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg text-center">
        <p className="font-semibold">You're viewing limited jobs. <button 
          onClick={() => navigate("/login")} 
          className="text-purple-800 underline hover:text-purple-600"
        >
          Login
        </button> to see all available jobs.</p>
      </div>
    )}
      <div className="flex flex-col md:flex-row gap-6 sm:justify-center">
        <div className="w-auto min-w-60 sm:w-auto max-h-50 md:w-auto bg-gray-100 p-3 rounded-lg shadow-md">
          <h2 className="text-base font-semibold mb-2">Filters</h2>

          <div className="flex flex-col gap-2">
            <div>
              <label className="block text-gray-700 text-xs mb-1">Profession/Skill</label>
              <Select
                options={skillOptions}
                value={selectedSkill}
                onChange={setSelectedSkill}
                className="text-xs"
                placeholder="Select"
                isClearable
              />
            </div>

            <div>
              <label className="block text-gray-700 text-xs mb-1">Sort By</label>
              <select
                className="w-full p-1 border border-gray-300 rounded text-xs"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </div>
        <div className="w-full px-4 sm:px-0 flex flex-col items-center">


      {loading ? (
  // Skeleton loader while jobs are loading
  <div className="w-full flex flex-col items-center gap-4 mt-5">
    {Array.from({ length: 3 }).map((_, index) => (
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
) :filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div key={job.id} className="w-full pt-5 flex justify-center">
                <div className="bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl w-full max-w-4xl flex flex-col md:flex-row gap-1 md:gap-3 items-start md:items-center justify-between px-5 py-4 relative overflow-hidden border border-gray-200 aspect-w-16 aspect-h-9">

                  {/* Floating Background Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-transparent opacity-10 pointer-events-none"></div>

                  {/* Job Info */}
                  <div className="flex-1">
                    <span className="text-purple-700 font-semibold text-xs md:text-sm tracking-wide">{job.categories}</span>
                    <h3 className=" mt-2 text-base md:text-xl text-gray-800 transition-transform transform hover:scale-102">{job.jobTitle}</h3>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="bg-purple-100 text-purple-800 rounded-full px-3 py-1 text-xs md:text-sm font-medium shadow-md">{job.budgetRange}</span>
                      <span className="text-gray-600 text-xs md:text-sm flex gap-1 items-center">
                        <span className="text-gray-600 text-sm flex gap-1 items-center">
                          <svg className="h-5 w-5 text-purple-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {job.distance}, {job.city}
                        </span>

                        <svg className="h-4 md:h-5 w-4 ml-2 md:w-5 text-purple-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {job.jobDate}
                      </span>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="mt-3 md:mt-0 w-full md:w-auto">
                    <button
                      className="bg-purple-900 text-white font-medium px-4 md:px-5 py-2 rounded-3xl flex gap-2 justify-center items-center w-full md:w-auto shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-purple-500 active:scale-95 text-sm md:text-base"
                      onClick={() => {
                        setSelectedJob(job);
                        setViewStartTime(Date.now()); // start timer
                      }}                      
                    >
                      View
                      <svg className="h-4 md:h-5 w-4 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>

                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">No jobs found.</p>
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
                  <strong>{selectedJob.jobTitle}</strong>-Requirements
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
    if (viewStartTime) {
      const timeSpent = (Date.now() - viewStartTime) / 1000; // Convert to seconds
      storeTimeSpent(selectedJob.id, timeSpent);
    }
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
      </div>
    </div>

  );
};

export default JobSearch;

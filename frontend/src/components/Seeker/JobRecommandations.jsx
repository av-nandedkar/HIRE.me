import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue,set,push } from "firebase/database";
import { app } from "../../firebase";
import { useNavigate } from "react-router-dom";

// Firebase DB
const database = getDatabase(app);

const JobRecommendations = () => {
  const [skills, setSkills] = useState([]);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [experience, setExperience] = useState(0);
  const [budget, setBudget] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [jobOpenTime, setJobOpenTime] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
      const seekerEmail = localStorage.getItem("email");
      if (!seekerEmail) {
        navigate("/seekerprofile");
        return;
      }
    
      const encodedEmail = seekerEmail.replace(/\./g, ",");
      const seekerRef = ref(database, `user-metadata/seeker/${encodedEmail}`);
    
      onValue(seekerRef, (snapshot) => {
        const seekerData = snapshot.val();
        if (seekerData) {
          if (!seekerData.formSubmitted) {
            navigate("/seekerprofile");
            return;
          }
    
        } else {
          navigate("/seekerprofile");
        }
      });
    }, []);

  useEffect(() => {
    // Get email from localStorage
    const storedEmail = localStorage.getItem("email");
    if (!storedEmail) return;

    setEmail(storedEmail);

    const encodedEmail = storedEmail.replace(/\./g, ",");
    const seekerRef = ref(database, `user-metadata/seeker/${encodedEmail}`);

    // Get user profile data from Firebase
    onValue(seekerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLatitude(parseFloat(data.latitude));
        setLongitude(parseFloat(data.longitude));
        setSkills(data.skills || []);
        setExperience(parseInt(data.experienceYears) || 0);
        setBudget(parseInt(data.expectedPayRange) || 0);
      }
    });
  }, []);

  useEffect(() => {
    // Fetch job recommendations when email, latitude, longitude, and skills are available
    const fetchRecommendations = async () => {
      if (!email || !latitude || !longitude || skills.length === 0) {
        setError("Incomplete profile. Please ensure all fields are filled.");
        return;
      }

      setLoading(true);
      setError("");
    
      try {
        const response = await fetch("http://192.168.174.55:5000/recommend", {              //### CHANGED             
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            skills,
            latitude,
            longitude,
            experience,
            budget,
          }),
        });

        if (!response.ok) throw new Error("Failed to fetch recommendations.");
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Call the fetchRecommendations function when dependencies are set
    if (email && latitude && longitude && skills.length > 0) {
      fetchRecommendations();
    }
  }, [email, latitude, longitude, skills, experience, budget]);

  const showJobDetails = (job) => {
    setSelectedJob(job);
    setJobOpenTime(Date.now()); // Start timer when job is opened
  
    // Find similar jobs (unchanged)
    const related = jobs.filter((j) => {
      if (j.jobTitle === job.jobTitle && j !== job) return true;
      if (!j.skillsRequired || !job.skillsRequired) return false;
      const jobSkills = job.skillsRequired.toLowerCase().split(",").map(s => s.trim());
      const currentSkills = j.skillsRequired.toLowerCase().split(",").map(s => s.trim());
      return jobSkills.some(skill => currentSkills.includes(skill)) && j !== job;
    });
  
    setSimilarJobs(related);
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
      <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto font-sans">
        <h2 className="text-2xl md:text-3xl font-bold text-purple-900 mb-8 text-center animate-fade-in mt-15">
          🔎 Job Recommendations Just for You
        </h2>
    
        {/* Profile Info */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-purple-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-100 p-2 rounded-full">
                <span className="text-purple-700">🛠️</span>
              </div>
              <div>
                <strong className="block text-purple-900 text-sm font-medium">Skills</strong>
                <p className="text-gray-600 text-sm">{skills.length > 0 ? skills.join(", ") : "Not specified"}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-purple-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-100 p-2 rounded-full">
                <span className="text-purple-700">📅</span>
              </div>
              <div>
                <strong className="block text-purple-900 text-sm font-medium">Experience</strong>
                <p className="text-gray-600 text-sm">{experience} years</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-purple-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-100 p-2 rounded-full">
                <span className="text-purple-700">💰</span>
              </div>
              <div>
                <strong className="block text-purple-900 text-sm font-medium">Budget</strong>
                <p className="text-gray-600 text-sm">₹{budget}</p>
              </div>
            </div>
          </div>
        </div>
    
        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-10">
            <div className="inline-flex items-center gap-2 text-gray-500 animate-pulse">
              <svg className="animate-spin h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading job recommendations...
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}
    
        {/* Job List */}
        <div className="mt-10">
          
          {jobs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job, index) => (
                <div
                  key={index}
                  onClick={() => showJobDetails(job)}
                  className="cursor-pointer group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-purple-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{job.jobTitle}</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{job.location}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                        <span>{parseFloat(job.distance_km).toFixed(2)} km</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(job.jobDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                      
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <svg className="h-4 w-4 text-purple-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span><strong className="font-medium">Skills:</strong> {job.skillsRequired}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span><strong className="font-medium">Budget:</strong> ₹{job.budgetRange}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                    <button className="text-purple-700 hover:text-purple-900 text-sm font-medium flex items-center gap-1 transition-colors">
                      View Details
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !loading && (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="mt-3 text-lg font-medium text-gray-900">No job recommendations found</h4>
                <p className="mt-1 text-gray-500">Try adjusting your filters or check back later</p>
              </div>
            )
          )}
        </div>
    
       {/* Job Details Modal */}
{selectedJob && (
  <div className="mt-20 fixed inset-0 flex items-start justify-center z-50 overflow-y-auto p-4 backdrop-blur-sm bg-black/30">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 my-8 relative transform transition-all duration-300 scale-95 group-hover:scale-100">
      <button
        onClick={() => {
          if (jobOpenTime && selectedJob) {
            const timeSpentSec = Math.round((Date.now() - jobOpenTime) / 1000);
            storeTimeSpent(selectedJob.job_id, timeSpentSec);
          }
          setSelectedJob(null);
          setJobOpenTime(null);
        }}
        className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Job Title and Basic Info */}
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{selectedJob.jobTitle}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Distance */}
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v3l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">Distance</p>
                <p className="text-sm sm:text-base text-gray-900">{parseFloat(selectedJob.distance_km).toFixed(2)} km away</p>
              </div>
            </div>

            {/* Posted Date */}
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">Posted On</p>
                <p className="text-sm sm:text-base text-gray-900">
                  {new Date(selectedJob.jobDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Job Details Grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Location */}
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Location</p>
              <p className="text-sm sm:text-base text-gray-900">{selectedJob.location}</p>
            </div>
          </div>

          {/* Budget */}
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Budget</p>
              <p className="text-sm sm:text-base text-gray-900">₹{selectedJob.budgetRange}</p>
            </div>
          </div>

          {/* Skills Required */}
          <div className="flex items-start gap-3 sm:col-span-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Skills Required</p>
              <p className="text-sm sm:text-base text-gray-900">{selectedJob.skillsRequired}</p>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="pt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
  <div className="flex-1">
    <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-2">Job Description</h4>
    <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">{selectedJob.description || "No additional details provided."}</p>
  </div>

  {/* Apply Button - Compact version */}
  <div className="w-full sm:w-auto">
    <button
      className="bg-purple-700 hover:bg-purple-800 text-white font-medium px-4 sm:px-5 py-1.5 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm w-full sm:w-auto"
      onClick={() => navigate(`/applyform?jobId=${selectedJob.job_id}`)}
    >
      Apply Now
      <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </button>
  </div>
</div>

        {/* Similar Jobs */}
        {similarJobs.length > 0 && (
          <div className="pt-5 mt-5 border-t border-purple-200">
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Similar Jobs</h4>
            <div className="grid gap-2 max-h-48 sm:max-h-60 overflow-y-auto pr-2">
              {similarJobs.map((job, idx) => (
                <div
                  key={idx}
                  className="bg-purple-100 hover:bg-gray-100 p-3 sm:p-4 rounded-lg border border-gray-100 transition cursor-pointer"
                  onClick={() => showJobDetails(job)}
                >
                  <h5 className="font-medium text-sm sm:text-base text-gray-900">{job.jobTitle}</h5>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs sm:text-sm text-gray-600">
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>₹{job.budgetRange}</span>
                    <span>•</span>
                    <span>{parseFloat(job.distance_km).toFixed(2)} km</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}
      </div>
    );
    
};

export default JobRecommendations;

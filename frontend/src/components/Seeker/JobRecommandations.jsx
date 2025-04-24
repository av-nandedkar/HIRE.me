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
        const response = await fetch("http://10.40.4.225:5000/recommend", {
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
    <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto font-sans">
      <h2 className="text-3xl font-bold text-purple-800 mb-6 text-center animate-fade-in">
        🔎 Job Recommendations Just for You
      </h2>

      {/* Profile Info */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 text-gray-800 mb-6">
        <div className="bg-white p-4 shadow-xl rounded-2xl">
          <strong>Skills:</strong>
          <p>{skills.length > 0 ? skills.join(", ") : "Not specified"}</p>
        </div>
        <div className="bg-white p-4 shadow-xl rounded-2xl">
          <strong>Experience:</strong>
          <p>{experience} years</p>
        </div>
        <div className="bg-white p-4 shadow-xl rounded-2xl">
          <strong>Budget:</strong>
          <p>₹{budget}</p>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && <p className="text-center text-gray-500 animate-pulse">⏳ Loading job recommendations...</p>}
      {error && <p className="text-center text-red-500 font-semibold">⚠️ {error}</p>}

      {/* Job List */}
      <div className="mt-8">
        <h3 className="text-2xl font-semibold mb-4 text-purple-700">🎯 Recommended Jobs</h3>
        {jobs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job, index) => (
              <div
                key={index}
                onClick={() => showJobDetails(job)}
                className="cursor-pointer bg-gradient-to-br from-white to-purple-50 border border-purple-100 shadow-lg rounded-2xl p-5 transition-all duration-300 hover:shadow-purple-300 hover:scale-[1.02]"
              >
                <h4 className="text-lg font-bold text-purple-900 mb-1">{job.jobTitle}</h4>
                <p className="text-sm text-gray-700 mb-2">
                  📍 <span className="font-medium">{job.location}</span> | 📅 {job.jobDate}
                </p>
                <p className="text-sm text-gray-800 mb-1">🛠️ <strong>Skills:</strong> {job.skillsRequired}</p>
                <p className="text-sm text-gray-800 mb-1">💰 <strong>Budget:</strong> ₹{job.budgetRange}</p>
                <p className="text-sm text-gray-800">🛣️ <strong>Distance:</strong> {job.distance_km} km</p>
              </div>
            ))}
          </div>
        ) : (
          !loading && <p className="text-gray-500 text-center">No job recommendations found.</p>
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0  flex items-center justify-center z-100 overflow-y-auto transform scale-100 backdrop-blur-lg">
        <div className="bg-white rounded-xl shadow-lg max-w-xl w-full p-6 relative scale-90">
          <button
  onClick={() => {
    if (jobOpenTime && selectedJob) {
      const timeSpentSec = Math.round((Date.now() - jobOpenTime) / 1000);
      storeTimeSpent(selectedJob.job_id, timeSpentSec); // <-- store it
    }
    setSelectedJob(null);
    setJobOpenTime(null);
  }}
  className="absolute top-3 right-4 text-gray-500 hover:text-black text-xl"
>
  ✖
</button>


            <h3 className="text-xl font-bold text-purple-800 mb-2">{selectedJob.jobTitle}</h3>
            <p className="mb-2"><strong>Location:</strong> {selectedJob.location}</p>
            <p className="mb-2"><strong>Skills:</strong> {selectedJob.skillsRequired}</p>
            <p className="mb-2"><strong>Budget:</strong> ₹{selectedJob.budgetRange}</p>
            <p className="mb-2"><strong>Distance:</strong> {selectedJob.distance_km} km</p>
            <p className="mb-4"><strong>Description:</strong> {selectedJob.description || "No additional details provided."}</p>

            <button
              className="bg-purple-900 text-white font-medium px-5 py-2 rounded-3xl shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-purple-500 active:scale-95"
              onClick={() => navigate(`/applyform?jobId=${selectedJob.job_id}`)}
            >
              Apply Now
            </button>

            {/* Similar Jobs */}
            {similarJobs.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-purple-700 mb-2">🔁 Similar Jobs</h4>
                <div className="grid gap-4 max-h-60 overflow-y-auto pr-2">
                  {similarJobs.map((job, idx) => (
                    <div
                      key={idx}
                      className="bg-purple-50 p-3 rounded-xl border border-purple-100 hover:shadow-md transition cursor-pointer"
                      onClick={() => showJobDetails(job)}
                    >
                      <h5 className="font-semibold text-purple-800">{job.jobTitle}</h5>
                      <p className="text-sm text-gray-700">
                        {job.location} • ₹{job.budgetRange}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobRecommendations;

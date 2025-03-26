import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../../firebase";

// Initialize Firebase Database
const database = getDatabase(app);

const JobRecommendations = () => {
  const [skills, setSkills] = useState([]);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [experience, setExperience] = useState(0); // Added experience field
  const [budget, setBudget] = useState(0); // Added budget field
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Fetch Seekers' Profile (Skills, Location, Experience, and Budget) from Firebase
  useEffect(() => {
    const seekerEmail = localStorage.getItem("email"); // Get user email from localStorage
    if (!seekerEmail) return;

    const encodedEmail = seekerEmail.replace(/\./g, ","); // Firebase-safe key
    const seekerRef = ref(database, `user-metadata/seeker/${encodedEmail}`);

    onValue(seekerRef, (snapshot) => {
      const seekerData = snapshot.val();
      if (seekerData) {
        setLatitude(parseFloat(seekerData.latitude));
        setLongitude(parseFloat(seekerData.longitude));
        setSkills(seekerData.skills || []);
        setExperience(parseInt(seekerData.experience) || 0); // Added experience
        setBudget(parseInt(seekerData.budget) || 0); // Added budget
      }
    });
  }, []);

  // ✅ Fetch Job Recommendations from Flask API
  const fetchRecommendations = async () => {
    if (!latitude || !longitude || skills.length === 0) {
      setError("Incomplete user profile. Ensure skills and location are set.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:5000/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: skills,
          latitude: latitude,
          longitude: longitude,
          experience: experience,
          budget: budget,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch job recommendations.");

      const data = await response.json();
      console.log("🎉 Received Recommendations:", data);
      setJobs(data); // Set job data received from Flask API
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h2>🔎 Find Job Recommendations</h2>

      {/* ✅ Display fetched profile data */}
      <p>
        <strong>Your Skills:</strong>{" "}
        {skills.length > 0 ? skills.join(", ") : "No skills found"}
      </p>
      <p>
        <strong>Experience:</strong> {experience || "Not specified"} years
      </p>
      <p>
        <strong>Budget:</strong> ₹{budget || "Not specified"}
      </p>

      {/* ✅ Button to trigger fetching recommendations */}
      <button
        onClick={fetchRecommendations}
        disabled={!latitude || !longitude || skills.length === 0}
        style={{
          padding: "10px 20px",
          marginTop: "10px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        🔍 Find Jobs
      </button>

      {/* ✅ Show loading and error messages */}
      {loading && <p>⏳ Loading job recommendations...</p>}
      {error && <p style={{ color: "red" }}>⚠️ {error}</p>}

      {/* ✅ Display Recommended Jobs */}
      <h3 style={{ marginTop: "20px" }}>🎯 Recommended Jobs:</h3>
      <ul>
        {jobs.length > 0 ? (
          jobs.map((job, index) => (
            <li
              key={index}
              style={{
                marginBottom: "10px",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <strong>{job.jobTitle}</strong> - {job.categories} in{" "}
              {job.location} <br />
              <small>
                💰 Budget: ₹{job.budgetRange} | 📅 Date: {job.jobDate} | ⚡
                Score: {job.final_score.toFixed(2)}
              </small>
            </li>
          ))
        ) : (
          <p>No job recommendations found.</p>
        )}
      </ul>
    </div>
  );
};

export default JobRecommendations;

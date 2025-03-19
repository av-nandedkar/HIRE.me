import { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../../firebase";
import Select from "react-select";
import toast, { Toaster } from "react-hot-toast";

const database = getDatabase(app);

const JobSearch = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");

  const [seekerLocation, setSeekerLocation] = useState(null);

 // Fetch Seekers' Location from Firebase
 useEffect(() => {
    const seekerEmail = localStorage.getItem("email"); 
    if (!seekerEmail) return;

    const encodedEmail = seekerEmail.replace(/\./g, ","); // Firebase keys can't contain dots
    const seekerRef = ref(database, `user-metadata/seeker/${encodedEmail}`);

    onValue(seekerRef, (snapshot) => {
      const seekerData = snapshot.val();
      if (seekerData) {
        setSeekerLocation({
          latitude: parseFloat(seekerData.latitude),
          longitude: parseFloat(seekerData.longitude),
        });
      }
    });
  }, []);
  

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null; // Handle missing values

    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371000; // Earth's radius in meters

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
};

  

  useEffect(() => {
    const jobsRef = ref(database, "jobs");

    onValue(jobsRef, (snapshot) => {
      const jobsData = snapshot.val();
      if (jobsData) {
        const jobsArray = Object.keys(jobsData).map((key) => ({
          id: key,
          ...jobsData[key],
        }));
        setJobs(jobsArray);
        setFilteredJobs(jobsArray);
      } else {
        setJobs([]);
        setFilteredJobs([]);
      }
    });
  }, []);

  const skillOptions = [
    "Plumber", "Electrician", "Painter", "Electronics Repairs", "Mechanic", 
    "Housemaid", "Cleaning Worker"
  ].map(skill => ({ value: skill, label: skill }));

  // Filter jobs by selected skill
  // Filter & Sort Jobs by Skill and Location
  useEffect(() => {
    let filtered = [...jobs];

    if (selectedSkill) {
        filtered = filtered.filter(job =>
            job.skillsRequired?.includes(selectedSkill.value)
        );
    }

    // Add distance calculation to all jobs
    filtered = filtered.map(job => {
        const jobLat = parseFloat(job.latitude);
        const jobLon = parseFloat(job.longitude);
        const seekerLat = seekerLocation?.latitude;
        const seekerLon = seekerLocation?.longitude;

        let distance = null;
        if (!isNaN(jobLat) && !isNaN(jobLon) && seekerLat && seekerLon) {
            distance = haversineDistance(seekerLat, seekerLon, jobLat, jobLon) / 1000; // Convert to km
        }

        return { ...job, distance: distance !== null ? distance.toFixed(2) : "N/A" };
    });

    // Sort jobs by distance first, then by date
    filtered.sort((a, b) => {
        if (a.distance !== "N/A" && b.distance !== "N/A") {
            return parseFloat(a.distance) - parseFloat(b.distance); // Closest jobs first
        }
        if (sortOrder === "newest") {
            return new Date(b.jobDate) - new Date(a.jobDate);
        }
        return new Date(a.jobDate) - new Date(b.jobDate);
    });

    setFilteredJobs(filtered);
}, [selectedSkill, sortOrder, jobs, seekerLocation]);



  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Toaster />
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6 mt-20">
          Job Search
        </h2>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          {/* Skill Filter */}
          <div className="w-full md:w-1/2">
            <label className="block text-gray-700 font-medium mb-1">
              Filter by Profession/Skill
            </label>
            <Select
              options={skillOptions}
              value={selectedSkill}
              onChange={setSelectedSkill}
              className="w-full"
              placeholder="Select Skill"
              isClearable
            />
          </div>

          {/* Sort Dropdown */}
          <div className="w-full md:w-1/2">
            <label className="block text-gray-700 font-medium mb-1">
              Sort By
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Job Listings */}
        <div className="grid gap-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div key={job.id} className="bg-gray-50 p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800">
                  {job.jobTitle}
                </h3>
                <p className="text-gray-600">
                  <strong>Category:</strong> {job.categories}
                </p>
                <p className="text-gray-600">
                  <strong>Location:</strong> {job.location}, {job.pincode}
                </p>
                <p className="text-gray-600">
                  <strong>Budget:</strong> {job.budgetRange}
                </p>
                <p className="text-gray-600">
                  <strong>Job Date:</strong> {job.jobDate}
                </p>
                <p className="text-gray-600">
                  <strong>Apply By:</strong> {job.applyBy}
                </p>
                <p className="text-gray-600">
                  <strong>Skills Required:</strong> {job.skillsRequired?.join(", ")}
                </p>
                <p className="text-gray-600">
                  <strong>Contact:</strong> {job.contactPersonName} - {job.contactPersonPhone}
                </p>
                <p className="text-gray-600">
                    <strong>Distance:</strong> {job.distance ? `${job.distance} km` : "N/A"}
                </p>

              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">No jobs found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobSearch;

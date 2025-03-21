import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
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

  useEffect(() => {
    const seekerEmail = localStorage.getItem("email");
    if (!seekerEmail) return;

    const encodedEmail = seekerEmail.replace(/\./g, ",");
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
  console.log("c",data);
      if (data.routes && data.routes.length > 0) {
        const distanceMeters = data.routes[0].legs[0].distance;
        const distanceKm = (distanceMeters / 1000).toFixed(2); // Convert meters to km
        console.log("Exact Road Distance:", distanceKm, "km");
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

  return (
    <div className="min-h-screen bg-white p-6">
      <Toaster />
      <div className="flex gap-6">
        <div className="w-1/4 bg-gray-100 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Filter Options</h2>
          <label className="block text-gray-700 mb-2">Profession/Skill</label>
          <Select
            options={skillOptions}
            value={selectedSkill}
            onChange={setSelectedSkill}
            className="mb-4"
            placeholder="Select Skill"
            isClearable
          />
          <label className="block text-gray-700 mb-2">Sort By</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
        <div className="w-3/4 grid grid-cols-2 gap-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div key={job.id} className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-bold">{job.jobTitle}</h3>
                <p className="text-gray-600">Category: {job.categories}</p>
                <p className="text-gray-600">Location: {job.location}, {job.pincode}</p>
                <p className="text-gray-600">Budget: {job.budgetRange}</p>
                <p className="text-gray-600">Job Date: {job.jobDate}</p>
                <p className="text-gray-600">Apply By: {job.applyBy}</p>
                <p className="text-gray-600">Skills: {job.skillsRequired?.join(", ")}</p>
                <p className="text-gray-600">Contact: {job.contactPersonName} - {job.contactPersonPhone}</p>
                <p className="text-gray-600">Distance: {job.distance}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600 col-span-2">No jobs found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobSearch;

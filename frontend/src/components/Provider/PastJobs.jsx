import { useEffect, useState } from "react";
import { getDatabase, ref, onValue, update } from "firebase/database";

const ExpiredJobs = () => {
  const [expiredJobs, setExpiredJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase();
    const providerEmail = localStorage.getItem("email"); // Get provider's email from LocalStorage

    if (!providerEmail) {
      console.error("No provider email found in LocalStorage.");
      setLoading(false);
      return;
    }

    const jobsRef = ref(db, "jobs"); // Fetch all jobs

    onValue(jobsRef, (snapshot) => {
      if (snapshot.exists()) {
        const jobsData = snapshot.val();
        const currentDate = new Date().toISOString().split("T")[0]; // Get current date (YYYY-MM-DD)

        const expired = Object.keys(jobsData)
          .map((jobId) => ({
            id: jobId,
            ...jobsData[jobId],
          }))
          .filter(
            (job) =>
              job.provideremail === providerEmail && // Filter jobs by provider's email
              job.applyBy < currentDate // Apply date is expired
          );

        setExpiredJobs(expired);
      } else {
        setExpiredJobs([]);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-8 min-h-screen relative transition-all sm:p-12 bg-gray-900">
      <h2 className="text-3xl pt-20 font-semibold mb-6 text-gray-800 text-center mb-10 text-white">Your Expired Job Listings</h2>

      {loading ? (
        <p className="text-center text-gray-600">Loading expired jobs...</p>
      ) : expiredJobs.length === 0 ? (
        <p className="text-center text-gray-500">No expired job listings found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expiredJobs.map((job) => (
            <div
              key={job.id}
              className="p-6 bg-white shadow-lg rounded-lg hover:shadow-xl transition duration-300"
            >
              <h3 className="text-purple-600 font-semibold text-lg tracking-wide">{job.jobTitle}</h3>
              <p className="text-gray-600 text-sm pt-2"><span className="text-black font-semibold">Job Type: </span>{job.jobType}</p>
              <p className="text-gray-600 text-sm pt-1"><span className="text-black font-semibold">Job Location: </span> {job.location}</p>
              <p className="text-gray-500 text-sm pt-1"><span className="text-black font-semibold">Job Category: </span>{job.categories}</p>
              <p className="text-red-600 font-semibold pt-1">Apply By: {job.applyBy}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpiredJobs;

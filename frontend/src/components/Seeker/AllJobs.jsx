import { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../../firebase";
import { Toaster } from "react-hot-toast";

const database = getDatabase(app);

const AllJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in based on localStorage
    const userData = localStorage.getItem('authToken');
    setIsLoggedIn(!!userData);
  }, []);

  useEffect(() => {
    const jobsRef = ref(database, "jobs/current");
    onValue(jobsRef, (snapshot) => {
      const jobsData = snapshot.val();
      if (jobsData) {
        const jobsArray = Object.keys(jobsData).map((key) => ({
          id: key,
          ...jobsData[key],
        }));

        // Sort jobs by newest first
        jobsArray.sort((a, b) => new Date(b.jobDate) - new Date(a.jobDate));

        // Take only the first 4 jobs if not logged in
        const jobsToDisplay = isLoggedIn ? jobsArray : jobsArray.slice(0, 4);
        setJobs(jobsToDisplay);
      } else {
        setJobs([]);
      }
      setLoading(false);
    });
  }, [isLoggedIn]); // Adding isLoggedIn as a dependency to update jobs when it changes

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-150 p-6">
        <h1 className="text-3xl text-center mt-7 text-purple-700 font-semibold ">Jobs</h1>
      <Toaster />
      <div className="w-full flex flex-col items-center justify-center">
        {loading ? (
          // Skeleton loader
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="w-full p-4 bg-gray-200 animate-pulse rounded-xl shadow-md"
              >
                <div className="h-6 w-3/4 bg-gray-300 rounded-md"></div>
                <div className="h-4 w-1/2 bg-gray-300 rounded-md mt-2"></div>
                <div className="h-4 w-1/3 bg-gray-300 rounded-md mt-2"></div>
                <div className="h-10 w-1/4 bg-gray-300 rounded-md mt-4"></div>
              </div>
            ))}
          </div>
        ) : jobs.length > 0 ? (
            <div className="w-full flex flex-col items-center pt-5 min-h-screen bg-gray-50">
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl flex flex-col items-center text-center gap-3 p-5 relative overflow-hidden border border-gray-200"
                >
                  {/* Floating Background Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-transparent opacity-10 pointer-events-none"></div>
          
                  {/* Job Info */}
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
                  </div>
          
                  {/* Login Prompt if not logged in */}
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
          
        ) : (
          <div className="text-gray-600 mt-10 text-center">No jobs available right now.</div>
        )}
      </div>
    </div>
  );
};

export default AllJobs;

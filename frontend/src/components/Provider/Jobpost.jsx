import { useState,useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import toast, { Toaster } from "react-hot-toast";
import { getDatabase, ref, push ,set, child} from "firebase/database";
import { app } from "../../firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";

const database = getDatabase(app);

const JobForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    jobTitle: "",
    jobType: "",
    categories: "",
    skillsRequired: [],
    experienceLevel: "",
    budgetRange: "",
    location: "",
    pincode: "",
    latitude: null,
  longitude: null,
    jobDate: "",
    applyBy: "",
    description: "",
    contactPersonName: "",
    contactPersonPhone: "",
  });

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


  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
        const updatedForm = { ...prev, [name]: value };

        // If any location-related field is updated, update the 'location' field
        if (["street", "landmark", "locality", "city", "state", "pincode"].includes(name)) {
            updatedForm.location = `${updatedForm.street || ""}, ${updatedForm.locality || ""}, ${updatedForm.city || ""}, ${updatedForm.state || ""}`.replace(/(,\s?)+/g, ", ").trim();
        }

        return updatedForm;
    });
};

  
  const handleSkillChange = (e) => {
    const selectedSkills = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, skills: selectedSkills });
  };
 
  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setFormData((prevData) => ({
        ...prevData,
        provideremail: storedEmail, // Set email from localStorage
      }));
    }
  }, []);



  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
        "jobTitle",
        "jobType",
        "categories",
        "skillsRequired",
        "budgetRange",
        "location",
        "pincode",
        "jobDate",
        "applyBy",
        "description",
        "contactPersonPhone",
        "contactPersonName",
    ];

    // Validate required fields
    for (const field of requiredFields) {
        const value = formData[field];

        if (
            (typeof value === "string" && !value.trim()) || // Check for empty strings
            (Array.isArray(value) && value.length === 0) || // Check for empty arrays
            (typeof value === "object" && value === null) // Check for null objects (dates)
        ) {
            toast.error(`Please fill in the required field: ${field}`);
            return;
        }
    }

    // Fetch coordinates before submitting
    const { latitude, longitude } = await fetchCoordinates(formData.location, formData.pincode);
    console.log("lat and long", latitude, longitude);

  // Generate a large random number (e.g., 13-digit timestamp + random 6-digit number)
const randomNum = Date.now().toString() + Math.floor(100000 + Math.random() * 900000).toString();

// Replace spaces and special characters in job title to create a valid Firebase key
const jobTitleKey = `${formData.jobTitle.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "")}-${formData.city}-${randomNum}`;

    const jobData = {
        ...formData,
        latitude,
        longitude,
    };

    const jobRef = child(ref(database, "jobs"), jobTitleKey);

    // Store job data in Firebase using the job title as the key
    set(jobRef, jobData)
        .then(() => {
            toast.success("Job posted successfully!");
            console.log("Job Data Stored:", jobData);

            // Reset form after submission
            setFormData({
                jobTitle: "",
                jobType: "",
                categories: "",
                skillsRequired: [],
                experienceLevel: "",
                budgetRange: "",
                location: "",
                pincode: "",
                latitude: null,
                longitude: null,
                jobDate: "",
                applyBy: "",
                description: "",
                contactPersonName: "",
                contactPersonPhone: "",
            });
            setStep(1);
        })
        .catch((error) => {
            toast.error("Error posting job: " + error.message);
            console.error("Firebase Error:", error);
        });
};


  const skillOptions = [
    "Plumber", "Electrician", "Painter", "Electronics Repairs", "Mechanic", 
    "Housemaid", "Cleaning Worker"
  ];
  // Handle closing form
  const handleClose = () => {
    if (
      window.confirm(
        "Are you sure you want to close the form? All progress will be lost."
      )
    ) {
      setStep(1);
      setFormData({
        jobTitle: "",
        jobType: "",
        categories: "",
        skillsRequired: [],
        experienceLevel: "",
        budgetRange: "",
        location: "",
        pincode: "",
        jobDate: "",
        applyBy: "",
        description: "",
        contactPersonName: "",
        contactPersonPhone: "",
      });
      toast.error("Form reset!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-8">
      <Toaster />
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl relative">
        {/* Progress Indicator */}
        <div className="text-center mb-6">
          <span className="text-gray-500">Step {step} of 3</span>
        </div>

        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Job Posting Form
        </h2>

        {/* STEP 1 - Basic Details */}
        {step === 1 && (
          <>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700">
                Job Title *
              </label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none"
                required
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700">
                Job Type *
              </label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none"
                required
              >
                <option value="">Select Job Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700">
                Job Categories *
              </label>
              <input
                type="text"
                name="categories"
                value={formData.categories}
                onChange={handleChange}
                placeholder="eg. IT, Healthcare, Construction"
                className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none"
                required
              />
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700">
              experienceLevel *
              </label>
              <input
                type="text"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                placeholder="eg. years,months"
                className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none"
                required
              />
            </div>
        
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700">
              Job Description *
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder=""
                className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none"
                required
              />
            </div>
            <div className="mt-4 flex justify-between">
              <button
                onClick={handleClose}
                className="bg-red-600 text-white py-2 px-4 rounded-3xl hover:bg-red-700 transition"
              >
                Close
              </button>
              <button
                onClick={() => setStep(2)}
                className="bg-gray-800 text-white py-2 px-4 rounded-3xl hover:bg-blue-700 transition"
              >
                Next »
              </button>
            </div>
          </>
        )}

        {/* STEP 2 - Job Specifications */}
        {step === 2 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">Skills/Expertise *</label>
              <Select
                isMulti
                name="skills"
                options={skillOptions.map(skill => ({ value: skill, label: skill }))}
                className="w-full"
                classNamePrefix="select"
                value={formData.skillsRequired.map(skill => ({ value: skill, label: skill }))}
                onChange={(selectedOptions) =>
                  setFormData({
                    ...formData,
                    skillsRequired: selectedOptions.map(option => option.value),
                  })
                }
              />

            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700">
                Job Budget Range *
              </label>
              <input
                type="text"
                name="budgetRange"
                value={formData.budgetRange}
                onChange={handleChange}
                placeholder="₹1000 - ₹1500"
                className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none"
                required
              />
            </div>

            <div className="mb-5">
    <label className="block text-sm font-medium text-gray-700">
        Job Location *
    </label>

    {/* Street Address */}
    <input
        type="text"
        name="street"
        value={formData.street}
        onChange={handleChange}
        placeholder="Street Address"
        className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none"
        required
    />

    {/* Locality */}
    <input
        type="text"
        name="locality"
        value={formData.locality}
        onChange={handleChange}
        placeholder="Locality / Area"
        className="w-full mt-2 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none"
        required
    />

    {/* City */}
    <input
        type="text"
        name="city"
        value={formData.city}
        onChange={handleChange}
        placeholder="City"
        className="w-full mt-2 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none"
        required
    />

    {/* State */}
    <input
        type="text"
        name="state"
        value={formData.state}
        onChange={handleChange}
        placeholder="State"
        className="w-full mt-2 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none"
        required
    />

    {/* Pincode */}
    <input
        type="text"
        name="pincode"
        value={formData.pincode}
        onChange={handleChange}
        placeholder="Pincode"
        className="w-full mt-2 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none"
        required
    />
</div>

            
      
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="bg-gray-400 text-white py-2 px-4 rounded-3xl hover:bg-gray-800 transition"
              >
                « Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="bg-gray-800 text-white py-2 px-4 rounded-3xl hover:bg-blue-700 transition"
              >
                Next »
              </button>
            </div>
          </>
        )}

        {/* STEP 3 - Contact and Submit */}
        {step === 3 && (
          <>
                <div className="mb-5">
  <label className="block text-sm font-medium text-gray-700">
    Job Application Deadline *
  </label>
  <input
    type="date"
    name="applyBy"
    value={formData.applyBy}
    onChange={(e) =>
      setFormData({ ...formData, applyBy: e.target.value })
    }
    className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none rounded-md"
    placeholder="YYYY-MM-DD"
    required
  />
</div>

                        <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700">
                Job Start Date *
            </label>
            <input
            type="date"
            name="jobDate"
            value={formData.jobDate}
            onChange={(e) =>
                setFormData({ ...formData, jobDate: e.target.value })
            }
            className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none rounded-md"
            required
            />
            </div>


            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700">
                Contact Person Name *
              </label>
              <input
                type="text"
                name="contactPersonName"
                value={formData.contactPersonName}
                onChange={handleChange}
                className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none"
                required
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700">
                Contact Phone *
              </label>
              <input
                type="text"
                name="contactPersonPhone"
                value={formData.contactPersonPhone}
                onChange={handleChange}
                className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none"
                required
              />
            </div>

            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="bg-gray-400 text-white py-2 px-4 rounded-3xl hover:bg-gray-800 transition"
              >
                « Back
              </button>
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white py-2 px-4 rounded-3xl hover:bg-green-700 transition"
              >
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JobForm;

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import toast, { Toaster } from "react-hot-toast";
import Select from "react-select";
import { getDatabase, ref, push ,set ,get,  child } from "firebase/database";
import { app } from '../../firebase';
import { useNavigate } from "react-router-dom";

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dbshuwmvx/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "Hire.me";

const database = getDatabase(app);

const SeekerForm = () => {
  
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [imageUploading, setImageUploading] = useState(false);
  const [uploading, setUploading] = useState(false);


  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    profilePicture: null,
    dateOfBirth: "",
    skills: [],
    experienceYears: "",
    location: "",
    pincode: "",
    latitude: null,
    longitude: null,
    expectedPayRange: "",
    formSubmitted: false, // New field  

  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const storedEmail = localStorage.getItem("email");
      if (!storedEmail) return;
  
      const formattedEmail = storedEmail.replace(/\./g, ",");
      const userRef = child(ref(database, "user-metadata/seeker"), formattedEmail);
  
      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setFormData(userData);
          // console.log("flag", userData.formSubmitted);
          if (userData.formSubmitted) {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, []);
  
  if (loading) {
    return <p className="text-center">Loading...</p>;
  }
  
  if (formData.formSubmitted) {
    return (<>
      <div className="flex items-center pt-15 justify-center min-h-screen bg-gray-900 text-white px-4">
     
        <div className="bg-white text-gray-800   scale-80  p-8 rounded-2xl shadow-2xl  w-full max-w-md text-center">
        <div className="flex justify-center  items-center w-full">
  <img src="/profile.png" alt="Profile Image" className="h-24 sm:h-32 md:h-40 lg:h-48 xl:h-35 object-contain" />
</div>
          <h2 className="text-2xl text-gray-900"> Profile Completed </h2>
          <p className="mt-3 text-gray-600">Explore job opportunities now!</p>
    
          <div className="mt-6 flex flex-col gap-4">
            <button
              onClick={() => navigate("/viewprofile")}
              className="w-full bg-purple-600  text-white py-3 px-6 rounded-3xl  text-lg hover:bg-purple-700 transition duration-300 "
            >
              View Profile
            </button>
            <button
              onClick={() => navigate("/jobsearch")}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-3xl text-lg hover:bg-green-700 transition duration-300"
            >
              Find Jobs
            </button>
          </div>
        </div>
      </div>
      </>
    );
    
  }
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
      // console.log("object", data);
      // console.log("Nearest", data.geocodingResults[1].formatted_address);
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


  const skillOptions = [
    // Original list
    "Plumber", "Electrician", "Painter", "Electronics Repairs", "Mechanic", 
    "Housemaid", "Cleaning Worker", "Agriculture", "Poultry Farming", "Fisheries", 
    "Construction", "Maintenance", "Handicrafts",
  
    // Additional related fields (Grouped by domain)
  
    // Household & Cleaning
    "Housekeeping", "Home Cleaning", "Laundry Services", "Dishwashing", "Ironing",
    "Babysitting", "Elderly Care",
  
    // Technical & Repairs
    "Carpenter", "Welder", "Tailor", "Blacksmith", "AC Technician",
    "Refrigerator Technician", "Mobile Repair Technician", "Computer Repair Technician",
    "Water Purifier Technician", "CCTV Installation", "Cable TV Technician", "Clock Repair",
  
    // Mechanical & Transport
    "Vehicle Washer", "Driver", "Driving Instructor", "Delivery Person",
    "Car Washing", "Mechanic (2-Wheeler)", "Mechanic (4-Wheeler)",
  
    // Construction & Manual Labor
    "Mason", "Tile Fitter", "Roofer", "Factory Worker", "Warehouse Worker",
    "Garbage Collection", "Recycling Worker", "Sign Board Installer", "Window Cleaner",
  
    // Agriculture & Livelihood
    "Farm Laborer", "Gardener", "Livestock Care", "Pest Control Worker", "Fishing Net Repairer",
  
    // Event & Service Industry
    "Event Decorator", "Sound Technician", "DJ Services", "Catering Assistant",
    "Waiter / Waitress", "Street Vendor", "Packers and Movers",
  
    // Personal Care
    "Barber", "Beautician", "Massage Therapist", "Yoga Instructor",
  
    // Miscellaneous
    "Baker", "Cook", "Retail Assistant", "Customer Support", "Photographer",
    "Sewing Machine Operator", "Shoe Repair", "Receptionist", "Tutor"
  ];
  

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


  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.secure_url) {
        setFormData((prev) => ({ ...prev, profilePicture: data.secure_url }));
        toast.success("Image uploaded successfully!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast.error("Image upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("formsubmitted", formData.formSubmitted);
    
  
    const requiredFields = ["fullName", "phoneNumber", "skills", "experienceYears", "location", "pincode", "expectedPayRange"];
    
    for (const field of requiredFields) {
      if (!formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0)) {
        toast.error("Please fill all the required fields!");
        return;
      }
    }
  
    const { latitude, longitude } = await fetchCoordinates(formData.location,formData.pincode);
    
    const storedEmail = localStorage.getItem("email");
    const formattedEmail = storedEmail.replace(/\./g, ",");
    
    const updatedFormData = {
      ...formData,
      email: storedEmail,
      userType: "seeker",
      latitude,
      longitude,
      formSubmitted: true, // Mark as submitted
    };

    
    const professionalsRef = ref(database, "user-metadata/seeker");
    const userRef = child(professionalsRef, formattedEmail);
  
    set(userRef, updatedFormData)
      .then(() => {
        toast.success("Profile submitted successfully!");
        navigate("/viewprofile");
        setFormData({ ...formData, formSubmitted: true }); // Ensure the form stays marked as submitted
      })
      .catch((error) => {
        toast.error("Error submitting profile: " + error.message);
      });

      if (updatedFormData.formSubmitted) {
        return (
          <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="bg-white text-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md text-center">
              <h2 className="text-2xl font-bold">Thank You!</h2>
              <p className="mt-2">Your form has been submitted successfully.</p>
              <button 
                onClick={() => navigate("/dashboard")} 
                className="bg-blue-600 text-white py-2 px-4 rounded-3xl mt-4 hover:bg-blue-700 transition"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        );
      }
  };
  
  
  const handleClose = () => {
    if (window.confirm("Are you sure you want to close the form? All progress will be lost.")) {
      navigate("/dashboard");
      setFormData({
        fullName: "",
          email: "",
          phoneNumber: "",
          profilePicture: null,
          skills: [],
          experienceYears: "",
          location: "",
          pincode: "",
          expectedPayRange: "",
      
      });
      toast.error("Form reset!");
    }
  };

 


  return (
    <div className="flex items-center px-8 justify-center min-h-screen bg-gray-900">
      <Toaster />
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-xl relative">
        <div className="text-center mb-4">
          <span className="text-gray-500">Step {step} of 3</span>
        </div>
        <h2 className="text-2xl font-bold text-center mb-5 text-gray-800">Seeker Registration Form</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mt-1">Full Name *</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="text-sm w-full p-2 border-b-2 border-gray-300 rounded focus:border-blue-600 outline-none" />

              <label className="block text-sm font-medium text-gray-700 mt-4">Phone Number *</label>
              <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required className="text-sm w-full p-2 border-b-2 border-gray-300 rounded focus:border-blue-600 outline-none" />

              <div className="flex justify-between">
                <button onClick={handleClose} className="bg-red-600 text-white py-2 px-4 rounded-3xl hover:bg-red-700 transition mt-4">Close</button>
                <button 
                  type="button" 
                  onClick={nextStep} 
                  className="bg-gray-800 text-white py-2 px-4 rounded-3xl hover:bg-blue-700 transition mt-4"
                >
                  Next »
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Profile Picture</label>
              <input type="file" name="profilePicture" onChange={handleFileChange} className="text-xs w-full p-2 border border-gray-300 rounded focus:border-blue-600 outline-none" disabled={imageUploading} />
              {imageUploading && <p className="text-blue-500">Uploading...</p>}

              <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">Skills/Expertise *</label>
              <Select
                isMulti
                name="skills"
                options={skillOptions.map(skill => ({ value: skill, label: skill }))}
                className="w-full"
                classNamePrefix="select"
                value={formData.skills.map(skill => ({ value: skill, label: skill }))}
                onChange={(selectedOptions) =>
                  setFormData({
                    ...formData,
                    skills: selectedOptions.map(option => option.value),
                  })
                }
              />

              <label className="block text-sm font-medium text-gray-700  mt-3">Years of Experience *</label>
              <input type="text" name="experienceYears" value={formData.experienceYears} onChange={handleChange} required className="w-full p-2 border-b-2 border-gray-300 rounded focus:border-blue-600 outline-none" />

              <div className="flex justify-between">
                <button type="button" onClick={prevStep} className="bg-gray-600 text-white py-2 px-4 rounded-3xl hover:bg-gray-700 transition mt-4">« Back</button>
                <button type="button" onClick={nextStep} className="bg-gray-800 text-white py-2 px-4 rounded-3xl hover:bg-blue-700 transition mt-4">Next »</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
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

              <label className="block text-sm font-medium text-gray-700 mt-4">Expected Pay Range *</label>
              <input type="text" name="expectedPayRange" value={formData.expectedPayRange} onChange={handleChange} required className="w-full p-2 border-b-2 border-gray-300 rounded focus:border-blue-600 outline-none" />

              <div className="flex justify-between">
                <button type="button" onClick={prevStep} className="bg-gray-600 text-white py-2 px-4 rounded-3xl hover:bg-gray-700 transition mt-4">« Back</button>
                <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded-3xl hover:bg-green-700 transition mt-4">Submit</button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SeekerForm;

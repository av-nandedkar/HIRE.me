import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Select from "react-select";
import { getDatabase, ref, push ,set , child } from "firebase/database";
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

  });

  const fetchCoordinates = async (pincode) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${pincode}`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        const latitude = lat;
        const longitude = lon;
        console.log("latitude and longitude", latitude,longitude);
        return { latitude,longitude}; // Return coordinates
      } else {
        toast.error("Location not found. Please enter a valid location and pincode.");
        return { latitude: null, longitude: null };

      }
    } catch (error) {
      toast.error("Failed to fetch location coordinates.");
      console.error("Geocoding Error:", error);
      return { latitude: null, longitude: null };
    }
  };

  const skillOptions = [
    "Plumber", "Electrician", "Painter", "Electronics Repairs", "Mechanic", 
    "Housemaid", "Cleaning Worker"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    const requiredFields = ["fullName", "phoneNumber", "skills", "experienceYears", "location", "pincode", "expectedPayRange"];
  
    for (const field of requiredFields) {
      if (!formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0)) {
        toast.error("Please fill all the required fields!");
        return;
      }
    }
  
    // Fetch coordinates before submitting
  const { latitude, longitude } =  await fetchCoordinates(formData.pincode);
  console.log("lat and long", latitude,longitude);
  
    // Fetch email from local storage and format it
    const storedEmail = localStorage.getItem("email");
    const formattedEmail = storedEmail.replace(/\./g, ",");
  
    // Add email and userType to formData
    const updatedFormData = {
      ...formData,
      email: storedEmail,
      userType: "seeker",
      latitude,
    longitude,
    };
  
    // Use child() to store data using the formatted email as key
    const professionalsRef = ref(database, "user-metadata/seeker");
    const userRef = child(professionalsRef, formattedEmail);
  
    set(userRef, updatedFormData)
      .then(() => {
        toast.success("Profile submitted successfully!");
        navigate("/viewprofile");
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
      })
      .catch((error) => {
        toast.error("Error submitting profile: " + error.message);
      });
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

              <label className="block text-sm font-medium text-gray-700 mt-4">Email Address (Optional)</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="text-sm w-full p-2 border-b-2 border-gray-300 rounded focus:border-blue-600 outline-none" />

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
              <label className="block text-sm font-medium text-gray-700 mt-2">Location *</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full p-2 border-b-2 border-gray-300 rounded focus:border-blue-600 outline-none" />

              <label className="block text-sm font-medium text-gray-700 mt-4">Pincode *</label>
              <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required className="w-full p-2 border-b-2 border-gray-300 rounded focus:border-blue-600 outline-none" />

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

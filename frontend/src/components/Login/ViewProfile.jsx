import { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';
import { getDatabase, ref, get, update } from "firebase/database";
import { app } from "../../firebase";
import { FaUserCircle, FaPen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dbshuwmvx/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "Hire.me";

const database = getDatabase(app);

const ViewProfile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [formattedEmail, setFormattedEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    const role = localStorage.getItem("userRole");

    if (!storedEmail || !role) {
      toast.error(" Please log in First ! ");
      navigate("/login");
      return;
    }

    setUserRole(role);
    const emailKey = storedEmail.replace(/\./g, ",");
    setFormattedEmail(emailKey);

    const userRef = ref(database, `user-metadata/${role}/${emailKey}`);

    get(userRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          setProfileData(snapshot.val());
          setEditedData(snapshot.val());
        } else {
          toast.error("Profile not found. Please complete your profile.");
          navigate(role === "provider" ? "/providerprofile" : "/seekerprofile");
        }
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        toast.error("Error fetching profile data.");
      })
      .finally(() => setLoading(false));
  }, [navigate]);


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


  const handleInputChange = async (e) => {
    const { name, value } = e.target;
  
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "location" && { pincode: "" }), // Clear pincode if location changes
    }));
  
    if (name === "skills") {
      setEditedData((prev) => ({
        ...prev,
        skills: value.split(",").map(skill => skill.trim()),
      }));
    }
  
    // Fetch coordinates only if both location and pincode are valid
    const location = name === "pincode" ? editedData.location : value;
    const pincode = name === "location" ? editedData.pincode : value;
  
    if (location && /^\d{6}$/.test(pincode)) {
      const coordinates = await fetchCoordinates(location, pincode);
      setEditedData((prev) => ({
        ...prev,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      }));
    }
  };
  
  

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    const requiredFields = ["fullName", "phoneNumber", "location", "pincode"];
    const emptyFields = requiredFields.filter(field => !editedData[field]?.trim());
  
    if (emptyFields.length > 0) {
      toast.error(`Please fill all required fields: ${emptyFields.join(", ")}`);
      return;
    }
  
    const userRef = ref(database, `user-metadata/${userRole}/${formattedEmail}`);
  
    // If userRole is "provider", exclude latitude & longitude
    const { latitude, longitude, ...filteredData } = editedData;
    const updatedData = userRole === "provider" ? filteredData : editedData;
  
    update(userRef, updatedData)
      .then(() => {
        toast.success("Profile updated successfully!");
        setProfileData(editedData);
        setIsEditing(false);
      })
      .catch((error) => {
        toast.error("Error updating profile: " + error.message);
        console.error("Error updating profile:", error);
      });
  };
  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Loading...
      </div>
    );
  }

  const handleProfilePicEdit = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.error("No file selected or input event is incorrect", e);
      toast.error("Please select an image first!");
      return;
    }

    if (!file) return;

    setImageUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      // Uploading image to Cloudinary
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!data.secure_url) throw new Error("Upload failed");

      // Update the profile picture state
      setEditedData((prev) => ({ ...prev, profilePicture: data.secure_url }));

      toast.success("Image uploaded successfully!");
      window.location.reload();

      // Fetch email and user type from local storage
      const storedEmail = localStorage.getItem("email");
      const userRole = localStorage.getItem("userRole"); // Ensure consistency in naming

      if (!storedEmail || !userRole) {
        toast.error("User information missing. Please log in again.");
        return;
      }

      // Replace `.` with `,` to avoid Firebase key issues
      const emailKey = storedEmail.replace(/\./g, ",");
      const userRef = ref(database, `user-metadata/${userRole}/${emailKey}`);

      // Update Firebase with the new profile picture URL
      await update(userRef, { profilePicture: data.secure_url });

      toast.success("Profile picture updated!");
    } catch (error) {
      toast.error("Image upload failed: " + error.message);
    } finally {
      setImageUploading(false);
    }
  };


  // Define fields for each user role
  const roleFields = {
    provider: [
      { label: "Full Name", name: "fullName" },
      { label: "Phone Number", name: "phoneNumber" },
      { label: "Email", name: "email" },
      { label: "Organization Name", name: "organizationName" },
      { label: "Business Type", name: "businessType" },
      { label: "Location", name: "location" },
      { label: "Pincode", name: "pincode" },
      { label: "Communication Method", name: "communicationMethod", isDropdown: true },
      { label: "User Type", name: "userType" },],
    seeker: [

      { label: "Full Name", name: "fullName" },
      { label: "Phone Number", name: "phoneNumber" },
      { label: "Email", name: "email" },
      { label: "Skills", name: "skills" },
      { label: "Location", name: "location" },
      { label: "Pincode", name: "pincode" },
      { label: "Experience (Years)", name: "experienceYears" },
      { label: "Expected Pay Range", name: "expectedPayRange" },
      { label: "User Type", name: "userType" },


    ],
  };

  return (
    <div className="min-h-screen py-25 flex items-center justify-center bg-gray-100 p-4">
      <Toaster />
      <div className="bg-white shadow-xl rounded-lg overflow-hidden flex flex-col md:flex-row w-full md:w-[700px]">
        {/* Left Section */}
        <div className="bg-gradient-to-b from-orange-400 to-pink-400 p-6 flex flex-col items-center text-center text-white md:w-1/3 relative">
          <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mb-4 overflow-hidden relative">
            {profileData?.profilePicture ? (
              <img
                src={profileData.profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUserCircle className="text-6xl text-white" />
            )}

            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleProfilePicEdit} // Trigger function on file select
            />

            {/* Button to trigger file input */}
            <button
              onClick={() => fileInputRef.current.click()} // Open file selection dialog
              className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow-md hover:bg-gray-200 transition z-10 right-3 mt-3"
            >
              <FaPen className="text-gray-600 text-sm relative " />
            </button>
          </div>
          <h2 className="text-xl md:text-base font-medium text-black mb-1">
            {profileData?.fullName || profileData?.organizationName || "N/A"}
          </h2>
          <p className="text-sm mb-4">{userRole.toUpperCase()}</p>
          <button
            onClick={handleEditToggle}
            className="bg-white text-pink-500 px-3 py-1 rounded-3xl shadow-md hover:bg-gray-100 transition"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-2/3 p-6 text-gray-700">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Information</h3>
          {roleFields[userRole].map((field) => (
            <div key={field.name} className="mb-2">
              <label className="font-semibold">{field.label}: </label>
              {isEditing && !["email", "userType", "communicationMethod"].includes(field.name) ? (
                <input
                  type="text"
                  name={field.name}
                  value={
                    Array.isArray(editedData[field.name])
                      ? editedData[field.name].join(", ")
                      : editedData[field.name] || ""
                  }
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-2 py-1 ml-2 mt-1 w-full md:w-auto"
                />
              ) : (
                <span className="ml-2">
                  {Array.isArray(profileData[field.name])
                    ? profileData[field.name].join(", ")
                    : profileData[field.name] || "N/A"}
                </span>
              )}
            </div>
          ))}

          {isEditing && (
            <button
              onClick={handleSave}
              className="bg-green-600 text-white py-2 px-4 rounded-3xl hover:bg-green-700 transition mt-4"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
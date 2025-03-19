import { useEffect, useState } from "react";
import { getDatabase, ref, get, update } from "firebase/database";
import { app } from "../../firebase";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const database = getDatabase(app);

const ViewProfile = () => {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [formattedEmail, setFormattedEmail] = useState("");
    const [userRole, setUserRole] = useState("");

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "skills") {
            // Split by comma and remove extra spaces
            setEditedData({ ...editedData, [name]: value.split(",").map(skill => skill.trim()) });
        } else {
            setEditedData({ ...editedData, [name]: value });
        }
    };


    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleSave = () => {
        const userRef = ref(database, `user-metadata/${userRole}/${formattedEmail}`);
        update(userRef, editedData)
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
          { label: "profilePicture", name: "profilePicture" },
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
<div className="bg-gradient-to-b from-orange-400 to-pink-400 p-6 flex flex-col items-center text-center text-white md:w-1/3">
  <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mb-4 overflow-hidden">
    {profileData?.profilePicture ? (
      <img src={profileData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
    ) : (
      <FaUserCircle className="text-6xl text-white" /> 
    )}
  </div>
  <h2 className="text-xl md:text-base font-medium text-black mb-1">{profileData?.fullName || profileData?.organizationName || "N/A"}</h2>
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
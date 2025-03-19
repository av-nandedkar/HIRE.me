import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getDatabase, ref, push , set, child } from "firebase/database";
import { app } from '../../firebase';
import { useNavigate } from "react-router-dom";

const database = getDatabase(app);

const  ProviderForm = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    organizationName: "",
    phoneNumber: "",
    professionalDetails: "",
    location: "",
    pincode: "",
     businessType: "",
     communicationMethod: "",
    identityVerification: null,
  });

  const skillOptions = [
    "Plumber", "Electrician", "Painter", "Electronics Repairs", "Mechanic", 
    "Housemaid", "Cleaning Worker"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };



  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    const requiredFields = ["fullName", "phoneNumber", "location", "pincode", "businessType", "communicationMethod"];
    
    for (const field of requiredFields) {
      if (!formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0)) {
        toast.error("Please fill all the required fields!");
        return;
      }
    }
  
    const storedEmail = localStorage.getItem("email");
    if (!storedEmail) {
      toast.error("Email not found! Please log in again.");
      return;
    }
  
    // Replace `.` with `,` to avoid Firebase key issues
    const emailKey = storedEmail.replace('.', ',');
    const professionalsRef = ref(database, "user-metadata/provider");
    const userRef = child(professionalsRef, emailKey);
  
    // Add userType: 'provider' to the submitted data
    set(userRef, { ...formData, email: storedEmail, userType: "provider" })
      .then(() => {
        toast.success("Profile submitted successfully!");
        navigate("/viewprofile");
        setFormData({
          fullName: "",
          organizationName: "",
          phoneNumber: "",
          location: "",
          pincode: "",
          businessType: "",
          communicationMethod: "",
        });
        setStep(1); // Reset to the first step
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
          organizationName: "",
          phoneNumber: "",
          location: "",
          pincode: "",
           businessType: "",
           communicationMethod : "",
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
        <h2 className="text-2xl font-bold text-center mb-5 text-gray-800"> Provider Registration Form</h2>
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
             
              <label className="block text-sm font-medium text-gray-700 mt-4">Organisation Name (Optional)</label>
              <input type="organizationName" name="organizationName" value={formData.organizationName} onChange={handleChange} className="text-sm w-full p-2 border-b-2 border-gray-300 rounded focus:border-blue-600 outline-none" />
              <label className="block text-sm font-medium text-gray-700 mt-4">Business Type (Optional)</label>
              <input type="businessType" name="businessType" value={formData.businessType} onChange={handleChange} className="text-sm w-full p-2 border-b-2 border-gray-300 rounded focus:border-blue-600 outline-none" />

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

           

              <div className="flex flex-col">
  <label className="block text-sm font-medium text-gray-700 mt-4">
    Communication Type *
  </label>
  <select
    name="communicationMethod"
    value={formData.communicationMethod}
    onChange={handleChange}
    required
    className="w-full p-2 border-b-2 border-gray-300 rounded focus:border-blue-600 outline-none bg-gray-400 text-white"
  >
    <option value="">Select Communication Type</option>
    <option value="Email">Email</option>
    <option value="Phone">Phone</option>
    <option value="Video Call">Message</option>
  </select>
</div>

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

export default  ProviderForm;

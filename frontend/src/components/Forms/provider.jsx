import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const JobForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    profilePicture: null,
    location: "",
    businessDetails: "",
    companyName: "",
    companyAddress: "",
    pinCode: "", // New Pin Code Field
    gstId: "",
    jobCategories: "",
    preferredSkills: "",
    budgetRange: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Required fields
    const requiredFields = ["location", "companyAddress", "pinCode", "jobCategories", "preferredSkills", "budgetRange"];
  
    // Check if any required field is empty
    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        toast.error("Please fill all the required fields!");
        return;
      }
    }
  
    toast.success("Job posted successfully!");
    console.log("Form Submitted:", formData);
  };
  
  

  // Function to close/reset the form
  const handleClose = () => {
    if (window.confirm("Are you sure you want to close the form? All progress will be lost.")) {
      setStep(1);
      setFormData({
        profilePicture: null,
        location: "",
        businessDetails: "",
        companyName: "",
        companyAddress: "",
        pinCode: "", // Reset Pin Code
        gstId: "",
        jobCategories: "",
        preferredSkills: "",
        budgetRange: "",
      });
      toast.error("Form reset!");
    }
  };

  return (
    <div className="flex items-center px-8 justify-center min-h-screen bg-gray-900">
      <Toaster />
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition"
        >
          ✖
        </button>

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
              <label className="block text-sm font-medium text-gray-700">Profile Picture (Optional)</label>
              <input type="file" name="profilePicture" onChange={(e) => setFormData({ ...formData, profilePicture: e.target.files[0] })} className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none" />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700">Location *</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none" />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700">Business Details (Optional)</label>
              <textarea name="businessDetails" value={formData.businessDetails} onChange={handleChange} className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none"></textarea>
            </div>

            <div className="mt-4 flex justify-between">
              <button onClick={handleClose} className="bg-red-600 text-white py-2 px-4 rounded-3xl hover:bg-red-700 transition">Close</button>
              <button onClick={() => setStep(2)} className="bg-gray-800 text-white py-2 px-4 rounded-3xl hover:bg-blue-700 transition">Next »</button>
            </div>
          </>
        )}

        {/* STEP 2 - Company Details + Pin Code */}
        {step === 2 && (
          <>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700">Company Name (Optional)</label>
              <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none" />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700">Company Address *</label>
              <input type="text" name="companyAddress" value={formData.companyAddress} onChange={handleChange} required className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none" />
            </div>

            {/* New Pin Code Field */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700">Pin Code *</label>
              <input type="text" name="pinCode" value={formData.pinCode} onChange={handleChange} required className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none" />
            </div>

            <div className="mt-4 flex justify-between">
              <button onClick={() => setStep(1)} className="bg-gray-400 text-white py-2 px-4 rounded-3xl hover:bg-gray-800 transition">« Back</button>
              <button onClick={() => setStep(3)} className="bg-gray-800 text-white py-2 px-4 rounded-3xl hover:bg-blue-700 transition">Next »</button>
            </div>
          </>
        )}

        {/* STEP 3 - Job Preferences */}
        {step === 3 && (
          <>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700">Job Categories *</label>
              <input type="text" name="jobCategories" value={formData.jobCategories} onChange={handleChange} required className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none" />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700">Preferred Worker Skills *</label>
              <input type="text" name="preferredSkills" value={formData.preferredSkills} onChange={handleChange} required className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none" />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700">Budget Range *</label>
              <input type="text" name="budgetRange" value={formData.budgetRange} onChange={handleChange} required className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none" />
            </div>

            <div className="mt-4 flex justify-between">
              <button onClick={() => setStep(2)} className="bg-gray-400 text-white py-2 px-4 rounded-3xl hover:bg-gray-800 transition">« Back</button>
              <button onClick={handleSubmit} className="bg-green-600 text-white py-2 px-4 rounded-3xl hover:bg-green-700 transition">Submit</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JobForm;

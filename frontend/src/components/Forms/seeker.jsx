import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Select from "react-select";
import { getDatabase, ref, push } from "firebase/database";
import { app } from '../../firebase';
const database = getDatabase(app);

const SeekerForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    profilePicture: null,
    dateOfBirth: "",
    professionalDetails: "",
    skills: [],
    experienceYears: "",
    certifications: [],
    projectImages: [],
    availability: {
      workHours: "",
      daysAvailable: "",
      onDemand: false,
    },
    location: "",
    pincode: "",
    expectedPayRange: "",
    identityVerification: null,
    languagesKnown: "",
  });

  const skillOptions = [
    "Plumber", "Electrician", "Painter", "Electronics Repairs", "Mechanic", 
    "Housemaid", "Cleaning Worker"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profilePicture: e.target.files[0] });
  };

  const handleSkillChange = (e) => {
    const selectedSkills = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, skills: selectedSkills });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    const requiredFields = ["fullName", "phoneNumber", "skills", "experienceYears", "location", "pincode", "expectedPayRange"];
    
    for (const field of requiredFields) {
      if (!formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0)) {
        toast.error("Please fill all the required fields!");
        return;
      }
    }

    const professionalsRef = ref(database, "professionals");
    push(professionalsRef, formData)
      .then(() => {
        toast.success("Profile submitted successfully!");
        setFormData({
          fullName: "",
          email: "",
          phoneNumber: "",
          profilePicture: null,
          dateOfBirth: "",
          professionalDetails: "",
          skills: [],
          experienceYears: "",
          certifications: [],
          projectImages: [],
          availability: {
            workHours: "",
            daysAvailable: "",
            onDemand: false,
          },
          location: "",
          pincode: "",
          expectedPayRange: "",
          identityVerification: null,
          languagesKnown: "",
        });
      })
      .catch((error) => {
        toast.error("Error submitting profile: " + error.message);
      });
  };

  const handleClose = () => {
    if (window.confirm("Are you sure you want to close the form? All progress will be lost.")) {
      setStep(1);
      setFormData({
        fullName: "",
          email: "",
          phoneNumber: "",
          profilePicture: null,
          dateOfBirth: "",
          professionalDetails: "",
          skills: [],
          experienceYears: "",
          certifications: [],
          projectImages: [],
          availability: {
            workHours: "",
            daysAvailable: "",
            onDemand: false,
          },
          location: "",
          pincode: "",
          expectedPayRange: "",
          identityVerification: null,
          languagesKnown: "",
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
              <input type="file" name="profilePicture" onChange={handleFileChange} className="text-xs w-full p-2 border border-gray-300 rounded focus:border-blue-600 outline-none" />
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

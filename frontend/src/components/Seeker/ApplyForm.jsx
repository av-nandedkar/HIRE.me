import { useState, useEffect } from "react";
import { getDatabase, ref, set } from "firebase/database";
import { useLocation } from "react-router-dom";
import { app } from "../../firebase";
import toast, { Toaster } from "react-hot-toast";

const database = getDatabase(app);

const ApplyForm = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const jobId = queryParams.get("jobId"); // Get jobId from URL params

  const [formData, setFormData] = useState({
    applicantName: "",
    applicantEmail: "",
    coverLetter: "",
    contactNumber: "",
  });

  const [resume, setResume] = useState(null); // Base64 version
  const [resumeName, setResumeName] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file selection and convert to Base64
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type. Please upload a PDF or DOCX file.");
        return;
      }

      // Read file and convert to Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setResume(reader.result); // Store Base64 string
        setResumeName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { applicantName, applicantEmail, coverLetter, contactNumber } =
      formData;

    // Validate jobId
    if (!jobId) {
      toast.error("Invalid or missing job ID. Unable to submit application.");
      setLoading(false);
      return;
    }

    // Basic validation
    if (
      !applicantName.trim() ||
      !applicantEmail.trim() ||
      !coverLetter.trim() ||
      !contactNumber.trim()
    ) {
      toast.error("All fields are required except Resume.");
      setLoading(false);
      return;
    }

    // Validate contact number (10-15 digits)
    if (!/^\d{10,15}$/.test(contactNumber)) {
      toast.error("Enter a valid contact number (10-15 digits).");
      setLoading(false);
      return;
    }

    try {
      const applicationId = `app-${Date.now()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      // ✅ Prepare application data
      const applicationData = {
        ...formData,
        appliedAt: new Date().toISOString(),
        resumeData: resume || null, // Base64 data (if provided)
        resumeName: resumeName || null,
      };

      // ✅ Store application in Firebase Realtime Database
      const applicationsRef = ref(
        database,
        `jobs/${jobId}/applications/${applicationId}`
      );
      await set(applicationsRef, applicationData);

      toast.success("Application submitted successfully! 🎉");

      // ✅ Reset form after submission
      resetForm();
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Error submitting application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset form function
  const resetForm = () => {
    setFormData({
      applicantName: "",
      applicantEmail: "",
      coverLetter: "",
      contactNumber: "",
    });
    setResume(null);
    setResumeName("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-8">
      <Toaster />
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl relative">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {jobId
            ? `Apply for Job ID: ${jobId}`
            : "No Job ID Provided - Application Disabled"}
        </h2>

        {jobId ? (
          <form onSubmit={handleSubmit}>
            {/* Applicant Name */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700">
                Applicant Name *
              </label>
              <input
                type="text"
                name="applicantName"
                value={formData.applicantName}
                onChange={handleChange}
                className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none"
                required
              />
            </div>

            {/* Email Address */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                name="applicantEmail"
                value={formData.applicantEmail}
                onChange={handleChange}
                className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none"
                required
              />
            </div>

            {/* Cover Letter */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700">
                Cover Letter / Message *
              </label>
              <textarea
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleChange}
                rows="4"
                className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none"
                required
              ></textarea>
            </div>

            {/* Contact Number */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700">
                Contact Number *
              </label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none"
                required
              />
            </div>

            {/* Resume Upload */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700">
                Upload Resume/CV (Optional)
              </label>
              <input
                type="file"
                accept=".pdf, .docx"
                onChange={handleFileUpload}
                className="w-full mt-1 p-2 border-b-2 border-gray-300 focus:border-blue-600 outline-none"
              />
              {resumeName && (
                <p className="text-sm text-gray-500 mt-1">
                  Selected: {resumeName}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-4 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className={`bg-green-600 text-white py-2 px-4 rounded-3xl hover:bg-green-700 transition ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-center text-red-500 font-semibold">
            Cannot apply without a valid Job ID. Please check the URL.
          </p>
        )}
      </div>
    </div>
  );
};

export default ApplyForm;

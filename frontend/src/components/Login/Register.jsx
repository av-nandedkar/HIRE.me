import React, { useState } from "react";
import bcrypt from "bcryptjs";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { getDatabase, ref, child, get ,set } from "firebase/database";
import { app } from "../../firebase";

const auth = getAuth(app);

const Register = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    userType: "",
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // General Input Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Password Validation
  const validatePassword = (password) => {
    const strongPasswordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/;
    setPasswordError(
      strongPasswordRegex.test(password)
        ? ""
        : "Password must be 8+ characters with uppercase, lowercase, number, and special character."
    );
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData((prev) => ({ ...prev, password: newPassword }));
    validatePassword(newPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent double submission

    // Validate inputs
    if (Object.values(formData).some((field) => !field) || !confirmPassword) {
        toast.error("Please fill all required fields.");
        return;
    }

    if (passwordError) {
        toast.error(passwordError);
        return;
    }

    if (formData.password !== confirmPassword) {
        toast.error("Passwords do not match!");
        return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
        toast.error("Please enter a valid 10-digit phone number.");
        return;
    }

    try {
        setIsSubmitting(true);

        // Check if user already exists
        const formattedEmail = formData.email.replace(/\./g, ",");
        const db = getDatabase(app);
        const userRef = ref(db, `registrationdetails/${formattedEmail}`);

        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            toast.error("User already registered! Redirecting to login...");
            navigate("/login");
            return;
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(formData.password, 10); // Salt rounds = 10

        // Register user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            formData.email,
            formData.password
        );
        const user = userCredential.user;

        // Store additional user details along with hashed password in Firebase Realtime Database
        await set(userRef, {
            userType: formData.userType,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: hashedPassword, // Store the hashed password
        });

        // Save user role & Navigate
        localStorage.setItem("userRole", formData.userType);
        toast.success("Registration successful!");
        navigate("/login");
    } catch (error) {
        if (error.code === "auth/email-already-in-use") {
            toast.error("User already registered! Redirecting to login...");
            navigate("/login");
        } else {
            console.error("Registration Error:", error);
            toast.error(`Registration failed: ${error.message}`);
        }
    } finally {
        setIsSubmitting(false);
    }
};


  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            fontSize: "1rem",
            padding: "10px 20px",
            maxWidth: "500px",
            borderRadius: "40px",
            marginTop: "30px",
          },
        }}
      />
      <div className="flex items-center mt-10 px-8 justify-center min-h-screen bg-gray-900">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-xl xl:max-w-xl">
          <div className="flex justify-center mb-2">
            <a href="/">
              {" "}
              <img
                src="/HIRE.me-blue.png"
                alt="HIRE.me Logo"
                className="h-12"
              />
            </a>
          </div>

          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
            Join HIRE.me Today
          </h2>

          <>
            {" "}
            <p className="text-gray-600 text-sm text-center mt-4">
              <strong>Already a Member?</strong>{" "}
              <a href="/login" className="text-blue-400 hover:underline">
               Sign In here
              </a>
            </p>
            <div className="flex items-center my-4">
              <hr className="flex-grow border-gray-600" />
              <span className="text-gray-700 px-2">or</span>
              <hr className="flex-grow border-gray-600" />
            </div>
          </>

          {step === 1 && (
            <>
              {/* User Type */}
              <label className="text-sm block text-gray-600 mb-2">
                How do you want to use HIRE.me?
              </label>
              <select
                name="userType"
                className="text-s w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={formData.userType}
                onChange={handleChange}
              >
                <option value="">Choose an option</option>
                <option value="provider">I need to hire someone</option>
                <option value="seeker">I'm looking for work</option>
              </select>

              {/* Name, Email, Phone */}
              <div className="mt-4">
                <label className="text-sm block text-gray-600">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="mt-4">
                <label className="text-sm block text-gray-600">
                  Email<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="bg-gray-800 text-white py-2 px-4 rounded-3xl"
                >
                  Next
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Password */}
              <div className="mt-3 relative">
                <label className="mb-3 text-sm block text-gray-600">
                  Password<span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="text-s w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={formData.password}
                  onChange={handlePasswordChange}
                  placeholder="Enter strong password"
                />

                <span
                  className="absolute right-3 top-10 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
                {passwordError && (
                  <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="mt-4 relative">
                <label className="mb-3 text-sm block text-gray-600">
                  Confirm Password<span className="text-red-500">*</span>
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="Confirm your password"
                />
                <span
                  className="absolute right-3 top-10 cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <div className="mt-4">
                <label className="text-sm block text-gray-600">
                  Phone Number<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  className="w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="bg-gray-400 text-white py-1 px-4 rounded-3xl hover:bg-gray-800 transition cursor-pointer"
                >
                  «
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gray-800 text-white py-2 px-4 rounded-3xl hover:bg-blue-700 transition cursor-pointer "
                >
                  Register
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Register;

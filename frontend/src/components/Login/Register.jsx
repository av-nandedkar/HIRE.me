import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import axios from 'axios';


const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    userType: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    pinCode: '',
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    validatePassword(newPassword);
  };
  
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };
  
  const validatePassword = (password) => {
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      setPasswordError('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
    } else {
      setPasswordError('');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.userType || !formData.name || !formData.email || !formData.password || !confirmPassword || !formData.phone || !formData.location || !formData.pinCode) {
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
  
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/register`,
        { ...formData },  // ✅ Sending formData without confirmPassword
        { headers: { "Content-Type": "application/json" } }
      );
  
      toast.success(data?.message || "Registration successful!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed.");
    }
  };
  
  
  
  

  return (
    <>
    <Toaster
    position="top-center"
    reverseOrder={false}
    toastOptions={{
      style: {
        fontSize: '1rem',
        padding: '10px 20px',
        maxWidth: '500px',
        borderRadius: '40px',
        marginTop: '30px',
      },
    }}
  />
    <div className="flex items-center px-8 justify-center min-h-screen bg-gray-900">
<div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
<div className="flex justify-center mb-4">
         <a href='/'> <img src="/HIRE.me-blue.png" alt="HIRE.me Logo" className="h-12" /></a>
        </div>
     
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Join HIRE.me Today</h2>

       <>   <p className="text-gray-600 text-sm text-center mt-4">
  <strong>Already a Member?</strong> <a href="/login" className="text-blue-400 hover:underline"><strong>Sign In here</strong></a>
</p>

        
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-600" />
          <span className="text-gray-700 px-2">or</span>
          <hr className="flex-grow border-gray-600" />
        </div></>


        {step === 1 && (
          <>

        {/* User Type */}
        <label className="block text-gray-600 mb-2">How do you want to use HIRE.me?</label>
        <select name="userType" className="w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300" value={formData.userType} onChange={handleChange}>
          <option value="">Choose an option</option>
          <option value="provider">I need to hire someone</option>
          <option value="seeker">I'm looking for work</option>
        </select>

        {/* Name, Email, Phone */}
        <div className="mt-4">
        <label className="block text-gray-600">
  Full Name <span className="text-red-500">*</span>
</label>
          <input type="text" name="name" className="w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300" value={formData.name} onChange={handleChange} />
        </div>

        <div className="mt-4">
          <label className="block text-gray-600">Email<span className="text-red-500">*</span></label>
          <input type="email" name="email" className="w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300" value={formData.email} onChange={handleChange} />
        </div>
        <div className="mt-4 flex justify-end">
  <button onClick={() => setStep(2)} className="bg-gray-800 text-white py-2 px-4 rounded-3xl">Next</button>
</div>


        </>  
     )} 

        {step === 2 && (
          <>

        {/* Password */}
        <div className="mt-4 relative">
          <label className="block text-gray-600">Password<span className="text-red-500">*</span></label>
          <input 
            type={showPassword ? 'text' : 'password'} 
            className="w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300" 
            value={password} 
            onChange={handlePasswordChange} 
            placeholder="Enter strong password"
          />
          <span className="absolute right-3 top-10 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
          {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
        </div>

        {/* Confirm Password */}
        <div className="mt-4 relative">
          <label className="block text-gray-600">Confirm Password<span className="text-red-500">*</span></label>
          <input 
            type={showConfirmPassword ? 'text' : 'password'} 
            className="w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300" 
            value={confirmPassword} 
            onChange={handleConfirmPasswordChange} 
            placeholder="Confirm your password"
          />
          <span className="absolute right-3 top-10 cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <div className="mt-4 flex justify-between">
              <button onClick={() => setStep(1)} className="bg-gray-400 text-white py-1 px-4 rounded-3xl hover:bg-gray-800 transition cursor-pointer">«</button>
              <button onClick={() => setStep(3)}className="bg-gray-800 text-white py-2 px-4 rounded-3xl ">Next</button>
            </div>

</>   )} 

{step === 3 && (
          <>
        <div className="mt-4">
          <label className="block text-gray-600">Phone Number<span className="text-red-500">*</span></label>
          <input type="text" name="phone" className="w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300" value={formData.phone} onChange={handleChange} />
        </div>

        {/* Location and Pin Code */}
        <div className="mt-4">
          <label className="block text-gray-600">Location<span className="text-red-500">*</span></label>
          <input type="text" name="location" className="w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300" value={formData.location} onChange={handleChange} />
        </div>

        <div className="mt-4">
          <label className="block text-gray-600">Pin Code<span className="text-red-500">*</span></label>
          <input type="text" name="pinCode" className="w-full px-3 py-1 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300" value={formData.pinCode} onChange={handleChange} />
        </div>

        {/* Submit Button */}
        <div className="mt-4 flex justify-between">
              <button onClick={() => setStep(2)} className="bg-gray-400 text-white py-1 px-4 rounded-3xl hover:bg-gray-800 transition cursor-pointer">«</button>
              <button onClick={handleSubmit} className="bg-gray-800 text-white py-2 px-4 rounded-3xl hover:bg-blue-700 transition cursor-pointer ">Register</button>
            </div>

        </>
        )}
      </div>
    </div></>
  );
};

export default Register;
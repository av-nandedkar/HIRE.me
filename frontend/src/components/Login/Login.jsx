import React from 'react'
import { useState } from 'react';
import { FaGoogle, FaApple } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div className="flex items-center justify-center min-h-screen bg-white-900">
      <div className="bg-white p-8 rounded-xl shadow-lg w-105">
        <h2 className="text-black text-2xl font-bold text-center mb-6">Welcome to HIRE.me</h2>
        
        <div className="flex gap-2 mb-4">
          <button className="flex items-center justify-center w-1/2 px-4 py-3 bg-gray-100 text-black rounded-2xl hover:bg-gray-300 cursor-pointer">
            <FaGoogle className="mr-2 w-6 h-6 " /> Log in with Google
          </button>
          <button className="flex items-center justify-center w-1/2 px-4 py-3 bg-gray-100 text-black rounded-2xl hover:bg-gray-300 cursor-pointer">
            <FaApple className="mr-2 w-6 h-6 " /> Log in with Apple
          </button>
        </div>
        
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-600" />
          <span className="text-gray-700 px-2">or</span>
          <hr className="flex-grow border-gray-600" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 mb-1">Email</label>
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="w-full px-3 py-2 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 mb-1">Password</label>
          <input 
            type="password" 
            placeholder="Enter your password" 
            className="w-full px-3 py-2 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          <label className="flex items-center text-gray-600">
            <input type="checkbox" className="mr-2" /> Remember me
          </label>
          <a href="#" className="text-blue-400 text-sm hover:underline">Forgot password?</a>
        </div>

        <button className="w-full bg-blue-600 text-white py-2 rounded-2xl hover:bg-blue-700 transition cursor-pointer">
          Sign in to your account
        </button>

        <p className="text-gray-600 text-sm text-center mt-4">
          Don’t have an account yet? <a href="#" className="text-blue-400 hover:underline">Sign up here</a>
        </p>
      </div>
    </div>
  );
}

export default Login

import React, { useState } from 'react';
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast, Toaster } from "react-hot-toast";
import { getAuth,signInWithEmailAndPassword,GoogleAuthProvider ,signInWithPopup } from 'firebase/auth';
import {app}from '../../firebase';
import { getDatabase, ref, get } from "firebase/database";
const auth=getAuth(app);
const provider = new GoogleAuthProvider();
const database = getDatabase(app);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (password) => /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(password);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      // Check if user exists in the database
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
  
      if (snapshot.exists()) {
        // User exists, proceed with login
        const token = await user.getIdToken();
        localStorage.setItem("authToken", token);
        toast.success("Login successful!");
        window.location.href = "/dashboard"; // Redirect after login
      } else {
        // User not found, ask them to register first
        toast.error("You are not registered. Please sign up first.");
        await auth.signOut(); // Sign out if user is not found in the database
      }
    } catch (error) {
      toast.error(error.message || "Google login failed.");
    }
  };
  

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast.error("Please enter both email and password.");
      setLoading(false);
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      toast.error("Please enter a valid email.");
      setLoading(false);
      return;
    }

    if (!isValidPassword(trimmedPassword)) {
      toast.error("Password must have at least 6 characters, 1 uppercase, 1 number, and 1 special character.");
      setLoading(false);
      return;
    }

    try {
    
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      const user = userCredential.user;
  
      toast.success("Login successful!");
  
      const token = await user.getIdToken();
      localStorage.setItem("authToken", token);
  
      window.location.href = "/dashboard";
  
    } catch (error) {
      toast.error(error.message || "Invalid credentials. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { fontSize: '1rem', padding: '10px 20px', maxWidth: '500px', borderRadius: '40px', marginTop: '30px' } }} />

      <div className="flex items-center p-8 justify-center min-h-screen bg-gray-900">
        <div className="bg-white mt-12 p-8 rounded-3xl shadow-lg w-full max-w-md">
          <h2 className="text-black text-2xl font-bold text-center mb-6">Welcome to</h2>
          <div className="flex justify-center mb-6">
            <a href='/'> <img src="/HIRE.me-blue.png" alt="HIRE.me Logo" className="h-12" /></a>
          </div>

          <div className="flex gap-2 mb-4">
            <button onClick={handleGoogleLogin} className="flex items-center justify-center w-full px-4 py-3 bg-gray-100 text-black rounded-2xl hover:bg-gray-300 cursor-pointer">
              <FaGoogle className="mr-2 w-5 h-5" /> Log in with Google
            </button>
          </div>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-600" />
            <span className="text-gray-700 px-2">or</span>
            <hr className="flex-grow border-gray-600" />
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-600 mb-1">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email address"
              />
            </div>

            <div className="mb-4 relative">
              <label className="block text-gray-600 mb-1">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="w-full px-3 py-2 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-label="Password"
              />
              <span className="absolute right-3 top-10 cursor-pointer" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="flex justify-between items-center mb-4">
              <label className="flex items-center text-gray-600">
                <input type="checkbox" className="mr-2" /> Remember me
              </label>
              <a href="#" className="text-blue-400 text-sm hover:underline">Forgot password?</a>
            </div>

            <button type="submit" disabled={loading} className={`w-full py-2 rounded-2xl transition cursor-pointer ${loading ? "bg-gray-500" : "bg-gray-800 hover:bg-blue-700 text-white"}`}>
              {loading ? "Signing in..." : "Sign in to your account"}
            </button>
          </form>

          <p className="text-gray-600 text-sm text-center mt-4">
            Don’t have an account yet? <a href="/register" className="text-blue-400 hover:underline">Sign up here</a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;

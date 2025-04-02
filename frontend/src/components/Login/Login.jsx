import React, { useState } from 'react';
import bcrypt from 'bcryptjs';  // Import bcryptjs
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, deleteUser } from 'firebase/auth';
import { app } from '../../firebase';
import { getDatabase, ref, get, set, remove } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const database = getDatabase(app);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check user existence in registrationdetails
  const checkUserInRegistrationDetails = async (email) => {
    try {
      const userRef = ref(database, 'registrationdetails');
      const snapshot = await get(userRef);
  
      if (!snapshot.exists()) {
        return null; // No users found
      }
  
      let userFound = null;
  
      snapshot.forEach((childSnapshot) => {
        const userData = childSnapshot.val();
        if (userData.email?.toLowerCase() === email.toLowerCase()) {
          userFound = { ...userData, uid: childSnapshot.key }; // Match found
        }
      });
  
      return userFound;
    } catch (error) {
      console.error("Error fetching registration details:", error);
      return null;
    }
  };
  

  // Step 3 & 4: Handle Authentication Entry
  const handleAuthEntry = async (email) => {
    const authRef = ref(database, `authentication/${email.replace('.', ',')}`);
   
  };

  // Step 5: Save necessary items to localStorage
  const saveToLocalStorage = (user) => {
    localStorage.setItem('authToken', auth.currentUser?.accessToken || '');
    localStorage.setItem('userRole', user.userType);
    localStorage.setItem('email', user.email);
  };

  const saveToLocalStoragebymail = (user, rememberMe) => {
    const randomToken = Math.random().toString(36).substr(2) + Date.now().toString(36) + Math.random().toString(36).substr(2);

    if (rememberMe) {
        // Store in both localStorage & sessionStorage
        localStorage.setItem("authToken", randomToken);
        localStorage.setItem("userRole", user.userType);
        localStorage.setItem("email", user.email);

        sessionStorage.setItem("authToken", randomToken);
        sessionStorage.setItem("userRole", user.userType);
        sessionStorage.setItem("email", user.email);
    } else {
        // Store only in localStorage
        localStorage.setItem("authToken", randomToken);
        localStorage.setItem("userRole", user.userType);
        localStorage.setItem("email", user.email);
    }

    // console.log("Generated Auth Token:", randomToken);
};


  // Google Login - Follows Steps 1, 3, 4, 5
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      // Step 1: Check registration details
      const registeredUser = await checkUserInRegistrationDetails(user.email);
  
      if (!registeredUser) {
        await deleteUser(user);  // Delete unauthorized user
        toast.error('User not registered. Redirecting to registration page.');
        navigate('/register');
        return false;  // Proper return for unsuccessful login
      }
  
      // Step 3 & 4: Handle Authentication Entry
      await handleAuthEntry(user.email);
  
      // Step 5: Save necessary items to localStorage
      saveToLocalStorage(registeredUser);
  
      toast.success('Login successful!');
      navigate('/dashboard');
      window.location.reload();  // Ensure a fresh start
      return true;  // Proper return for successful login
    } catch (error) {
      toast.error('Google login failed. Please try again.');
      return false;  // Proper return for error
    }
  };
  
 // Form Login - Follows Steps 1, 2, 3, 4, 5
 const handleFormLogin = async (e) => {
  e.preventDefault();
  if (loading) return false;  // Prevent multiple submissions

  setLoading(true);

  try {
    // Step 1: Check registration details
    const registeredUser = await checkUserInRegistrationDetails(email);

    if (!registeredUser) {
      toast.error('User not registered. Redirecting to registration page.');
      navigate('/register');
      setLoading(false);
      return false;  // Proper return for unsuccessful login
    }

    // Step 2: Validate password using bcrypt
const isPasswordCorrect = await bcrypt.compare(password, registeredUser.password); // No need to hash 'password' again

if (!isPasswordCorrect) {
  toast.error('Incorrect password.');
  setLoading(false);
  return false;  // Proper return for incorrect password
}

    saveToLocalStoragebymail(registeredUser, rememberMe);

    toast.success('Login successful!');
    navigate('/dashboard');
    window.location.reload(); // Ensure fresh state
    return true;  // Proper return for successful login
  } catch (error) {
    console.error("Error during form login:", error);
    toast.error('Login failed. Please try again.');
    return false;  // Proper return for any other error
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { fontSize: '1rem', padding: '10px 20px', maxWidth: '500px', borderRadius: '40px', marginTop: '30px' } }} />
  
      <div className="flex items-center mt-10 p-8 justify-center min-h-screen bg-gray-900">
        <div className="bg-white mt-12 p-8 rounded-3xl shadow-lg w-full max-w-md">
          <h2 className="text-black text-2xl font-bold text-center mb-6">Welcome to</h2>
          <div className="flex justify-center mb-6">
            <a href='/'> <img src="/HIRE.me-blue.png" alt="HIRE.me Logo" className="h-12" /></a>
          </div>
  
          <div className="flex gap-2 mb-4">
            <button
              onClick={async () => {
                const result = await handleGoogleLogin();
                // if (!result) {
                //   toast.error('Google login failed or user not registered.');
                // }
              }}
              className="flex items-center justify-center w-full px-4 py-3 bg-gray-100 text-black rounded-2xl hover:bg-gray-300 cursor-pointer"
            >
              <FaGoogle className="mr-2 w-5 h-5" /> Log in with Google
            </button>
          </div>
  
          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-600" />
            <span className="text-gray-700 px-2">or</span>
            <hr className="flex-grow border-gray-600" />
          </div>
  
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const result = await handleFormLogin(e);
              // if (!result) {
              //   toast.error('Login failed or user not registered.');
              // }
            }}
          >
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
              <span
                className="absolute right-3 top-10 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
  
            <div className="flex justify-between items-center mb-4">
            <label className='text-sm'><input
  type="checkbox"
  className="mr-2"
  checked={rememberMe}
  onChange={(e) => setRememberMe(e.target.checked)}
/>Remember Me</label>

              <a href="/forgotpassword" className="text-blue-400 text-sm hover:underline">Forgot password?</a>
            </div>
  
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-2xl transition cursor-pointer ${loading ? "bg-gray-500" : "bg-gray-800 hover:bg-blue-700 text-white"}`}
            >
              {loading ? 'Signing in...' : 'Sign in to your account'}
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

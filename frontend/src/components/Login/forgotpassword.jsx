import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { getDatabase, ref, child, get ,set } from "firebase/database";
import { app } from '../../firebase';

const auth = getAuth(app);

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!email) {
        toast.error('Please enter your email address.');
        setIsSubmitting(false);
        return;
    }

    try {
        // Format email to match Firebase key format
        const formattedEmail = email.replace(/\./g, ",");
        const db = getDatabase(app);
        const userRef = ref(db, `registrationdetails/${formattedEmail}`);

        // Check if the user exists
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
            toast.error('Email not registered. Register First ! ');
            navigate('/register');
            setIsSubmitting(false);
            return;
        }

        // Send password reset email
        await sendPasswordResetEmail(auth, email);
        toast.success('Password reset link sent to your email.');
        navigate('/login');
    } catch (error) {
        console.error('Error sending reset email:', error);
        toast.error('Failed to send password reset email.');
    } finally {
        setIsSubmitting(false);
    }
};

  return (
    <>
      <Toaster
        position="top-center"
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

      <div className="flex items-center mt-10 px-8 justify-center min-h-screen bg-gray-900">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Forgot Password</h2>

          <form onSubmit={handleSubmit}>
            <label className="text-sm block text-gray-600 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Enter your email"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 bg-gray-800 text-white py-2 px-4 rounded-3xl hover:bg-blue-700 transition cursor-pointer w-full"
            >
              {isSubmitting ? 'Submitting...' : 'Send Reset Link'}
            </button>

            <p className="text-gray-600 text-sm text-center mt-4">
              Remember your password?{' '}
              <a href="/login" className="text-blue-400 hover:underline">Sign In</a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;

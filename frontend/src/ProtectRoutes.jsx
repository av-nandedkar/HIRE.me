import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check localStorage first
        let role = localStorage.getItem("userRole");

        if (!role) {
          // Fetch from Firestore if not found in localStorage
          const userRef = doc(db, "registrationdetails", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            role = userSnap.data().userRole;
            localStorage.setItem("userRole", role); // Store it for future use
          }
        }

        setUserRole(role);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  if (loading) return <p>Loading...</p>;

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
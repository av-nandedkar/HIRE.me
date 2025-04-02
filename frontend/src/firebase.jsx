// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDIRzhbIRFR7o_-D85-yvN2J_ExUp1GsSI",
  authDomain: "hireme-5716f.firebaseapp.com",
  projectId: "hireme-5716f",
  storageBucket: "hireme-5716f.firebasestorage.app",
  messagingSenderId: "370581906927",
  appId: "1:370581906927:web:a235aa8b5069f54027421a",
  measurementId: "G-RM8949NCNC",
  databaseURL:"https://hireme-5716f-default-rtdb.firebaseio.com"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
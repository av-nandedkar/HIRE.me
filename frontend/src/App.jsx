import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import {Navbar,Footer} from './components/Navbar/Navbar'
import Login from './components/Login/Login';
import Register from './components/Login/Register';
import Home from './components/Home/Home'
import WorkProviderForm from './components/Provider/providerDetails';
import SeekerForm from './components/Seeker/seekerDetails';
import Contact from './components/Forms/contact';
import Dashboard from './components/Dashboards/dashboard';
import JobForm from './components/Provider/Jobpost';
import ViewProfile from './components/Login/ViewProfile';
import ForgotPassword from './components/Login/forgotpassword';
function App() {
  return (

    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home/>}></Route>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/providerprofile" element={<WorkProviderForm />} />
          <Route path="/seekerprofile" element={<SeekerForm/>}></Route>
          <Route path="/contact" element={<Contact/>}></Route>
          <Route path="/jobpost" element={<JobForm/>}></Route>
          <Route path="/viewprofile" element={<ViewProfile/>}></Route>
          <Route path="/forgotpassword" element={<ForgotPassword/>}></Route>


        </Routes>
        <Footer/>
      </div>
    </Router>

  );
}

export default App

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import {Navbar,Footer} from './components/Navbar/Navbar'
import Login from './components/Login/Login';
import Register from './components/Login/Register';
import Home from './components/Home/Home'
import WorkProviderForm from './components/Forms/provider';
import SeekerForm from './components/Forms/seeker';
import Contact from './components/Forms/contact';
import Dashboard from './components/Login/dashboard';
function App() {
  return (

    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home/>}></Route>
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/workproviderform" element={<WorkProviderForm />} />
          <Route path="/seekerform" element={<SeekerForm/>}></Route>
          <Route path="/contact" element={<Contact/>}></Route>
        </Routes>
        <Footer/>
      </div>
    </Router>

  );
}

export default App

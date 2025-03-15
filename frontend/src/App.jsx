import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import {Navbar,Footer} from './components/Navbar/Navbar'
import Login from './components/Login/Login';
import Register from './components/Login/Register';
import Home from './components/Home/Home'
import WorkProviderForm from './components/Forms/provider';

function App() {
  return (

    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home/>}></Route>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/workproviderform" element={<WorkProviderForm />} />

        </Routes>
        <Footer/>
      </div>
    </Router>

  );
}

export default App

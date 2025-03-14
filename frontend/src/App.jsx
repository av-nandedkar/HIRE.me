import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'; 

import Login from './components/Login/Login';
import Register from './components/Login/Register';

function App() {
  return (

    <Router>
      <div>
        {/* <Navbar /> */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />

          
        </Routes>
      </div>
    </Router>

  );
}

export default App

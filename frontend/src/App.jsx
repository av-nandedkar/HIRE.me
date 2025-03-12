import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'; 

import Login from './Components/Login/Login';

function App() {
  return (

    <Router>
      <div>
        {/* <Navbar /> */}
        <Routes>
          <Route path="/login" element={<Login />} />
          
        </Routes>
      </div>
    </Router>

  );
}

export default App

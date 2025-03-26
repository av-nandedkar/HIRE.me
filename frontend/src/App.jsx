import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import ProtectRoutes from "./ProtectRoutes";
import { Navbar, Footer } from "./components/Navbar/Navbar";
import Login from "./components/Login/Login";
import Register from "./components/Login/Register";
import Home from "./components/Home/Home";
import WorkProviderForm from "./components/Provider/providerDetails";
import SeekerForm from "./components/Seeker/seekerDetails";
import Contact from "./components/Forms/contact";
import Dashboard from "./components/Dashboards/dashboard";
import JobForm from "./components/Provider/Jobpost";
import ViewProfile from "./components/Login/ViewProfile";
import ForgotPassword from "./components/Login/forgotpassword";
import JobSearch from "./components/Seeker/JobSearch";
import JobRecommendations from "./components/Seeker/JobRecommendations";
import ApplyForm from "./components/Seeker/ApplyForm";
import JobList from "./components/Provider/JobList";
import ApplicationsList from "./components/Provider/ApplicatiosList"
function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />}></Route>
          <Route path="/forgotpassword" element={<ForgotPassword />}></Route>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/viewprofile" element={<ViewProfile />}></Route>
          <Route path="/jobrecommendations" element={<JobRecommendations/>}></Route>
          <Route path="/applyform" element={< ApplyForm/>}></Route>
          <Route path="providerprofile/joblist" element={< JobList/>}></Route>
          <Route path="providerprofile/applications" element={< ApplicationsList/>}></Route>
          {/* Provider-only Routes */}
          <Route
            path="/providerprofile"
            element={
              <ProtectRoutes allowedRoles={["provider"]}>
                <WorkProviderForm />
              </ProtectRoutes>
            }
          />
          <Route
            path="/jobpost"
            element={
              <ProtectRoutes allowedRoles={["provider"]}>
                <JobForm />
              </ProtectRoutes>
            }
          />

          {/* Seeker-only Routes */}
          <Route
            path="/seekerprofile"
            element={
              <ProtectRoutes allowedRoles={["seeker"]}>
                <SeekerForm />
              </ProtectRoutes>
            }
          />
          <Route
            path="/jobsearch"
            element={
              <ProtectRoutes allowedRoles={["seeker"]}>
                <JobSearch />
              </ProtectRoutes>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
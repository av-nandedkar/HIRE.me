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
import ApplyForm from "./components/Seeker/ApplyForm";
import JobList from "./components/Provider/JobList";
import ApplicationsList from "./components/Provider/ApplicatiosList";
import ViewAppliedJobs from "./components/Seeker/ViewAppliedJobs";
import CompletedJobs from "./components/Provider/CompletedJobs";
import JobRecommendations from "./components/Seeker/JobRecommandations";
import AllJobs from "./components/Seeker/AllJobs";

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
             {/* OPEN  Routes */}
          <Route path="/" element={<Home />}></Route>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />}></Route>
          <Route path="/forgotpassword" element={<ForgotPassword />}></Route>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/viewprofile" element={<ViewProfile />}></Route>
          <Route path="/alljobs" element={<AllJobs/>}></Route>

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
          path = "/completedjobs"
          element={
            <ProtectRoutes allowedRoles={["provider"]}>
              <CompletedJobs/>
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
            
             <Route
            path="/providerprofile/joblist"
            element={
              <ProtectRoutes allowedRoles={["provider"]}>
                <JobList />
              </ProtectRoutes>
            }
          />
              <Route
            path="/providerprofile/applications"
            element={
              <ProtectRoutes allowedRoles={["provider"]}>
                <ApplicationsList />
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
          <Route
            path="/viewappliedjobs"
            element={
              <ProtectRoutes allowedRoles={["seeker"]}>
                <ViewAppliedJobs />
              </ProtectRoutes>
            }
          />
             <Route
            path="/applyform"
            element={
              <ProtectRoutes allowedRoles={["seeker"]}>
                <ApplyForm />
              </ProtectRoutes>
            }
          />
        <Route
            path="/jobrecommendations"
            element={
              <ProtectRoutes allowedRoles={["seeker"]}>
                <JobRecommendations />
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
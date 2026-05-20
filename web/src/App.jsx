import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import CreateJobPage from "./pages/CreateJobPage";
import MyJobsPage from "./pages/MyJobsPage";
import ApplicantsPage from "./pages/ApplicantsPage";
import CandidateDetailPage from "./pages/CandidateDetailPage";
import InsightsPage from "./pages/InsightsPage";
import EditJobPage from "./pages/EditJobPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/jobs/create" element={<CreateJobPage />} />
            <Route path="/jobs/:jobId/edit" element={<EditJobPage />}/>
            <Route path="/jobs/my-jobs" element={<MyJobsPage />} />
            <Route path="/jobs/:jobId/applicants" element={<ApplicantsPage />} />
            <Route path="/jobs/:jobId/applicants/:applicationId" element={<CandidateDetailPage />} />
            <Route path="/profile"element={<ProfilePage />} />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
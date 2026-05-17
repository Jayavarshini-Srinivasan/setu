
import {getDashboardStats,} from "../services/dashboardService";
import  useAuth  from "../hooks/useAuth";
import { Link } from "react-router-dom";
import useAsync from "../hooks/useAsync";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";
import "../styles/DashboardPage.css";

export default function DashboardPage() {
  const { user } = useAuth();
  const fetchDashboardStats =
  async () => {
    if (!user) {
      return {
        totalJobs: 0,

        totalApplicants: 0,
      };
    }

    return await getDashboardStats();
  };

const {
  data: stats,
  loading,
  error,
} = useAsync(
  fetchDashboardStats,
  [user]
);


if (loading) {
  return (
    <LoadingSpinner
      text="Loading dashboard..."
    />
  );
}
if (error) {
  return (
    <ErrorState
      message="Failed to load dashboard"
    />
  );
}

 return (
  <div className="dashboard-page">
    <h1 className="dashboard-heading">
      Welcome,{" "}
      {user.companyName ||
        user.email}
    </h1>

    <p className="dashboard-subtitle">
      Here is your recruiter
      summary.
    </p>

    <div className="dashboard-stats-grid">
      {/* JOBS CARD */}
      <div className="dashboard-card">
        <h3 className="dashboard-card-title">
          Total Jobs Posted
        </h3>

        <p className="dashboard-card-value jobs">
          {
            stats.totalJobs
          }
        </p>

        <Link
          to="/jobs/my-jobs"
          className="dashboard-link"
        >
          View Jobs
        </Link>
      </div>

      {/* APPLICANTS CARD */}
      <div className="dashboard-card">
        <h3 className="dashboard-card-title">
          Total Applicants
        </h3>

        <p className="dashboard-card-value applicants">
          {
            stats.totalApplicants
          }
        </p>
      </div>
    </div>
  </div>
);
}

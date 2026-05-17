import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  signOut,
} from "firebase/auth";

import {
  auth,
} from "../firebase";

import useAuth from "../hooks/useAuth";

import "../styles/Navbar.css";

export default function Navbar() {
  const navigate =
    useNavigate();

  const { user } =
    useAuth();

  /*
    LOGOUT
  */
  const handleLogout =
    async () => {
      try {
        await signOut(auth);

        navigate("/login");
      } catch (error) {
        console.error(
          "Logout failed",
          error
        );
      }
    };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2 className="navbar-brand">
          Setu Recruiter
        </h2>

        <div className="nav-links">
          <Link
            to="/dashboard"
            className="nav-link"
          >
            Dashboard
          </Link>

          <Link
            to="/jobs/my-jobs"
            className="nav-link"
          >
            My Jobs
          </Link>

          <Link
            to="/jobs/create"
            className="nav-link"
          >
            Create Job
          </Link>

          <Link
            to="/profile"
            className="nav-link"
          >
            Profile
          </Link>
        </div>
      </div>

      <div className="navbar-right">
        <span className="user-email">
          {user?.email}
        </span>

        <button
          onClick={
            handleLogout
          }
          className="logout-button"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
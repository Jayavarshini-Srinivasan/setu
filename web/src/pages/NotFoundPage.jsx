import {
  Link,
} from "react-router-dom";

import "../styles/NotFoundPage.css";

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <h1 className="not-found-title">
        404
      </h1>

      <p className="not-found-text">
        Page not found.
      </p>

      <Link
        to="/dashboard"
        className="back-dashboard-button"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
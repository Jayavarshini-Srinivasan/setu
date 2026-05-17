import {
  Link,
} from "react-router-dom";

export default function JobCard({
  job,
  toggleStatus,
}) {
  return (
    <div className="job-card">
      <div>
        <h3 className="job-title">
          {job.title}
        </h3>

        <p className="job-details">
          <span className="job-category">
            {
              job.workerCategory
            }
          </span>

          {" • "}

          {
            job.location
          }

          {" • "}

          ₹
          {
            job.salary
          }
        </p>

        <p
          className={`job-status ${
            job.isActive
              ? "active"
              : "inactive"
          }`}
        >
          Status:
          {" "}

          {job.isActive
            ? "Active"
            : "Inactive"}
        </p>
      </div>

      <div className="job-actions">
        <button
          onClick={() =>
            toggleStatus(
              job.jobId,
              job.isActive
            )
          }
          className="status-button"
        >
          {job.isActive
            ? "Deactivate"
            : "Activate"}
        </button>

        <Link
          to={`/jobs/${job.jobId}/edit`}
          className="edit-button"
        >
          Edit Job
        </Link>

        <Link
          to={`/jobs/${job.jobId}/applicants`}
          className="applicants-button"
        >
          View Applicants
        </Link>
      </div>
    </div>
  );
}
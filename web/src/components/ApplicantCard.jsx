import StatusBadge from "./StatusBadge";
import { formatSkills,formatExperience,formatStatus,} from "../utils/formatters";
import { APPLICATION_STATUS,} from "../constants/applicationStatus";

export default function ApplicantCard({
  app,
  updatingId,
  updateStatus,
  formatDate,
}) {
  return (
    <div className="applicant-card">
      <div className="applicant-header">
        <div>
          <h3 className="applicant-name">
            {app.worker.profile
              ?.fullName ||
              "Unknown Worker"}
          </h3>

          <p className="applicant-meta">
            <strong>
              Match Score:
            </strong>

            {" "}

            <span className="match-score">
              {app.matchScore}%
            </span>

            {" • "}

            <strong>
              Applied:
            </strong>

            {" "}

            {formatDate(
              app.appliedAt
            )}
          </p>
        </div>

        <div>
  <StatusBadge
    status={formatStatus(app.status)}
  />
</div>
      </div>

      <div className="profile-section">
        {app.worker
          .workerType ===
        "labour" ? (
          <div>
            <h4 className="labour-heading">
              Labour Profile
            </h4>

            <div className="profile-grid">
              <p>
                <strong>
                  Role:
                </strong>

                {" "}

                {formatExperience(
                app.worker.profile
                    ?.experience
                )}
              </p>

              <p>
                <strong>
                  Experience:
                </strong>

                {" "}

                {formatSkills(
                app.worker.profile
                    ?.skills
                )}
                years
              </p>

              <p>
                <strong>
                  Location:
                </strong>

                {" "}

                {app.worker.profile
                  ?.location ||
                  "N/A"}
              </p>

              <p>
                <strong>
                  Skills:
                </strong>

                {" "}

                {app.worker.profile
                  ?.skills?.join(
                    ", "
                  ) || "N/A"}
              </p>
            </div>
          </div>
        ) : (
          <div>
            <h4 className="professional-heading">
              Professional
              Profile
            </h4>

            <div className="profile-grid">
              <p>
                <strong>
                  Role:
                </strong>

                {" "}

                {app.worker.profile
                  ?.jobRole ||
                  "N/A"}
              </p>

              <p>
                <strong>
                  Experience:
                </strong>

                {" "}

                {app.worker.profile
                  ?.experience ||
                  "N/A"}{" "}
                years
              </p>

              <p>
                <strong>
                  Education:
                </strong>

                {" "}

                {app.worker.profile
                  ?.professionalData
                  ?.education ||
                  "N/A"}
              </p>

              <p>
                <strong>
                  Skills:
                </strong>

                {" "}

                {app.worker.profile
                  ?.skills?.join(
                    ", "
                  ) || "N/A"}
              </p>
            </div>

            {app.worker.profile
              ?.generatedResumeUrl && (
              <div className="resume-link-container">
                <a
                  href={
                    app.worker
                      .profile
                      .generatedResumeUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="resume-link"
                >
                  📄 View Resume
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="applicant-actions">
        <button
          disabled={
            updatingId ===
              app.applicationId ||
            app.status ===
              APPLICATION_STATUS.REVIEWED
          }
          onClick={() =>
            updateStatus(
              app.applicationId,
              APPLICATION_STATUS.REVIEWED
            )
          }
        >
          Review
        </button>

        <button
          disabled={
            updatingId ===
              app.applicationId ||
            app.status ===
              APPLICATION_STATUS.SHORTLISTED
          }
          onClick={() =>
            updateStatus(
              app.applicationId,
              APPLICATION_STATUS.SHORTLISTED
            )
          }
        >
          Shortlist
        </button>

        <button
          disabled={
            updatingId ===
              app.applicationId ||
            app.status ===
              APPLICATION_STATUS.REJECTED
          }
          onClick={() =>
            updateStatus(
              app.applicationId,
              APPLICATION_STATUS.REJECTED
            )
          }
        >
          Reject
        </button>
      </div>
    </div>
  );
}
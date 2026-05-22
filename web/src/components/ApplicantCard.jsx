import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { formatStatus, formatExperience, formatSkills } from "../utils/formatters";
import { APPLICATION_STATUS } from "../constants/applicationStatus";

export default function ApplicantCard({ app, jobId, updatingId, updateStatus, formatDate }) {
  const isPending = app.status === APPLICATION_STATUS.PENDING;
  
  return (
    <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Background Match Gradient */}
      <div style={{
        position: 'absolute', top: 0, right: 0, 
        width: '150px', height: '150px', 
        background: app.matchScore >= 80 ? 'var(--success)' : app.matchScore >= 50 ? 'var(--warning)' : 'var(--danger)',
        opacity: 0.05, borderRadius: '50%', filter: 'blur(30px)', transform: 'translate(30%, -30%)'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '20px' }}>
              {app.worker.profile?.name || "Unknown Candidate"}
            </h3>
            <StatusBadge status={formatStatus(app.status)} />
            <span className="badge" style={{ 
              background: app.matchScore >= 80 ? 'var(--success-bg)' : app.matchScore >= 50 ? 'var(--warning-bg)' : 'var(--danger-bg)',
              color: app.matchScore >= 80 ? 'var(--success)' : app.matchScore >= 50 ? 'var(--warning)' : 'var(--danger)',
              border: `1px solid ${app.matchScore >= 80 ? 'var(--success)' : app.matchScore >= 50 ? 'var(--warning)' : 'var(--danger)'}`
            }}>
              {app.matchScore}% Match
            </span>
          </div>
          <p style={{ color: 'var(--text)', fontSize: '14px', margin: 0 }}>
            Applied {formatDate(app.appliedAt)}
          </p>
        </div>
        
        <Link to={`/jobs/${jobId}/applicants/${app.applicationId}`}>
          <button style={{ background: 'transparent', color: 'var(--text-h)', border: '1px solid var(--border)' }}>
            View Full Profile
          </button>
        </Link>
      </div>

      {/* AI SUMMARY */}
      {app.aiSummary && (
        <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-h)', display: 'flex', gap: '8px' }}>
            <span>🤖</span>
            <span style={{ fontStyle: 'italic' }}>{app.aiSummary}</span>
          </p>
        </div>
      )}


      {/* SKILLS BREAKDOWN */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '14px', color: 'var(--success)', marginBottom: '8px' }}>Strengths (Matched)</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {app.strengths?.length > 0 ? app.strengths.map((skill, idx) => (
              <span key={idx} className="badge" style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success)' }}>
                {skill}
              </span>
            )) : <span style={{ color: 'var(--text)', fontSize: '13px' }}>None recorded</span>}

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

              <p>
                <strong>
                  Contact:
                </strong>

                {" "}

                {app.status === APPLICATION_STATUS.SHORTLISTED ? (
                  <span className="unlocked-contact">
                    📞 <a href={`tel:${app.worker.profile?.phoneNumber || ""}`} style={{ color: "#27ae60", textDecoration: "none" }}>{app.worker.profile?.phoneNumber || "N/A"}</a>
                  </span>
                ) : (
                  <span className="locked-contact">
                    🔒 Hidden (Shortlist to view)
                  </span>
                )}
              </p>
            </div>

          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '14px', color: 'var(--danger)', marginBottom: '8px' }}>Missing Skills</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {app.weaknesses?.length > 0 ? app.weaknesses.map((skill, idx) => (
              <span key={idx} className="badge" style={{ background: 'transparent', color: 'var(--text)', border: '1px dashed var(--danger)' }}>
                {skill}
              </span>
            )) : <span style={{ color: 'var(--text)', fontSize: '13px' }}>None missing!</span>}

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

              <p>
                <strong>
                  Contact:
                </strong>

                {" "}

                {app.status === APPLICATION_STATUS.SHORTLISTED ? (
                  <span className="unlocked-contact">
                    📧 <a href={`mailto:${app.worker.profile?.email || ""}`} className="contact-email-link">{app.worker.profile?.email || "N/A"}</a>
                  </span>
                ) : (
                  <span className="locked-contact">
                    🔒 Hidden (Shortlist to view)
                  </span>
                )}
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
        </div>
      </div>

      {/* ACTIONS */}
      <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
        <button 
          onClick={() => updateStatus(app.applicationId, APPLICATION_STATUS.REVIEWED)}
          disabled={updatingId === app.applicationId || app.status === APPLICATION_STATUS.REVIEWED}
          style={{ background: 'var(--info-bg)', color: 'var(--info)', opacity: app.status === APPLICATION_STATUS.REVIEWED ? 0.5 : 1 }}
        >
          Mark as Reviewed
        </button>
        <button 
          onClick={() => updateStatus(app.applicationId, APPLICATION_STATUS.SHORTLISTED)}
          disabled={updatingId === app.applicationId || app.status === APPLICATION_STATUS.SHORTLISTED}
          style={{ background: 'var(--success)', color: '#fff', opacity: app.status === APPLICATION_STATUS.SHORTLISTED ? 0.5 : 1 }}
        >
          Shortlist
        </button>
        <button 
          onClick={() => updateStatus(app.applicationId, APPLICATION_STATUS.REJECTED)}
          disabled={updatingId === app.applicationId || app.status === APPLICATION_STATUS.REJECTED}
          style={{ background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', opacity: app.status === APPLICATION_STATUS.REJECTED ? 0.5 : 1 }}
        >
          Reject
        </button>
      </div>
    </div>
  );
}
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { formatStatus, formatExperience, formatSkills, getDisplayName } from "../utils/formatters";
import { APPLICATION_STATUS } from "../constants/applicationStatus";

export default function ApplicantCard({ app, jobId, updatingId, updateStatus, formatDate }) {
  const isPending = app.status === APPLICATION_STATUS.PENDING;
  const profile = app.worker?.profile || {};
  const isShortlisted = app.status === APPLICATION_STATUS.SHORTLISTED;
  const candidateRole = profile.professionalRole || profile.canonicalRole || profile.role || "N/A";
  const name = getDisplayName(profile, app.worker);
  
  // Theme colors derived from Setu
  const cardBorder = isShortlisted ? "#34D399" : "#E5E7EB";
  const cardShadow = isShortlisted ? "0 10px 15px -3px rgba(16, 185, 129, 0.1), 0 4px 6px -2px rgba(16, 185, 129, 0.05)" : "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)";
  const bgBadgeColor = app.matchScore >= 80 ? "#D1FAE5" : app.matchScore >= 50 ? "#FEF3C7" : "#FEE2E2";
  const textBadgeColor = app.matchScore >= 80 ? "#065F46" : app.matchScore >= 50 ? "#92400E" : "#991B1B";
  const borderBadgeColor = app.matchScore >= 80 ? "#10B981" : app.matchScore >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: "16px",
      border: `2px solid ${cardBorder}`,
      boxShadow: cardShadow,
      padding: "24px",
      marginBottom: "32px",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      position: "relative",
      overflow: "hidden",
      transition: "all 0.2s ease-in-out"
    }}>
      {/* Background Match Gradient Indicator */}
      <div style={{
        position: "absolute", top: 0, right: 0, 
        width: "250px", height: "250px", 
        background: borderBadgeColor,
        opacity: 0.03, borderRadius: "50%", filter: "blur(50px)", transform: "translate(30%, -30%)",
        pointerEvents: "none"
      }} />

      {/* Header section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Avatar */}
          <div style={{ 
            width: "56px", height: "56px", borderRadius: "28px", 
            backgroundColor: "#F3F4F6", color: "#374151", 
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: "700", fontSize: "20px", border: "1px solid #D1D5DB"
          }}>
            {name.substring(0, 2).toUpperCase()}
          </div>
          
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
              <h3 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#111827" }}>
                {name}
              </h3>
              <StatusBadge status={formatStatus(app.status)} />
            </div>
            <p style={{ color: "#6B7280", fontSize: "14px", margin: 0, fontWeight: "500" }}>
              Applied {formatDate(app.appliedAt)}
            </p>
          </div>
        </div>

        {/* Match Score */}
        <div style={{ 
          background: bgBadgeColor, color: textBadgeColor, border: `1px solid ${borderBadgeColor}`,
          padding: "8px 16px", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center"
        }}>
          <span style={{ fontSize: "20px", fontWeight: "800" }}>{app.matchScore}%</span>
          <span style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Match</span>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px", position: "relative", zIndex: 1 }}>
        
        {/* Left Column: Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "#F9FAFB", padding: "20px", borderRadius: "12px", border: "1px solid #F3F4F6" }}>
          <h4 style={{ margin: 0, fontSize: "14px", color: "#4B5563", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #E5E7EB", paddingBottom: "8px" }}>Candidate Profile</h4>
          
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "12px", fontSize: "14px", alignItems: "start" }}>
            <span style={{ color: "#6B7280", fontWeight: "500" }}>Target Role:</span>
            <span style={{ color: "#111827", fontWeight: "600", textTransform: "capitalize" }}>{candidateRole}</span>
            
            <span style={{ color: "#6B7280", fontWeight: "500" }}>Experience:</span>
            <span style={{ color: "#111827", fontWeight: "600" }}>{formatExperience(profile.experience)}</span>
            
            <span style={{ color: "#6B7280", fontWeight: "500" }}>Location:</span>
            <span style={{ color: "#111827", fontWeight: "600" }}>📍 {profile.location || "N/A"}</span>
          </div>

          <div style={{ marginTop: "4px" }}>
            <span style={{ color: "#6B7280", fontWeight: "500", fontSize: "14px", display: "block", marginBottom: "8px" }}>Top Skills:</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {profile.skills?.length > 0 ? profile.skills.map((s, idx) => (
                <span key={idx} style={{ background: "#FFFFFF", color: "#374151", border: "1px solid #D1D5DB", fontSize: "12px", padding: "4px 10px", borderRadius: "16px", fontWeight: "500" }}>
                  {s}
                </span>
              )) : <span style={{ color: "#6B7280", fontSize: "13px" }}>N/A</span>}
            </div>
          </div>
          
          {/* Contact Details Panel */}
          <div style={{ 
            marginTop: "auto", 
            padding: "16px", 
            background: isShortlisted ? "#ECFDF5" : "#FFFFFF", 
            borderRadius: "8px", 
            border: `1px solid ${isShortlisted ? "#A7F3D0" : "#E5E7EB"}`,
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
              <span style={{ fontSize: "16px" }}>📞</span>
              {isShortlisted ? (
                <a href={`tel:${profile.phoneNumber || ""}`} style={{ color: "#059669", fontWeight: "600", textDecoration: "none" }}>
                  {profile.phoneNumber || "N/A"}
                </a>
              ) : (
                <span style={{ color: "#9CA3AF", fontStyle: "italic", fontSize: "13px" }}>Phone Hidden (Shortlist to view)</span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
              <span style={{ fontSize: "16px" }}>✉️</span>
              {isShortlisted ? (
                <a href={`mailto:${profile.email || ""}`} style={{ color: "#059669", fontWeight: "600", textDecoration: "none", wordBreak: "break-all" }}>
                  {profile.email || "N/A"}
                </a>
              ) : (
                <span style={{ color: "#9CA3AF", fontStyle: "italic", fontSize: "13px" }}>Email Hidden (Shortlist to view)</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* AI SUMMARY */}
          {app.aiSummary && (
            <div style={{ 
              background: "#EFF6FF", 
              border: "1px solid #BFDBFE", 
              padding: "16px", 
              borderRadius: "12px",
            }}>
              <p style={{ margin: 0, fontSize: "14px", color: "#1E3A8A", lineHeight: "1.6", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "20px" }}>🤖</span>
                <span style={{ fontWeight: "500" }}>{app.aiSummary}</span>
              </p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Matched Strengths */}
            <div>
              <h4 style={{ fontSize: "13px", color: "#059669", marginBottom: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "16px" }}>✅</span> Strengths (Matched)
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {app.strengths?.length > 0 ? app.strengths.map((skill, idx) => (
                  <span key={idx} style={{ background: "#ECFDF5", color: "#047857", border: "1px solid #34D399", fontSize: "12px", padding: "4px 10px", borderRadius: "16px", fontWeight: "600" }}>
                    {skill}
                  </span>
                )) : <span style={{ color: "#6B7280", fontSize: "13px", fontStyle: "italic" }}>None matching</span>}
              </div>
            </div>

            {/* Missing Skills */}
            <div>
              <h4 style={{ fontSize: "13px", color: "#DC2626", marginBottom: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "16px" }}>⚠️</span> Missing Skills
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {app.weaknesses?.length > 0 ? app.weaknesses.map((skill, idx) => (
                  <span key={idx} style={{ background: "#FEF2F2", color: "#B91C1C", border: "1px solid #F87171", fontSize: "12px", padding: "4px 10px", borderRadius: "16px", fontWeight: "600" }}>
                    {skill}
                  </span>
                )) : <span style={{ color: "#059669", fontSize: "13px", fontWeight: "600" }}>Perfect skills alignment!</span>}
              </div>
            </div>
          </div>
          
        </div>

      </div>

      {/* FOOTER ACTIONS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", paddingTop: "24px", borderTop: "1px solid #E5E7EB", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link to={`/jobs/${jobId}/applicants/${app.applicationId}`} style={{ textDecoration: "none" }}>
            <button style={{ 
              background: "#F3F4F6", color: "#374151", border: "1px solid #D1D5DB", 
              padding: "10px 20px", fontSize: "14px", fontWeight: "600", borderRadius: "8px",
              cursor: "pointer", transition: "background 0.2s"
            }} onMouseOver={(e) => e.target.style.background = "#E5E7EB"} onMouseOut={(e) => e.target.style.background = "#F3F4F6"}>
              View Full Profile
            </button>
          </Link>

          {profile.generatedResumeUrl && (
            <a 
              href={profile.generatedResumeUrl} 
              target="_blank" 
              rel="noreferrer" 
              style={{ 
                background: "#FFFFFF", color: "#111827", border: "1px solid #D1D5DB", 
                padding: "10px 20px", fontSize: "14px", fontWeight: "600", borderRadius: "8px",
                cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", textDecoration: "none",
                transition: "background 0.2s"
              }}
              onMouseOver={(e) => e.target.style.background = "#F9FAFB"} onMouseOut={(e) => e.target.style.background = "#FFFFFF"}
            >
              📄 View Resume
            </a>
          )}
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            onClick={() => updateStatus(app.applicationId, APPLICATION_STATUS.REVIEWED)}
            disabled={updatingId === app.applicationId || app.status === APPLICATION_STATUS.REVIEWED}
            style={{ 
              background: "#DBEAFE", 
              color: "#1E40AF", 
              border: "1px solid #93C5FD",
              fontWeight: "600",
              opacity: app.status === APPLICATION_STATUS.REVIEWED ? 0.5 : 1,
              padding: "10px 20px",
              fontSize: "14px",
              borderRadius: "8px",
              cursor: (updatingId === app.applicationId || app.status === APPLICATION_STATUS.REVIEWED) ? "not-allowed" : "pointer"
            }}
          >
            Mark as Reviewed
          </button>
          
          <button 
            onClick={() => updateStatus(app.applicationId, APPLICATION_STATUS.SHORTLISTED)}
            disabled={updatingId === app.applicationId || app.status === APPLICATION_STATUS.SHORTLISTED}
            style={{ 
              background: "#10B981", 
              color: "#FFFFFF", 
              border: "none",
              fontWeight: "600",
              opacity: app.status === APPLICATION_STATUS.SHORTLISTED ? 0.5 : 1,
              padding: "10px 24px",
              fontSize: "14px",
              borderRadius: "8px",
              cursor: (updatingId === app.applicationId || app.status === APPLICATION_STATUS.SHORTLISTED) ? "not-allowed" : "pointer",
              boxShadow: app.status !== APPLICATION_STATUS.SHORTLISTED ? "0 4px 6px -1px rgba(16, 185, 129, 0.2)" : "none"
            }}
          >
            Shortlist
          </button>

          <button 
            onClick={() => updateStatus(app.applicationId, APPLICATION_STATUS.REJECTED)}
            disabled={updatingId === app.applicationId || app.status === APPLICATION_STATUS.REJECTED}
            style={{ 
              background: "#FFFFFF", 
              color: "#DC2626", 
              border: "1px solid #F87171", 
              fontWeight: "600",
              opacity: app.status === APPLICATION_STATUS.REJECTED ? 0.5 : 1,
              padding: "10px 20px",
              fontSize: "14px",
              borderRadius: "8px",
              cursor: (updatingId === app.applicationId || app.status === APPLICATION_STATUS.REJECTED) ? "not-allowed" : "pointer"
            }}
          >
            Reject
          </button>
        </div>
      </div>

    </div>
  );
}


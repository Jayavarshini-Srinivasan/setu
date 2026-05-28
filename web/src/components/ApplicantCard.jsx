import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { formatStatus, formatExperience, formatSkills, getDisplayName } from "../utils/formatters";
import { APPLICATION_STATUS } from "../constants/applicationStatus";

function getSkillIcon(skillName = "") {
  const name = skillName.toLowerCase();
  if (name.includes("drive") || name.includes("driving")) return "🚗";
  if (name.includes("navigat") || name.includes("map")) return "📍";
  if (name.includes("cod") || name.includes("program") || name.includes("developer") || name.includes("javascript") || name.includes("python") || name.includes("node") || name.includes("react")) return "💻";
  if (name.includes("design") || name.includes("ui") || name.includes("ux") || name.includes("figma")) return "🎨";
  if (name.includes("speak") || name.includes("english") || name.includes("tamil") || name.includes("communication")) return "🗣️";
  if (name.includes("sales") || name.includes("market") || name.includes("gst") || name.includes("excel")) return "📈";
  return "⚙️";
}

export default function ApplicantCard({ app, jobId, updatingId, updateStatus }) {
  const isPending = app.status === APPLICATION_STATUS.PENDING;
  const profile = app.worker?.profile || {};
  const isShortlisted = app.status === APPLICATION_STATUS.SHORTLISTED;
  
  const candidateRoleRaw = profile.professionalRole || profile.canonicalRole || profile.role || "";
  const candidateRole = candidateRoleRaw
    ? candidateRoleRaw
        .split(/[_\s]+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "Profile incomplete";
    
  const name = getDisplayName(profile, app.worker);

  // Experience calculations
  let experienceYears = profile.experience;
  if (experienceYears === undefined || experienceYears === null || experienceYears === "") {
    if (Array.isArray(profile.experienceDetails)) {
      const sum = profile.experienceDetails.reduce((acc, item) => {
        const yrs = parseInt(item.years || item.duration || 0, 10);
        return acc + (isNaN(yrs) ? 0 : yrs);
      }, 0);
      if (sum > 0) experienceYears = sum;
    }
  }

  // Skills list from either professionalSkills or skills
  const skillsList = (profile.skills && profile.skills.length > 0) 
    ? profile.skills 
    : (profile.professionalSkills || []);

  // Email and Phone number lookups
  const candidateEmail = profile.email || app.worker?.email || "";
  const candidatePhone = profile.phoneNumber || profile.phone || app.worker?.phoneNumber || app.worker?.phone || "";

  // Date formatter helper
  const getFullDateTime = (dateValue) => {
    if (!dateValue) return "Recently";
    const d = dateValue._seconds ? new Date(dateValue._seconds * 1000) : new Date(dateValue);
    return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Why this candidate recommendations list
  const recommendations = [];
  if (app.matchScore >= 75) {
    recommendations.push("Meets core requirements");
  }
  if (app.strengths && app.strengths.length > 0) {
    recommendations.push("Good skills match");
  }
  if (profile.location) {
    recommendations.push("Location matches job requirement");
  }
  if (experienceYears && experienceYears > 0) {
    recommendations.push(`Strong work experience (${experienceYears} ${experienceYears === 1 ? 'year' : 'years'})`);
  }
  if (recommendations.length === 0) {
    recommendations.push("Profile complete & reviewed");
  }

  const initials = name
    ? name
        .split(" ")
        .map(n => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "WO";

  // Card theme colors
  const cardBorder = isShortlisted ? "#34D399" : "#E5E7EB";
  const cardShadow = isShortlisted 
    ? "0 10px 15px -3px rgba(16, 185, 129, 0.08), 0 4px 6px -2px rgba(16, 185, 129, 0.04)" 
    : "0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02)";

  // SVG circular match score gauge variables
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (app.matchScore / 100) * circumference;
  const matchColor = app.matchScore >= 80 ? "#10B981" : app.matchScore >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <div className="glass-card applicant-card-hover" style={{
      border: `2px solid ${cardBorder}`,
      boxShadow: cardShadow,
      padding: "24px",
      borderRadius: "16px",
      marginBottom: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      backgroundColor: "#FFFFFF",
      transition: "all 0.25s ease"
    }}>
      {/* Header section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Avatar with initials */}
          <div style={{ 
            width: "48px", height: "48px", borderRadius: "50%", 
            backgroundColor: isShortlisted ? "#ECFDF5" : "#F3F4F6", 
            color: isShortlisted ? "#059669" : "#374151", 
            display: "flex", alignItems: "center",
            fontWeight: "700", fontSize: "16px", border: `1px solid ${isShortlisted ? "#A7F3D0" : "#D1D5DB"}`,
            justifyContent: "center"
          }}>
            {initials}
          </div>
          
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#111827" }}>
                {name}
              </h3>
              <StatusBadge status={formatStatus(app.status)} />
            </div>
            <p style={{ color: "#6B7280", fontSize: "12px", margin: 0, marginTop: "2px" }}>
              📅 Applied on {getFullDateTime(app.appliedAt)}
            </p>
          </div>
        </div>

        {/* Circular Match Score Gauge */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="40" height="40" viewBox="0 0 48 48" style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="transparent"
              stroke="#E5E7EB"
              strokeWidth="4"
            />
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="transparent"
              stroke={matchColor}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "16px", fontWeight: "800", color: "#111827", lineHeight: 1 }}>{app.matchScore}%</span>
            <span style={{ fontSize: "9px", color: "#6B7280", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.03em" }}>Match Score</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Profile & Contact) and Right Column (AI Insights & Highlights) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", borderTop: "1px solid #F3F4F6", paddingTop: "20px" }}>
        
        {/* Left Side: Profile and Contact */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "11px", color: "#8E887E", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Candidate Profile</h4>
            <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "8px 12px", fontSize: "13px", alignItems: "center" }}>
              <span style={{ color: "#6B7280" }}>💼 Target Role</span>
              <span style={{ color: "#111827", fontWeight: "600" }}>{candidateRole}</span>
              
              <span style={{ color: "#6B7280" }}>📅 Experience</span>
              <span style={{ color: "#111827", fontWeight: "600" }}>
                {experienceYears !== undefined && experienceYears !== null ? `${experienceYears} ${experienceYears === 1 ? 'year' : 'years'}` : "Entry Level"}
              </span>
              
              <span style={{ color: "#6B7280" }}>📍 Location</span>
              <span style={{ color: "#111827", fontWeight: "600" }}>
                {profile.location ? `📍 ${profile.location}` : "Location unspecified"}
              </span>

              <span style={{ color: "#6B7280" }}>⚙️ Top Skills</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {skillsList.length > 0 ? skillsList.slice(0, 3).map((s, idx) => (
                  <span key={idx} style={{ background: "#F3F4F6", color: "#374151", fontSize: "11px", padding: "2px 8px", borderRadius: "12px", fontWeight: "500", border: "1px solid #E5E7EB" }}>
                    {s}
                  </span>
                )) : <span style={{ color: "#9CA3AF", fontStyle: "italic" }}>Profile incomplete</span>}
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px dashed #E5E7EB", paddingTop: "12px" }}>
            <h4 style={{ margin: "0 0 10px 0", fontSize: "11px", color: "#8E887E", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Contact Information</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {/* Phone Row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", background: "#F9FAFB", padding: "6px 12px", borderRadius: "8px", border: "1px solid #F3F4F6" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📞</span>
                  <span style={{ fontWeight: "600", color: "#111827" }}>{candidatePhone || "Phone unavailable"}</span>
                  {candidatePhone && (
                    <span style={{ background: "#D1FAE5", color: "#065F46", fontSize: "10px", fontWeight: "700", padding: "1px 6px", borderRadius: "99px", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                      ✔ Verified
                    </span>
                  )}
                </div>
                {candidatePhone && (
                  <div style={{ display: "flex", gap: "4px" }}>
                    <a href={`https://wa.me/${candidatePhone}`} target="_blank" rel="noreferrer" style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#E8F5E9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", textDecoration: "none" }} title="WhatsApp">
                      💬
                    </a>
                    <a href={`tel:${candidatePhone}`} style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#E3F2FD", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", textDecoration: "none" }} title="Call">
                      📞
                    </a>
                  </div>
                )}
              </div>

              {/* Email Row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", background: "#F9FAFB", padding: "6px 12px", borderRadius: "8px", border: "1px solid #F3F4F6" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden", textOverflow: "ellipsis" }}>
                  <span>✉️</span>
                  <span style={{ fontWeight: "600", color: "#111827", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {candidateEmail || "Email unavailable"}
                  </span>
                  {candidateEmail && (
                    <span style={{ background: "#D1FAE5", color: "#065F46", fontSize: "10px", fontWeight: "700", padding: "1px 6px", borderRadius: "99px", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                      ✔ Verified
                    </span>
                  )}
                </div>
                {candidateEmail ? (
                  <a href={`mailto:${candidateEmail}`} style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#FFF3E0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", textDecoration: "none" }} title="Email">
                    ✉️
                  </a>
                ) : (
                  <button 
                    onClick={() => alert("Email request has been sent to candidate!")}
                    style={{ background: "none", border: "1px dashed var(--accent)", color: "var(--accent)", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "4px", cursor: "pointer" }}
                  >
                    Request Email
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: AI Insights & Recommendation Checklist */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* AI Insight Box */}
          {app.aiSummary && (
            <div style={{ 
              background: "#EEF2FF", 
              border: "1px solid #C7D2FE", 
              padding: "12px 16px", 
              borderRadius: "12px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px"
            }}>
              <span style={{ fontSize: "20px" }}>🤖</span>
              <p style={{ margin: 0, fontSize: "13px", color: "#3730A3", lineHeight: "1.5", fontWeight: "500" }}>
                {app.aiSummary}
              </p>
            </div>
          )}

          {/* Strengths (Matched) */}
          <div>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "11px", color: "#059669", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "4px" }}>
              ✔ Strengths (Matched)
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {app.strengths?.length > 0 ? app.strengths.slice(0, 3).map((skill, idx) => (
                <span key={idx} style={{ background: "#ECFDF5", color: "#047857", border: "1px solid #A7F3D0", fontSize: "11px", padding: "3px 8px", borderRadius: "8px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <span>{getSkillIcon(skill)}</span>
                  {skill}
                </span>
              )) : <span style={{ color: "#6B7280", fontSize: "12px", fontStyle: "italic" }}>None matching</span>}
            </div>
          </div>

          {/* Missing Skills */}
          <div>
            <h4 style={{ margin: "0 0 6px 0", fontSize: "11px", color: "#DC2626", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "4px" }}>
              ⚠ Missing Skills
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {app.weaknesses?.length > 0 ? app.weaknesses.slice(0, 3).map((skill, idx) => (
                <span key={idx} style={{ background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FCA5A5", fontSize: "11px", padding: "3px 8px", borderRadius: "8px", fontWeight: "600" }}>
                  {skill}
                </span>
              )) : <span style={{ color: "#059669", fontSize: "12px", fontWeight: "600" }}>Perfect skills alignment!</span>}
            </div>
          </div>

          {/* Why this candidate checklist card */}
          <div style={{ 
            background: "#F0FDF4", 
            border: "1px solid #DCFCE7", 
            borderRadius: "12px", 
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <h5 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#166534", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                ⭐ Why this candidate?
              </h5>
              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "11px", color: "#166534", display: "flex", flexDirection: "column", gap: "4px" }}>
                {recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
            <span style={{ fontSize: "24px", opacity: 0.8 }} title="Recommended">🏅</span>
          </div>
        </div>
      </div>

      {/* Footer row action buttons */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        borderTop: "1px solid #F3F4F6", 
        paddingTop: "16px", 
        flexWrap: "wrap", 
        gap: "12px", 
        marginTop: "8px" 
      }}>
        <Link to={`/jobs/${jobId}/applicants/${app.applicationId}`}>
          <button className="secondary" style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            👁️ View Full Profile
          </button>
        </Link>

        <div style={{ display: "flex", gap: "8px" }}>
          <button 
            onClick={() => updateStatus(app.applicationId, APPLICATION_STATUS.REVIEWED)}
            disabled={updatingId === app.applicationId || app.status === APPLICATION_STATUS.REVIEWED}
            style={{ 
              background: "#EEF2FF", 
              color: "#3730A3", 
              border: "1px solid #C7D2FE",
              fontWeight: "600",
              opacity: app.status === APPLICATION_STATUS.REVIEWED ? 0.5 : 1,
              padding: "8px 14px",
              fontSize: "12px",
              borderRadius: "8px",
              cursor: (updatingId === app.applicationId || app.status === APPLICATION_STATUS.REVIEWED) ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <input 
              type="checkbox" 
              checked={app.status === APPLICATION_STATUS.REVIEWED} 
              readOnly 
              style={{ width: "12px", height: "12px", pointerEvents: "none" }}
            />
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
              padding: "8px 16px",
              fontSize: "12px",
              borderRadius: "8px",
              cursor: (updatingId === app.applicationId || app.status === APPLICATION_STATUS.SHORTLISTED) ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            🔖 Shortlist
          </button>

          <button 
            onClick={() => updateStatus(app.applicationId, APPLICATION_STATUS.REJECTED)}
            disabled={updatingId === app.applicationId || app.status === APPLICATION_STATUS.REJECTED}
            style={{ 
              background: "#FFFFFF", 
              color: "#DC2626", 
              border: "1px solid #FCA5A5", 
              fontWeight: "600",
              opacity: app.status === APPLICATION_STATUS.REJECTED ? 0.5 : 1,
              padding: "8px 14px",
              fontSize: "12px",
              borderRadius: "8px",
              cursor: (updatingId === app.applicationId || app.status === APPLICATION_STATUS.REJECTED) ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            ❌ Reject
          </button>
        </div>
      </div>
    </div>
  );
}

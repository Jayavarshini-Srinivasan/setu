import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getApplicationById,
  getGeneratedResume,
  updateApplicationStatus as updateApplicationStatusService,
} from "../services/applicationsService";
import { handleError } from "../utils/errorHandler";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";
import StatusBadge from "../components/StatusBadge";
import { formatStatus, getDisplayName } from "../utils/formatters";
import { APPLICATION_STATUS } from "../constants/applicationStatus";

/* ─── Helpers ─────────────────────────────────── */
function titleCase(str = "") {
  return str
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function InfoRow({ label, value, icon }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
      <span style={{ fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>{icon}</span>
      <div>
        <div style={{ fontSize: "10px", fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>{label}</div>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{value || <span style={{ color: "#9CA3AF", fontStyle: "italic", fontWeight: 400 }}>Not provided</span>}</div>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 style={{
      margin: "0 0 16px 0", fontSize: "13px", fontWeight: "700",
      color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.07em",
      display: "flex", alignItems: "center", gap: "8px"
    }}>
      {children}
    </h3>
  );
}

/* ─── Match score ring ──────────────────────────── */
function MatchRing({ score }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#10B981" : score >= 55 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{ position: "relative", width: "90px", height: "90px", flexShrink: 0 }}>
      <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="45" cy="45" r={r} fill="none" stroke="#E5E7EB" strokeWidth="7" />
        <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center"
      }}>
        <span style={{ fontSize: "18px", fontWeight: "800", color: "#111827", lineHeight: 1 }}>{score}%</span>
        <span style={{ fontSize: "9px", color: "#6B7280", fontWeight: "600", textTransform: "uppercase" }}>Match</span>
      </div>
    </div>
  );
}

/* ─── Skill chip ────────────────────────────────── */
function SkillChip({ label, variant = "neutral" }) {
  const styles = {
    success: { bg: "#ECFDF5", color: "#047857", border: "#A7F3D0" },
    danger:  { bg: "#FEF2F2", color: "#B91C1C", border: "#FCA5A5" },
    neutral: { bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
    accent:  { bg: "#FFF0E6", color: "#C2410C", border: "#FDBA74" },
  };
  const s = styles[variant];
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontSize: "11px", fontWeight: "600", padding: "3px 10px",
      borderRadius: "99px", display: "inline-flex", alignItems: "center", gap: "4px"
    }}>
      {label}
    </span>
  );
}

export default function CandidateDetailPage() {
  const { jobId, applicationId } = useParams();

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [loadingResume, setLoadingResume] = useState(false);
  const [activeTab, setActiveTab] = useState("resume"); // 'resume' | 'ai'

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getApplicationById(applicationId);
      setApp(data);

      const profile = data.worker?.profile || {};
      if (!profile.generatedResumeUrl && data.workerId) {
        setLoadingResume(true);
        try {
          const resume = await getGeneratedResume(data.workerId);
          setResumeData(resume);
        } catch (err) {
          console.warn("Could not generate resume:", err);
        } finally {
          setLoadingResume(false);
        }
      }
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplication(); }, [applicationId]);

  const updateStatus = async (status) => {
    try {
      setUpdatingId(applicationId);
      setApp((prev) => ({ ...prev, status }));
      await updateApplicationStatusService(applicationId, status);
    } catch (err) {
      alert(handleError(err));
      fetchApplication();
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading candidate profile…" />;
  if (error || !app) return <ErrorState message="Failed to load candidate profile." />;

  /* ─── Data extraction ───────────────────────── */
  const isShortlisted = app.status === APPLICATION_STATUS.SHORTLISTED;
  const profile = app.worker?.profile || {};
  const name = getDisplayName(profile, app.worker);
  const candidateRole = titleCase(profile.professionalRole || profile.canonicalRole || profile.role || "");
  const candidateEmail = profile.email || app.worker?.email || "";
  const candidatePhone = profile.phoneNumber || profile.phone || app.worker?.phoneNumber || app.worker?.phone || "";

  // Skills
  const skillsList = (profile.skills && profile.skills.length > 0)
    ? profile.skills
    : (profile.professionalSkills || []);

  // Experience
  let experienceYears = profile.experience;
  if (experienceYears === undefined || experienceYears === null || experienceYears === "") {
    if (Array.isArray(profile.experienceDetails)) {
      const sum = profile.experienceDetails.reduce((acc, item) => {
        const y = parseInt(item.years || item.duration || 0, 10);
        return acc + (isNaN(y) ? 0 : y);
      }, 0);
      if (sum > 0) experienceYears = sum;
    }
  }

  // Applied date
  const appliedDate = app.appliedAt
    ? (app.appliedAt._seconds
        ? new Date(app.appliedAt._seconds * 1000)
        : new Date(app.appliedAt)
      ).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "Recently";

  // Worker type badge
  const workerTypeBadge = app.worker?.workerType === "labour" ? "🔧 Blue Collar" : "💼 Professional";

  // Initials for avatar
  const initials = name
    ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "??";

  const avatarBg = isShortlisted ? "#ECFDF5" : "#F3F4F6";
  const avatarColor = isShortlisted ? "#059669" : "#374151";
  const cardBorderTop = isShortlisted ? "4px solid #10B981" : "4px solid var(--accent)";

  /* ─── Resume section content ─────────────────── */
  const hasResumeUrl = !!profile.generatedResumeUrl;
  const experienceItems = resumeData?.experience || profile.experienceDetails || [];
  const summaryText = (() => {
    const raw = resumeData?.summary || profile.resumeSummary;
    if (!raw) return null;
    if (typeof raw === "object") return raw.text || null;
    return raw;
  })();

  return (
    <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "24px 20px" }}>
      {/* Back link */}
      <Link
        to={`/jobs/${jobId}/applicants`}
        style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "20px", color: "var(--text)", textDecoration: "none", fontSize: "13px", fontWeight: "500" }}
      >
        ← Back to Pipeline
      </Link>

      {/* ══════════════════════════════════════════ */}
      {/* TWO-COLUMN LAYOUT                          */}
      {/* ══════════════════════════════════════════ */}
      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "flex-start" }}>

        {/* ╔═══════════════════════════════════════ */}
        {/* ║  LEFT COLUMN  (flex: 2)               */}
        {/* ╚═══════════════════════════════════════ */}
        <div style={{ flex: "2", minWidth: "320px", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Hero card */}
          <div className="glass-card" style={{ borderTop: cardBorderTop, padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
              {/* Avatar */}
              <div style={{
                width: "72px", height: "72px", borderRadius: "50%",
                background: avatarBg, color: avatarColor,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: "800", fontSize: "24px", flexShrink: 0,
                border: `2px solid ${isShortlisted ? "#6EE7B7" : "#E5E7EB"}`
              }}>
                {initials}
              </div>

              {/* Name & meta */}
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                  <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "800", color: "#111827" }}>{name}</h1>
                  <StatusBadge status={formatStatus(app.status)} />
                </div>
                <p style={{ margin: "0 0 12px 0", color: "#6B7280", fontSize: "14px" }}>
                  {candidateRole || "No role specified"}
                  {experienceYears ? ` · ${experienceYears} yr${experienceYears !== 1 ? "s" : ""} exp` : ""}
                  {profile.location ? ` · 📍 ${profile.location}` : ""}
                </p>

                {/* Stat row */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{ background: "#F3F4F6", color: "#374151", fontSize: "11px", fontWeight: "600", padding: "4px 10px", borderRadius: "99px", border: "1px solid #E5E7EB" }}>
                    {workerTypeBadge}
                  </span>
                  <span style={{ background: "#F3F4F6", color: "#374151", fontSize: "11px", fontWeight: "600", padding: "4px 10px", borderRadius: "99px", border: "1px solid #E5E7EB" }}>
                    📅 Applied {appliedDate}
                  </span>
                  {profile.availability && (
                    <span style={{ background: "#D1FAE5", color: "#065F46", fontSize: "11px", fontWeight: "600", padding: "4px 10px", borderRadius: "99px", border: "1px solid #A7F3D0" }}>
                      ✅ {profile.availability}
                    </span>
                  )}
                </div>
              </div>

              {/* Match ring */}
              <MatchRing score={app.matchScore || 0} />
            </div>
          </div>

          {/* Contact card */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <SectionTitle>📞 Contact Information</SectionTitle>
            {isShortlisted ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>
                <InfoRow icon="✉️" label="Email" value={
                  candidateEmail
                    ? <a href={`mailto:${candidateEmail}`} style={{ color: "var(--accent)" }}>{candidateEmail}</a>
                    : null
                } />
                <InfoRow icon="📞" label="Phone" value={
                  candidatePhone
                    ? <a href={`tel:${candidatePhone}`} style={{ color: "var(--accent)" }}>{candidatePhone}</a>
                    : null
                } />
              </div>
            ) : (
              <div style={{
                textAlign: "center", padding: "28px 20px",
                background: "#F9FAFB", borderRadius: "12px",
                border: "1.5px dashed #E5E7EB"
              }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>🔒</div>
                <p style={{ margin: "0 0 16px 0", color: "#6B7280", fontSize: "14px", fontWeight: "500" }}>
                  Shortlist this candidate to unlock contact details
                </p>
                <button
                  className="action-btn-primary"
                  style={{ maxWidth: "260px", margin: "0 auto" }}
                  onClick={() => updateStatus(APPLICATION_STATUS.SHORTLISTED)}
                  disabled={updatingId === applicationId}
                >
                  ⭐ Shortlist &amp; Unlock Contact
                </button>
              </div>
            )}
          </div>

          {/* Skills card */}
          {skillsList.length > 0 && (
            <div className="glass-card" style={{ padding: "24px" }}>
              <SectionTitle>⚙️ Full Skills Profile</SectionTitle>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {skillsList.map((skill, i) => (
                  <SkillChip key={i} label={skill} variant="neutral" />
                ))}
              </div>
            </div>
          )}

          {/* ── Tab selector for resume/ai ─────── */}
          <div style={{ display: "flex", borderBottom: "2px solid #E5E7EB", gap: "0" }}>
            {[
              { id: "resume", label: "📄 Resume" },
              { id: "ai",     label: "🤖 AI Analysis" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  background: "none",
                  fontSize: "13px",
                  fontWeight: activeTab === tab.id ? "700" : "500",
                  color: activeTab === tab.id ? "var(--accent)" : "#6B7280",
                  borderBottom: activeTab === tab.id ? "3px solid var(--accent)" : "3px solid transparent",
                  cursor: "pointer",
                  marginBottom: "-2px",
                  transition: "all 0.15s"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Resume tab ──────────────────────── */}
          {activeTab === "resume" && (
            <div>
              {hasResumeUrl ? (
                <div className="glass-card" style={{ padding: "0", overflow: "hidden", borderRadius: "16px" }}>
                  <iframe
                    src={profile.generatedResumeUrl}
                    style={{ width: "100%", height: "640px", border: "none", background: "#fff" }}
                    title="Resume"
                  />
                </div>
              ) : loadingResume ? (
                <div className="glass-card" style={{ padding: "32px", textAlign: "center" }}>
                  <LoadingSpinner text="Generating resume…" />
                </div>
              ) : (
                <div className="glass-card" style={{ padding: "28px", background: "#fff" }}>
                  {/* Resume header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "3px solid var(--accent)", paddingBottom: "16px", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <h2 style={{ margin: "0 0 4px 0", fontSize: "22px", fontWeight: "800", color: "#111827" }}>
                        {resumeData?.fullName || name}
                      </h2>
                      <p style={{ margin: 0, color: "var(--accent)", fontWeight: "700", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {resumeData?.role || candidateRole || "Professional"}
                      </p>
                    </div>
                    <div style={{ textAlign: "right", fontSize: "12px", color: "#6B7280", lineHeight: "1.8" }}>
                      {(resumeData?.location || profile.location) && <div>📍 {resumeData?.location || profile.location}</div>}
                      {isShortlisted && candidateEmail && <div>✉️ {candidateEmail}</div>}
                      {isShortlisted && candidatePhone && <div>📞 {candidatePhone}</div>}
                    </div>
                  </div>

                  {/* Summary */}
                  {summaryText && (
                    <div style={{ marginBottom: "28px" }}>
                      <SectionTitle>Professional Summary</SectionTitle>
                      <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.7", color: "#374151", fontStyle: "italic" }}>
                        "{summaryText}"
                      </p>
                    </div>
                  )}

                  {/* Experience timeline */}
                  {experienceItems.length > 0 && (
                    <div style={{ marginBottom: "28px" }}>
                      <SectionTitle>Work History</SectionTitle>
                      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {experienceItems.map((exp, idx) => (
                          <div key={idx} style={{ position: "relative", paddingLeft: "20px", borderLeft: "2px solid #FDBA74" }}>
                            <div style={{ position: "absolute", left: "-5px", top: "5px", width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)" }} />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "4px" }}>
                              <span style={{ fontWeight: "700", fontSize: "14px", color: "#111827" }}>
                                {exp.role || exp.professionalRole || "Role"}
                              </span>
                              {(exp.years || exp.duration) && (
                                <span style={{ fontSize: "11px", background: "#FFF0E6", color: "#C2410C", fontWeight: "700", padding: "2px 10px", borderRadius: "99px" }}>
                                  {exp.years || exp.duration} {parseInt(exp.years, 10) === 1 ? "yr" : "yrs"}
                                </span>
                              )}
                            </div>
                            {exp.company && (
                              <p style={{ margin: "0 0 6px 0", fontSize: "13px", fontWeight: "600", color: "#6B7280" }}>
                                🏢 {exp.company}
                              </p>
                            )}
                            {exp.achievements && (
                              <p style={{ margin: 0, fontSize: "13px", color: "#374151", lineHeight: "1.5" }}>
                                {exp.achievements}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {(resumeData?.education?.degree || profile.education?.degree) && (
                    <div style={{ marginBottom: "28px" }}>
                      <SectionTitle>Education</SectionTitle>
                      <div style={{ padding: "14px 16px", background: "#F9FAFB", borderRadius: "10px", border: "1px solid #E5E7EB" }}>
                        <p style={{ margin: "0 0 4px 0", fontWeight: "700", fontSize: "14px", color: "#111827" }}>
                          🎓 {resumeData?.education?.degree || profile.education?.degree}
                        </p>
                        <p style={{ margin: 0, fontSize: "13px", color: "#6B7280" }}>
                          {resumeData?.education?.institution || profile.education?.institution}
                          {(resumeData?.education?.graduationYear || profile.education?.graduationYear)
                            && ` · ${resumeData?.education?.graduationYear || profile.education?.graduationYear}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Professional links */}
                  {(resumeData?.links?.linkedin || resumeData?.links?.github || resumeData?.links?.portfolio || profile.linkedin || profile.github || profile.portfolio) && (
                    <div>
                      <SectionTitle>Professional Links</SectionTitle>
                      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        {(resumeData?.links?.linkedin || profile.linkedin) && (
                          <a href={resumeData?.links?.linkedin || profile.linkedin} target="_blank" rel="noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent)", fontWeight: "600", fontSize: "13px", textDecoration: "none" }}>
                            🔗 LinkedIn
                          </a>
                        )}
                        {(resumeData?.links?.github || profile.github) && (
                          <a href={resumeData?.links?.github || profile.github} target="_blank" rel="noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent)", fontWeight: "600", fontSize: "13px", textDecoration: "none" }}>
                            🔗 GitHub
                          </a>
                        )}
                        {(resumeData?.links?.portfolio || profile.portfolio) && (
                          <a href={resumeData?.links?.portfolio || profile.portfolio} target="_blank" rel="noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent)", fontWeight: "600", fontSize: "13px", textDecoration: "none" }}>
                            🔗 Portfolio
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* No resume fallback */}
                  {!summaryText && experienceItems.length === 0 && skillsList.length === 0 && (
                    <div style={{ textAlign: "center", padding: "32px", color: "#9CA3AF" }}>
                      <div style={{ fontSize: "36px", marginBottom: "12px" }}>📋</div>
                      <p style={{ margin: 0, fontSize: "14px" }}>Resume details not yet available for this candidate.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── AI Analysis tab ──────────────────── */}
          {activeTab === "ai" && (
            <div className="glass-card" style={{ padding: "28px" }}>
              <SectionTitle>🤖 AI Analysis Summary</SectionTitle>

              {/* Match breakdown */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "28px" }}>
                <div className="candidate-stat-box">
                  <span className="candidate-stat-value" style={{ color: app.matchScore >= 80 ? "#10B981" : app.matchScore >= 55 ? "#F59E0B" : "#EF4444" }}>
                    {app.matchScore || 0}%
                  </span>
                  <span className="candidate-stat-label">Overall Match</span>
                </div>
                <div className="candidate-stat-box">
                  <span className="candidate-stat-value" style={{ color: "#10B981" }}>{app.strengths?.length || 0}</span>
                  <span className="candidate-stat-label">Strengths</span>
                </div>
                <div className="candidate-stat-box">
                  <span className="candidate-stat-value" style={{ color: "#EF4444" }}>{app.weaknesses?.length || 0}</span>
                  <span className="candidate-stat-label">Gaps</span>
                </div>
                <div className="candidate-stat-box">
                  <span className="candidate-stat-value">{skillsList.length}</span>
                  <span className="candidate-stat-label">Total Skills</span>
                </div>
              </div>

              {/* AI Summary quote */}
              {app.aiSummary && (
                <div style={{ background: "#EEF2FF", border: "1px solid #C7D2FE", padding: "16px 20px", borderRadius: "12px", marginBottom: "24px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <span style={{ fontSize: "20px" }}>🤖</span>
                  <p style={{ margin: 0, fontSize: "14px", color: "#3730A3", lineHeight: "1.6", fontWeight: "500", fontStyle: "italic" }}>
                    "{app.aiSummary}"
                  </p>
                </div>
              )}

              {/* Strengths */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#059669", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
                  ✅ Matched Strengths
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {app.strengths?.length > 0
                    ? app.strengths.map((s, i) => <SkillChip key={i} label={`✓ ${s}`} variant="success" />)
                    : <span style={{ color: "#9CA3AF", fontStyle: "italic", fontSize: "13px" }}>No matched strengths recorded</span>
                  }
                </div>
              </div>

              {/* Gaps */}
              <div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#DC2626", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
                  ⚠️ Missing / Gap Skills
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {app.weaknesses?.length > 0
                    ? app.weaknesses.map((s, i) => <SkillChip key={i} label={`✗ ${s}`} variant="danger" />)
                    : <span style={{ color: "#059669", fontSize: "13px", fontWeight: "600" }}>✅ Perfect alignment — no skill gaps!</span>
                  }
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ╔═══════════════════════════════════════ */}
        {/* ║  RIGHT COLUMN  (flex: 1)              */}
        {/* ╚═══════════════════════════════════════ */}
        <div style={{ flex: "1", minWidth: "260px", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Current Status card */}
          <div className="glass-card" style={{ padding: "22px", borderTop: cardBorderTop }}>
            <SectionTitle>📊 Current Status</SectionTitle>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "#F9FAFB", borderRadius: "10px", border: "1.5px solid #E5E7EB" }}>
              <StatusBadge status={formatStatus(app.status)} />
              <div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#111827" }}>
                  {app.status === APPLICATION_STATUS.SHORTLISTED && "🎉 Shortlisted"}
                  {app.status === APPLICATION_STATUS.REVIEWED && "📋 Reviewed"}
                  {app.status === APPLICATION_STATUS.REJECTED && "❌ Rejected"}
                  {app.status === APPLICATION_STATUS.PENDING && "⏳ Pending Review"}
                </div>
                <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>Applied {appliedDate}</div>
              </div>
            </div>
          </div>

          {/* Workflow Actions card */}
          <div className="glass-card" style={{ padding: "22px" }}>
            <SectionTitle>⚡ Workflow Actions</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                className="action-btn-primary"
                onClick={() => updateStatus(APPLICATION_STATUS.SHORTLISTED)}
                disabled={updatingId === applicationId || app.status === APPLICATION_STATUS.SHORTLISTED}
              >
                ⭐ Shortlist Candidate
              </button>
              <button
                className="action-btn-secondary"
                onClick={() => updateStatus(APPLICATION_STATUS.REVIEWED)}
                disabled={updatingId === applicationId || app.status === APPLICATION_STATUS.REVIEWED}
              >
                ✔ Mark as Reviewed
              </button>
              <button
                className="action-btn-danger"
                onClick={() => updateStatus(APPLICATION_STATUS.REJECTED)}
                disabled={updatingId === applicationId || app.status === APPLICATION_STATUS.REJECTED}
              >
                ✕ Reject Candidate
              </button>
            </div>
          </div>

          {/* Quick profile summary */}
          <div className="glass-card" style={{ padding: "22px" }}>
            <SectionTitle>👤 Quick Summary</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <InfoRow icon="💼" label="Role" value={candidateRole || "—"} />
              <InfoRow icon="⏱️" label="Experience" value={
                experienceYears !== undefined && experienceYears !== null
                  ? `${experienceYears} year${experienceYears !== 1 ? "s" : ""}`
                  : "Entry Level"
              } />
              <InfoRow icon="📍" label="Location" value={profile.location} />
              <InfoRow icon="🔖" label="Worker Type" value={app.worker?.workerType === "labour" ? "Blue Collar / Labour" : "Professional"} />
              {profile.availability && (
                <InfoRow icon="📅" label="Availability" value={profile.availability} />
              )}
            </div>
          </div>

          {/* Top skills quick view */}
          {skillsList.length > 0 && (
            <div className="glass-card" style={{ padding: "22px" }}>
              <SectionTitle>⚙️ Top Skills</SectionTitle>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {skillsList.slice(0, 6).map((skill, i) => (
                  <SkillChip key={i} label={skill} variant="accent" />
                ))}
                {skillsList.length > 6 && (
                  <span style={{ fontSize: "11px", color: "#9CA3AF", fontStyle: "italic", alignSelf: "center" }}>
                    +{skillsList.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

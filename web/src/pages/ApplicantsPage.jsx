import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { getSingleJob } from "../services/jobsService";
import { getApplicantsForJob, updateApplicationStatus as updateApplicationStatusService } from "../services/applicationsService";
import { handleError } from "../utils/errorHandler";
import ApplicantCard from "../components/ApplicantCard";

const STATUS_TABS = ["All", "pending", "reviewed", "shortlisted", "rejected"];

/* ─── Skeleton card shown during loading ──────── */
function SkeletonCard() {
  return (
    <div style={{
      background: "#fff",
      border: "2px solid #E5E7EB",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
        <div className="skeleton-loading skeleton-avatar" />
        <div style={{ flex: 1 }}>
          <div className="skeleton-loading skeleton-title" />
          <div className="skeleton-loading skeleton-text" style={{ width: "180px" }} />
        </div>
        <div className="skeleton-loading" style={{ width: "50px", height: "50px", borderRadius: "50%" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <div className="skeleton-loading skeleton-text" style={{ width: "100%" }} />
          <div className="skeleton-loading skeleton-text" style={{ width: "80%" }} />
          <div className="skeleton-loading skeleton-text" style={{ width: "90%" }} />
          <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
            <div className="skeleton-loading skeleton-chip" />
            <div className="skeleton-loading skeleton-chip" />
            <div className="skeleton-loading skeleton-chip" />
          </div>
        </div>
        <div>
          <div className="skeleton-loading skeleton-text" style={{ width: "100%" }} />
          <div className="skeleton-loading skeleton-text" style={{ width: "70%" }} />
          <div className="skeleton-loading" style={{ width: "100%", height: "60px", borderRadius: "10px", marginTop: "8px" }} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #F3F4F6" }}>
        <div className="skeleton-loading" style={{ width: "120px", height: "32px", borderRadius: "8px" }} />
        <div style={{ display: "flex", gap: "8px" }}>
          <div className="skeleton-loading" style={{ width: "120px", height: "32px", borderRadius: "8px" }} />
          <div className="skeleton-loading" style={{ width: "90px", height: "32px", borderRadius: "8px" }} />
          <div className="skeleton-loading" style={{ width: "80px", height: "32px", borderRadius: "8px" }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Empty state for filtered results ─────────── */
function FilterEmptyState({ filter }) {
  const emoji = filter === "shortlisted" ? "⭐" : filter === "rejected" ? "❌" : filter === "reviewed" ? "📋" : "📨";
  return (
    <div style={{
      textAlign: "center", padding: "60px 20px",
      background: "#fff", borderRadius: "16px",
      border: "2px dashed #E5E7EB"
    }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>{emoji}</div>
      <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", color: "#374151", fontWeight: "700" }}>
        No {filter === "All" ? "" : filter} applicants
      </h3>
      <p style={{ margin: 0, color: "#6B7280", fontSize: "14px" }}>
        {filter === "All"
          ? "No one has applied to this job yet."
          : `No applicants currently have a "${filter}" status.`}
      </p>
    </div>
  );
}

export default function ApplicantsPage() {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [activeFilter, setFilter]   = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy]         = useState("Best Match");
  const [jobTitle, setJobTitle]     = useState("");
  const [jobRole, setJobRole]       = useState("");

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch job metadata
      try {
        const job = await getSingleJob(jobId);
        if (job && job.title) setJobTitle(job.title);
        if (job && job.workerCategory) setJobRole(job.workerCategory);
      } catch (err) {
        console.warn("Failed to fetch job title:", err);
      }

      // Fetch enriched applicants from backend API
      const enrichedApps = await getApplicantsForJob(jobId);
      
      const mappedApps = (enrichedApps || []).map(app => {
        let appliedAtDate = app.appliedAt;
        if (app.appliedAt) {
          if (app.appliedAt._seconds !== undefined) {
            appliedAtDate = new Date(app.appliedAt._seconds * 1000);
          } else {
            appliedAtDate = new Date(app.appliedAt);
          }
        }
        return { ...app, appliedAt: appliedAtDate };
      });

      setApplicants(mappedApps);
    } catch (e) {
      setError(handleError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplicants(); }, [jobId]);

  const updateStatus = async (applicationId, status) => {
    try {
      setUpdatingId(applicationId);
      setApplicants(prev => prev.map(a => a.applicationId === applicationId ? { ...a, status } : a));
      await updateApplicationStatusService(applicationId, status);
    } catch (e) {
      alert(handleError(e));
      fetchApplicants();
    } finally {
      setUpdatingId(null);
    }
  };

  const countFor = (tab) => {
    const list = Array.isArray(applicants) ? applicants : [];
    return tab === "All" ? list.length
      : list.filter(a => a.status?.toLowerCase() === tab.toLowerCase()).length;
  };

  const filtered = useMemo(() => {
    const list = Array.isArray(applicants) ? applicants : [];
    let result = list;

    if (activeFilter !== "All") {
      result = result.filter(a => a.status?.toLowerCase() === activeFilter.toLowerCase());
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(a => {
        const profile = a.worker?.profile || {};
        const name = (profile.name || profile.fullName || profile.resumeSummary || a.worker?.email || "").toLowerCase();
        const skills = [...(profile.skills || []), ...(profile.professionalSkills || [])];
        const role = (profile.professionalRole || profile.canonicalRole || profile.role || "").toLowerCase();
        return name.includes(q) || role.includes(q) || skills.some(s => s.toLowerCase().includes(q));
      });
    }
    
    if (sortBy === "Best Match") {
      result = [...result].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else if (sortBy === "Newest") {
      result = [...result].sort((a, b) => {
        const aTime = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
        const bTime = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
        return bTime - aTime;
      });
    }
    return result;
  }, [applicants, activeFilter, searchQuery, sortBy]);

  return (
    <div style={{ width: "100%", maxWidth: "1100px", margin: "0 auto", padding: "24px 20px" }}>
      {/* Back link */}
      <Link to="/jobs/my-jobs" style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        marginBottom: "20px", color: "var(--text)", textDecoration: "none",
        fontSize: "13px", fontWeight: "500"
      }}>
        ← Back to My Jobs
      </Link>

      {/* ── Page Header ────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "12px",
            background: "var(--success-bg)", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0
          }}>👥</div>
          <div>
            <h1 style={{ margin: "0 0 2px 0", fontSize: "26px", color: "var(--text-h)", fontWeight: "800" }}>
              Applicants
            </h1>
            <p style={{ margin: 0, color: "var(--text)", fontSize: "13px" }}>
              {jobTitle ? jobTitle : "Loading…"}
              {!loading && ` · ${applicants.length} candidate${applicants.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Search + Sort Controls */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", fontSize: "14px", pointerEvents: "none" }}>🔍</span>
            <input
              type="text"
              placeholder="Filter by skill, name…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: "32px", paddingRight: "12px", paddingTop: "8px", paddingBottom: "8px",
                borderRadius: "8px", border: "1.5px solid var(--border)", fontSize: "13px",
                background: "#fff", outline: "none", minWidth: "190px",
                transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding: "8px 14px", borderRadius: "8px",
              border: "1.5px solid var(--border)", fontSize: "13px",
              background: "#fff", cursor: "pointer", fontWeight: "600", color: "var(--text-h)"
            }}
          >
            <option>Best Match</option>
            <option>Newest</option>
          </select>
        </div>
      </div>

      {/* ── Filter Tabs ─────────────────────────────── */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "28px", overflowX: "auto", paddingBottom: "2px" }}>
        {STATUS_TABS.map(tab => {
          const count = countFor(tab);
          const isActive = activeFilter.toLowerCase() === tab.toLowerCase();
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              style={{
                padding: "6px 14px",
                borderRadius: "99px",
                border: isActive ? "none" : "1.5px solid var(--border)",
                background: isActive ? "var(--accent)" : "#fff",
                color: isActive ? "#fff" : "var(--text)",
                fontWeight: isActive ? "700" : "500",
                fontSize: "12px",
                cursor: "pointer",
                textTransform: "capitalize",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                boxShadow: isActive ? "0 2px 8px rgba(232,93,4,0.25)" : "none"
              }}
            >
              {isActive && tab === "shortlisted" && <span>⭐</span>}
              {tab === "All" ? `All (${count})` : `${tab.charAt(0).toUpperCase() + tab.slice(1)} (${count})`}
            </button>
          );
        })}
      </div>

      {/* ── Content Area ─────────────────────────────── */}
      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : error ? (
        <div style={{
          textAlign: "center", padding: "60px 20px",
          background: "#fff", borderRadius: "16px",
          border: "2px dashed #FCA5A5"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
          <h3 style={{ margin: "0 0 8px 0", color: "#EF4444", fontWeight: "700" }}>Failed to load applicants</h3>
          <p style={{ margin: "0 0 20px 0", color: "#6B7280", fontSize: "14px" }}>{error}</p>
          <button className="primary" onClick={fetchApplicants}>Try Again</button>
        </div>
      ) : applicants.length === 0 ? (
        <FilterEmptyState filter="All" />
      ) : filtered.length === 0 ? (
        <FilterEmptyState filter={activeFilter} />
      ) : (
        <div>
          {filtered.map(app => (
            <ApplicantCard
              key={app.applicationId}
              app={app}
              jobId={jobId}
              updatingId={updatingId}
              updateStatus={updateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
import { getDashboardStats } from "../services/dashboardService";
import useAuth from "../hooks/useAuth";
import { Link } from "react-router-dom";
import useAsync from "../hooks/useAsync";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";

const STAT_CARDS = (stats) => [
  { icon: "💼", value: stats.totalJobs,                    label: "Total Jobs",       color: "#6366F1" },
  { icon: "👥", value: stats.totalApplicants,              label: "Total Applicants", color: "#E85D04" },
  { icon: "✅", value: stats.activeJobs,                   label: "Active Jobs",      color: "#10B981" },
  { icon: "⭐", value: stats.hiringFunnel?.shortlisted ?? 0,label: "Shortlisted",    color: "#F59E0B" },
];

const AVATAR_COLORS = ["#6366F1","#E85D04","#10B981","#F59E0B","#EC4899","#14B8A6"];
function avatarColor(name = "") { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]; }
function initials(name = "")   { return name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() || "?"; }

function statusBadge(status = "") {
  const s = status.toLowerCase();
  if (s === "shortlisted") return { bg:"#D1FAE5", color:"#10B981", label:"SHORTLISTED" };
  if (s === "reviewed")    return { bg:"#DBEAFE", color:"#6366F1", label:"REVIEWED" };
  if (s === "rejected")    return { bg:"#FEE2E2", color:"#EF4444", label:"REJECTED" };
  return { bg:"#FEF3C7", color:"#F59E0B", label:"PENDING" };
}

function jobStatusBadge(active) {
  return active
    ? { bg:"#D1FAE5", color:"#10B981", label:"ACTIVE" }
    : { bg:"#FEF3C7", color:"#F59E0B", label:"PAUSED" };
}

export default function DashboardPage() {
  const { user } = useAuth();

  const fetchStats = async () => {
    if (!user) return null;
    return await getDashboardStats();
  };

  const { data: stats, loading, error } = useAsync(fetchStats, [user]);

  if (loading || !stats) return <LoadingSpinner text="Loading dashboard..." />;
  if (error)             return <ErrorState message="Failed to load dashboard" />;

  const cards = STAT_CARDS(stats);

  /* derive recent applicants & active jobs from stats if available */
  const recentApplicants = stats.recentApplicants || [];
  const activeJobs       = stats.activeJobsList   || [];

  return (
    <div style={{ width:"100%" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:24 }}>
        <div>
          <h1 style={{ marginBottom:2 }}>Dashboard</h1>
          <p style={{ color:"#6B7280", fontSize:13, margin:0 }}>
            Welcome back, {user.contactName || "Recruiter"} · {user.companyName || ""}
          </p>
        </div>
        <Link to="/jobs/create">
          <button className="primary" style={{ padding:"10px 20px", borderRadius:10 }}>
            + Post New Job
          </button>
        </Link>
      </div>

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:14, marginBottom:24 }}>
        {cards.map((c, i) => (
          <div key={i} className="card" style={{ padding:"18px 16px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:8 }}>
            <span style={{ fontSize:24 }}>{c.icon}</span>
            <p style={{ margin:0, fontSize:28, fontWeight:800, color:c.color, lineHeight:1 }}>{c.value}</p>
            <p style={{ margin:0, fontSize:12, color:"#6B7280" }}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Bottom two columns */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

        {/* Recent Applicants */}
        <div className="card" style={{ padding:"20px" }}>
          <h3 style={{ marginBottom:16, fontSize:14, fontWeight:700 }}>Recent Applicants</h3>
          {recentApplicants.length === 0 ? (
            <p style={{ fontSize:13, color:"#9CA3AF" }}>No applicants yet.</p>
          ) : recentApplicants.slice(0,4).map((app, i) => {
            const name  = app.workerName || app.name || "Unknown";
            const role  = app.jobTitle   || app.role || "Applicant";
            const badge = statusBadge(app.status);
            const detailLink = app.jobId && app.applicationId
              ? `/jobs/${app.jobId}/applicants/${app.applicationId}`
              : `/jobs/my-jobs`;
            return (
              <Link key={i} to={detailLink} style={{ display:"flex", alignItems:"center", gap:12, paddingBottom:12, marginBottom:12,
                borderBottom: i < Math.min(recentApplicants.length,4)-1 ? "1px solid #F3F0EA":"none",
                textDecoration:"none" }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:avatarColor(name),
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", flexShrink:0 }}>
                  {initials(name)}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ margin:0, fontSize:13, fontWeight:600, color:"#111827", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{name}</p>
                  <p style={{ margin:0, fontSize:11, color:"#6B7280" }}>{role}</p>
                </div>
                <span style={{ background:badge.bg, color:badge.color, fontSize:10, fontWeight:700,
                  padding:"3px 8px", borderRadius:99, flexShrink:0 }}>{badge.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Active Jobs */}
        <div className="card" style={{ padding:"20px" }}>
          <h3 style={{ marginBottom:16, fontSize:14, fontWeight:700 }}>Active Jobs</h3>
          {activeJobs.length === 0 ? (
            <p style={{ fontSize:13, color:"#9CA3AF" }}>No active jobs.</p>
          ) : activeJobs.slice(0,4).map((job, i) => {
            const badge = jobStatusBadge(job.isActive !== false);
            return (
              <Link key={i} to={`/jobs/${job.jobId}/applicants`}
                style={{ display:"flex", alignItems:"center", gap:10, paddingBottom:12, marginBottom:12,
                  borderBottom: i < Math.min(activeJobs.length,4)-1 ? "1px solid #F3F0EA":"none",
                  textDecoration:"none" }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ margin:0, fontSize:13, fontWeight:600, color:"#111827", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{job.title || "Job"}</p>
                  <p style={{ margin:0, fontSize:11, color:"#6B7280" }}>{job.applicantCount ?? job.totalApplicants ?? 0} applicants</p>
                </div>
                <span style={{ background:badge.bg, color:badge.color, fontSize:10, fontWeight:700,
                  padding:"3px 8px", borderRadius:99, flexShrink:0 }}>{badge.label}</span>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}

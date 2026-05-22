import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import { getApplicantsForJob, updateApplicationStatus as updateApplicationStatusService } from "../services/applicationsService";
import { handleError } from "../utils/errorHandler";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";

const STATUS_TABS = ["All", "pending", "reviewed", "shortlisted", "rejected"];

const AVATAR_COLORS = ["#6366F1","#E85D04","#10B981","#F59E0B","#EC4899","#14B8A6","#8B5CF6"];
function avatarColor(name="") { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]; }
function initials(name="")   { return name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()||"?"; }

function statusBadge(status="") {
  const s = status.toLowerCase();
  if (s==="shortlisted") return { bg:"#D1FAE5", color:"#10B981", label:"SHORTLISTED" };
  if (s==="reviewed")    return { bg:"#DBEAFE", color:"#6366F1", label:"REVIEWED" };
  if (s==="rejected")    return { bg:"#FEE2E2", color:"#EF4444", label:"REJECTED" };
  return { bg:"#FEF3C7", color:"#F59E0B", label:"PENDING" };
}

function matchColor(score) {
  if (score >= 80) return { bg:"#D1FAE5", color:"#10B981" };
  if (score >= 60) return { bg:"#FEF3C7", color:"#F59E0B" };
  return { bg:"#FEE2E2", color:"#EF4444" };
}

export default function ApplicantsPage() {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [activeFilter, setFilter]   = useState("All");
  const [sortBy, setSortBy]         = useState("Best Match");

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const data = await getApplicantsForJob(jobId);
      setApplicants(data);
    } catch (e) { setError(handleError(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchApplicants(); }, [jobId]);

  const updateStatus = async (applicationId, status) => {
    try {
      setUpdatingId(applicationId);
      setApplicants(prev => prev.map(a => a.applicationId===applicationId ? {...a, status} : a));
      await updateApplicationStatusService(applicationId, status);
    } catch (e) {
      alert(handleError(e));
      fetchApplicants();
    } finally { setUpdatingId(null); }
  };

  const filtered = useMemo(() => {
    const list = Array.isArray(applicants) ? applicants : [];
    let result = list;
    if (activeFilter === "pending") result = list.filter(a => a.status?.toLowerCase() === "pending");
    else if (activeFilter === "reviewed") result = list.filter(a => a.status?.toLowerCase() === "reviewed");
    else if (activeFilter === "shortlisted") result = list.filter(a => a.status?.toLowerCase() === "shortlisted");
    else if (activeFilter === "rejected") result = list.filter(a => a.status?.toLowerCase() === "rejected");
    
    if (sortBy === "Best Match") {
      result = [...result].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }
    return result;
  }, [applicants, activeFilter, sortBy]);


  if (loading) return <LoadingSpinner text="Loading applicants..." />;
  if (error)   return <ErrorState message="Failed to load applicants" />;

  if (!applicants || applicants.length === 0) return (
    <EmptyState title="No Applicants" description="There are no applicants for this job yet." />
  );

  const countFor = (tab) => {
    const list = Array.isArray(applicants) ? applicants : [];
    return tab === "All" ? list.length
      : list.filter(a => a.status?.toLowerCase() === tab.toLowerCase()).length;
  };

  return (
    <div style={{ width:"100%" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:6 }}>
        <div>
          <h1 style={{ marginBottom:2 }}>Applicants</h1>
          <p style={{ color:"#6B7280", fontSize:13, margin:0 }}>
            Accounts Executive · {applicants.length} candidates
          </p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <select value="All Jobs" onChange={()=>{}}
            style={{ padding:"8px 12px", borderRadius:8, border:"1.5px solid #E5E0D5", fontSize:13, color:"#374151", background:"#fff", cursor:"pointer" }}>
            <option>All Jobs</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ padding:"8px 12px", borderRadius:8, border:"1.5px solid #E5E0D5", fontSize:13, color:"#374151", background:"#fff", cursor:"pointer" }}>
            <option>Best Match</option>
            <option>Newest</option>
            <option>Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs" style={{ marginTop:16 }}>
        {STATUS_TABS.map(tab => {
          const count = countFor(tab);
          return (
            <button key={tab} type="button"
              className={`filter-tab${activeFilter===tab ? " active":""}`}
              onClick={() => setFilter(tab)}
              style={{ textTransform:"capitalize" }}>
              {tab==="All" ? `All (${count})` : `${tab.charAt(0).toUpperCase()+tab.slice(1)} (${count})`}
            </button>
          );
        })}
      </div>

      {/* Applicant rows */}
      {filtered.length === 0 ? (
        <EmptyState title="No Applicants" description={`No applicants with status: ${activeFilter}`} />
      ) : (
        <div>
          {filtered.map(app => {
            const profile  = app.worker?.profile || {};
            const name     = profile.name || app.workerName || "Unknown";
            const edu      = profile.education || profile.qualification || "B.Com";
            const exp      = profile.experience ? `${profile.experience} yrs` : "—";
            const skills   = profile.skills || app.strengths || [];
            const badge    = statusBadge(app.status);
            const mc       = matchColor(app.matchScore || 0);
            const isUpdating = updatingId === app.applicationId;

            return (
              <div key={app.applicationId} className="applicant-row">
                {/* Avatar */}
                <div className="applicant-avatar" style={{ background:avatarColor(name) }}>
                  {initials(name)}
                </div>

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:4 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:"#111827" }}>{name}</span>
                    {app.matchScore > 0 && (
                      <span style={{ background:mc.bg, color:mc.color, fontSize:10, fontWeight:700,
                        padding:"2px 8px", borderRadius:99 }}>{app.matchScore}% MATCH</span>
                    )}
                  </div>
                  <p style={{ margin:"0 0 6px", fontSize:12, color:"#6B7280" }}>
                    {edu} · {exp}
                  </p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {skills.slice(0,4).map((s,i) => (
                      <span key={i} style={{ background:"#F3F4F6", color:"#374151", fontSize:11, fontWeight:600,
                        padding:"2px 8px", borderRadius:99 }}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Status badge */}
                <span style={{ background:badge.bg, color:badge.color, fontSize:10, fontWeight:700,
                  padding:"4px 10px", borderRadius:99, flexShrink:0, whiteSpace:"nowrap" }}>{badge.label}</span>

                {/* Actions */}
                <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                  <button type="button" disabled={isUpdating}
                    onClick={() => updateStatus(app.applicationId, "shortlisted")}
                    style={{ padding:"6px 12px", fontSize:11, fontWeight:700, borderRadius:6,
                      background:app.status==="shortlisted"?"#D1FAE5":"#fff",
                      color:"#10B981", border:"1.5px solid #10B981", cursor:"pointer" }}>
                    Shortlist
                  </button>
                  <Link to={`/jobs/${jobId}/applicants/${app.applicationId}`}>
                    <button type="button"
                      style={{ padding:"6px 12px", fontSize:11, fontWeight:700, borderRadius:6,
                        background:"#fff", color:"#374151", border:"1.5px solid #E5E0D5", cursor:"pointer" }}>
                      View
                    </button>
                  </Link>
                  <button type="button" disabled={isUpdating}
                    onClick={() => updateStatus(app.applicationId, "rejected")}
                    style={{ padding:"6px 12px", fontSize:11, fontWeight:700, borderRadius:6,
                      background:"#fff", color:"#EF4444", border:"1.5px solid #EF4444", cursor:"pointer" }}>
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
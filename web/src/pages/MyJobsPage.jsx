import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import { getRecruiterJobs, toggleJobStatus as toggleJobStatusService, updateJob, deleteJob } from "../services/jobsService";
import LoadingSpinner from "../components/LoadingSpinner";

const STATUS_FILTERS = ["All", "Active", "Paused", "Draft", "Closed"];

const CATEGORY_COLORS = {
  professional: { bg:"#DBEAFE", color:"#1D4ED8" },
  labour:       { bg:"#FEF3C7", color:"#D97706" },
};

function jobStatus(job) {
  if (job.isDraft) return { label:"DRAFT", bg:"#E0E7FF", color:"#4338CA" };
  if (!job.isActive) return { label:"PAUSED", bg:"#FEF3C7", color:"#D97706" };
  return { label:"ACTIVE", bg:"#D1FAE5", color:"#059669" };
}

export default function MyJobsPage() {
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("All");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getRecruiterJobs();
      setJobs(data);
    } catch (error) {
      console.error("Failed to fetch jobs", error);
      alert("Failed to load recruiter jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const toggleStatus = async (jobId, currentStatus, isDraft) => {
    try {
      if (isDraft) {
        setJobs(prev => prev.map(j => j.jobId === jobId ? { ...j, isDraft: false, isActive: true } : j));
        await updateJob(jobId, { isDraft: false, isActive: true });
        alert("Job published successfully!");
      } else {
        setJobs(prev => prev.map(j => j.jobId === jobId ? { ...j, isActive: !currentStatus } : j));
        await toggleJobStatusService(jobId, !currentStatus);
      }
    } catch (error) {
      alert("Failed to update job status");
      fetchJobs();
    }
  };

  const handleDelete = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job and all of its applications? This action cannot be undone.")) {
      try {
        await deleteJob(jobId);
        setJobs(prev => prev.filter(j => j.jobId !== jobId));
        alert("Job deleted successfully!");
      } catch (error) {
        console.error("Failed to delete job", error);
        alert("Failed to delete job");
        fetchJobs();
      }
    }
  };

  const filtered = useMemo(() => {
    const list = Array.isArray(jobs) ? jobs : [];
    if (filter === "All") return list;
    if (filter === "Active") return list.filter(j => j.isActive && !j.isDraft && !j.isClosed);
    if (filter === "Paused") return list.filter(j => !j.isActive && !j.isDraft && !j.isClosed);
    if (filter === "Draft") return list.filter(j => j.isDraft);
    if (filter === "Closed") return list.filter(j => j.isClosed);
    return list;
  }, [jobs, filter]);

  const activeCount = useMemo(() => {
    const list = Array.isArray(jobs) ? jobs : [];
    return list.filter(j => j.isActive).length;
  }, [jobs]);

  if (loading) return <LoadingSpinner text="Loading jobs..." />;

  if (!jobs || jobs.length === 0) return (
    <EmptyState title="No Jobs" description="You have not posted any jobs yet." />
  );

  return (
    <div style={{ width:"100%" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:6 }}>
        <div>
          <h1 style={{ marginBottom:2 }}>My Jobs</h1>
          <p style={{ color:"#6B7280", fontSize:13, margin:0 }}>
            {jobs.length} total · {activeCount} active
          </p>
        </div>
        <Link to="/jobs/create">
          <button className="primary" style={{ padding:"10px 18px", borderRadius:10 }}>
            + Post New Job
          </button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs" style={{ marginTop:18 }}>
        {STATUS_FILTERS.map(f => (
          <button key={f} type="button"
            className={`filter-tab${filter===f ? " active" : ""}`}
            onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {/* Job list */}
      {filtered.length === 0 ? (
        <EmptyState title="No Jobs Found" description="No jobs match this filter." />
      ) : (
        <div>
          {filtered.map(job => {
            const st  = jobStatus(job);
            const cat = CATEGORY_COLORS[job.workerCategory?.toLowerCase()] || CATEGORY_COLORS.professional;
            const applicants = job.applicantCount ?? job.totalApplicants ?? 0;
            return (
              <div key={job.jobId} className="job-row">
                {/* Icon */}
                <div className="job-row-icon" style={{ background:"#FFF0E6" }}>
                  {job.workerCategory?.toLowerCase() === "labour" ? "🧱" : "💼"}
                </div>

                {/* Info */}
                <Link to={`/jobs/${job.jobId}/applicants`} style={{ flex:1, minWidth:0, textDecoration:"none" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:3 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:"#111827" }}>{job.title}</span>
                    <span style={{ background:cat.bg, color:cat.color, fontSize:10, fontWeight:700,
                      padding:"2px 8px", borderRadius:99, textTransform:"uppercase" }}>
                      {job.workerCategory}
                    </span>
                  </div>
                  <p style={{ margin:0, fontSize:12, color:"#6B7280" }}>
                    ₹{job.salary?.toLocaleString?.() ?? job.salary}/yr · Posted {job.postedAt ? new Date(job.postedAt._seconds ? job.postedAt._seconds*1000 : job.postedAt).toLocaleDateString() : "recently"}
                  </p>
                </Link>

                {/* Applicants */}
                <Link to={`/jobs/${job.jobId}/applicants`} style={{ textAlign:"center", flexShrink:0, textDecoration:"none" }}>
                  <p style={{ margin:0, fontSize:20, fontWeight:800, color:"#E85D04" }}>{applicants}</p>
                  <p style={{ margin:0, fontSize:10, color:"#6B7280" }}>Applicants</p>
                </Link>

                {/* Status badge */}
                <span style={{ background:st.bg, color:st.color, fontSize:10, fontWeight:700,
                  padding:"4px 10px", borderRadius:99, flexShrink:0 }}>{st.label}</span>

                {/* Actions */}
                <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                  <Link to={`/jobs/${job.jobId}/edit`}>
                    <button className="secondary" style={{ padding:"6px 14px", fontSize:12 }}>Edit</button>
                  </Link>
                  <button
                    onClick={() => toggleStatus(job.jobId, job.isActive, job.isDraft)}
                    style={{ padding:"6px 14px", fontSize:12, borderRadius:6,
                      background: job.isActive ? "#FEE2E2" : (job.isDraft ? "#D1FAE5" : "#FEF3C7"),
                      color: job.isActive ? "#EF4444" : (job.isDraft ? "#059669" : "#D97706"),
                      border:"none", fontWeight:600, cursor:"pointer" }}>
                    {job.isActive ? "Pause" : (job.isDraft ? "Publish" : "Activate")}
                  </button>
                  <button
                    onClick={() => handleDelete(job.jobId)}
                    style={{ padding:"6px 14px", fontSize:12, borderRadius:6,
                      background:"#FFF5F5", color:"#EF4444", border:"1.5px solid #FCA5A5", fontWeight:600, cursor:"pointer" }}>
                    Delete
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
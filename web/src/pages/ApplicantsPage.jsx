import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import { getSingleJob } from "../services/jobsService";
import { updateApplicationStatus as updateApplicationStatusService } from "../services/applicationsService";
import { handleError } from "../utils/errorHandler";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";
import ApplicantCard from "../components/ApplicantCard";
import { db } from "../firebase";
import { collection, query, where, orderBy, getDocs, getDoc, doc } from "firebase/firestore";
import { formatDate } from "../utils/formatters";

const STATUS_TABS = ["All", "pending", "reviewed", "shortlisted", "rejected"];

export default function ApplicantsPage() {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [activeFilter, setFilter]   = useState("All");
  const [skillFilter, setSkillFilter] = useState("");
  const [sortBy, setSortBy]         = useState("Best Match");
  const [jobTitle, setJobTitle]     = useState("Job Pipeline");

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch Job Title
      try {
        const job = await getSingleJob(jobId);
        if (job && job.title) {
          setJobTitle(job.title);
        }
      } catch (err) {
        console.warn("Failed to fetch job title:", err);
      }

      // Query Applications
      let appsSnapshot;
      try {
        const q = query(collection(db, "applications"), where("jobId", "==", jobId), orderBy("matchScore", "desc"));
        appsSnapshot = await getDocs(q);
      } catch (err) {
        console.warn("Query with orderBy failed, falling back to unordered query:", err);
        const qFallback = query(collection(db, "applications"), where("jobId", "==", jobId));
        appsSnapshot = await getDocs(qFallback);
      }

      if (appsSnapshot.empty) {
        setApplicants([]);
        return;
      }

      const appsList = appsSnapshot.docs.map(docSnap => ({
        applicationId: docSnap.id,
        ...docSnap.data(),
        appliedAt: docSnap.data().appliedAt?.toDate ? docSnap.data().appliedAt.toDate() : docSnap.data().appliedAt
      }));

      // Fetch all worker profiles safely
      const workerProfiles = await Promise.all(
        appsList.map(app => {
          if (!app.workerId) return null;
          return getDoc(doc(db, "users", app.workerId)).catch(e => {
            console.warn("Failed to fetch worker", app.workerId, e);
            return null;
          });
        })
      );

      const mergedApps = appsList.map((app, i) => ({
        ...app,
        worker: (workerProfiles[i] && workerProfiles[i].exists && workerProfiles[i].exists()) ? workerProfiles[i].data() : {}
      }));

      setApplicants(mergedApps);
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
      setApplicants(prev => prev.map(a => a.applicationId === applicationId ? {...a, status} : a));
      await updateApplicationStatusService(applicationId, status);
    } catch (e) {
      alert(handleError(e));
      fetchApplicants();
    } finally { setUpdatingId(null); }
  };

  const filtered = useMemo(() => {
    const list = Array.isArray(applicants) ? applicants : [];
    let result = list;
    if (activeFilter !== "All") {
      result = result.filter(a => a.status?.toLowerCase() === activeFilter.toLowerCase());
    }

    if (skillFilter.trim().length > 0) {
      const sf = skillFilter.toLowerCase().trim();
      result = result.filter(a => {
        const profile = a.worker?.profile || {};
        const skills = profile.skills || profile.professionalSkills || [];
        return skills.some(skill => typeof skill === "string" && skill.toLowerCase().includes(sf));
      });
    }
    
    if (sortBy === "Best Match") {
      result = [...result].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }
    return result;
  }, [applicants, activeFilter, skillFilter, sortBy]);

  if (loading) return <LoadingSpinner text="Loading applicants..." />;
  if (error)   return <ErrorState message="Failed to load applicants" />;

  const countFor = (tab) => {
    const list = Array.isArray(applicants) ? applicants : [];
    return tab === "All" ? list.length
      : list.filter(a => a.status?.toLowerCase() === tab.toLowerCase()).length;
  };

  return (
    <div style={{ width: "100%", padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <Link to="/jobs/my-jobs" style={{ display: "inline-flex", marginBottom: "20px", color: "var(--text)", textDecoration: "none" }}>
        &larr; Back to My Jobs
      </Link>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ marginBottom: 4, fontSize: "24px", color: "var(--text-h)" }}>Applicants</h1>
          <p style={{ color: "var(--text)", fontSize: "14px", margin: 0 }}>
            {jobTitle} · {applicants.length} candidates
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            placeholder="Filter by skill..."
            value={skillFilter}
            onChange={e => setSkillFilter(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 13, background: "#fff", outline: "none", minWidth: "150px" }}
          />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 13, background: "#fff", cursor: "pointer" }}>
            <option>Best Match</option>
            <option>Newest</option>
          </select>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs" style={{ marginBottom: 24, display: "flex", gap: 8, overflowX: "auto" }}>
        {STATUS_TABS.map(tab => {
          const count = countFor(tab);
          const isActive = activeFilter === tab;
          return (
            <button key={tab} type="button"
              onClick={() => setFilter(tab)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: "none",
                background: isActive ? "var(--primary)" : "var(--bg)",
                color: isActive ? "#fff" : "var(--text-h)",
                fontWeight: isActive ? "600" : "500",
                cursor: "pointer",
                textTransform: "capitalize",
                whiteSpace: "nowrap"
              }}>
              {tab === "All" ? `All (${count})` : `${tab} (${count})`}
            </button>
          );
        })}
      </div>

      {/* Applicant cards */}
      {(!applicants || applicants.length === 0) ? (
        <EmptyState title="No Applicants" description="There are no applicants for this job yet." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No Applicants" description={`No applicants with status: ${activeFilter}`} />
      ) : (
        <div>
          {filtered.map(app => (
            <ApplicantCard 
              key={app.applicationId}
              app={app}
              jobId={jobId}
              updatingId={updatingId}
              updateStatus={updateStatus}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
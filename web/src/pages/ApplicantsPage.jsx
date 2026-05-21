import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import { getApplicantsForJob, updateApplicationStatus as updateApplicationStatusService } from "../services/applicationsService";
import ApplicantCard from "../components/ApplicantCard";
import { handleError } from "../utils/errorHandler";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";

const FILTERS = ["All", "pending", "reviewed", "shortlisted", "rejected"];

export default function ApplicantsPage() {
  const { jobId } = useParams();
  
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const data = await getApplicantsForJob(jobId);
      setApplicants(data);
    } catch (error) {
      setError(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const updateStatus = async (applicationId, status) => {
    try {
      setUpdatingId(applicationId);
      
      // Optimistic Update
      setApplicants((prev) =>
        prev.map((app) =>
          app.applicationId === applicationId ? { ...app, status } : app
        )
      );

      await updateApplicationStatusService(applicationId, status);
    } catch (error) {
      alert(handleError(error));
      fetchApplicants(); // Rollback
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Unknown Date";
    if (dateValue._seconds) {
      return new Date(dateValue._seconds * 1000).toLocaleDateString();
    }
    return new Date(dateValue).toLocaleDateString();
  };

  const filteredApplicants = useMemo(() => {
    if (activeFilter === "All") return applicants;
    return applicants.filter(app => app.status.toLowerCase() === activeFilter.toLowerCase());
  }, [applicants, activeFilter]);

  if (loading) return <LoadingSpinner text="Loading pipeline..." />;
  if (error) return <ErrorState message="Failed to load applicants" />;

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <Link to="/jobs/my-jobs" style={{ display: 'inline-block', marginBottom: '24px' }}>
        &larr; Back to My Jobs
      </Link>

      <h2 style={{ fontSize: '32px', marginBottom: '24px' }}>Hiring Pipeline</h2>

      {/* FILTER TABS */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        {FILTERS.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            style={{
              background: activeFilter === filter ? 'var(--accent)' : 'transparent',
              color: activeFilter === filter ? '#fff' : 'var(--text)',
              border: activeFilter === filter ? '1px solid var(--accent-border)' : '1px solid var(--border)',
              borderRadius: '999px',
              padding: '6px 16px',
              textTransform: 'capitalize'
            }}
          >
            {filter} {filter !== "All" && `(${applicants.filter(a => a.status.toLowerCase() === filter.toLowerCase()).length})`}
          </button>
        ))}
      </div>

      {applicants.length === 0 ? (
        <EmptyState title="No Applicants Yet" description="No workers have applied for this job." />
      ) : filteredApplicants.length === 0 ? (
        <EmptyState title="No matches" description={`No applicants with status: ${activeFilter}`} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {filteredApplicants.map((app) => (
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
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getApplicationById, updateApplicationStatus as updateApplicationStatusService } from "../services/applicationsService";
import { handleError } from "../utils/errorHandler";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";
import StatusBadge from "../components/StatusBadge";
import { formatStatus } from "../utils/formatters";
import { APPLICATION_STATUS } from "../constants/applicationStatus";

export default function CandidateDetailPage() {
  const { jobId, applicationId } = useParams();
  
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const data = await getApplicationById(applicationId);
      setApp(data);
    } catch (error) {
      setError(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const updateStatus = async (status) => {
    try {
      setUpdatingId(applicationId);
      setApp(prev => ({ ...prev, status })); // Optimistic
      await updateApplicationStatusService(applicationId, status);
    } catch (error) {
      alert(handleError(error));
      fetchApplication(); // Rollback
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading candidate profile..." />;
  if (error || !app) return <ErrorState message="Failed to load candidate" />;

  const isShortlisted = app.status === APPLICATION_STATUS.SHORTLISTED;
  const profile = app.worker.profile || {};

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <Link to={`/jobs/${jobId}/applicants`} style={{ display: 'inline-block', marginBottom: '24px' }}>
        &larr; Back to Pipeline
      </Link>

      <div style={{ display: 'flex', gap: '32px' }}>
        
        {/* LEFT COLUMN: Profile & Resume */}
        <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
              👤
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: '0 0 8px 0', fontSize: '32px' }}>{profile.name || profile.fullName || "Candidate Profile"}</h1>
              <p style={{ color: 'var(--text)', margin: '0 0 16px 0' }}>{profile.jobRole || profile.canonicalRole || "No role specified"} • {profile.experience || 0} years experience • {profile.location || "Remote"}</p>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <StatusBadge status={formatStatus(app.status)} />
                <span className="badge" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  {app.worker.workerType === 'labour' ? 'Blue Collar' : 'Professional'}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>Contact Information</h3>
            {isShortlisted ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <p><strong>Email:</strong> {profile.email || "Not provided"}</p>
                <p><strong>Phone:</strong> {profile.phone || "Not provided"}</p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                <p style={{ color: 'var(--text)', marginBottom: '16px' }}>🔒 Contact info is hidden to protect privacy.</p>
                <button 
                  onClick={() => updateStatus(APPLICATION_STATUS.SHORTLISTED)}
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  Unlock Contact Info by Shortlisting
                </button>
              </div>
            )}
          </div>

          <div className="glass-card">
            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>Full Skills Profile</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {profile.skills?.length > 0 ? profile.skills.map((skill, i) => (
                <span key={i} className="badge" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>{skill}</span>
              )) : <p>No skills listed</p>}
            </div>
          </div>

          {profile.generatedResumeUrl && (
            <div className="glass-card">
              <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>Resume Preview</h3>
              <iframe 
                src={profile.generatedResumeUrl} 
                style={{ width: '100%', height: '600px', border: 'none', borderRadius: '8px', background: '#fff' }}
                title="Resume"
              />
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: AI & Actions */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-card" style={{ borderTop: '4px solid var(--accent)' }}>
            <h3 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'var(--text-h)' }}>AI Match Score</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '24px' }}>
              <span style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--accent)' }}>{app.matchScore}%</span>
            </div>

            {app.aiSummary && (
              <div style={{ background: 'var(--code-bg)', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontStyle: 'italic', fontSize: '14px', lineHeight: '1.6' }}>
                " {app.aiSummary} "
              </div>
            )}

            <h4 style={{ color: 'var(--success)', marginBottom: '12px' }}>Strengths</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {app.strengths?.length > 0 ? app.strengths.map((s, i) => (
                <span key={i} className="badge" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>✓ {s}</span>
              )) : <span style={{ color: 'var(--text)', fontSize: '13px' }}>None recorded</span>}
            </div>

            <h4 style={{ color: 'var(--danger)', marginBottom: '12px' }}>Weaknesses / Missing</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {app.weaknesses?.length > 0 ? app.weaknesses.map((s, i) => (
                <span key={i} className="badge" style={{ border: '1px dashed var(--danger)', color: 'var(--text)' }}>✗ {s}</span>
              )) : <span style={{ color: 'var(--text)', fontSize: '13px' }}>None missing!</span>}
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0 }}>Workflow Actions</h3>
            <button 
              onClick={() => updateStatus(APPLICATION_STATUS.REVIEWED)}
              disabled={updatingId === applicationId || app.status === APPLICATION_STATUS.REVIEWED}
              style={{ width: '100%', background: 'var(--info-bg)', color: 'var(--info)', opacity: app.status === APPLICATION_STATUS.REVIEWED ? 0.5 : 1 }}
            >
              Mark as Reviewed
            </button>
            <button 
              onClick={() => updateStatus(APPLICATION_STATUS.SHORTLISTED)}
              disabled={updatingId === applicationId || app.status === APPLICATION_STATUS.SHORTLISTED}
              style={{ width: '100%', background: 'var(--success)', color: '#fff', opacity: app.status === APPLICATION_STATUS.SHORTLISTED ? 0.5 : 1 }}
            >
              Shortlist Candidate
            </button>
            <button 
              onClick={() => updateStatus(APPLICATION_STATUS.REJECTED)}
              disabled={updatingId === applicationId || app.status === APPLICATION_STATUS.REJECTED}
              style={{ width: '100%', background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', opacity: app.status === APPLICATION_STATUS.REJECTED ? 0.5 : 1 }}
            >
              Reject Candidate
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

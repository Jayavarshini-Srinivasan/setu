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
    <div style={{ padding: '0 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Link to={`/jobs/${jobId}/applicants`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontWeight: '500', fontSize: '14px', color: 'var(--text)' }}>
        &larr; Back to Pipeline
      </Link>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        
        {/* LEFT COLUMN: Profile & Resume */}
        <div style={{ flex: '2', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: 'var(--accent)' }}>
              👤
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h1 style={{ margin: '0 0 6px 0', fontSize: '28px', fontWeight: '700' }}>{profile.name || profile.fullName || "Candidate Profile"}</h1>
              <p style={{ color: 'var(--text)', margin: '0 0 12px 0', fontSize: '15px' }}>{profile.jobRole || profile.canonicalRole || "No role specified"} • {profile.experience || 0} years experience • {profile.location || "Remote"}</p>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <StatusBadge status={formatStatus(app.status)} />
                <span className="badge" style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '4px 10px', fontSize: '11px', fontWeight: '600' }}>
                  {app.worker.workerType === 'labour' ? 'Blue Collar' : 'Professional'}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px', fontSize: '18px', fontWeight: '600' }}>Contact Information</h3>
            {isShortlisted ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <p style={{ margin: 0, fontSize: '14px' }}><strong>Email:</strong> <a href={`mailto:${profile.email || ""}`} style={{ color: 'var(--accent)' }}>{profile.email || "Not provided"}</a></p>
                <p style={{ margin: 0, fontSize: '14px' }}><strong>Phone:</strong> <a href={`tel:${profile.phoneNumber || ""}`} style={{ color: 'var(--accent)' }}>{profile.phoneNumber || "Not provided"}</a></p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px', background: 'var(--bg)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                <p style={{ color: 'var(--text)', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>🔒 Contact info is hidden to protect privacy.</p>
                <button 
                  onClick={() => updateStatus(APPLICATION_STATUS.SHORTLISTED)}
                  className="primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontWeight: '600' }}
                >
                  Unlock Contact Info by Shortlisting
                </button>
              </div>
            )}
          </div>

          <div className="glass-card">
            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px', fontSize: '18px', fontWeight: '600' }}>Full Skills Profile</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {profile.skills?.length > 0 ? profile.skills.map((skill, i) => (
                <span key={i} className="badge" style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '4px 10px', fontSize: '12px' }}>{skill}</span>
              )) : <p style={{ margin: 0, color: 'var(--text)' }}>No skills listed</p>}
            </div>
          </div>

          {profile.generatedResumeUrl && (
            <div className="glass-card">
              <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px', fontSize: '18px', fontWeight: '600' }}>Resume Preview</h3>
              <iframe 
                src={profile.generatedResumeUrl} 
                style={{ width: '100%', height: '600px', border: 'none', borderRadius: '8px', background: '#fff' }}
                title="Resume"
              />
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: AI & Actions */}
        <div style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-card" style={{ borderTop: '4px solid var(--accent)', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', margin: '0 0 16px 0', color: 'var(--text-h)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Intelligence</h3>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '20px' }}>
              <span style={{ fontSize: '48px', fontWeight: '800', color: 'var(--accent)', lineHeight: 1 }}>{app.matchScore}%</span>
              <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '600' }}>Match Score</span>
            </div>

            {app.aiSummary && (
              <div style={{ 
                background: 'var(--accent-bg)', 
                border: '1px solid var(--accent-border)',
                padding: '16px', 
                borderRadius: '12px', 
                marginBottom: '24px', 
                fontStyle: 'italic', 
                fontSize: '13px', 
                lineHeight: '1.6',
                color: 'var(--text-h)',
                fontWeight: '500'
              }}>
                " {app.aiSummary} "
              </div>
            )}

            <h4 style={{ color: 'var(--success)', marginBottom: '12px', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Strengths</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {app.strengths?.length > 0 ? app.strengths.map((s, i) => (
                <span key={i} className="badge" style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success)', fontSize: '11px', padding: '3px 8px' }}>✓ {s}</span>
              )) : <span style={{ color: 'var(--text)', fontSize: '13px' }}>None recorded</span>}
            </div>

            <h4 style={{ color: 'var(--danger)', marginBottom: '12px', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Missing Skills</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {app.weaknesses?.length > 0 ? app.weaknesses.map((s, i) => (
                <span key={i} className="badge" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger)', fontSize: '11px', padding: '3px 8px' }}>✗ {s}</span>
              )) : <span style={{ color: 'var(--success)', fontSize: '13px', fontWeight: '600' }}>✓ Perfect skills alignment!</span>}
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>Workflow Actions</h3>
            <button 
              onClick={() => updateStatus(APPLICATION_STATUS.REVIEWED)}
              disabled={updatingId === applicationId || app.status === APPLICATION_STATUS.REVIEWED}
              style={{ width: '100%', background: 'var(--info-bg)', color: 'var(--info)', fontWeight: '600', opacity: app.status === APPLICATION_STATUS.REVIEWED ? 0.5 : 1, padding: '12px' }}
            >
              Mark as Reviewed
            </button>
            <button 
              onClick={() => updateStatus(APPLICATION_STATUS.SHORTLISTED)}
              disabled={updatingId === applicationId || app.status === APPLICATION_STATUS.SHORTLISTED}
              style={{ width: '100%', background: 'var(--success)', color: '#fff', fontWeight: '600', opacity: app.status === APPLICATION_STATUS.SHORTLISTED ? 0.5 : 1, padding: '12px' }}
            >
              Shortlist Candidate
            </button>
            <button 
              onClick={() => updateStatus(APPLICATION_STATUS.REJECTED)}
              disabled={updatingId === applicationId || app.status === APPLICATION_STATUS.REJECTED}
              style={{ width: '100%', background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', fontWeight: '600', opacity: app.status === APPLICATION_STATUS.REJECTED ? 0.5 : 1, padding: '12px' }}
            >
              Reject Candidate
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

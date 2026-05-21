import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { formatStatus, formatExperience, formatSkills } from "../utils/formatters";
import { APPLICATION_STATUS } from "../constants/applicationStatus";

export default function ApplicantCard({ app, jobId, updatingId, updateStatus, formatDate }) {
  const isPending = app.status === APPLICATION_STATUS.PENDING;
  const profile = app.worker?.profile || {};
  const isShortlisted = app.status === APPLICATION_STATUS.SHORTLISTED;
  const candidateRole = profile.professionalRole || profile.canonicalRole || profile.role || "N/A";
  
  return (
    <div className="glass-card" style={{ padding: '28px', position: 'relative', overflow: 'hidden', marginBottom: '24px' }}>
      {/* Background Match Gradient */}
      <div style={{
        position: 'absolute', top: 0, right: 0, 
        width: '180px', height: '180px', 
        background: app.matchScore >= 80 ? 'var(--success)' : app.matchScore >= 50 ? 'var(--warning)' : 'var(--danger)',
        opacity: 0.04, borderRadius: '50%', filter: 'blur(40px)', transform: 'translate(25%, -25%)',
        zIndex: 0
      }} />

      {/* Main Split Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
        
        {/* LEFT COLUMN: Candidate Profile Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: 'var(--text-h)' }}>
                {profile.name || "Unknown Candidate"}
              </h3>
              <StatusBadge status={formatStatus(app.status)} />
            </div>
            <p style={{ color: 'var(--text)', fontSize: '13px', margin: 0 }}>
              Applied {formatDate(app.appliedAt)}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
              <span style={{ color: 'var(--text)', fontWeight: '500' }}>Target Role:</span>
              <span style={{ color: 'var(--text-h)', fontWeight: '600', textTransform: 'capitalize' }}>{candidateRole}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
              <span style={{ color: 'var(--text)', fontWeight: '500' }}>Experience:</span>
              <span style={{ color: 'var(--text-h)', fontWeight: '600' }}>{formatExperience(profile.experience)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
              <span style={{ color: 'var(--text)', fontWeight: '500' }}>Location:</span>
              <span style={{ color: 'var(--text-h)', fontWeight: '600' }}>📍 {profile.location || "N/A"}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              <span style={{ color: 'var(--text)', fontWeight: '500' }}>Skills:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                {profile.skills?.length > 0 ? profile.skills.map((s, idx) => (
                  <span key={idx} className="badge" style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', fontSize: '11px', padding: '2px 6px' }}>
                    {s}
                  </span>
                )) : <span style={{ color: 'var(--text)', fontSize: '13px' }}>N/A</span>}
              </div>
            </div>

            {/* Contact Details Panel */}
            <div style={{ 
              marginTop: '8px', 
              padding: '12px 16px', 
              background: isShortlisted ? 'var(--success-bg)' : 'var(--bg)', 
              borderRadius: '8px', 
              border: `1px solid ${isShortlisted ? 'var(--success)' : 'var(--border)'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ fontSize: '14px' }}>📞</span>
                {isShortlisted ? (
                  <a href={`tel:${profile.phoneNumber || ""}`} style={{ color: 'var(--success)', fontWeight: '600', textDecoration: 'none' }}>
                    {profile.phoneNumber || "N/A"}
                  </a>
                ) : (
                  <span style={{ color: 'var(--text)', fontStyle: 'italic' }}>Phone Hidden (Shortlist to view)</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ fontSize: '14px' }}>✉️</span>
                {isShortlisted ? (
                  <a href={`mailto:${profile.email || ""}`} style={{ color: 'var(--success)', fontWeight: '600', textDecoration: 'none' }}>
                    {profile.email || "N/A"}
                  </a>
                ) : (
                  <span style={{ color: 'var(--text)', fontStyle: 'italic' }}>Email Hidden (Shortlist to view)</span>
                )}
              </div>
            </div>

            {profile.generatedResumeUrl && (
              <a 
                href={profile.generatedResumeUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="secondary" 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  marginTop: '12px',
                  padding: '10px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: 'var(--text-h)',
                  background: '#FFFFFF',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s'
                }}
              >
                📄 View Resume
              </a>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: AI Insights & Strengths/Weaknesses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderLeft: '1px solid var(--border)', paddingLeft: '24px' }}>
          
          {/* Match Score Block */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text)', fontWeight: '600', fontSize: '15px' }}>AI Match Quality</span>
            <span className="badge" style={{ 
              background: app.matchScore >= 80 ? 'var(--success-bg)' : app.matchScore >= 50 ? 'var(--warning-bg)' : 'var(--danger-bg)',
              color: app.matchScore >= 80 ? 'var(--success)' : app.matchScore >= 50 ? 'var(--warning)' : 'var(--danger)',
              border: `1px solid ${app.matchScore >= 80 ? 'var(--success)' : app.matchScore >= 50 ? 'var(--warning)' : 'var(--danger)'}`,
              fontWeight: '700',
              padding: '4px 10px',
              fontSize: '13px'
            }}>
              {app.matchScore}% Score
            </span>
          </div>

          {/* AI SUMMARY */}
          {app.aiSummary && (
            <div style={{ 
              background: 'var(--accent-bg)', 
              border: '1px solid var(--accent-border)', 
              padding: '16px', 
              borderRadius: '12px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-h)', lineHeight: '1.6', display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>🤖</span>
                <span style={{ fontStyle: 'italic', fontWeight: '500' }}>{app.aiSummary}</span>
              </p>
            </div>
          )}

          {/* Matched Strengths */}
          <div>
            <h4 style={{ fontSize: '13px', color: 'var(--success)', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Strengths (Matched)
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {app.strengths?.length > 0 ? app.strengths.map((skill, idx) => (
                <span key={idx} className="badge" style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success)', fontSize: '12px', padding: '4px 8px' }}>
                  {skill}
                </span>
              )) : <span style={{ color: 'var(--text)', fontSize: '13px' }}>None matching</span>}
            </div>
          </div>

          {/* Missing Skills */}
          <div>
            <h4 style={{ fontSize: '13px', color: 'var(--danger)', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Missing Skills
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {app.weaknesses?.length > 0 ? app.weaknesses.map((skill, idx) => (
                <span key={idx} className="badge" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger)', fontSize: '12px', padding: '4px 8px' }}>
                  {skill}
                </span>
              )) : <span style={{ color: 'var(--success)', fontSize: '13px', fontWeight: '600' }}>✓ Perfect skills alignment!</span>}
            </div>
          </div>

        </div>

      </div>

      {/* ACTIONS FOOTER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', paddingTop: '20px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <Link to={`/jobs/${jobId}/applicants/${app.applicationId}`}>
          <button className="secondary" style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '600' }}>
            View Full Profile →
          </button>
        </Link>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => updateStatus(app.applicationId, APPLICATION_STATUS.REVIEWED)}
            disabled={updatingId === app.applicationId || app.status === APPLICATION_STATUS.REVIEWED}
            style={{ 
              background: 'var(--info-bg)', 
              color: 'var(--info)', 
              fontWeight: '600',
              opacity: app.status === APPLICATION_STATUS.REVIEWED ? 0.5 : 1,
              padding: '8px 16px',
              fontSize: '13px'
            }}
          >
            Mark as Reviewed
          </button>
          
          <button 
            onClick={() => updateStatus(app.applicationId, APPLICATION_STATUS.SHORTLISTED)}
            disabled={updatingId === app.applicationId || app.status === APPLICATION_STATUS.SHORTLISTED}
            style={{ 
              background: 'var(--success)', 
              color: '#fff', 
              fontWeight: '600',
              opacity: app.status === APPLICATION_STATUS.SHORTLISTED ? 0.5 : 1,
              padding: '8px 16px',
              fontSize: '13px'
            }}
          >
            Shortlist
          </button>

          <button 
            onClick={() => updateStatus(app.applicationId, APPLICATION_STATUS.REJECTED)}
            disabled={updatingId === app.applicationId || app.status === APPLICATION_STATUS.REJECTED}
            style={{ 
              background: 'transparent', 
              color: 'var(--danger)', 
              border: '1px solid var(--danger)', 
              fontWeight: '600',
              opacity: app.status === APPLICATION_STATUS.REJECTED ? 0.5 : 1,
              padding: '8px 16px',
              fontSize: '13px'
            }}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
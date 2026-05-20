import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getInsights } from "../services/insightsService";
import { handleError } from "../utils/errorHandler";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";

export default function InsightsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await getInsights();
      setData(res);
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Generating AI Insights..." />;
  if (error || !data) return <ErrorState message="Failed to load insights" />;

  const { totalApplicants, workerTypeCounts, topSkills, recommendations } = data;
  const labourCount = workerTypeCounts.labour || 0;
  const professionalCount = workerTypeCounts.professional || 0;

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <Link to="/dashboard" style={{ display: 'inline-block', marginBottom: '24px' }}>
        &larr; Back to Dashboard
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
        <h1 style={{ margin: 0 }}>🧠 AI Hiring Insights</h1>
        <span className="badge" style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>Beta</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* RECOMMENDATIONS */}
          <div className="glass-card" style={{ borderTop: '4px solid var(--accent)' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>AI Recommendations</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recommendations.map((rec, i) => (
                <div key={i} style={{ padding: '16px', background: 'var(--code-bg)', borderRadius: '8px', borderLeft: '4px solid var(--info)' }}>
                  <p style={{ margin: 0, color: 'var(--text-h)' }}>{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* TOP SKILLS */}
          <div className="glass-card">
            <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Top Applicant Skills</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {topSkills.map((skill, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-h)', marginRight: '16px' }}>{skill.skill}</span>
                  <span className="badge" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>{skill.count} workers</span>
                </div>
              ))}
              {topSkills.length === 0 && <p>No skills data available yet.</p>}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* APPLICANT DEMOGRAPHICS */}
          <div className="glass-card">
            <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Applicant Analytics</h2>
            
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--text-h)' }}>{totalApplicants}</div>
              <div style={{ color: 'var(--text)' }}>Total Pipeline</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Professional</span>
                  <span style={{ fontWeight: 'bold' }}>{professionalCount}</span>
                </div>
                <div style={{ width: '100%', background: 'var(--bg)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${totalApplicants ? (professionalCount/totalApplicants)*100 : 0}%`, height: '100%', background: 'var(--info)' }} />
                </div>
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Blue Collar / Labour</span>
                  <span style={{ fontWeight: 'bold' }}>{labourCount}</span>
                </div>
                <div style={{ width: '100%', background: 'var(--bg)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${totalApplicants ? (labourCount/totalApplicants)*100 : 0}%`, height: '100%', background: 'var(--warning)' }} />
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

import { getDashboardStats } from "../services/dashboardService";
import useAuth from "../hooks/useAuth";
import { Link } from "react-router-dom";
import useAsync from "../hooks/useAsync";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";

export default function DashboardPage() {
  const { user } = useAuth();
  
  const fetchDashboardStats = async () => {
    if (!user) return null;
    return await getDashboardStats();
  };

  const { data: stats, loading, error } = useAsync(fetchDashboardStats, [user]);

  if (loading || !stats) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }
  
  if (error) {
    return <ErrorState message="Failed to load dashboard" />;
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>Welcome back, {user.contactName?.split(' ')[0] || "Recruiter"}</h1>
          <p style={{ color: 'var(--text)', margin: 0, fontSize: '16px' }}>Here is what's happening at {user.companyName || "your company"}.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/insights">
            <button style={{ background: 'var(--glass-bg)', color: 'var(--text-h)', border: '1px solid var(--border)' }}>
              🧠 AI Insights
            </button>
          </Link>
          <Link to="/jobs/create">
            <button style={{ background: 'var(--accent)', color: '#fff' }}>
              + Post New Job
            </button>
          </Link>
        </div>
      </header>

      {/* TOP METRICS */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '24px', 
        marginBottom: '32px' 
      }}>
        
        <div className="glass-card">
          <p style={{ color: 'var(--text)', fontSize: '14px', marginBottom: '8px' }}>Total Applicants</p>
          <h2 style={{ fontSize: '36px', margin: 0, color: 'var(--text-h)' }}>{stats.totalApplicants}</h2>
        </div>

        <div className="glass-card">
          <p style={{ color: 'var(--text)', fontSize: '14px', marginBottom: '8px' }}>Active Jobs</p>
          <h2 style={{ fontSize: '36px', margin: 0, color: 'var(--text-h)' }}>{stats.activeJobs} <span style={{fontSize: '16px', color: 'var(--text)'}}>/ {stats.totalJobs}</span></h2>
        </div>

        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ color: 'var(--text)', fontSize: '14px', marginBottom: '8px' }}>Avg Match Score</p>
            <h2 style={{ fontSize: '36px', margin: 0, color: 'var(--accent)' }}>{stats.averageMatchScore}%</h2>
          </div>
          <div style={{
            position: 'absolute', right: '-20px', bottom: '-20px', 
            width: '100px', height: '100px', 
            background: 'var(--accent)', opacity: 0.1, 
            borderRadius: '50%', filter: 'blur(20px)'
          }} />
        </div>

        <div className="glass-card">
          <p style={{ color: 'var(--text)', fontSize: '14px', marginBottom: '8px' }}>Shortlisted</p>
          <h2 style={{ fontSize: '36px', margin: 0, color: 'var(--success)' }}>{stats.hiringFunnel.shortlisted}</h2>
        </div>

      </div>

      {/* HIRING FUNNEL SECTION */}
      <h3 style={{ marginTop: '40px', marginBottom: '20px' }}>Hiring Funnel</h3>
      <div className="glass-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
          <FunnelStage title="Pending" count={stats.hiringFunnel.pending} color="var(--text-h)" />
          <FunnelStage title="Reviewed" count={stats.hiringFunnel.reviewed} color="var(--info)" />
          <FunnelStage title="Shortlisted" count={stats.hiringFunnel.shortlisted} color="var(--success)" />
          <FunnelStage title="Rejected" count={stats.hiringFunnel.rejected} color="var(--danger)" />
        </div>
      </div>
      
    </div>
  );
}

function FunnelStage({ title, count, color }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', padding: '24px 16px', background: 'var(--bg-card)', borderRadius: '12px', border: `1px solid var(--border)` }}>
      <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h4>
      <div style={{ fontSize: '32px', fontWeight: '600', color: color }}>{count}</div>
    </div>
  );
}

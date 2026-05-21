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
    <div style={{ padding: '0 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ marginBottom: '8px', fontSize: '28px', fontWeight: '700' }}>Welcome back, {user.contactName?.split(' ')[0] || "Recruiter"}</h1>
          <p style={{ color: 'var(--text)', margin: 0, fontSize: '15px' }}>Here is what's happening at {user.companyName || "your company"}.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/insights">
            <button className="secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}>
              🧠 AI Insights
            </button>
          </Link>
          <Link to="/jobs/create">
            <button className="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}>
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
        
        <div className="glass-card" style={{ padding: '24px' }}>
          <p style={{ color: 'var(--text)', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>Total Applicants</p>
          <h2 style={{ fontSize: '36px', margin: 0, color: 'var(--text-h)', fontWeight: '700' }}>{stats.totalApplicants}</h2>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <p style={{ color: 'var(--text)', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>Active Jobs</p>
          <h2 style={{ fontSize: '36px', margin: 0, color: 'var(--text-h)', fontWeight: '700' }}>{stats.activeJobs} <span style={{fontSize: '16px', color: 'var(--text)', fontWeight: '400'}}>/ {stats.totalJobs}</span></h2>
        </div>

        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden', padding: '24px' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ color: 'var(--text)', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>Avg Match Score</p>
            <h2 style={{ fontSize: '36px', margin: 0, color: 'var(--accent)', fontWeight: '700' }}>{stats.averageMatchScore}%</h2>
          </div>
          <div style={{
            position: 'absolute', right: '-20px', bottom: '-20px', 
            width: '100px', height: '100px', 
            background: 'var(--accent)', opacity: 0.1, 
            borderRadius: '50%', filter: 'blur(20px)'
          }} />
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <p style={{ color: 'var(--text)', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>Shortlisted</p>
          <h2 style={{ fontSize: '36px', margin: 0, color: 'var(--success)', fontWeight: '700' }}>{stats.hiringFunnel.shortlisted}</h2>
        </div>

      </div>

      {/* HIRING FUNNEL SECTION */}
      <h3 style={{ marginTop: '40px', marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>Hiring Funnel</h3>
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
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
    <div className="card" style={{ flex: 1, minWidth: '180px', textAlign: 'center', padding: '24px 16px', borderRadius: '16px' }}>
      <h4 style={{ margin: '0 0 16px 0', fontSize: '12px', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>{title}</h4>
      <div style={{ fontSize: '32px', fontWeight: '700', color: color }}>{count}</div>
    </div>
  );
}

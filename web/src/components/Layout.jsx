import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import useAuth from "../hooks/useAuth";

export default function Layout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "My Jobs", path: "/jobs/my-jobs", icon: "💼" },
    { name: "Create Job", path: "/jobs/create", icon: "➕" },
    { name: "AI Insights", path: "/insights", icon: "🧠" },
    { name: "Profile", path: "/profile", icon: "⚙️" },
  ];

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside style={{
        background: 'var(--sidebar-bg)',
        color: 'var(--sidebar-text)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        borderRight: '1px solid var(--border)',
        height: '100svh',
        position: 'sticky',
        top: 0
      }}>
        <div style={{ marginBottom: '40px', padding: '0 12px' }}>
          <h2 style={{ color: 'var(--text-h)', fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)' }}>✦</span> Setu ATS
          </h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                  background: isActive ? 'var(--sidebar-hover)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', paddingLeft: '12px' }}>
          <div style={{ fontSize: '13px', color: 'var(--sidebar-text)', marginBottom: '16px' }}>
            {user?.email}
          </div>
          <button 
            onClick={handleLogout}
            style={{
              background: 'transparent',
              color: 'var(--danger)',
              padding: 0,
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content" style={{ padding: '32px 40px', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}

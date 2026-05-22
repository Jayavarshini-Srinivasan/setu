import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import useAuth from "../hooks/useAuth";

const PAGE_META = {
  "/dashboard":         { title: "Dashboard",   sub: "Recruiter · Web Dashboard" },
  "/jobs/create":       { title: "Post a Job",   sub: "Recruiter · Web Dashboard" },
  "/jobs/my-jobs":      { title: "My Jobs",      sub: "Recruiter · Web Dashboard" },
  "/insights":          { title: "AI Insights",  sub: "Recruiter · Web Dashboard" },
  "/profile":           { title: "Settings",     sub: "Recruiter · Web Dashboard" },
};

function getPageMeta(pathname) {
  if (pathname.endsWith("/applicants") || pathname.includes("/applicants/")) {
    return { title: "Applicants", sub: "Recruiter · Web Dashboard" };
  }
  if (pathname.includes("/edit")) {
    return { title: "Edit Job", sub: "Recruiter · Web Dashboard" };
  }
  return PAGE_META[pathname] || { title: "Dashboard", sub: "Recruiter · Web Dashboard" };
}

const NAV = [
  { name: "Dashboard",  path: "/dashboard",   icon: "📊" },
  { name: "Post Job",   path: "/jobs/create", icon: "➕" },
  { name: "My Jobs",    path: "/jobs/my-jobs",icon: "💼" },
  { name: "Applicants", path: "/jobs/my-jobs",icon: "👥", matchPrefix: "/jobs" },
  { name: "AI Insights",path: "/insights",    icon: "🤖" },
  { name: "Settings",   path: "/profile",     icon: "⚙️" },
];

export default function Layout() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const meta      = getPageMeta(location.pathname);

  const initials = user?.contactName
    ? user.contactName.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()
    : (user?.email?.[0] || "R").toUpperCase();

  const handleLogout = async () => {
    try { await signOut(auth); navigate("/login"); }
    catch (e) { console.error(e); }
  };

  return (
    <div className="page-shell">
      {/* White rounded app card */}
      <div className="app-card">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          {/* Brand */}
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">🧱</div>
            <div className="sidebar-brand-text">
              <h3>Kaam</h3>
              <p>Recruiter Portal</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="sidebar-nav">
            {NAV.map(item => {
              const isActive = item.matchPrefix
                ? location.pathname.startsWith(item.matchPrefix)
                : location.pathname === item.path || location.pathname.startsWith(item.path + "/");
              return (
                <Link
                  key={item.path + item.name}
                  to={item.path}
                  className={`sidebar-link${isActive ? " active" : ""}`}
                >
                  <span className="icon">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="sidebar-link logout-link"
              style={{
                background: "none",
                border: "none",
                width: "100%",
                padding: "9px 12px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
                textAlign: "left"
              }}
            >
              <span className="icon">🚪</span>
              Logout
            </button>
          </nav>

          {/* User */}
          <div className="sidebar-user" style={{ cursor: "pointer" }} onClick={handleLogout} title="Sign Out">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <h4>{user?.contactName || "Recruiter"}</h4>
              <p>{user?.companyName || user?.email || ""}</p>
            </div>
          </div>
        </aside>

        {/* ── CONTENT ── */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

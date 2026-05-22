import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const DOTS = 6;

export default function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  useEffect(() => { if (user) navigate("/dashboard"); }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Login failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* Top title */}
      <div className="auth-top">
        <h2>Recruiter Login</h2>
        <p>Auth · Web Dashboard</p>
      </div>

      {/* Split card */}
      <div className="auth-card">
        {/* Left dark panel */}
        <div className="auth-left">
          <div className="auth-left-icon">🧱</div>
          <h2>Hire smarter with <span>AI-powered matching</span></h2>
          <p>Access thousands of verified workers. Let AI find your perfect candidates.</p>
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-dot">✓</div>
              AI match explanations
            </div>
            <div className="auth-feature">
              <div className="auth-feature-dot">✓</div>
              Skill gap analytics
            </div>
            <div className="auth-feature">
              <div className="auth-feature-dot">✓</div>
              Multilingual candidates
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="auth-right" style={{ display:"flex", flexDirection:"column", justifyContent:"center" }}>
          <h1>Welcome back</h1>
          <p style={{ color:"#6B7280", fontSize:13, marginBottom:28 }}>
            Log in to your recruiter account
          </p>
          <form onSubmit={handleLogin}>
            <div className="auth-field">
              <label>Business Email</label>
              <input type="email" placeholder="name@company.com" value={email}
                onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="primary"
              style={{ width:"100%", padding:"12px", fontSize:14, marginTop:8 }}>
              {loading ? "Logging in..." : "Log In →"}
            </button>
            <p style={{ textAlign:"center", marginTop:16, fontSize:13, color:"#6B7280" }}>
              Don't have an account?{" "}
              <Link to="/signup" style={{ fontWeight:700, color:"#E85D04" }}>Sign up</Link>
            </p>
          </form>
        </div>
      </div>

      {/* Bottom pagination */}
      <div className="auth-bottom">
        <div className="auth-dots">
          {Array.from({ length: DOTS }).map((_, i) => (
            <div key={i} className={`auth-dot${i === 1 ? " active" : ""}`} />
          ))}
        </div>
        <div className="auth-nav">
          <Link to="/signup">
            <button className="secondary" style={{ padding:"8px 20px" }}>← Prev</button>
          </Link>
          <button className="primary" style={{ padding:"8px 20px" }} disabled>Next →</button>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.log("LOGIN ERROR:", error);
      alert("Login failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100svh', padding: 20 }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 400, textAlign: 'left', borderTop: '4px solid var(--accent)', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            background: 'var(--accent-bg)', 
            border: '1px solid var(--accent-border)',
            fontSize: '24px',
            color: 'var(--accent)'
          }}>
            ✦
          </div>
        </div>
        
        <h1 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>Welcome Back</h1>
        <p style={{ textAlign: 'center', color: 'var(--text)', fontSize: 14, marginBottom: 32 }}>Log in to Setu Recruiter Platform</p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-h)' }}>Work Email</label>
            <input 
              type="email" 
              placeholder="name@company.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
 
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-h)' }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
 
          <button 
            type="submit" 
            disabled={loading}
            className="primary"
            style={{ 
              width: '100%',
              padding: '12px', 
              fontSize: 14, 
              fontWeight: 600,
              marginTop: 8,
              boxShadow: '0 4px 12px 0 rgba(232, 93, 4, 0.15)'
            }}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: 'var(--text)' }}>
          Don't have an account? <Link to="/signup" style={{ fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
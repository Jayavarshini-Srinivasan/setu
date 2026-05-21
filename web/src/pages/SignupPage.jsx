import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function SignupPage() {
  
  const [contactName, setContactName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // 1. Create User in Firebase Auth
      await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Call backend to create profile using Admin SDK (bypasses rules)
      const recruiterData = {
        role: "recruiter",
        companyName,
        contactName,
        email,
      };
      
      await API.post("/auth/onboard-recruiter", recruiterData);
      
      // Force a full reload to reset AuthContext state and cleanly load the dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("SIGNUP ERROR:", error);
      alert(error.response?.data?.error || error.message || "Signup failed");
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

        <h1 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>Create Account</h1>
        <p style={{ textAlign: 'center', color: 'var(--text)', fontSize: 14, marginBottom: 32 }}>Join as a Setu Recruiter</p>
        
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-h)' }}>Full Name</label>
            <input 
              type="text" 
              placeholder="Jaya Sharma" 
              value={contactName} 
              onChange={(e) => setContactName(e.target.value)} 
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-h)' }}>Company Name</label>
            <input 
              type="text" 
              placeholder="Acme Logistics" 
              value={companyName} 
              onChange={(e) => setCompanyName(e.target.value)} 
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-h)' }}>Work Email</label>
            <input 
              type="email" 
              placeholder="jaya@acme.com" 
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
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: 'var(--text)' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

export default function SignupPage() {
  const navigate = useNavigate();
  
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
      <div className="glass-card" style={{ width: '100%', maxWidth: 400, textAlign: 'left' }}>
        <h1 style={{ fontSize: 28, textAlign: 'center', marginBottom: 8 }}>Create Account</h1>
        <p style={{ textAlign: 'center', color: 'var(--text)', marginBottom: 24 }}>Join as a Setu Recruiter</p>
        
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>Full Name</label>
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
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>Company Name</label>
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
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>Work Email</label>
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
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>Password</label>
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
            style={{ 
              background: 'var(--accent)', 
              color: '#fff', 
              padding: '12px', 
              fontSize: 16, 
              marginTop: 8,
              boxShadow: '0 4px 14px 0 var(--accent-border)'
            }}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14 }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

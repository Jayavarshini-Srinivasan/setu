import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";
import API from "../services/api";

const DOTS = 6;

export default function SignupPage() {
  const [contactName, setContactName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail]             = useState("");
  const [phone, setPhone]             = useState("");
  const [companyType, setCompanyType] = useState("Startup");
  const [password, setPassword]       = useState("");
  const [loading, setLoading]         = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      const recruiterData = { role: "recruiter", companyName, contactName, email };
      await API.post("/auth/onboard-recruiter", recruiterData);
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("SIGNUP ERROR:", error);
      alert(error.response?.data?.error || error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell" style = {{paddingTop : "60px"}}>
      

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
        <div className="auth-right">
          <h1>Create recruiter account</h1>
          <form onSubmit={handleSignup}>
            <div className="auth-row">
              <div className="auth-field">
                <label>Full Name</label>
                <input type="text" placeholder="Full name" value={contactName}
                  onChange={e => setContactName(e.target.value)} required />
              </div>
              <div className="auth-field">
                <label>Company Name</label>
                <input type="text" placeholder="Company name" value={companyName}
                  onChange={e => setCompanyName(e.target.value)} required />
              </div>
            </div>
            <div className="auth-row">
              <div className="auth-field">
                <label>Business Email</label>
                <input type="email" placeholder="Business email" value={email}
                  onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="auth-field">
                <label>Phone Number</label>
                <input type="tel" placeholder="Phone number" value={phone}
                  onChange={e => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="auth-field">
              <label>Company Type</label>
              <select value={companyType} onChange={e => setCompanyType(e.target.value)}>
                <option>Startup</option>
                <option>SME</option>
                <option>Enterprise</option>
                <option>MNC</option>
              </select>
            </div>
            <div className="auth-field">
              <label>Password</label>
              <input type="password" placeholder="Minimum 8 characters" value={password}
                onChange={e => setPassword(e.target.value)} required minLength={8} />
            </div>
            <button type="submit" disabled={loading} className="primary"
              style={{ width:"100%", padding:"12px", fontSize:14, marginTop:8 }}>
              {loading ? "Creating account..." : "Create Recruiter Account →"}
            </button>
            <p style={{ textAlign:"center", marginTop:16, fontSize:13, color:"#6B7280" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ fontWeight:700, color:"#E85D04" }}>Sign in</Link>
            </p>
          </form>

          
        </div>
      </div>
    </div>
  );
}

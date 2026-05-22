import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { getRecruiterProfile, updateRecruiterProfile } from "../services/recruiterService";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [formData, setFormData] = useState({ companyName:"", contactName:"", email:"" });

  const fetchProfile = async () => {
    try {
      const uid = auth.currentUser.uid;
      const userData = await getRecruiterProfile(uid);
      setFormData({
        companyName: userData.companyName || "",
        contactName: userData.contactName || "",
        email: userData.email || "",
      });
    } catch (error) { alert("Failed to load profile"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const uid = auth.currentUser.uid;
      await updateRecruiterProfile(uid, {
        companyName: formData.companyName.trim(),
        contactName: formData.contactName.trim(),
      });
      alert("Profile updated successfully");
    } catch (error) { alert("Failed to update profile"); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;

  return (
    <div style={{ width:"100%" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ marginBottom:2 }}>Settings</h1>
        <p style={{ color:"#6B7280", fontSize:13, margin:0 }}>Manage your recruiter profile</p>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth:480 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label>Company Name</label>
            <input name="companyName" value={formData.companyName} onChange={handleChange} required />
          </div>
          <div>
            <label>Contact Name</label>
            <input name="contactName" value={formData.contactName} onChange={handleChange} required />
          </div>
          <div>
            <label>Email</label>
            <input type="email" value={formData.email} disabled
              style={{ background:"#F9F8F6", color:"#9CA3AF" }} />
          </div>
          <button type="submit" disabled={saving} className="primary"
            style={{ padding:"11px", marginTop:8 }}>
            {saving ? "Saving..." : "Save Changes →"}
          </button>
        </div>
      </form>
    </div>
  );
}
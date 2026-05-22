import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function EditJobPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [category, setCategory] = useState("labour");
  const [formData, setFormData] = useState({
    title:"", requiredSkills:"", location:"", salary:"",
    experienceRequired:"", description:""
  });

  const fetchJob = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/jobs/${jobId}`);
      setCategory(data.workerCategory || "labour");
      setFormData({
        title: data.title || "",
        requiredSkills: data.requiredSkills?.join(", ") || "",
        location: data.location || "",
        salary: data.salary || "",
        experienceRequired: data.experienceRequired || "",
        description: data.description || "",
      });
    } catch (error) { alert("Failed to load job"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJob(); }, [jobId]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        title: formData.title.trim(),
        workerCategory: category,
        requiredSkills: formData.requiredSkills.split(",").map(s => s.trim()).filter(Boolean),
        location: formData.location.trim(),
        salary: Number(formData.salary),
        experienceRequired: Number(formData.experienceRequired),
        description: formData.description.trim(),
      };
      await API.put(`/jobs/${jobId}`, payload);
      alert("Job updated successfully");
      navigate("/jobs/my-jobs");
    } catch (error) { alert("Failed to update job"); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner text="Loading job details..." />;

  return (
    <div style={{ width:"100%" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ marginBottom:2 }}>Edit Job</h1>
        <p style={{ color:"#6B7280", fontSize:13, margin:0 }}>Update job details and republish.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 32px" }}>
          {/* LEFT */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div><label>Job Title</label>
              <input name="title" value={formData.title} onChange={handleChange} required /></div>
            <div><label>Worker Category</label>
              <div className="toggle-group">
                <button type="button" className={`toggle-btn${category==="labour"?" active":""}`}
                  onClick={() => setCategory("labour")}>Labour</button>
                <button type="button" className={`toggle-btn${category==="professional"?" active":""}`}
                  onClick={() => setCategory("professional")}>Professional</button>
              </div></div>
            <div><label>Location</label>
              <input name="location" value={formData.location} onChange={handleChange} required /></div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div><label>Salary (₹)</label>
                <input type="number" name="salary" value={formData.salary} onChange={handleChange} required /></div>
              <div><label>Experience (yrs)</label>
                <input type="number" name="experienceRequired" value={formData.experienceRequired} onChange={handleChange} required /></div>
            </div>
          </div>
          {/* RIGHT */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div><label>Required Skills</label>
              <input name="requiredSkills" placeholder="Comma separated" value={formData.requiredSkills} onChange={handleChange} /></div>
            <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
              <label>Job Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={7} style={{ resize:"vertical", flex:1 }} />
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:12, marginTop:24 }}>
          <button type="button" className="secondary" style={{ flex:1, padding:"11px" }}
            onClick={() => navigate("/jobs/my-jobs")}>Cancel</button>
          <button type="submit" disabled={saving} className="primary" style={{ flex:1, padding:"11px" }}>
            {saving ? "Updating..." : "Update Job →"}
          </button>
        </div>
      </form>
    </div>
  );
}
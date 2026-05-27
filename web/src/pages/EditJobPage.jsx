import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { isRequiredString } from "../utils/validators";

const EXP_OPTIONS = ["Any", "0-2 yr", "2-5 yr", "5+ yr"];

export default function EditJobPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [category, setCategory]   = useState("labour");
  const [experience, setExperience] = useState("Any");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills]         = useState([]);
  const [salaryMin, setSalaryMin]   = useState("");
  const [salaryMax, setSalaryMax]   = useState("");

  const [formData, setFormData] = useState({
    title: "", location: "", description: "",
  });

  const fetchJob = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/jobs/${jobId}`);
      setCategory(data.workerCategory || "labour");
      setExperience(data.experienceRequired || "Any");
      setSkills(data.requiredSkills || []);
      setSalaryMin(data.salary?.toString() || "");
      setSalaryMax(data.salaryMax?.toString() || "");
      
      setFormData({
        title: data.title || "",
        location: data.location || "",
        description: data.description || "",
      });
    } catch (error) { alert("Failed to load job"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJob(); }, [jobId]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const addSkill = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const s = skillInput.trim();
      if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
      setSkillInput("");
    }
  };
  const removeSkill = (s) => setSkills(prev => prev.filter(x => x !== s));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (!isRequiredString(formData.title))    { alert("Job title is required"); return; }
      if (!isRequiredString(formData.location)) { alert("Location is required"); return; }

      const payload = {
        title:              formData.title.trim(),
        workerCategory:     category,
        requiredSkills:     skills,
        location:           formData.location.trim(),
        salary:             parseInt(salaryMin) || 0,
        salaryMax:          parseInt(salaryMax) || 0,
        experienceRequired: experience,
        description:        formData.description.trim(),
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
              </div>
            </div>
            
            <div><label>Location</label>
              <input name="location" value={formData.location} onChange={handleChange} required /></div>
            
            <div>
              <label>Experience Required</label>
              <div className="exp-group">
                {EXP_OPTIONS.map(opt => (
                  <button key={opt} type="button"
                    className={`exp-btn${experience===opt ? " active":""}`}
                    onClick={() => setExperience(opt)}>{opt}</button>
                ))}
              </div>
            </div>

            <div>
              <label>Salary Range</label>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <input type="number" placeholder="₹4,00,000" value={salaryMin}
                  onChange={e => setSalaryMin(e.target.value)} style={{ flex:1 }} />
                <span style={{ color:"#6B7280", fontSize:16, flexShrink:0 }}>–</span>
                <input type="number" placeholder="₹5,00,000" value={salaryMax}
                  onChange={e => setSalaryMax(e.target.value)} style={{ flex:1 }} />
              </div>
            </div>

          </div>
          
          {/* RIGHT */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <label>Required Skills</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:8 }}>
                {skills.map(s => (
                  <span key={s} className="skill-tag">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)}>×</button>
                  </span>
                ))}
              </div>
              <input
                placeholder="Add skill... (press Enter)"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={addSkill}
              />
            </div>
            
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


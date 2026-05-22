import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createJob } from "../services/jobsService";
import { isRequiredString, normalizeSkills } from "../utils/validators";

const EXP_OPTIONS = ["Any", "0-2 yr", "2-5 yr", "5+ yr"];

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [category, setCategory]   = useState("labour");
  const [experience, setExperience] = useState("Any");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills]         = useState([]);
  const [salaryMin, setSalaryMin]   = useState("");
  const [salaryMax, setSalaryMax]   = useState("");

  const [formData, setFormData] = useState({
    title: "", location: "", description: "",
  });

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

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
      setLoading(true);
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
        isDraft:            false,
        isActive:           true,
      };

      await createJob(payload);
      alert("Job created successfully!");
      navigate("/jobs/my-jobs");
    } catch (error) {
      alert(error.response?.data?.error || "Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      if (!isRequiredString(formData.title)) {
        alert("Job title is required to save a draft");
        return;
      }

      const payload = {
        title:              formData.title.trim(),
        workerCategory:     category,
        requiredSkills:     skills,
        location:           formData.location.trim() || "Remote",
        salary:             parseInt(salaryMin) || 0,
        salaryMax:          parseInt(salaryMax) || 0,
        experienceRequired: experience,
        description:        formData.description.trim() || "Draft job description.",
        isDraft:            true,
        isActive:           false,
      };

      await createJob(payload);
      alert("Draft saved successfully!");
      navigate("/jobs/my-jobs");
    } catch (error) {
      alert(error.response?.data?.error || "Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width:"100%" }}>
      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <h1 style={{ marginBottom:2 }}>Post a Job</h1>
        <p style={{ color:"#6B7280", fontSize:13, margin:0 }}>
          AI will auto-match your job to the best candidates.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 32px" }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {/* Job Title */}
            <div>
              <label>Job Title</label>
              <input name="title" placeholder="Accounts Executive"
                value={formData.title} onChange={handleChange} required />
            </div>

            {/* Worker Category */}
            <div>
              <label>Worker Category</label>
              <div className="toggle-group">
                <button type="button" className={`toggle-btn${category==="labour" ? " active" : ""}`}
                  onClick={() => setCategory("labour")}>Labour</button>
                <button type="button" className={`toggle-btn${category==="professional" ? " active" : ""}`}
                  onClick={() => setCategory("professional")}>Professional</button>
              </div>
            </div>

            {/* Location */}
            <div>
              <label>Location</label>
              <input name="location" placeholder="MG Road, Bangalore"
                value={formData.location} onChange={handleChange} required />
            </div>

            {/* Experience */}
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

            {/* Salary Range */}
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

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {/* Required Skills */}
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

            {/* Description */}
            <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
              <label>Job Description</label>
              <textarea name="description"
                placeholder="We are looking for an experienced..."
                value={formData.description} onChange={handleChange}
                rows={7}
                style={{ resize:"vertical", flex:1 }} />
            </div>

            {/* AI Estimate banner */}
            <div style={{ background:"#EEF2FF", border:"1.5px solid #A5B4FC", borderRadius:10, padding:"12px 16px" }}>
              <p style={{ margin:0, fontSize:12, fontWeight:700, color:"#6366F1" }}>
                🤖 AI Estimate: ~47 matching candidates found
              </p>
              <p style={{ margin:"4px 0 0", fontSize:11, color:"#6B7280" }}>
                Top match score: 94% · Location match: Bangalore region
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display:"flex", gap:12, marginTop:24 }}>
          <button type="button" disabled={loading} className="secondary"
            style={{ flex:1, padding:"11px" }}
            onClick={handleSaveDraft}>Save Draft</button>
          <button type="submit" disabled={loading} className="primary"
            style={{ flex:1, padding:"11px" }}>
            {loading ? "Publishing..." : "Publish Job →"}
          </button>
        </div>
      </form>
    </div>
  );
}
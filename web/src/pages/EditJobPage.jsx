import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import API from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function EditJobPage() {
  const { jobId } =
    useParams();

  const navigate =
    useNavigate();

  /*
    STATES
  */
  const [loading,
    setLoading] =
    useState(true);

  const [saving,
    setSaving] =
    useState(false);

  const [formData,
    setFormData] =
    useState({
      title: "",

      workerCategory:
        "labour",

      requiredSkills:
        "",

      location: "",

      salary: "",

      experienceRequired:
        "",

      description: "",
    });

  const fetchJob =
    async () => {
      try {
        setLoading(true);

        const { data } =
          await API.get(
            `/jobs/${jobId}`
          );

        setFormData({
          title:
            data.title || "",

          workerCategory:
            data.workerCategory ||
            "labour",

          requiredSkills:
            data.requiredSkills
              ?.join(", ") ||
            "",

          location:
            data.location || "",

          salary:
            data.salary || "",

          experienceRequired:
            data.experienceRequired || "",

          description:
            data.description || "",
        });
      } catch (error) {
        console.log(error);

        alert(
          "Failed to load job"
        );
      } finally {
        setLoading(false);
      }
    };

  /*
    FETCH JOB
  */
  useEffect(() => {
    fetchJob();
  }, [jobId]);

  /*
    INPUT CHANGE
  */
  const handleChange =
    (e) => {
      const {
        name,
        value,
      } = e.target;

      setFormData(
        (prev) => ({
          ...prev,

          [name]:
            value,
        })
      );
    };

  /*
    UPDATE JOB
  */
  const handleSubmit =
    async (e) => {
      e.preventDefault();

      try {
        setSaving(true);

        const payload = {
          title:
            formData.title.trim(),

          workerCategory:
            formData.workerCategory,

          requiredSkills:
            formData.requiredSkills
              .split(",")

              .map((skill) =>
                skill.trim()
              )

              .filter(
                Boolean
              ),

          location:
            formData.location.trim(),

          salary:
            Number(
              formData.salary
            ),

          experienceRequired:
            Number(
              formData
                .experienceRequired
            ),

          description:
            formData.description.trim(),
        };

        await API.put(
          `/jobs/${jobId}`,
          payload
        );

        alert(
          "Job updated successfully"
        );

        navigate(
          "/jobs/my-jobs"
        );
      } catch (error) {
        console.log(error);

        alert(
          "Failed to update job"
        );
      } finally {
        setSaving(false);
      }
    };

  /*
    LOADING
  */
  if (loading) {
    return (
      <LoadingSpinner text="Loading job details..." />
    );
  }

  return (
    <div className="create-job-page" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <h2 className="create-job-heading" style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '700', color: 'var(--text-h)' }}>
        Edit Job Details
      </h2>

      <form
        className="create-job-form card"
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          background: "var(--bg-card)",
          padding: "32px",
          borderRadius: "16px",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow)"
        }}
      >
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--text-h)' }}>Job Title</label>
          <input
            type="text"
            name="title"
            placeholder="e.g. Senior Warehouse Operator"
            value={formData.title}
            onChange={handleChange}
            required
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--text-h)' }}>Category</label>
          <select
            name="workerCategory"
            value={formData.workerCategory}
            onChange={handleChange}
            style={{ width: '100%', boxSizing: 'border-box' }}
          >
            <option value="labour">Labour</option>
            <option value="professional">Professional</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--text-h)' }}>Required Skills</label>
          <input
            type="text"
            name="requiredSkills"
            placeholder="e.g. Forklift Driving, Inventory Management (comma separated)"
            value={formData.requiredSkills}
            onChange={handleChange}
            required
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--text-h)' }}>Location</label>
          <input
            type="text"
            name="location"
            placeholder="e.g. Sector 62, Noida"
            value={formData.location}
            onChange={handleChange}
            required
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--text-h)' }}>Salary (Monthly, ₹)</label>
            <input
              type="number"
              name="salary"
              placeholder="e.g. 18000"
              value={formData.salary}
              onChange={handleChange}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--text-h)' }}>Experience Required (Years)</label>
            <input
              type="number"
              name="experienceRequired"
              placeholder="e.g. 2"
              value={formData.experienceRequired}
              onChange={handleChange}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--text-h)' }}>Job Description</label>
          <textarea
            name="description"
            placeholder="Describe job responsibilities, shift details, benefits, etc."
            value={formData.description}
            onChange={handleChange}
            required
            rows={5}
            style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="primary"
          style={{
            padding: "12px",
            fontSize: "14px",
            fontWeight: "600",
            marginTop: "8px",
            boxShadow: "0 4px 12px 0 rgba(232, 93, 4, 0.15)"
          }}
        >
          {saving ? "Updating..." : "Update Job Posting"}
        </button>
      </form>
    </div>
  );
}
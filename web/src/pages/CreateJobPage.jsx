import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createJob,} from "../services/jobsService";
import { isRequiredString,normalizeSkills,} from "../utils/validators";
import "../styles/CreateJobPage.css";

export default function CreateJobPage() {
  const navigate =
    useNavigate();

  const [loading,
    setLoading] =
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

  /*
    HANDLE INPUT CHANGE
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
    CREATE JOB
  */
  const handleSubmit =
    async (e) => {
      e.preventDefault();

      try {
        setLoading(true);

        /*
          CLEAN PAYLOAD
        */
       if (
  !isRequiredString(
    formData.title
  )
) {
  alert(
    "Job title is required"
  );

  return;
}

        if (
          !isRequiredString(
            formData.location
          )
        ) {
          alert(
            "Location is required"
          );

          return;
        }
        const payload = {
          title:
            formData.title.trim(),

          workerCategory:
            formData.workerCategory,

          requiredSkills:
          normalizeSkills(
            formData.requiredSkills
          ),

          location:
            formData.location.trim(),

          /*
            STORE NUMERIC
            VALUE
          */
          salary:
            parseInt(
              formData.salary
            ),

          /*
            STORE NUMERIC
            VALUE
          */
          experienceRequired:
            parseInt(
              formData
                .experienceRequired
            ),

          description:
            formData.description.trim(),
        };

        /*
          VALIDATION
        */
        if (
          isNaN(
            payload.salary
          )
        ) {
          alert(
            "Salary must be a number"
          );

          return;
        }

        if (
          isNaN(
            payload
              .experienceRequired
          )
        ) {
          alert(
            "Experience must be a number"
          );

          return;
        }

        /*
          API REQUEST
        */
        await createJob(payload);

        alert(
          "Job created successfully!"
        );

        navigate(
          "/jobs/my-jobs"
        );
      } catch (error) {
        console.error(
          error
        );

        console.log(
  error.response?.data
);

alert(
  error.response?.data?.error ||
  "Failed to create job"
);
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="create-job-page" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <h2 className="create-job-heading" style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '700', color: 'var(--text-h)' }}>
        Create a New Job
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
          disabled={loading}
          className="primary"
          style={{
            padding: "12px",
            fontSize: "14px",
            fontWeight: "600",
            marginTop: "8px",
            boxShadow: "0 4px 12px 0 rgba(232, 93, 4, 0.15)"
          }}
        >
          {loading ? "Creating..." : "Create Job Posting"}
        </button>
      </form>
    </div>
  );
}

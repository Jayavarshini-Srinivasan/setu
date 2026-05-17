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
    <div className="create-job-page">
      <h2 className="create-job-heading">
        Create a New Job
      </h2>

      <form

      className="create-job-form"
        onSubmit={
          handleSubmit
        }
        style={{
          display: "flex",

          flexDirection:
            "column",

          gap: "15px",
        }}
      >
        <input
          type="text"
          name="title"
          placeholder="Job Title"
          value={
            formData.title
          }
          onChange={
            handleChange
          }
          required
          style={{
            padding:
              "10px",

            borderRadius:
              "4px",

            border:
              "1px solid #ccc",
          }}
        />

        <select
          name="workerCategory"
          value={
            formData.workerCategory
          }
          onChange={
            handleChange
          }
          style={{
            padding:
              "10px",

            borderRadius:
              "4px",

            border:
              "1px solid #ccc",
          }}
        >
          <option value="labour">
            Labour
          </option>

          <option value="professional">
            Professional
          </option>
        </select>

        <input
          type="text"
          name="requiredSkills"
          placeholder="Required Skills (comma separated)"
          value={
            formData.requiredSkills
          }
          onChange={
            handleChange
          }
          required
          style={{
            padding:
              "10px",

            borderRadius:
              "4px",

            border:
              "1px solid #ccc",
          }}
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={
            formData.location
          }
          onChange={
            handleChange
          }
          required
          style={{
            padding:
              "10px",

            borderRadius:
              "4px",

            border:
              "1px solid #ccc",
          }}
        />

        <input
          type="number"
          name="salary"
          placeholder="Salary (Example: 15000)"
          value={
            formData.salary
          }
          onChange={
            handleChange
          }
          required
          style={{
            padding:
              "10px",

            borderRadius:
              "4px",

            border:
              "1px solid #ccc",
          }}
        />

        <input
          type="number"
          name="experienceRequired"
          placeholder="Experience Required (Example: 2)"
          value={
            formData
              .experienceRequired
          }
          onChange={
            handleChange
          }
          required
          style={{
            padding:
              "10px",

            borderRadius:
              "4px",

            border:
              "1px solid #ccc",
          }}
        />

        <textarea
          name="description"
          placeholder="Job Description"
          value={
            formData.description
          }
          onChange={
            handleChange
          }
          required
          rows={5}
          style={{
            padding:
              "10px",

            borderRadius:
              "4px",

            border:
              "1px solid #ccc",
          }}
        />

        <button
          type="submit"
          disabled={
            loading
          }
          style={{
            padding:
              "12px",

            backgroundColor:
              "#2ecc71",

            color:
              "white",

            border:
              "none",

            borderRadius:
              "4px",

            cursor:
              "pointer",

            fontWeight:
              "bold",
          }}
        >
          {loading
            ? "Creating..."
            : "Create Job"}
        </button>
      </form>
    </div>
  );
}
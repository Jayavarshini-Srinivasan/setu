import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import API from "../services/api";

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
      <div>
        Loading job...
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth:
          "600px",

        margin:
          "0 auto",
      }}
    >
      <h2>
        Edit Job
      </h2>

      <form
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
        />

        <select
          name="workerCategory"
          value={
            formData.workerCategory
          }
          onChange={
            handleChange
          }
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
          placeholder="Skills"
          value={
            formData.requiredSkills
          }
          onChange={
            handleChange
          }
          required
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
        />

        <input
          type="number"
          name="salary"
          placeholder="Salary"
          value={
            formData.salary
          }
          onChange={
            handleChange
          }
          required
        />

        <input
          type="number"
          name="experienceRequired"
          placeholder="Experience Required"
          value={
            formData
              .experienceRequired
          }
          onChange={
            handleChange
          }
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          rows={5}
          value={
            formData.description
          }
          onChange={
            handleChange
          }
          required
        />

        <button
          type="submit"
          disabled={saving}
        >
          {saving
            ? "Updating..."
            : "Update Job"}
        </button>
      </form>
    </div>
  );
}
import {
  useEffect,
  useState,
} from "react";


import {
  auth,
} from "../firebase";

import {
  getRecruiterProfile,
  updateRecruiterProfile,
} from "../services/recruiterService";

import LoadingSpinner from "../components/LoadingSpinner";

import "../styles/ProfilePage.css";

export default function ProfilePage() {
  const [loading,
    setLoading] =
    useState(true);

  const [saving,
    setSaving] =
    useState(false);

  const [formData,
    setFormData] =
    useState({
      companyName: "",

      contactName: "",

      email: "",
    });

  /*
    FETCH PROFILE
  */
  useEffect(() => {
    fetchProfile();
  }, []);

const fetchProfile =
  async () => {
    try {
      const uid =
        auth.currentUser.uid;

      const userData =
        await getRecruiterProfile(
          uid
        );

      setFormData({
        companyName:
          userData.companyName ||
          "",

        contactName:
          userData.contactName ||
          "",

        email:
          userData.email ||
          "",
      });
    } catch (error) {
      console.log(error);

      alert(
        error.message ||
        "Failed to load recruiter profile"
      );
    } finally {
      setLoading(false);
    }
  };
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
    UPDATE PROFILE
  */
const handleSubmit =
  async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const uid =
        auth.currentUser.uid;

      await updateRecruiterProfile(
        uid,
        {
          companyName:
            formData.companyName.trim(),

          contactName:
            formData.contactName.trim(),
        }
      );

      alert(
        "Profile updated successfully"
      );
    } catch (error) {
      console.log(error);

      alert(
        error.message ||
        "Failed to update profile"
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
      <LoadingSpinner
        text="Loading profile..."
      />
    );
  }

  return (
    <div className="profile-page">
      <h2 className="profile-heading">
        Recruiter Profile
      </h2>

      <form
        onSubmit={
          handleSubmit
        }
        className="profile-form"
      >
        <div className="form-group">
          <label>
            Company Name
          </label>

          <input
            type="text"
            name="companyName"
            value={
              formData.companyName
            }
            onChange={
              handleChange
            }
            required
          />
        </div>

        <div className="form-group">
          <label>
            Contact Name
          </label>

          <input
            type="text"
            name="contactName"
            value={
              formData.contactName
            }
            onChange={
              handleChange
            }
            required
          />
        </div>

        <div className="form-group">
          <label>
            Email
          </label>

          <input
            type="email"
            value={
              formData.email
            }
            disabled
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="save-button"
        >
          {saving
            ? "Saving..."
            : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
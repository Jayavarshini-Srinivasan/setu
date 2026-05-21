import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";
import EmptyState from "../components/EmptyState";
import "../styles/MyJobsPage.css";
import {getRecruiterJobs, toggleJobStatus as toggleJobStatusService,} from "../services/jobsService";
import JobCard from "../components/JobCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function MyJobsPage() {
  const [jobs,
    setJobs] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  const fetchJobs =
    async () => {
      try {
        setLoading(true);

        const data = await getRecruiterJobs();

        setJobs(data);
      } catch (error) {
        console.error(
          "Failed to fetch jobs",
          error
        );

        alert(
          "Failed to load recruiter jobs"
        );
      } finally {
        setLoading(false);
      }
    };

  /*
    FETCH JOBS
  */
  useEffect(() => {
    fetchJobs();
  }, []);

  /*
    TOGGLE ACTIVE STATUS
  */
  const toggleStatus =
    async (
      jobId,
      currentStatus
    ) => {
      try {
        /*
          OPTIMISTIC UPDATE
        */
        setJobs((prev) =>
          prev.map((job) =>
            job.jobId ===
            jobId
              ? {
                  ...job,

                  isActive:
                    !currentStatus,
                }
              : job
          )
        );

        /*
          API UPDATE
        */
        await toggleJobStatusService(
          jobId,
          !currentStatus
        );
      } catch (error) {
        console.error(
          "Failed to update status",
          error
        );

        alert(
          "Failed to update job status"
        );

        /*
          ROLLBACK
        */
        fetchJobs();
      }
    };

  /*
    LOADING
  */
 if (loading) {
  return (
    <LoadingSpinner
      text="Loading jobs..."
    />
  );
}

 return (
  <div className="my-jobs-page">
    <div className="my-jobs-header">
      <h2>
        My Posted Jobs
      </h2>

      <Link
        to="/jobs/create"
        className="create-job-button"
      >
        + Create New Job
      </Link>
    </div>

    {jobs.length === 0 ? (
      <EmptyState
        title="No Jobs Found"
        description="You have not posted any jobs yet."
      />
    ) : (
      <div className="jobs-list">
        {jobs.map((job) => (
          <JobCard
            key={job.jobId}
            job={job}
            toggleStatus={
              toggleStatus
            }
          />
        ))}
      </div>
    )}
  </div>
);
}
import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  Link,
} from "react-router-dom";

import EmptyState from "../components/EmptyState";
import { getApplicantsForJob, updateApplicationStatus as updateApplicationStatusService,} from "../services/applicationsService";
import ApplicantCard from "../components/ApplicantCard";
import {handleError,} from "../utils/errorHandler";
import "../styles/ApplicantsPage.css";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";

export default function ApplicantsPage() {
  const { jobId } =
    useParams();


  /*
    TRACK STATUS UPDATE
    PER APPLICATION
  */
  const [
    updatingId,
    setUpdatingId,
  ] = useState(null);

  /*
    FETCH APPLICANTS
  */
  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const fetchApplicants =
    async () => {
      try {
        setLoading(true);

        const data =
        await getApplicantsForJob(
          jobId
        );

        setApplicants(data);
      } catch (error) {
        setError(
          handleError(error)
        );
      } finally {
        setLoading(false);
      }
    };

  /*
    UPDATE STATUS
  */
  const updateStatus =
    async (
      applicationId,
      status
    ) => {
      try {
        setUpdatingId(
          applicationId
        );

        /*
          OPTIMISTIC UPDATE
        */
        setApplicants(
          (prev) =>
            prev.map(
              (app) =>
                app.applicationId ===
                applicationId
                  ? {
                      ...app,

                      status,
                    }
                  : app
            )
        );

        /*
          API UPDATE
        */
        await updateApplicationStatusService(
          applicationId,
          status
        );
      } catch (error) {
        alert(
          handleError(error)
        );

        /*
          ROLLBACK
        */
        fetchApplicants();
      } finally {
        setUpdatingId(
          null
        );
      }
    };

  /*
    FORMAT DATE
  */
  const formatDate =
    (dateValue) => {
      if (!dateValue)
        return "Unknown Date";

      /*
        FIRESTORE TIMESTAMP
      */
      if (
        dateValue._seconds
      ) {
        return new Date(
          dateValue._seconds *
            1000
        ).toLocaleDateString();
      }

      return new Date(
        dateValue
      ).toLocaleDateString();
    };



  /*
    LOADING
  */
 if (loading) {
  return (
    <LoadingSpinner
      text="Loading applicants..."
    />
  );
}
if (error) {
  return (
    <ErrorState
      message="Failed to load applicants"
    />
  );
}
 return (
  <div className="applicants-page">
    <Link
      to="/jobs/my-jobs"
      className="back-link"
    >
      &larr; Back to
      My Jobs
    </Link>

    <h2 className="applicants-heading">
      Applicants
    </h2>

    {applicants.length === 0 ? (
      <EmptyState
        title="No Applicants Yet"
        description="No workers have applied for this job."
      />
    ) : (
      <div className="applicants-list">
        {applicants.map(
          (app) => (
            <ApplicantCard
              key={
                app.applicationId
              }
              app={app}
              updatingId={
                updatingId
              }
              updateStatus={
                updateStatus
              }
              formatDate={
                formatDate
              }
              
            />
          )
        )}
      </div>
    )}
  </div>
);
}
import API from "../services/api";
import { auth } from "../services/firebase";
import { getJobId } from "./jobId";

export class ApplyJobError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function getApiErrorMessage(error) {
  const data = error?.response?.data;
  return (
    data?.error ||
    data?.message ||
    error?.message ||
    "Could not submit your application. Please try again."
  );
}

/**
 * Submit an application for a matched job.
 * Returns { jobId, alreadyApplied } on success.
 */
export async function submitJobApplication(job) {
  const jobId = getJobId(job);
  if (!jobId) {
    throw new ApplyJobError(
      "MISSING_JOB_ID",
      "This job is missing an id and cannot be applied to."
    );
  }

  const user = auth.currentUser;
  if (!user) {
    throw new ApplyJobError("NOT_AUTHENTICATED", "Please sign in to apply.");
  }

  const token = await user.getIdToken();
  const workerId = user.uid;

  try {
    await API.post(
      "/apply",
      {
        workerId,
        jobId,
        matchScore: job.matchScore ?? 0,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { jobId, alreadyApplied: false };
  } catch (error) {
    const msg = getApiErrorMessage(error);

    if (/already applied/i.test(msg)) {
      return { jobId, alreadyApplied: true };
    }

    if (/job not found/i.test(msg) || /not found/i.test(msg)) {
      throw new ApplyJobError(
        "JOB_NOT_FOUND",
        "This job is no longer available. Pull to refresh your matches."
      );
    }

    throw new ApplyJobError("APPLY_FAILED", msg);
  }
}

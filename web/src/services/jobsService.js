import API from "./api";

/*
  CREATE JOB
*/
export async function createJob(
  jobData
) {
  try {
    const response =
      await API.post(
        "/jobs",
        jobData
      );

    return response.data;
  } catch (error) {
    console.log(error);

    throw error;
  }
}

/*
  GET RECRUITER JOBS
*/
export async function getRecruiterJobs() {
  try {
    const response =
      await API.get(
        "/jobs/recruiter"
      );

    return response.data;
  } catch (error) {
    console.log(error);

    throw error;
  }
}

/*
  GET SINGLE JOB
*/
export async function getSingleJob(
  jobId
) {
  try {
    const response =
      await API.get(
        `/jobs/${jobId}`
      );

    return response.data;
  } catch (error) {
    console.log(error);

    throw error;
  }
}

/*
  UPDATE JOB
*/
export async function updateJob(
  jobId,
  updatedData
) {
  try {
    const response =
      await API.put(
        `/jobs/${jobId}`,
        updatedData
      );

    return response.data;
  } catch (error) {
    console.log(error);

    throw error;
  }
}

/*
  TOGGLE JOB STATUS
*/
export async function toggleJobStatus(
  jobId,
  isActive
) {
  try {
    const response =
      await API.patch(
        `/jobs/${jobId}/status`,
        {
          isActive,
        }
      );

    return response.data;
  } catch (error) {
    console.log(error);

    throw error;
  }
}

/*
  DELETE JOB
*/
export async function deleteJob(jobId) {
  try {
    const response = await API.delete(`/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
import API from "./api";

/*
  GET APPLICANTS
  FOR A JOB
*/
export async function getApplicantsForJob(
  jobId
) {
  try {
    const response =
      await API.get(
        `/apply/job/${jobId}`
      );

    return response.data;
  } catch (error) {
    console.log(error);

    throw error;
  }
}

/*
  UPDATE APPLICATION STATUS
*/
export async function updateApplicationStatus(
  applicationId,
  status
) {
  try {
    const response =
      await API.patch(
        `/apply/${applicationId}/status`,
        {
          status,
        }
      );

    return response.data;
  } catch (error) {
    console.log(error);

    throw error;
  }
}
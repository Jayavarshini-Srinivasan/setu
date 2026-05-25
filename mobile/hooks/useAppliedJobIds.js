import { useAppliedJobs } from "../context/AppliedJobsContext";

/** @deprecated Use useAppliedJobs from AppliedJobsContext */
export default function useAppliedJobIds() {
  return useAppliedJobs();
}

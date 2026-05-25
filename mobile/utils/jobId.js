/** Canonical Firestore job document id from a match/job object. */
export function getJobId(job) {
  if (!job) return "";
  const id = job.jobId ?? job.id ?? job._id;
  return id != null ? String(id) : "";
}

export function isJobApplied(job, appliedJobIds) {
  const id = getJobId(job);
  if (!id || !appliedJobIds) return false;
  if (appliedJobIds instanceof Set) return appliedJobIds.has(id);
  return Boolean(appliedJobIds[id]);
}

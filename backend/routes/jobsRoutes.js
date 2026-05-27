const express =
  require("express");

const router =
  express.Router();

/*
  CONTROLLER
*/
const {
  createJob,
  getRecruiterJobs,
  toggleJobStatus,
  getSingleJob,
  updateJob,
  deleteJob,
} = require(
  "../controllers/jobController"
);
const authMiddleware =
  require(
    "../middleware/authMiddleware"
  );

  const recruiterMiddleware =
  require(
    "../middleware/recruiterMiddleware"
  );

/*
  ROUTE
*/
router.post(
  "/",
  authMiddleware,
  recruiterMiddleware,
  createJob
);

router.get(
  "/recruiter",
  authMiddleware,
  recruiterMiddleware,
  getRecruiterJobs
);

router.patch(
  "/:jobId/status",
  authMiddleware,
  recruiterMiddleware,
  toggleJobStatus
);

router.get(
  "/:jobId",
  authMiddleware,
  recruiterMiddleware,
  getSingleJob
);

router.put(
  "/:jobId",
  authMiddleware,
  recruiterMiddleware,
  updateJob
);

router.delete(
  "/:jobId",
  authMiddleware,
  recruiterMiddleware,
  deleteJob
);

module.exports =
  router;
const express =
  require("express");

const router =
  express.Router();

const {
  applyToJob,
  getApplicantsForJob,
  updateApplicationStatus,
  getApplicationById,
} = require(
  "../controllers/applicationController"
);

const  verifyToken = require(
  "../middleware/authMiddleware"
);

const recruiterMiddleware =
  require(
    "../middleware/recruiterMiddleware"
  );

/*
  WORKER APPLY
*/
router.post(
  "/",
  verifyToken,
  applyToJob
);

/*
  RECRUITER VIEW APPLICANTS
*/
router.get(
  "/job/:jobId",

  verifyToken,

  recruiterMiddleware,

  getApplicantsForJob
);

/*
  RECRUITER UPDATE APPLICATION
*/
router.patch(
  "/:applicationId/status",
  verifyToken,
  recruiterMiddleware,
  updateApplicationStatus
);

/*
  GET APPLICATION BY ID
*/
router.get(
  "/:applicationId",
  verifyToken,
  getApplicationById
);

module.exports = router;
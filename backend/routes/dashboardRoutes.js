const express =
  require("express");

const router =
  express.Router();

const {
  getDashboardStats,
} = require(
  "../controllers/dashboardController"
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
  DASHBOARD STATS
*/
router.get(
  "/stats",
  authMiddleware,
  recruiterMiddleware,
  getDashboardStats
);

module.exports =
  router;
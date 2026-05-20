const express = require("express");
const router = express.Router();
const { getRecruiterInsights } = require("../controllers/insightsController");
const verifyToken = require("../middleware/authMiddleware");

/*
  GET INSIGHTS
*/
router.get("/", verifyToken, getRecruiterInsights);

module.exports = router;

const express = require("express");

const router = express.Router();

const {
  matchJobs,
} = require("../controllers/matchController");

router.post("/", matchJobs);

module.exports = router;
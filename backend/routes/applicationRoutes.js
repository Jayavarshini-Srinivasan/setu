const express = require("express");

const router = express.Router();

const {
  applyToJob,
} = require("../controllers/applicationController");

router.post("/", applyToJob);

module.exports = router;
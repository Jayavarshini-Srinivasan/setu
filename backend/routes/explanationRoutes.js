const express = require("express");

const router = express.Router();

const {
  explainMatch,
} = require("../controllers/explanationController");

router.post("/", explainMatch);

module.exports = router;
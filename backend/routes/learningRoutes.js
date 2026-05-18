const express =
  require("express");

const router =
  express.Router();

const {
  getLearningPath,
} = require(
  "../controllers/learningController"
);

router.post(
  "/path",
  getLearningPath
);

module.exports =
  router;
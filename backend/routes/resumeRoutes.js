const express =
  require("express");

const router =
  express.Router();

const {
  buildResume,
} = require(
  "../controllers/resumeController"
);

/*
  GENERATE RESUME
*/
router.post(
  "/generate",
  buildResume
);

module.exports =
  router;
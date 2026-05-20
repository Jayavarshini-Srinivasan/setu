const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const {signup, getProfile, onboardRecruiter} = require("../controllers/authController");

router.post("/signup", signup);
router.post("/onboard-recruiter", authMiddleware, onboardRecruiter);
router.get("/profile", authMiddleware, getProfile);

module.exports = router;
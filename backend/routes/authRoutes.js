const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const {signup, getProfile} = require("../controllers/authController");

router.post("/signup", signup);
router.get("/profile", authMiddleware, getProfile);

module.exports = router;
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getNotifications, markAsRead, markAllAsRead } = require("../controllers/notificationsController");

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.put("/read-all", authMiddleware, markAllAsRead);
router.put("/:id/read", authMiddleware, markAsRead);

module.exports = router;

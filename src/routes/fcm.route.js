/**
 * FCM Routes
 * API endpoints for FCM token management
 */

const express = require("express");
const router = express.Router();
const fcmController = require("../controllers/fcm.controller");
const verifyToken = require("../middlewares/verifyToken");

// Register FCM token
router.post("/token", verifyToken, fcmController.registerToken);

// Unregister single FCM token
router.delete("/token", verifyToken, fcmController.unregisterToken);

// Unregister all FCM tokens (logout from all devices)
router.delete("/tokens", verifyToken, fcmController.unregisterAllTokens);

module.exports = router;

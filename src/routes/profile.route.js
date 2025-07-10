const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const verifyToken = require('../middlewares/verifyToken');

// Cập nhật profile
router.post('/profile', verifyToken, profileController.getProfile);
router.post('/profile/update', verifyToken, profileController.updateProfile);

module.exports = router;
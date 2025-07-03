const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');

// Cập nhật profile
router.post('/profile/update', profileController.updateProfile);

module.exports = router;
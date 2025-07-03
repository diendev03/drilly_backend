const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');

// Cập nhật profile
router.post('/user/profile/update', profileController.updateProfile);

module.exports = router;
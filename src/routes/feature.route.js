const express = require('express');
const router = express.Router();
const featureController = require('../controllers/feature.controller');
const verifyToken = require('../middlewares/verifyToken');

// Public routes (if any) or protected
// Getting available features might be public, but usually protected in this app context
router.get('/available', featureController.getAvailableFeatures);

// User specific routes - require authentication
router.get('/user', verifyToken, featureController.getUserFeatures);
router.post('/toggle', verifyToken, featureController.toggleFeature);

module.exports = router;

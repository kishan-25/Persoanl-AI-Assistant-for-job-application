
// backend/routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const { 
  trackJobApplication,
  getUserApplications
} = require('../controllers/applicationController');
const { protect } = require('../middlewares/authMiddleware');

// All routes are protected
router.post('/', protect, trackJobApplication);
router.get('/', protect, getUserApplications);

module.exports = router;
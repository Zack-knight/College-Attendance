const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getDashboardData } = require('../controllers/dashboard');

// Get dashboard data (protected route)
router.get('/', auth, getDashboardData);

module.exports = router; 
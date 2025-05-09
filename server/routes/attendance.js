const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance } = require('../controllers/attendance');
const auth = require('../middleware/auth');

// Only teachers can mark attendance
router.post('/mark', auth(['teacher', 'admin']), markAttendance);

// Admins and teachers can view attendance records
router.get('/records', auth(['admin', 'teacher', 'student']), getAttendance);

module.exports = router;
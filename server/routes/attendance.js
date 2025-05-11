const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance, getAttendanceSummary } = require('../controllers/attendance');
const auth = require('../middleware/auth');

// Only teachers can mark attendance
router.post('/mark', auth(['teacher', 'admin']), markAttendance);

// Admins and teachers can view attendance records
router.get('/records', auth(['admin', 'teacher', 'student']), getAttendance);

router.get('/summary', auth(['admin', 'teacher', 'student']), getAttendanceSummary);

module.exports = router;
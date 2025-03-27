const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const { auth, isAdmin, isTeacher, isStudent, isAdminOrTeacher } = require('../middleware/auth');
const attendanceController = require('../controllers/attendance');

// Validation middleware
const sessionValidation = [
  body('courseId').isMongoId().withMessage('Invalid course ID'),
  body('startTime').isISO8601().withMessage('Invalid start time'),
  body('endTime').isISO8601().withMessage('Invalid end time'),
  body('gracePeriodMinutes').optional().isInt({ min: 0, max: 60 }).withMessage('Grace period must be between 0 and 60 minutes')
];

const reportValidation = [
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date')
];

// Routes for teachers
router.post('/session', 
  auth, 
  isTeacher,
  sessionValidation,
  attendanceController.createSession
);

router.put('/session/:sessionId/close',
  auth,
  isTeacher,
  param('sessionId').isMongoId().withMessage('Invalid session ID'),
  attendanceController.closeSession
);

router.get('/course/:courseId/sessions',
  auth,
  isTeacher,
  param('courseId').isMongoId().withMessage('Invalid course ID'),
  attendanceController.getActiveSessions
);

// Routes for students
router.post('/session/:sessionId/mark',
  auth,
  isStudent,
  param('sessionId').isMongoId().withMessage('Invalid session ID'),
  attendanceController.markAttendance
);

// Routes for both teachers and students
router.get('/session/:sessionId',
  auth,
  param('sessionId').isMongoId().withMessage('Invalid session ID'),
  attendanceController.getSessionDetails
);

// Routes for teachers and admins
router.get('/course/:courseId/report',
  auth,
  isAdminOrTeacher,
  param('courseId').isMongoId().withMessage('Invalid course ID'),
  reportValidation,
  attendanceController.getAttendanceReport
);

module.exports = router;
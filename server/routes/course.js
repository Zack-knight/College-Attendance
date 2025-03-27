const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const courseController = require('../controllers/course');
const { auth, isAdmin, isTeacher, isStudent, isAdminOrTeacher } = require('../middleware/auth');

// Validation middleware
const courseValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Course name is required'),
  body('code')
    .trim()
    .matches(/^[A-Z0-9]{3,10}$/)
    .withMessage('Course code must be 3-10 characters long and contain only uppercase letters and numbers'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('schedule.day')
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
    .withMessage('Invalid day'),
  body('schedule.startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid start time format'),
  body('schedule.endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid end time format'),
  body('schedule.room')
    .trim()
    .notEmpty()
    .withMessage('Room is required'),
  body('semester')
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be between 1 and 8'),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),
  body('maxStudents')
    .isInt({ min: 1 })
    .withMessage('Maximum students must be at least 1')
];

const updateCourseValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Course name cannot be empty'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('schedule.day')
    .optional()
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
    .withMessage('Invalid day'),
  body('schedule.startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid start time format'),
  body('schedule.endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid end time format'),
  body('schedule.room')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Room cannot be empty'),
  body('semester')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be between 1 and 8'),
  body('department')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Department cannot be empty'),
  body('maxStudents')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum students must be at least 1'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const enrollStudentValidation = [
  body('courseId')
    .isMongoId()
    .withMessage('Invalid course ID'),
  body('studentId')
    .isMongoId()
    .withMessage('Invalid student ID')
];

// Query validation for getAllCourses
const getAllCoursesValidation = [
  query('department')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Department cannot be empty'),
  query('semester')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be between 1 and 8'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

// Routes
router.post('/', 
  auth, 
  isAdminOrTeacher, 
  courseValidation, 
  courseController.createCourse
);

router.put('/:id', 
  auth, 
  isAdminOrTeacher, 
  updateCourseValidation, 
  courseController.updateCourse
);

router.post('/enroll', 
  auth, 
  isAdminOrTeacher, 
  enrollStudentValidation, 
  courseController.enrollStudent
);

router.delete('/:courseId/students/:studentId', 
  auth, 
  isAdminOrTeacher, 
  courseController.removeStudent
);

router.get('/faculty', 
  auth, 
  isTeacher, 
  courseController.getFacultyCourses
);

router.get('/student', 
  auth, 
  isStudent, 
  courseController.getStudentCourses
);

router.get('/', 
  auth, 
  isAdminOrTeacher, 
  getAllCoursesValidation, 
  courseController.getAllCourses
);

router.get('/:id', 
  auth, 
  courseController.getCourseById
);

module.exports = router;
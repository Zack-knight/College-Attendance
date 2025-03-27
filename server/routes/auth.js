const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  changePassword,
  getMe 
} = require('../controllers/auth');
const { auth } = require('../middleware/auth');

// Validation middleware
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['student', 'teacher', 'admin'])
    .withMessage('Invalid role'),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),
  body('semester')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be between 1 and 8'),
  body('employeeId')
    .if((value, { req }) => req.body.role === 'teacher' || req.body.role === 'admin')
    .trim()
    .notEmpty()
    .withMessage('Employee ID is required for teachers and admins'),
  body('enrollmentNumber')
    .if(body('role').equals('student'))
    .trim()
    .notEmpty()
    .withMessage('Enrollment number is required for students')
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('department')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Department cannot be empty'),
  body('semester')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be between 1 and 8')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', auth, getMe);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfileValidation, updateProfile);
router.put('/change-password', auth, changePasswordValidation, changePassword);

module.exports = router;
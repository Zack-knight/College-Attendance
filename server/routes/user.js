const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const userController = require('../controllers/user');
const { auth, isAdmin, isTeacher, isAdminOrTeacher } = require('../middleware/auth');

// Validation middleware
const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('department')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Department cannot be empty'),
  body('semester')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be between 1 and 8'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('role')
    .optional()
    .isIn(['student', 'teacher', 'admin'])
    .withMessage('Invalid role')
];

// Query validation for getAllUsers
const getAllUsersValidation = [
  query('role')
    .optional()
    .isIn(['student', 'teacher', 'admin'])
    .withMessage('Invalid role'),
  query('department')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Department cannot be empty'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

// Routes
router.get('/',
  auth,
  isAdmin,
  getAllUsersValidation,
  userController.getAllUsers
);

router.get('/stats',
  auth,
  isAdmin,
  userController.getUserStats
);

router.get('/:id',
  auth,
  isAdminOrTeacher,
  userController.getUserById
);

router.put('/:id',
  auth,
  isAdminOrTeacher,
  updateUserValidation,
  userController.updateUser
);

router.delete('/:id',
  auth,
  isAdmin,
  userController.deleteUser
);

module.exports = router;
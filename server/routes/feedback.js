const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth, isAdmin, isTeacher, isStudent, isAdminOrTeacher } = require('../middleware/auth');
const feedbackController = require('../controllers/feedback');

// Validation middleware
const submitFeedbackValidation = [
  check('courseId').isMongoId().withMessage('Invalid course ID'),
  check('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  check('message').trim().notEmpty().withMessage('Message is required')
    .isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters'),
  check('category').isIn(['Course Content', 'Teaching Style', 'Course Organization', 'Assessment', 'Other'])
    .withMessage('Invalid feedback category'),
  check('isAnonymous').optional().isBoolean().withMessage('isAnonymous must be a boolean')
];

const reviewFeedbackValidation = [
  check('status').isIn(['Pending', 'Reviewed', 'Rejected'])
    .withMessage('Invalid feedback status'),
  check('response.message').optional().trim()
    .isLength({ max: 500 }).withMessage('Response cannot exceed 500 characters')
];

const getFeedbackValidation = [
  check('courseId').optional().isMongoId().withMessage('Invalid course ID'),
  check('category').optional().isIn(['Course Content', 'Teaching Style', 'Course Organization', 'Assessment', 'Other'])
    .withMessage('Invalid feedback category'),
  check('status').optional().isIn(['Pending', 'Reviewed', 'Rejected'])
    .withMessage('Invalid feedback status'),
  check('isAnonymous').optional().isBoolean().withMessage('isAnonymous must be a boolean')
];

// Routes
router.post('/submit',
  auth,
  isStudent,
  submitFeedbackValidation,
  feedbackController.submitFeedback
);

router.put('/:feedbackId/review',
  auth,
  isAdminOrTeacher,
  reviewFeedbackValidation,
  feedbackController.reviewFeedback
);

router.get('/',
  auth,
  isAdminOrTeacher,
  getFeedbackValidation,
  feedbackController.getFeedback
);

router.get('/student',
  auth,
  isStudent,
  feedbackController.getStudentFeedback
);

router.get('/course/:courseId',
  auth,
  isAdminOrTeacher,
  feedbackController.getCourseFeedback
);

module.exports = router;
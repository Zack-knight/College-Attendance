const express = require('express');
const router = express.Router();
const { getAllDepartments, createDepartment } = require('../controllers/department');
const { auth } = require('../middleware/auth');
const { body } = require('express-validator');

// Validation middleware
const departmentValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Department name is required'),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Department code is required')
];

router.get('/', auth, getAllDepartments);
router.post('/', auth, departmentValidation, createDepartment);

module.exports = router; 
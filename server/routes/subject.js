const express = require('express');
const router = express.Router();
const { createSubject, getSubjects } = require('../controllers/subject');
const auth = require('../middleware/auth');

// Faculty creates a subject
router.post('/', auth(['teacher', 'admin']), createSubject);
// Faculty gets their subjects
router.get('/', auth(['teacher', 'admin']), getSubjects);

module.exports = router; 
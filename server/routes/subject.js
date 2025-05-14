const express = require('express');
const router = express.Router();
const { createSubject, getSubjects, updateSubject, deleteSubject } = require('../controllers/subject');
const auth = require('../middleware/auth');

// Faculty creates a subject
router.post('/', auth(['teacher', 'admin']), createSubject);
// Get subjects (teachers get their own, admin gets all, students get read-only access)
router.get('/', auth(['teacher', 'admin', 'student']), getSubjects);

// Update subject (teacher can update their own, admin can update any)
router.put('/:id', auth(['teacher', 'admin']), updateSubject);

// Delete subject (teacher can delete their own, admin can delete any)
router.delete('/:id', auth(['teacher', 'admin']), deleteSubject);

module.exports = router; 
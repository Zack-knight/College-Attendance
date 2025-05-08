const express = require('express');
const router = express.Router();
const { getAllUsers, getAllStudents, deleteUser } = require('../controllers/user');
const auth = require('../middleware/auth');

// Only admins can access these routes
router.get('/all', auth(['admin']), getAllUsers);
router.get('/students', auth(['teacher', 'admin']), getAllStudents);
router.delete('/:id', auth(['admin']), deleteUser);

module.exports = router;
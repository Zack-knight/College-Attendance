const express = require('express');
const router = express.Router();
const { getAllUsers, getAllStudents, deleteUser } = require('../controllers/user');
const auth = require('../middleware/auth');

// Only admins can access these routes
router.get('/all', auth(['admin', 'teacher']), getAllUsers);
router.get('/students', auth(['teacher', 'admin']), getAllStudents);
router.delete('/:id', auth(['admin']), deleteUser);

// Add this route:
router.get('/me', auth(), (req, res) => {
  console.log('User in /me:', req.user);
  res.json(req.user);
});

module.exports = router;
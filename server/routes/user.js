const express = require('express');
const router = express.Router();
const { getAllUsers, getAllStudents, deleteUser } = require('../controllers/user');
const auth = require('../middleware/auth');
const User = require('../models/User'); // Assuming User model is defined in this file

// User listing routes with role-based permissions
router.get('/all', auth(['admin', 'teacher', 'student']), getAllUsers);
router.get('/students', auth(['teacher', 'admin']), getAllStudents);
router.delete('/:id', auth(['admin']), deleteUser);

// Get current user profile
router.get('/me', auth(), async (req, res) => {
  try {
    // Use _id instead of id to match what's stored in req.user
    const userId = req.user._id;
    console.log('Finding user with ID:', userId);
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      console.log('User not found with ID:', userId);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User found:', user.name, user.email);
    res.json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Server error while fetching user profile', details: err.message });
  }
});

module.exports = router;
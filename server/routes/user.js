const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser } = require('../controllers/user');
const auth = require('../middleware/auth');

// Only admins can access these routes
router.get('/all', auth(['admin']), getAllUsers);
router.delete('/:id', auth(['admin']), deleteUser);

module.exports = router;
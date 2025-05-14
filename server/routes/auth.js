const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout } = require('../controllers/auth');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', auth(), logout);

module.exports = router;
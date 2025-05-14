const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validator = require('validator');

// Refresh token storage (in a real app, use a database)
const refreshTokens = new Set();

// Generate access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '15m' }
  );
};

// Generate refresh token
const generateRefreshToken = (user) => {
  const refreshToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
  refreshTokens.add(refreshToken);
  return refreshToken;
};

// Input validation function
const validateRegistrationInput = (name, email, password, role, enrollmentNumber, semester, branch) => {
  const errors = {};

  // Validate name
  if (!name || name.trim() === '') {
    errors.name = 'Name is required';
  }

  // Validate email
  if (!email || !validator.isEmail(email)) {
    errors.email = 'Invalid email address';
  }

  // Validate password
  if (!password || password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  }

  // Validate role
  const validRoles = ['student', 'teacher', 'admin'];
  if (!role || !validRoles.includes(role)) {
    errors.role = 'Invalid role';
  }

  // Validate enrollment number for students
  if (role === 'student' && (!enrollmentNumber || enrollmentNumber.trim() === '')) {
    errors.enrollmentNumber = 'Enrollment number is required for students';
  }

  // Validate semester for students
  if (role === 'student' && (!semester || semester < 1 || semester > 8)) {
    errors.semester = 'Invalid semester for student';
  }
  
  // Validate branch for students
  if (role === 'student' && (!branch || branch.trim() === '')) {
    errors.branch = 'Branch or degree name is required for students';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

exports.register = async (req, res) => {
  const { name, email, password, role, enrollmentNumber, semester, branch } = req.body;

  // Validate input
  const { isValid, errors } = validateRegistrationInput(name, email, password, role, enrollmentNumber, semester, branch);
  if (!isValid) {
    return res.status(400).json({ errors });
  }

  try {
    // Check if the email or enrollment number already exists
    const existingUser = await User.findOne({ $or: [{ email }, { enrollmentNumber }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or enrollment number already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      enrollmentNumber,
      semester: role === 'student' ? semester : undefined,
      branch: role === 'student' ? branch : undefined
    });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    res.status(200).json({ 
      token, 
      refreshToken,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
};

// Refresh token endpoint
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Check if the refresh token is in our set
    if (!refreshTokens.has(refreshToken)) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Find the user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate a new access token
    const newToken = generateAccessToken(user);

    res.status(200).json({ token: newToken });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      // Remove the expired refresh token
      refreshTokens.delete(refreshToken);
      return res.status(401).json({ error: 'Refresh token expired' });
    }
    console.error('Refresh token error:', err);
    res.status(500).json({ error: 'Token refresh failed' });
  }
};

// Logout endpoint to invalidate refresh token
exports.logout = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  // Remove the refresh token
  refreshTokens.delete(refreshToken);

  res.status(200).json({ message: 'Logged out successfully' });
};
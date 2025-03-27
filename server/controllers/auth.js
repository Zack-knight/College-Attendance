const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      role: user.role,
      email: user.email
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

exports.register = async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      name, 
      email, 
      password, 
      role, 
      enrollmentNumber, 
      employeeId,
      department,
      semester 
    } = req.body;

    console.log('Role:', role);
    console.log('Employee ID:', employeeId);

    // Validate role-specific fields
    if (role === 'student' && !enrollmentNumber) {
      return res.status(400).json({ error: 'Enrollment number is required for students' });
    }
    if ((role === 'teacher' || role === 'admin') && !employeeId) {
      return res.status(400).json({ error: 'Employee ID is required for teachers and admins' });
    }

    // Check if email or enrollment/employee ID already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email }, 
        { enrollmentNumber }, 
        { employeeId }
      ] 
    });

    if (existingUser) {
      console.log('Existing user found:', existingUser);
      return res.status(400).json({ 
        error: 'Email, enrollment number, or employee ID already in use' 
      });
    }

    // Create a new user
    const user = new User({
      name,
      email,
      password,
      role,
      enrollmentNumber,
      employeeId,
      department,
      semester
    });

    try {
      await user.save();
      console.log('User saved successfully:', user);
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      return res.status(400).json({ 
        error: 'Failed to save user',
        details: saveError.message
      });
    }

    // Generate token
    const token = generateToken(user);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      error: 'Login failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, department, semester } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (department) user.department = department;
    if (semester) user.semester = semester;

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ 
      error: 'Failed to update profile',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ 
      error: 'Failed to change password',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ 
      error: 'Failed to get user data',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
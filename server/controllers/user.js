const User = require('../models/User');
const { validationResult } = require('express-validator');

exports.getAllUsers = async (req, res) => {
  try {
    const { role, department, isActive } = req.query;
    const query = {};

    // Apply filters
    if (role) query.role = role;
    if (department) query.department = department;
    if (typeof isActive === 'boolean') query.isActive = isActive;

    const users = await User.find(query)
      .select('-password')
      .populate('courses', 'name code')
      .sort({ role: 1, name: 1 });

    res.status(200).json(users);
  } catch (err) {
    console.error('Users fetch error:', err);
    res.status(500).json({
      error: 'Failed to fetch users',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('courses', 'name code schedule');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error('User fetch error:', err);
    res.status(500).json({
      error: 'Failed to fetch user',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      name,
      email,
      department,
      semester,
      isActive,
      role
    } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is authorized to update
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Not authorized to update this user' });
    }

    // Check if email is already in use by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (department) user.department = department;
    if (semester && user.role === 'student') user.semester = semester;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (role && req.user.role === 'admin') user.role = role;

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: 'User updated successfully',
      user: userResponse
    });
  } catch (err) {
    console.error('User update error:', err);
    res.status(500).json({
      error: 'Failed to update user',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is authorized to delete
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete users' });
    }

    // Prevent self-deletion
    if (req.user.id === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Check if user has any associated courses
    if (user.courses.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete user with associated courses. Please remove course associations first.' 
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('User deletion error:', err);
    res.status(500).json({
      error: 'Failed to delete user',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          }
        }
      }
    ]);

    const departmentStats = await User.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    const semesterStats = await User.aggregate([
      {
        $match: { role: 'student' }
      },
      {
        $group: {
          _id: '$semester',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      roleStats: stats,
      departmentStats,
      semesterStats
    });
  } catch (err) {
    console.error('User stats fetch error:', err);
    res.status(500).json({
      error: 'Failed to fetch user statistics',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
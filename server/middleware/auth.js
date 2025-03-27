const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.',
        details: 'Please provide a valid authentication token'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists and is active
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        error: 'Access denied. User not found.',
        details: 'The user associated with this token no longer exists'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        error: 'Access denied. Account is deactivated.',
        details: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Check token expiration
    const tokenExp = decoded.exp * 1000; // Convert to milliseconds
    if (Date.now() >= tokenExp) {
      return res.status(401).json({ 
        error: 'Access denied. Token expired.',
        details: 'Your session has expired. Please login again.'
      });
    }

    // Add user to request object
    req.user = {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name
    };

    next();
  } catch (err) {
    console.error('Authentication error:', err);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Access denied. Invalid token.',
        details: 'The provided token is invalid or malformed'
      });
    }

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Access denied. Token expired.',
        details: 'Your session has expired. Please login again.'
      });
    }

    res.status(500).json({ 
      error: 'Authentication failed.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied. Admin privileges required.',
      details: 'This action requires administrator privileges'
    });
  }
  next();
};

const isTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ 
      error: 'Access denied. Teacher privileges required.',
      details: 'This action requires teacher privileges'
    });
  }
  next();
};

const isStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ 
      error: 'Access denied. Student privileges required.',
      details: 'This action requires student privileges'
    });
  }
  next();
};

const isAdminOrTeacher = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ 
      error: 'Access denied. Admin or Teacher privileges required.',
      details: 'This action requires either administrator or teacher privileges'
    });
  }
  next();
};

const isAdminOrSelf = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return res.status(403).json({ 
      error: 'Access denied. Admin or self privileges required.',
      details: 'This action requires either administrator privileges or access to the specified resource'
    });
  }
  next();
};

module.exports = {
  auth,
  isAdmin,
  isTeacher,
  isStudent,
  isAdminOrTeacher,
  isAdminOrSelf
};
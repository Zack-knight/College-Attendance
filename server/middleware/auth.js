const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = (roles) => async (req, res, next) => {
  try {
    // Extract token from Authorization header with more robust handling
    let token = req.header('Authorization');
    
    if (!token) {
      console.log('No Authorization header found');
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    // Handle different token formats - some clients might send with or without Bearer prefix
    if (token.startsWith('Bearer ')) {
      token = token.slice(7).trim();
    }
    
    if (!token) {
      console.log('Empty token after Bearer prefix');
      return res.status(401).json({ error: 'Access denied. Empty token.' });
    }
    
    console.log('Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified, user ID:', decoded.id);
    
    // Fetch the full user document
    const user = await User.findById(decoded.id || decoded._id).lean();
    if (!user) {
      console.log('User not found for ID:', decoded.id || decoded._id);
      return res.status(401).json({ error: 'User not found.' });
    }
    
    // Add user to request
    req.user = user;
    console.log('User authenticated:', user.name, 'Role:', user.role);

    // Role-based access control
    if (roles && !roles.includes(user.role)) {
      console.log('Access denied for role:', user.role, 'Required roles:', roles);
      return res.status(403).json({ error: 'Access denied. You do not have permission.' });
    }

    next();
  } catch (err) {
    console.error('Authentication error:', err.message);
    // Return 401 instead of 400 for token issues, which is more appropriate
    return res.status(401).json({ error: 'Invalid or expired token.', details: err.message });
  }
};

module.exports = auth;
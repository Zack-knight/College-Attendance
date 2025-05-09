const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = (roles) => async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch the full user document
    const user = await User.findById(decoded.id).lean();
    if (!user) return res.status(401).json({ error: 'User not found.' });
    req.user = user;

    if (roles && !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Access denied. You do not have permission.' });
    }

    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

module.exports = auth;
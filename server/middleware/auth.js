const jwt = require('jsonwebtoken');

const auth = (roles) => (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if (roles && !roles.includes(decoded.role)) {
      return res.status(403).json({ error: 'Access denied. You do not have permission.' });
    }

    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

module.exports = auth;
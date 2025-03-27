const checkRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Access denied. User not authenticated.',
          details: 'Please authenticate before accessing this resource'
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Access denied. Insufficient permissions.',
          details: `This resource requires one of the following roles: ${roles.join(', ')}`
        });
      }

      next();
    } catch (err) {
      console.error('Role check error:', err);
      res.status(500).json({
        error: 'Role verification failed.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  };
};

// Helper middleware for specific role checks
const isAdmin = checkRole(['admin']);
const isTeacher = checkRole(['teacher']);
const isStudent = checkRole(['student']);
const isAdminOrTeacher = checkRole(['admin', 'teacher']);
const isAdminOrStudent = checkRole(['admin', 'student']);
const isTeacherOrStudent = checkRole(['teacher', 'student']);

module.exports = {
  checkRole,
  isAdmin,
  isTeacher,
  isStudent,
  isAdminOrTeacher,
  isAdminOrStudent,
  isTeacherOrStudent
}; 
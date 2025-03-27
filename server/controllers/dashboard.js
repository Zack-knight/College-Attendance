const User = require('../models/User');
const Course = require('../models/Course');
const Attendance = require('../models/attendance');
const AttendanceSession = require('../models/AttendanceSession');

exports.getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let dashboardData = {
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    };

    // Role-specific data
    switch (user.role) {
      case 'student':
        // Get student's courses and attendance
        const studentCourses = await Course.find({ 
          students: user._id 
        }).select('name code instructor');
        
        const studentAttendance = await Attendance.find({
          student: user._id
        }).sort({ date: -1 }).limit(5);

        dashboardData = {
          ...dashboardData,
          courses: studentCourses,
          recentAttendance: studentAttendance
        };
        break;

      case 'teacher':
        // Get teacher's courses and active sessions
        const teacherCourses = await Course.find({ 
          instructor: user._id 
        }).select('name code students');
        
        const activeSessions = await AttendanceSession.find({
          teacher: user._id,
          status: 'active'
        }).populate('course', 'name code');

        dashboardData = {
          ...dashboardData,
          courses: teacherCourses,
          activeSessions
        };
        break;

      case 'admin':
        // Get overall statistics
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalTeachers = await User.countDocuments({ role: 'teacher' });
        const totalCourses = await Course.countDocuments();
        const activeSessionsCount = await AttendanceSession.countDocuments({ status: 'active' });

        dashboardData = {
          ...dashboardData,
          statistics: {
            totalStudents,
            totalTeachers,
            totalCourses,
            activeSessionsCount
          }
        };
        break;
    }

    res.json(dashboardData);
  } catch (err) {
    console.error('Dashboard data fetch error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard data',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}; 
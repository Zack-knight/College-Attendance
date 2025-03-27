const AttendanceSession = require('../models/AttendanceSession');
const attendance = require('../models/attendance');
const User = require('../models/User');
const Course = require('../models/Course');
const { validationResult } = require('express-validator');
const sendEmail = require('../utils/email');
const {
  SESSION_STATUS,
  ATTENDANCE_STATUS,
  validateSession,
  processAttendanceMarking,
  closeSession,
  calculateAttendanceStats,
  generateAttendanceReport
} = require('../utils/attendanceManager');

exports.markAttendance = async (req, res) => {
  try {
    const session = await validateSession(req.params.sessionId);
    const attendanceRecord = await processAttendanceMarking(session, req.user.id, req.user.id);

    res.json({
      message: 'Attendance marked successfully',
      attendance: attendanceRecord
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.verifyAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { verificationStatus, remarks } = req.body;

    const attendanceRecord = await attendance.findById(attendanceId);
    if (!attendanceRecord) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    // Check if user is authorized to verify attendance
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to verify attendance' });
    }

    attendanceRecord.verificationStatus = verificationStatus;
    attendanceRecord.verifiedBy = req.user.id;
    attendanceRecord.verificationDate = new Date();
    if (remarks) attendanceRecord.remarks = remarks;

    await attendanceRecord.save();

    res.status(200).json({
      message: 'Attendance verification status updated successfully',
      attendance: attendanceRecord
    });
  } catch (err) {
    console.error('Attendance verification error:', err);
    res.status(500).json({
      error: 'Failed to verify attendance',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const { courseId, startDate, endDate, status, verificationStatus } = req.query;
    const query = {};

    // Apply filters
    if (courseId) query.course = courseId;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (status) query.status = status;
    if (verificationStatus) query.verificationStatus = verificationStatus;

    const attendanceRecords = await attendance.find(query)
      .populate('student', 'name enrollmentNumber')
      .populate('course', 'name code')
      .populate('markedBy', 'name')
      .populate('verifiedBy', 'name')
      .sort({ date: -1 });

    res.status(200).json(attendanceRecords);
  } catch (err) {
    console.error('Attendance fetch error:', err);
    res.status(500).json({
      error: 'Failed to fetch attendance records',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getStudentAttendance = async (req, res) => {
  try {
    const { courseId, startDate, endDate } = req.query;
    const query = { student: req.user.id };

    // Apply filters
    if (courseId) query.course = courseId;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendanceRecords = await attendance.find(query)
      .populate('course', 'name code')
      .sort({ date: -1 });

    // Calculate attendance statistics
    const totalClasses = attendanceRecords.length;
    const presentClasses = attendanceRecords.filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length;
    const lateClasses = attendanceRecords.filter(a => a.status === ATTENDANCE_STATUS.LATE).length;
    const absentClasses = attendanceRecords.filter(a => a.status === ATTENDANCE_STATUS.ABSENT).length;

    const statistics = {
      total: totalClasses,
      present: presentClasses,
      late: lateClasses,
      absent: absentClasses,
      percentage: totalClasses > 0 ? ((presentClasses + lateClasses) / totalClasses) * 100 : 0
    };

    res.status(200).json({
      attendance: attendanceRecords,
      statistics
    });
  } catch (err) {
    console.error('Student attendance fetch error:', err);
    res.status(500).json({
      error: 'Failed to fetch attendance records',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getCourseAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { startDate, endDate } = req.query;

    // Validate course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if user is authorized to view course attendance
    if (req.user.role !== 'admin' && course.faculty.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view course attendance' });
    }

    const query = { course: courseId };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendanceRecords = await attendance.find(query)
      .populate('student', 'name enrollmentNumber')
      .sort({ date: -1, student: 1 });

    // Calculate attendance statistics for each student
    const studentStats = {};
    attendanceRecords.forEach(record => {
      if (!studentStats[record.student._id]) {
        studentStats[record.student._id] = {
          student: record.student,
          total: 0,
          present: 0,
          late: 0,
          absent: 0,
          percentage: 0
        };
      }
      studentStats[record.student._id].total++;
      studentStats[record.student._id][record.status.toLowerCase()]++;
    });

    // Calculate percentages
    Object.values(studentStats).forEach(stat => {
      stat.percentage = stat.total > 0 ? ((stat.present + stat.late) / stat.total) * 100 : 0;
    });

    res.status(200).json({
      course,
      attendance: attendanceRecords,
      studentStats: Object.values(studentStats)
    });
  } catch (err) {
    console.error('Course attendance fetch error:', err);
    res.status(500).json({
      error: 'Failed to fetch attendance records',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Create a new attendance session
exports.createSession = async (req, res) => {
  try {
    const { courseId, startTime, endTime, gracePeriodMinutes } = req.body;

    // Validate course and instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to create session for this course' });
    }

    // Create new session
    const session = new AttendanceSession({
      course: courseId,
      teacher: req.user.id,
      startTime,
      endTime,
      gracePeriodMinutes: gracePeriodMinutes || 15
    });

    await session.save();

    res.status(201).json({
      message: 'Attendance session created successfully',
      session
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Close an attendance session
exports.closeSession = async (req, res) => {
  try {
    const session = await AttendanceSession.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.teacher.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to close this session' });
    }

    await closeSession(session);

    res.json({
      message: 'Session closed successfully',
      session
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active sessions for a course
exports.getActiveSessions = async (req, res) => {
  try {
    const { courseId } = req.params;

    const sessions = await AttendanceSession.find({
      course: courseId,
      status: SESSION_STATUS.ACTIVE
    }).populate('teacher', 'fullName email');

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get session details with attendance records
exports.getSessionDetails = async (req, res) => {
  try {
    const session = await AttendanceSession.findById(req.params.sessionId)
      .populate('teacher', 'fullName email')
      .populate('course', 'name code');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const attendanceRecords = await attendance.find({ session: session._id })
      .populate('student', 'fullName email studentId')
      .populate('markedBy', 'fullName email');

    res.json({
      session,
      attendance: attendanceRecords
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance report for a course
exports.getAttendanceReport = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { startDate, endDate } = req.query;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view attendance report for this course' });
    }

    const report = await generateAttendanceReport(courseId, new Date(startDate), new Date(endDate));

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
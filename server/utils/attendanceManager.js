const { formatDate } = require('./helpers');
const { sendEmail } = require('./emailService');
const attendance = require('../models/attendance');
const AttendanceSession = require('../models/AttendanceSession');
const User = require('../models/User');

// Attendance session status
const SESSION_STATUS = {
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
  EXPIRED: 'EXPIRED'
};

// Attendance marking status
const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE'
};

// Calculate if attendance is late based on session settings
const isLateAttendance = (session) => {
  const now = new Date();
  return now > session.endTime;
};

// Validate attendance session
const validateSession = async (sessionId) => {
  const session = await AttendanceSession.findById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }
  if (!session.canMarkAttendance()) {
    throw new Error('Session is not active or has expired');
  }
  return session;
};

// Process attendance marking
const processAttendanceMarking = async (session, studentId, markedBy) => {
  // Check for existing attendance
  const existingAttendance = await attendance.findOne({
    student: studentId,
    session: session._id
  });

  if (existingAttendance) {
    throw new Error('Attendance already marked for this session');
  }

  const status = isLateAttendance(session) ? ATTENDANCE_STATUS.LATE : ATTENDANCE_STATUS.PRESENT;

  const attendance = new attendance({
    student: studentId,
    session: session._id,
    course: session.course,
    status,
    markedBy,
    date: new Date()
  });

  await attendance.save();
  return attendance;
};

// Calculate student's attendance percentage for a course
const calculateStudentAttendancePercentage = async (studentId, courseId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  const attendanceRecords = await attendance.find({
    student: studentId,
    course: courseId,
    status: { $in: [ATTENDANCE_STATUS.PRESENT, ATTENDANCE_STATUS.LATE] }
  });

  const totalSessions = course.totalSessions || 0;
  const attendedSessions = attendanceRecords.length;

  if (totalSessions === 0) return 0;
  return ((attendedSessions / totalSessions) * 100).toFixed(2);
};

// Close attendance session
const closeSession = async (session) => {
  if (session.status !== SESSION_STATUS.ACTIVE) {
    throw new Error('Session is not active');
  }

  // Get all enrolled students
  const enrolledStudents = await User.find({
    role: 'student',
    enrolledCourses: session.course
  });

  // Get students who marked attendance
  const markedAttendance = await attendance.find({
    session: session._id
  });

  const markedStudentIds = markedAttendance.map(a => a.student.toString());

  // Mark absent for students who haven't marked attendance
  const absentPromises = enrolledStudents
    .filter(student => !markedStudentIds.includes(student._id.toString()))
    .map(student => new attendance({
      student: student._id,
      session: session._id,
      course: session.course,
      status: ATTENDANCE_STATUS.ABSENT,
      date: new Date()
    }).save());

  await Promise.all(absentPromises);

  // Update session status
  session.status = SESSION_STATUS.CLOSED;
  session.closedAt = new Date();
  await session.save();
};

// Calculate attendance stats for a student
const calculateAttendanceStats = async (courseId, studentId, startDate, endDate) => {
  const query = {
    course: courseId,
    student: studentId,
    date: { $gte: startDate, $lte: endDate }
  };

  const attendanceRecords = await attendance.find(query);
  const total = attendanceRecords.length;
  const present = attendanceRecords.filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length;
  const late = attendanceRecords.filter(a => a.status === ATTENDANCE_STATUS.LATE).length;
  const absent = attendanceRecords.filter(a => a.status === ATTENDANCE_STATUS.ABSENT).length;

  return {
    total,
    present,
    late,
    absent,
    percentage: total > 0 ? ((present + late) / total) * 100 : 0
  };
};

// Generate attendance report
const generateAttendanceReport = async (courseId, startDate, endDate) => {
  const sessions = await AttendanceSession.find({
    course: courseId,
    startTime: { $gte: startDate, $lte: endDate }
  });

  const students = await User.find({
    role: 'student',
    enrolledCourses: courseId
  });

  const report = await Promise.all(students.map(async student => {
    const stats = await calculateAttendanceStats(courseId, student._id, startDate, endDate);
    return {
      student: {
        id: student._id,
        name: student.fullName,
        email: student.email
      },
      ...stats
    };
  }));

  return {
    totalSessions: sessions.length,
    students: report
  };
};

module.exports = {
  SESSION_STATUS,
  ATTENDANCE_STATUS,
  validateSession,
  processAttendanceMarking,
  calculateStudentAttendancePercentage,
  closeSession,
  calculateAttendanceStats,
  generateAttendanceReport
}; 
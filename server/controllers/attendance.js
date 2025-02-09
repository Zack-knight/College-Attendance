const Attendance = require('../models/attendance')
const User = require('../models/User');
const sendEmail = require('../utils/email');

exports.markAttendance = async (req, res) => {
  const { studentName, subject, session, status } = req.body;
  try {
    const attendance = new Attendance({ studentName, subject, session, status });
    await attendance.save();

    // Check for low attendance
    const totalClasses = await Attendance.countDocuments({ studentName, subject });
    const presentClasses = await Attendance.countDocuments({ studentName, subject, status: 'Present' });
    const attendancePercentage = (presentClasses / totalClasses) * 100;

    if (attendancePercentage < 75) {
      const student = await User.findOne({ name: studentName, role: 'student' });
      if (student) {
        sendEmail(
          student.email,
          'Low Attendance Alert',
          `Your attendance in ${subject} is ${attendancePercentage.toFixed(2)}%. Please improve your attendance.`
        );
      }
    }

    res.status(201).json({ message: 'Attendance marked successfully', attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find();
    res.status(200).json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
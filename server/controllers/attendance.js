const Attendance = require('../models/Attendance');
const User = require('../models/User');
const sendEmail = require('../utils/email');

exports.markAttendance = async (req, res) => {
  const { enrollmentNumber, subject, session, status } = req.body;
  try {
    // Check if the enrollment number exists
    const user = await User.findOne({ enrollmentNumber });
    if (!user) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const attendance = new Attendance({ enrollmentNumber, subject, session, status });
    await attendance.save();

    // Check for low attendance
    const totalClasses = await Attendance.countDocuments({ enrollmentNumber, subject });
    const presentClasses = await Attendance.countDocuments({ enrollmentNumber, subject, status: 'Present' });
    const attendancePercentage = (presentClasses / totalClasses) * 100;

    if (attendancePercentage < 75) {
      sendEmail(
        user.email,
        'Low Attendance Alert',
        `Your attendance in ${subject} is ${attendancePercentage.toFixed(2)}%. Please improve your attendance.`
      );
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
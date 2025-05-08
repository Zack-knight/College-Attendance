const Attendance = require('../models/attendance');
const User = require('../models/User');
const sendEmail = require('../utils/email');

// Mark attendance for a subject and date
exports.markAttendance = async (req, res) => {
  const { subject, date, records } = req.body;
  try {
    if (!subject || !date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'Subject, date, and records are required' });
    }
    const attendance = new Attendance({ subject, date, records });
    await attendance.save();
    res.status(201).json({ message: 'Attendance marked successfully', attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get attendance for a subject (and optionally a date)
exports.getAttendance = async (req, res) => {
  try {
    const { subject, date } = req.query;
    const query = {};
    if (subject) query.subject = subject;
    if (date) query.date = new Date(date);
    const attendance = await Attendance.find(query)
      .populate('subject', 'name')
      .populate('records.student', 'name enrollmentNumber');
    res.status(200).json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
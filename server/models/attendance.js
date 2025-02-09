const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  enrollmentNumber: { type: String, required: true }, // Use enrollment number
  subject: { type: String, required: true },
  session: { type: String, required: true },
  status: { type: String, enum: ['Present', 'Absent'], required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Attendance', attendanceSchema);
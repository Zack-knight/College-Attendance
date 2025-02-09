const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  subject: { type: String, required: true },
  session: { type: String, required: true },
  status: { type: String, enum: ['Present', 'Absent'], required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Attendance', attendanceSchema);
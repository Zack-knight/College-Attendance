const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  date: { type: Date, required: true },
  records: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      status: { type: String, enum: ['present', 'absent'], required: true }
    }
  ]
});

module.exports = mongoose.model('Attendance', attendanceSchema);
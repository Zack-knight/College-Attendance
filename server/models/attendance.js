const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  date: { type: Date, required: true },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  records: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      status: { type: String, enum: ['present', 'absent'], required: true }
    }
  ]
}, { timestamps: true });

// Compound index for subject and date to prevent duplicate entries
attendanceSchema.index({ subject: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
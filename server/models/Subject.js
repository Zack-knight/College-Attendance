const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  type: { type: String, enum: ['course', 'event'], default: 'course' },
  attendanceTracking: { type: Boolean, default: false }
});

module.exports = mongoose.model('Subject', subjectSchema); 
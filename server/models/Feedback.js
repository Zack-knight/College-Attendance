const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Feedback', feedbackSchema);
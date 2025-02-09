const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  enrollmentNumber: { type: String, required: true }, // Use enrollment number
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Feedback', feedbackSchema);
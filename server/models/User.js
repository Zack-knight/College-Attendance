const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], required: true },
  enrollmentNumber: { type: String, required: false, unique: false },
  semester: { type: String, required: function() { return this.role === 'student'; } },
  branch: { type: String, required: function() { return this.role === 'student'; }, trim: true }
});

module.exports = mongoose.model('User', userSchema);
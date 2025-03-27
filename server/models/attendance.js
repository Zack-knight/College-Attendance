const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    validate: {
      validator: async function(v) {
        const user = await mongoose.model('User').findById(v);
        return user && user.role === 'student';
      },
      message: 'Student must be of role student'
    }
  },
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true,
    validate: {
      validator: async function(v) {
        const course = await mongoose.model('Course').findById(v);
        return course && course.isActive;
      },
      message: 'Course must be active'
    }
  },
  status: { 
    type: String, 
    enum: ['Present', 'Absent', 'Late'], 
    required: true 
  },
  date: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'Date cannot be in the future'
    }
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function(v) {
        const user = await mongoose.model('User').findById(v);
        return user && (user.role === 'teacher' || user.role === 'admin');
      },
      message: 'Attendance can only be marked by teachers or admins'
    }
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [200, 'Remarks cannot exceed 200 characters']
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationDate: Date
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance records
attendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });

// Index for faster queries
attendanceSchema.index({ course: 1, date: 1 });
attendanceSchema.index({ student: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
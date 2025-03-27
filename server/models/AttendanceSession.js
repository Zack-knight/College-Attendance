const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'CLOSED', 'EXPIRED'],
    default: 'ACTIVE'
  },
  gracePeriodMinutes: {
    type: Number,
    default: 15,
    min: 0,
    max: 60
  },
  closedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
attendanceSessionSchema.index({ course: 1, startTime: -1 });
attendanceSessionSchema.index({ teacher: 1, status: 1 });

// Method to check if session is active
attendanceSessionSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'ACTIVE' && 
         now >= this.startTime && 
         now <= this.endTime;
};

// Method to check if marking is allowed
attendanceSessionSchema.methods.canMarkAttendance = function() {
  if (this.status !== 'ACTIVE') return false;
  
  const now = new Date();
  const endTimeWithGrace = new Date(this.endTime);
  endTimeWithGrace.setMinutes(endTimeWithGrace.getMinutes() + this.gracePeriodMinutes);
  
  return now >= this.startTime && now <= endTimeWithGrace;
};

// Static method to find active sessions for a course
attendanceSessionSchema.statics.findActiveSession = function(courseId) {
  const now = new Date();
  return this.findOne({
    course: courseId,
    status: 'ACTIVE',
    startTime: { $lte: now },
    endTime: { $gte: now }
  });
};

const AttendanceSession = mongoose.model('AttendanceSession', attendanceSessionSchema);

module.exports = AttendanceSession;
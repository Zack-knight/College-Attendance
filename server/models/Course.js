const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Course name is required'],
    trim: true
  },
  code: { 
    type: String, 
    required: [true, 'Course code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9]{3,10}$/, 'Course code must be 3-10 characters long and contain only uppercase letters and numbers']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  faculty: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    validate: {
      validator: async function(v) {
        const user = await mongoose.model('User').findById(v);
        return user && (user.role === 'teacher' || user.role === 'admin');
      },
      message: 'Faculty must be a teacher or admin'
    }
  },
  students: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    validate: {
      validator: async function(v) {
        const user = await mongoose.model('User').findById(v);
        return user && user.role === 'student';
      },
      message: 'Students must be of role student'
    }
  }],
  schedule: {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
    },
    room: {
      type: String,
      required: true,
      trim: true
    }
  },
  semester: {
    type: Number,
    required: true,
    min: [1, 'Semester must be at least 1'],
    max: [8, 'Semester cannot exceed 8']
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  maxStudents: {
    type: Number,
    required: true,
    min: [1, 'Maximum students must be at least 1']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
courseSchema.index({ code: 1 });
courseSchema.index({ faculty: 1 });
courseSchema.index({ department: 1, semester: 1 });

module.exports = mongoose.model('Course', courseSchema);
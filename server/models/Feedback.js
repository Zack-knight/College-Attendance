const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    validate: {
      validator: async function(v) {
        const user = await mongoose.model('User').findById(v);
        return user && user.role === 'student';
      },
      message: 'Feedback can only be submitted by students'
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
  rating: {
    type: Number,
    required: true,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  message: { 
    type: String, 
    required: [true, 'Feedback message is required'],
    trim: true,
    minlength: [10, 'Feedback message must be at least 10 characters long'],
    maxlength: [1000, 'Feedback message cannot exceed 1000 characters']
  },
  category: {
    type: String,
    enum: ['Teaching', 'Course Content', 'Assignments', 'Examinations', 'Infrastructure', 'Other'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewDate: Date,
  response: {
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Response message cannot exceed 500 characters']
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    responseDate: Date
  },
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
feedbackSchema.index({ course: 1, status: 1 });
feedbackSchema.index({ student: 1, course: 1 });
feedbackSchema.index({ category: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
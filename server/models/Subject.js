const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    validate: {
      validator: function(v) {
        // Ensure name is at least 2 characters long and contains only letters and spaces
        return /^[A-Za-z ]{2,50}$/.test(v);
      },
      message: props => `${props.value} is not a valid subject name! Use only letters and spaces.`
    }
  },
  code: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Ensure code is between 6-12 digits
        return /^\d{6,12}$/.test(v);
      },
      message: props => `${props.value} is not a valid subject code! Must be between 6-12 digits.`
    }
  },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  type: { type: String, enum: ['course', 'event'], default: 'course' },
  attendanceTracking: { type: Boolean, default: false }
}, { timestamps: true });

// Create compound indexes for uniqueness
subjectSchema.index({ faculty: 1, name: 1 }, { unique: true }); // Faculty can't create duplicate subject names
subjectSchema.index({ code: 1 }, { unique: true }); // Subject codes must be globally unique

// Pre-save hook to ensure unique subject codes
subjectSchema.pre('save', async function(next) {
  // Check if the code is already in use
  const existingSubject = await this.constructor.findOne({ code: this.code });
  
  if (existingSubject && existingSubject._id.toString() !== this._id.toString()) {
    const error = new Error('Subject code must be unique');
    error.name = 'ValidationError';
    return next(error);
  }
  
  next();
});

module.exports = mongoose.model('Subject', subjectSchema); 
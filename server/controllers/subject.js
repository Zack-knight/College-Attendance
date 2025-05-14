const Subject = require('../models/Subject');

// Create a new subject (faculty only)
exports.createSubject = async (req, res) => {
  try {
    const { name, code, type, attendanceTracking } = req.body;
    
    // Validate required fields
    if (!name) return res.status(400).json({ error: 'Subject name is required' });
    if (!code) return res.status(400).json({ error: 'Subject code is required' });
    
    // Validate name format
    if (!/^[A-Za-z ]{2,50}$/.test(name)) {
      return res.status(400).json({
        error: 'Invalid subject name',
        details: 'Subject name must be 2-50 characters long and contain only letters and spaces'
      });
    }
    
    // Validate code format (between 6-12 digits)
    if (!/^\d{6,12}$/.test(code)) {
      return res.status(400).json({
        error: 'Invalid subject code',
        details: 'Subject code must be between 6-12 digits (numbers only)'
      });
    }
    
    // Create subject with correct faculty ID
    const subject = new Subject({
      name,
      code,
      faculty: req.user ? req.user._id : undefined, // Use _id consistently
      type: type || 'course',
      attendanceTracking: type === 'event' ? !!attendanceTracking : false
    });
    
    await subject.save();
    res.status(201).json(subject);
  } catch (err) {
    console.error('Error creating subject:', err);
    
    // Handle duplicate key errors (unique constraint violations)
    if (err.code === 11000) {
      console.log('Duplicate key error:', err);
      
      // Check if it's the compound faculty+name index
      if (err.keyPattern && err.keyPattern.faculty && err.keyPattern.name) {
        return res.status(400).json({ 
          error: 'You already have a subject with this name', 
          details: `You already created a subject named '${req.body.name}'` 
        });
      }
      
      // Check if it's the code field that caused the duplicate
      if (err.keyPattern && err.keyPattern.code) {
        return res.status(400).json({ 
          error: 'Subject code must be unique', 
          details: `A subject with code '${req.body.code}' already exists` 
        });
      }
      
      // Default duplicate key error
      return res.status(400).json({ 
        error: 'Duplicate subject information', 
        details: 'This subject appears to be a duplicate of an existing one. Each faculty can only create one subject with a given name, and subject codes must be unique across the system.' 
      });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      let errorMessages = [];
      if (err.errors) {
        // Standard mongoose validation errors
        errorMessages = Object.values(err.errors).map(e => e.message);
      } else {
        // Custom validation error from pre-save hook
        errorMessages = [err.message];
      }
      return res.status(400).json({
        error: 'Invalid subject details',
        details: errorMessages
      });
    }
    
    res.status(500).json({ error: 'Failed to create subject', details: err.message });
  }
};

// Get all subjects for the logged-in faculty
exports.getSubjects = async (req, res) => {
  try {
    let query = {};
    
    // Apply role-based filtering
    if (req.user.role === 'teacher') {
      query.faculty = req.user._id; // Teacher only sees their subjects
    }
    // Admin can see all subjects (empty query)
    
    const subjects = await Subject.find(query).populate('faculty', 'name email');
    res.json(subjects);
  } catch (err) {
    console.error('Error fetching subjects:', err);
    res.status(500).json({ error: 'Failed to fetch subjects', details: err.message });
  }
};

// Update a subject
exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, type, attendanceTracking } = req.body;
    
    // Find the subject
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    // Check ownership if teacher (admins can update any subject)
    if (req.user.role === 'teacher' && subject.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this subject' });
    }
    
    // Update fields
    if (name) subject.name = name;
    
    // Handle code update with formatting
    if (code) {
      subject.code = code.trim().toUpperCase();
    }
    
    if (type) subject.type = type;
    if (attendanceTracking !== undefined) subject.attendanceTracking = attendanceTracking;
    
    await subject.save();
    res.json(subject);
  } catch (err) {
    console.error('Error updating subject:', err);
    
    // Handle duplicate key errors (unique constraint violations)
    if (err.code === 11000) {
      // Check if it's the code field that caused the duplicate
      if (err.keyPattern && err.keyPattern.code) {
        return res.status(400).json({ 
          error: 'Subject code must be unique', 
          details: `A subject with code '${req.body.code}' already exists` 
        });
      }
      // Check if it's the name field that caused the duplicate
      if (err.keyPattern && err.keyPattern.name) {
        return res.status(400).json({ 
          error: 'Subject name must be unique for each faculty', 
          details: `A subject with name '${req.body.name}' already exists for this faculty` 
        });
      }
      // Check if it's the compound faculty+name index
      if (err.keyPattern && err.keyPattern.faculty && err.keyPattern.name) {
        return res.status(400).json({ 
          error: 'You already have a subject with this name', 
          details: `You already created a subject named '${req.body.name}'` 
        });
      }
      
      return res.status(400).json({ 
        error: 'Duplicate subject information', 
        details: 'This subject appears to be a duplicate of an existing one' 
      });
    }
    
    res.status(500).json({ error: 'Failed to update subject', details: err.message });
  }
};

// Delete a subject
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the subject
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    // Check ownership if teacher (admins can delete any subject)
    if (req.user.role === 'teacher' && subject.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this subject' });
    }
    
    await Subject.findByIdAndDelete(id);
    res.json({ message: 'Subject deleted successfully' });
  } catch (err) {
    console.error('Error deleting subject:', err);
    res.status(500).json({ error: 'Failed to delete subject', details: err.message });
  }
}; 
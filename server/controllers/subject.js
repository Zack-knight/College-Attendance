const Subject = require('../models/Subject');

// Create a new subject (faculty only)
exports.createSubject = async (req, res) => {
  try {
    const { name, type, attendanceTracking } = req.body;
    if (!name) return res.status(400).json({ error: 'Subject name is required' });
    const subject = new Subject({
      name,
      faculty: req.user ? req.user.id : undefined,
      type: type || 'course',
      attendanceTracking: type === 'event' ? !!attendanceTracking : false
    });
    await subject.save();
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all subjects for the logged-in faculty
exports.getSubjects = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'teacher') {
      query.faculty = req.user._id;
    }
    const subjects = await Subject.find(query);
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 
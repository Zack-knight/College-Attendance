const Subject = require('../models/Subject');

// Create a new subject (faculty only)
exports.createSubject = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Subject name is required' });
    const subject = new Subject({ name, faculty: req.user.id });
    await subject.save();
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all subjects for the logged-in faculty
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ faculty: req.user.id });
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 
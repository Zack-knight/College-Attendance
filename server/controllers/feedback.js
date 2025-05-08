const Feedback = require('../models/Feedback');
const User = require('../models/User');

exports.submitFeedback = async (req, res) => {
  console.log('Decoded user from token:', req.user);
  const { message } = req.body;

  try {
    if (!req.user || !req.user.id || !message) {
      return res.status(400).json({ error: 'User not authenticated or message missing' });
    }
    const feedback = new Feedback({ student: req.user.id, message });
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().populate('student', 'name enrollmentNumber');
    res.status(200).json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
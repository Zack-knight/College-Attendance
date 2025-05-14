const Feedback = require('../models/Feedback');
const User = require('../models/User');

exports.submitFeedback = async (req, res) => {
  console.log('Decoded user from token:', req.user);
  const { message } = req.body;
  console.log('Message:', message);
  try {
    if (!req.user || !(req.user.id || req.user._id) || !message) {
      return res.status(400).json({ error: 'User not authenticated or message missing' });
      // console.log('User not authenticated or message missing');
    }
    console.log('User ID:', req.user.id || req.user._id);
    const feedback = new Feedback({ student: req.user.id || req.user._id, message });
    console.log('Feedback:', feedback);
    await feedback.save();
    console.log('Feedback saved:', feedback);
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error:', err);
  }
};

exports.getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().populate('student', 'name enrollmentNumber branch');
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
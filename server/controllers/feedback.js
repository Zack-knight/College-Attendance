const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res) => {
  const { studentName, message } = req.body;
  try {
    const feedback = new Feedback({ studentName, message });
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find();
    res.status(200).json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
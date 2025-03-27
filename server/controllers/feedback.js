const Feedback = require('../models/Feedback');
const Course = require('../models/Course');
const { validationResult } = require('express-validator');

exports.submitFeedback = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      courseId,
      rating,
      message,
      category,
      isAnonymous
    } = req.body;

    // Validate course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if course is active
    if (!course.isActive) {
      return res.status(400).json({ error: 'Course is not active' });
    }

    // Check if student is enrolled in the course
    if (!course.students.includes(req.user.id)) {
      return res.status(403).json({ error: 'You are not enrolled in this course' });
    }

    // Check if feedback already submitted for this course
    const existingFeedback = await Feedback.findOne({
      student: req.user.id,
      course: courseId
    });

    if (existingFeedback) {
      return res.status(400).json({ error: 'You have already submitted feedback for this course' });
    }

    const feedback = new Feedback({
      student: req.user.id,
      course: courseId,
      rating,
      message,
      category,
      isAnonymous
    });

    await feedback.save();

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (err) {
    console.error('Feedback submission error:', err);
    res.status(500).json({
      error: 'Failed to submit feedback',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.reviewFeedback = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { feedbackId } = req.params;
    const { status, response } = req.body;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Check if user is authorized to review feedback
    if (req.user.role !== 'admin' && feedback.course.faculty.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to review this feedback' });
    }

    feedback.status = status;
    feedback.reviewedBy = req.user.id;
    feedback.reviewDate = new Date();

    if (response) {
      feedback.response = {
        message: response,
        respondedBy: req.user.id,
        responseDate: new Date()
      };
    }

    await feedback.save();

    res.status(200).json({
      message: 'Feedback reviewed successfully',
      feedback
    });
  } catch (err) {
    console.error('Feedback review error:', err);
    res.status(500).json({
      error: 'Failed to review feedback',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getFeedback = async (req, res) => {
  try {
    const { courseId, category, status, isAnonymous } = req.query;
    const query = {};

    // Apply filters
    if (courseId) query.course = courseId;
    if (category) query.category = category;
    if (status) query.status = status;
    if (typeof isAnonymous === 'boolean') query.isAnonymous = isAnonymous;

    const feedback = await Feedback.find(query)
      .populate('student', 'name enrollmentNumber')
      .populate('course', 'name code')
      .populate('reviewedBy', 'name')
      .populate('response.respondedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(feedback);
  } catch (err) {
    console.error('Feedback fetch error:', err);
    res.status(500).json({
      error: 'Failed to fetch feedback',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getStudentFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ student: req.user.id })
      .populate('course', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json(feedback);
  } catch (err) {
    console.error('Student feedback fetch error:', err);
    res.status(500).json({
      error: 'Failed to fetch student feedback',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getCourseFeedback = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Validate course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if user is authorized to view course feedback
    if (req.user.role !== 'admin' && course.faculty.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view course feedback' });
    }

    const feedback = await Feedback.find({ course: courseId })
      .populate('student', 'name enrollmentNumber')
      .sort({ createdAt: -1 });

    // Calculate feedback statistics
    const totalFeedback = feedback.length;
    const averageRating = totalFeedback > 0
      ? feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback
      : 0;

    const categoryStats = {};
    feedback.forEach(f => {
      if (!categoryStats[f.category]) {
        categoryStats[f.category] = 0;
      }
      categoryStats[f.category]++;
    });

    const statusStats = {};
    feedback.forEach(f => {
      if (!statusStats[f.status]) {
        statusStats[f.status] = 0;
      }
      statusStats[f.status]++;
    });

    res.status(200).json({
      course,
      feedback,
      statistics: {
        total: totalFeedback,
        averageRating,
        categoryStats,
        statusStats
      }
    });
  } catch (err) {
    console.error('Course feedback fetch error:', err);
    res.status(500).json({
      error: 'Failed to fetch course feedback',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
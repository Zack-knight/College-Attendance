const Course = require('../models/Course');
const User = require('../models/User');
const { validationResult } = require('express-validator');

exports.createCourse = async (req, res) => {
  try {
    console.log('Course creation request body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      code,
      description,
      schedule,
      semester,
      department,
      maxStudents
    } = req.body;

    console.log('Parsed course data:', {
      name,
      code,
      description,
      schedule,
      semester,
      department,
      maxStudents
    });

    // Check if course code already exists
    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return res.status(400).json({ error: 'Course code already exists' });
    }

    // Validate faculty
    const faculty = await User.findById(req.user.id);
    if (!faculty || (faculty.role !== 'teacher' && faculty.role !== 'admin')) {
      return res.status(403).json({ error: 'Only teachers and admins can create courses' });
    }

    const course = new Course({
      name,
      code,
      description,
      faculty: req.user.id,
      schedule,
      semester,
      department,
      maxStudents
    });

    await course.save();

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (err) {
    console.error('Course creation error:', err);
    res.status(500).json({
      error: 'Failed to create course',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if user is the course faculty or admin
    if (course.faculty.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this course' });
    }

    const {
      name,
      description,
      schedule,
      semester,
      department,
      maxStudents,
      isActive
    } = req.body;

    // Update fields if provided
    if (name) course.name = name;
    if (description) course.description = description;
    if (schedule) course.schedule = schedule;
    if (semester) course.semester = semester;
    if (department) course.department = department;
    if (maxStudents) course.maxStudents = maxStudents;
    if (typeof isActive === 'boolean') course.isActive = isActive;

    await course.save();

    res.status(200).json({
      message: 'Course updated successfully',
      course
    });
  } catch (err) {
    console.error('Course update error:', err);
    res.status(500).json({
      error: 'Failed to update course',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.enrollStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId, studentId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if course is active
    if (!course.isActive) {
      return res.status(400).json({ error: 'Course is not active' });
    }

    // Check if course is full
    if (course.students.length >= course.maxStudents) {
      return res.status(400).json({ error: 'Course is full' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ error: 'Invalid student' });
    }

    // Check if student is already enrolled
    if (course.students.includes(studentId)) {
      return res.status(400).json({ error: 'Student is already enrolled' });
    }

    // Check if student's department and semester match course requirements
    if (student.department !== course.department || student.semester !== course.semester) {
      return res.status(400).json({ 
        error: 'Student does not meet course requirements (department/semester mismatch)' 
      });
    }

    course.students.push(studentId);
    await course.save();

    // Add course to student's courses
    student.courses.push(courseId);
    await student.save();

    res.status(200).json({
      message: 'Student enrolled successfully',
      course
    });
  } catch (err) {
    console.error('Student enrollment error:', err);
    res.status(500).json({
      error: 'Failed to enroll student',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.removeStudent = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if user is the course faculty or admin
    if (course.faculty.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to remove students from this course' });
    }

    // Check if student is enrolled
    if (!course.students.includes(studentId)) {
      return res.status(400).json({ error: 'Student is not enrolled in this course' });
    }

    // Remove student from course
    course.students = course.students.filter(id => id.toString() !== studentId);
    await course.save();

    // Remove course from student's courses
    const student = await User.findById(studentId);
    if (student) {
      student.courses = student.courses.filter(id => id.toString() !== courseId);
      await student.save();
    }

    res.status(200).json({
      message: 'Student removed successfully',
      course
    });
  } catch (err) {
    console.error('Student removal error:', err);
    res.status(500).json({
      error: 'Failed to remove student',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getFacultyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ faculty: req.user.id })
      .populate('students', 'name enrollmentNumber department semester')
      .sort({ createdAt: -1 });

    res.status(200).json(courses);
  } catch (err) {
    console.error('Faculty courses fetch error:', err);
    res.status(500).json({
      error: 'Failed to fetch faculty courses',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getStudentCourses = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Find all courses where the student is enrolled
    const courses = await Course.find({ 
      students: student._id,
      isActive: true 
    })
      .populate('faculty', 'name email')
      .sort({ schedule: 1 });

    res.status(200).json(courses);
  } catch (err) {
    console.error('Error fetching student courses:', err);
    res.status(500).json({
      error: 'Failed to fetch student courses',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const { department, semester, isActive } = req.query;
    const query = {};

    // Apply filters if provided
    if (department) query.department = department;
    if (semester) query.semester = semester;
    if (typeof isActive === 'boolean') query.isActive = isActive;

    const courses = await Course.find(query)
      .populate('faculty', 'name email')
      .populate('students', 'name enrollmentNumber department semester')
      .sort({ department: 1, semester: 1, name: 1 });

    res.status(200).json(courses);
  } catch (err) {
    console.error('Courses fetch error:', err);
    res.status(500).json({
      error: 'Failed to fetch courses',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('faculty', 'name email')
      .populate('students', 'name enrollmentNumber department semester');

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.status(200).json(course);
  } catch (err) {
    console.error('Course fetch error:', err);
    res.status(500).json({
      error: 'Failed to fetch course',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
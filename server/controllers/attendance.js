const Attendance = require('../models/attendance');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const Subject = require('../models/Subject');

// Mark attendance for a subject and date
exports.markAttendance = async (req, res) => {
  const { subject, date, records } = req.body;
  try {
    if (!subject || !date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'Subject, date, and records are required' });
    }
    const attendance = new Attendance({ subject, date, records });
    await attendance.save();
    res.status(201).json({ message: 'Attendance marked successfully', attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get attendance with advanced filtering
exports.getAttendance = async (req, res) => {
  try {
    const {
      subject,
      faculty,
      student,
      enrollmentNumber,
      course,
      semester,
      status,
      dateFrom,
      dateTo,
      page = 1,
      pageSize = 20,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build query for Attendance collection
    const query = {};
    let subjectId = subject;
    let facultyId = faculty;

    // SUBJECT: If subject is a name, look up its ObjectId
    if (subject) {
      if (subject.match(/^[0-9a-fA-F]{24}$/)) {
        subjectId = subject;
      } else {
        const subjDoc = await Subject.findOne({ name: subject });
        if (!subjDoc) {
          return res.status(400).json({ error: `Subject '${subject}' not found` });
        }
        subjectId = subjDoc._id;
      }
      query.subject = subjectId;
    }

    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    // Populate subject, records.student, and subject.faculty
    let attendances = await Attendance.find(query)
      .populate({ path: 'subject', select: 'name faculty course semester' })
      .populate({ path: 'records.student', select: 'name enrollmentNumber semester' })
      .lean();

    // FACULTY: If faculty is a name, look up its ObjectId
    if (faculty) {
      let facultyUsers = [];
      if (faculty.match(/^[0-9a-fA-F]{24}$/)) {
        facultyUsers = await User.find({ _id: faculty, role: 'teacher' });
      } else {
        facultyUsers = await User.find({ name: faculty, role: 'teacher' });
      }
      if (!facultyUsers.length) {
        return res.status(400).json({ error: `Faculty '${faculty}' not found` });
      }
      const facultyIds = facultyUsers.map(f => f._id.toString());
      attendances = attendances.filter(a => a.subject && facultyIds.includes(a.subject.faculty?.toString()));
    }

    // Filter by course/semester (if present in subject)
    if (course) {
      attendances = attendances.filter(a => a.subject && a.subject.course === course);
    }
    if (semester) {
      attendances = attendances.filter(a =>
        a.records.some(r => r.student && r.student.semester === semester)
      );
    }

    // Flatten and filter records by student name, enrollment, and status
    let result = [];
    for (const a of attendances) {
      const facultyName = a.subject && a.subject.faculty ? await User.findById(a.subject.faculty).then(f => f?.name || '') : '';
      for (const r of a.records) {
        // Student-wise filtering
        if (student && (!r.student || !r.student.name.toLowerCase().includes(student.toLowerCase()))) continue;
        if (enrollmentNumber && (!r.student || !r.student.enrollmentNumber.includes(enrollmentNumber))) continue;
        if (status && status !== 'all' && r.status.toLowerCase() !== status.toLowerCase()) continue;
        result.push({
          _id: a._id + '-' + (r.student?._id || ''),
          enrollmentNumber: r.student?.enrollmentNumber || 'N/A',
          studentName: r.student?.name || 'N/A',
          subject: a.subject?.name || 'N/A',
          status: r.status,
          date: a.date,
          facultyName,
          course: a.subject?.course || '',
          semester: r.student?.semester || '',
        });
      }
    }

    // Sorting
    const sortKey = sortBy;
    const order = sortOrder === 'desc' ? -1 : 1;
    result.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];
      // For date, compare as Date
      if (sortKey === 'date') {
        valA = new Date(valA);
        valB = new Date(valB);
      }
      if (valA < valB) return -1 * order;
      if (valA > valB) return 1 * order;
      return 0;
    });

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const pageSizeNum = parseInt(pageSize, 10) || 20;
    const total = result.length;
    const paginated = result.slice((pageNum - 1) * pageSizeNum, pageNum * pageSizeNum);

    res.status(200).json({ records: paginated, total });
  } catch (err) {
    console.error('Error in getAttendance:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAttendanceSummary = async (req, res) => {
  try {
    const { dateFrom, dateTo, semester, enrollmentNumber, student, subject } = req.query;
    const user = req.user; // Populated by auth middleware

    // 1. Build subject query based on role
    let subjectQuery = {};
    if (subject) subjectQuery.name = subject;
    if (user.role === 'teacher') {
      subjectQuery.faculty = user._id; // Only their own subjects
    }
    // Admin: no extra filter, gets all subjects

    const subjects = await Subject.find(subjectQuery).lean();

    // 2. Get all students (or filtered)
    let studentQuery = { role: 'student' };
    if (semester) studentQuery.semester = semester;
    if (enrollmentNumber) studentQuery.enrollmentNumber = enrollmentNumber;
    if (student) studentQuery.name = { $regex: student, $options: 'i' };
    const students = await User.find(studentQuery).lean();

    // 4. For each subject, count total classes held in date range
    const subjectTotals = {};
    for (const subj of subjects) {
      const attQuery = { subject: subj._id };
      if (dateFrom || dateTo) {
        attQuery.date = {};
        if (dateFrom) attQuery.date.$gte = new Date(dateFrom);
        if (dateTo) attQuery.date.$lte = new Date(dateTo);
      }
      subjectTotals[subj._id] = await Attendance.countDocuments(attQuery);
    }

    // 5. For each student, for each subject, count attended classes
    const studentRows = [];
    for (const stu of students) {
      const attendance = {};
      for (const subj of subjects) {
        const attQuery = { subject: subj._id };
        if (dateFrom || dateTo) {
          attQuery.date = {};
          if (dateFrom) attQuery.date.$gte = new Date(dateFrom);
          if (dateTo) attQuery.date.$lte = new Date(dateTo);
        }
        // Find all attendance docs for this subject in range
        const attDocs = await Attendance.find(attQuery).lean();
        let attended = 0;
        for (const doc of attDocs) {
          const rec = doc.records.find(r => r.student?.toString() === stu._id.toString());
          if (rec && rec.status === 'present') attended++;
        }
        const total = subjectTotals[subj._id] || 0;
        attendance[subj._id] = {
          attended,
          percent: total ? Math.round((attended / total) * 100) : 0
        };
      }
      studentRows.push({
        enrollmentNumber: stu.enrollmentNumber,
        name: stu.name,
        semester: stu.semester,
        attendance
      });
    }

    // 6. Return
    res.json({
      subjects: subjects.map(s => ({
        _id: s._id,
        code: s.code || '', // If you have a code field
        name: s.name,
        totalClasses: subjectTotals[s._id] || 0
      })),
      students: studentRows
    });
  } catch (err) {
    console.error('Error in getAttendanceSummary:', err);
    res.status(500).json({ error: err.message });
  }
};
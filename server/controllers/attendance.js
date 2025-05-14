const Attendance = require('../models/attendance');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const Subject = require('../models/Subject');

// Mark attendance for a subject and date
exports.markAttendance = async (req, res) => {
  const { subject, date, records } = req.body;
  
  try {
    // Input validation
    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'At least one attendance record is required' });
    }
    
    // Validate each record has required fields
    const invalidRecords = records.filter(r => !r.student || !r.status);
    if (invalidRecords.length > 0) {
      return res.status(400).json({ 
        error: 'All records must have student and status fields',
        invalidRecords
      });
    }
    
    // Check if the subject exists
    const subjectDoc = await Subject.findById(subject);
    if (!subjectDoc) {
      return res.status(404).json({ error: `Subject with ID ${subject} not found` });
    }
    
    // Check faculty permission (only the assigned faculty or admin can mark attendance)
    if (req.user.role === 'teacher' && 
        subjectDoc.faculty && 
        subjectDoc.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        error: 'You do not have permission to mark attendance for this subject' 
      });
    }
    
    // Check for duplicate attendance record for same date and subject
    const existingAttendance = await Attendance.findOne({ subject, date: new Date(date) });
    
    let attendance;
    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.records = records;
      attendance = await existingAttendance.save();
      
      res.status(200).json({ 
        message: 'Attendance updated successfully', 
        attendance 
      });
    } else {
      // Create new attendance
      attendance = new Attendance({ 
        subject, 
        date: new Date(date), 
        records,
        markedBy: req.user._id
      });
      
      await attendance.save();
      res.status(201).json({ 
        message: 'Attendance marked successfully', 
        attendance 
      });
    }
  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({ 
      error: 'Failed to mark attendance', 
      details: err.message 
    });
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
    
    // For faculty users, restrict to only see their own subjects' attendance
    let facultySubjectsOnly = false;
    if (req.user.role === 'teacher') {
      facultySubjectsOnly = true;
    }
    
    // For student users, restrict to only see their own attendance records
    let studentOwnRecordsOnly = false;
    const studentId = req.user._id;
    if (req.user.role === 'student') {
      studentOwnRecordsOnly = true;
    }
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

    // For faculty users requesting their own attendance records
    if (facultySubjectsOnly) {
      // First, find all subjects this faculty teaches
      const facultySubjects = await Subject.find({ faculty: req.user._id }).select('_id');
      const facultySubjectIds = facultySubjects.map(s => s._id.toString());
      
      // Add this to the query if subjects were found
      if (facultySubjectIds.length > 0) {
        query.subject = { $in: facultySubjectIds };
      } else {
        // If faculty has no subjects, return empty result
        console.log('Faculty has no subjects, returning empty result');
        return res.status(200).json({ records: [], total: 0 });
      }
    }
    
    // Add pagination to query to prevent timeout
    const skip = (page - 1) * pageSize;
    const limit = parseInt(pageSize);
    
    console.log('Attendance query:', JSON.stringify(query));
    console.log('Pagination:', { skip, limit });
    if (studentOwnRecordsOnly) {
      console.log('Filtering for student: ' + studentId);
    }
    
    // Get total count for pagination info
    const totalCount = await Attendance.countDocuments(query);
    
    // Check if there are any records before proceeding
    if (totalCount === 0) {
      console.log('No attendance records found for the query');
      return res.status(200).json({ records: [], total: 0 });
    }
    
    // Optimize the query by limiting the results and using pagination
    let attendances = await Attendance.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: 'subject', select: 'name faculty course semester type attendanceTracking' })
      .populate({ path: 'records.student', select: 'name enrollmentNumber semester' })
      .lean();
      
    console.log(`Found ${attendances.length} attendance records out of ${totalCount} total`);
    
    // If no records found after filtering, return empty array
    if (!attendances || attendances.length === 0) {
      return res.status(200).json({ records: [], total: 0 });
    }

    // FACULTY: If faculty is a name, look up its ObjectId
    if (faculty) {
      try {
        let facultyUsers = [];
        if (faculty.match(/^[0-9a-fA-F]{24}$/)) {
          // It's an ObjectId, search directly
          facultyUsers = await User.find({ _id: faculty, role: 'teacher' });
        } else {
          // It's a name, search case-insensitive
          facultyUsers = await User.find({ 
            name: { $regex: new RegExp(faculty, 'i') }, 
            role: 'teacher' 
          });
        }
        
        if (!facultyUsers.length) {
          return res.status(400).json({ error: `Faculty '${faculty}' not found` });
        }
        
        const facultyIds = facultyUsers.map(f => f._id.toString());
        // Pre-fetch all faculty users to avoid multiple queries later
        const allFacultyMap = {};
        for (const fUser of facultyUsers) {
          allFacultyMap[fUser._id.toString()] = fUser.name;
        }
        
        // Filter attendances by faculty
        attendances = attendances.filter(a => {
          if (!a.subject || !a.subject.faculty) return false;
          const facultyIdStr = a.subject.faculty.toString();
          // Store faculty name in the attendance object for later use
          if (facultyIds.includes(facultyIdStr)) {
            a.cachedFacultyName = allFacultyMap[facultyIdStr] || '';
            return true;
          }
          return false;
        });
      } catch (err) {
        console.error('Error filtering by faculty:', err);
        return res.status(500).json({ error: 'Error filtering by faculty', details: err.message });
      }
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
      // Use cached faculty name if available, otherwise look it up
      let facultyName = a.cachedFacultyName || '';
      if (!facultyName && a.subject && a.subject.faculty) {
        try {
          const facultyUser = await User.findById(a.subject.faculty).select('name');
          facultyName = facultyUser?.name || '';
        } catch (err) {
          console.error('Error fetching faculty name:', err);
        }
      }
      
      for (const r of a.records) {
        // If student user, only show their own records
        if (studentOwnRecordsOnly) {
          if (!r.student || r.student._id.toString() !== studentId.toString()) {
            continue; // Skip records that don't belong to the student
          }
        }
        
        // Apply additional filters
        if (student && (!r.student || !r.student.name.toLowerCase().includes(student.toLowerCase()))) {
          continue;
        }
        
        if (enrollmentNumber && (!r.student || !r.student.enrollmentNumber || 
            !r.student.enrollmentNumber.toLowerCase().includes(enrollmentNumber.toLowerCase()))) {
          continue;
        }
        
        if (status && status !== 'all' && r.status !== status) {
          continue;
        }
        
        result.push({
          _id: a._id + '-' + (r.student?._id || ''),
          enrollmentNumber: r.student?.enrollmentNumber || 'N/A',
          studentName: r.student?.name || 'N/A',
          subject: a.subject?.name || 'N/A',
          status: r.status,
          date: a.date,
          facultyName: facultyName,
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
    
    // Handle empty results
    if (total === 0) {
      return res.status(200).json({ records: [], total: 0 });
    }
    
    const paginated = result.slice((pageNum - 1) * pageSizeNum, pageNum * pageSizeNum);

    res.status(200).json({ records: paginated, total });
  } catch (err) {
    console.error('Error in getAttendance:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAttendanceSummary = async (req, res) => {
  try {
    const { subject, dateFrom, dateTo, semester, enrollmentNumber, student } = req.query;
    const user = req.user; // Populated by auth middleware

    // 1. Build subject query based on role
    const query = {};
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    if (subject) {
      query.subject = subject;
    }

    // Initialize subjects list based on role
    let subjectsList = [];

    // For faculty, only show their own subjects
    if (user.role === 'teacher') {
      // Find subjects this faculty teaches
      const facultySubjects = await Subject.find({ faculty: user._id });
      subjectsList = facultySubjects;

      if (facultySubjects.length === 0) {
        return res.status(200).json({
          subjects: [],
          students: []
        });
      }

      // If subject filter already applied, validate access
      if (query.subject) {
        const hasAccess = facultySubjects.some(s =>
          s._id.toString() === query.subject.toString());

        if (!hasAccess) {
          return res.status(403).json({
            error: 'You do not have permission to access this subject'
          });
        }
      } else {
        // Filter by faculty subjects
        query.subject = {
          $in: facultySubjects.map(s => s._id)
        };
      }
    } else if (user.role === 'admin') {
      // Admin gets all subjects
      subjectsList = await Subject.find({});
    } else if (user.role === 'student') {
      // Student gets subjects they're enrolled in
      // Fetch attendances where this student has records
      const studentAttendances = await Attendance.find({
        'records.student': user._id
      }).select('subject').distinct('subject');

      if (studentAttendances.length === 0) {
        return res.status(200).json({
          subjects: [],
          students: []
        });
      }

      // Get the subject details for these attendances
      subjectsList = await Subject.find({
        _id: { $in: studentAttendances }
      });

      // Update query to only include these subjects
      query.subject = { $in: studentAttendances };
    }

    // For student users, we'll need to filter for their own records at the record level
    const studentId = user.role === 'student' ? user._id : null;

    // 2. Get students based on role and filters
    let studentsList = [];
    if (user.role === 'student') {
      // Students only see themselves
      studentsList = [await User.findById(user._id).lean()];
    } else {
      // Admin and faculty see students based on filters
      let studentQuery = { role: 'student' };
      if (semester) studentQuery.semester = semester;
      if (enrollmentNumber) studentQuery.enrollmentNumber = enrollmentNumber;
      if (student) studentQuery.name = { $regex: student, $options: 'i' };
      studentsList = await User.find(studentQuery).lean();
    }

    // 3. For each subject, count total classes held in date range
    const subjectTotals = {};
    for (const subj of subjectsList) {
      const attQuery = { subject: subj._id };
      if (dateFrom || dateTo) {
        attQuery.date = {};
        if (dateFrom) attQuery.date.$gte = new Date(dateFrom);
        if (dateTo) attQuery.date.$lte = new Date(dateTo);
      }
      subjectTotals[subj._id.toString()] = await Attendance.countDocuments(attQuery);
    }

    // 4. For each student, for each subject, count attended classes
    const studentRows = [];
    for (const stu of studentsList) {
      const attendance = {};

      for (const subj of subjectsList) {
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
          // Make sure records is an array before trying to find
          const records = Array.isArray(doc.records) ? doc.records : [];
          const rec = records.find(r =>
            r.student && r.student._id && r.student._id.toString() === stu._id.toString()
          );
          if (rec && rec.status === 'present') attended++;
        }

        const subjIdStr = subj._id.toString();
        const total = subjectTotals[subjIdStr] || 0;

        attendance[subjIdStr] = {
          attended,
          total,
          percent: total ? Math.round((attended / total) * 100) : 0
        };
      }

      studentRows.push({
        _id: stu._id,
        enrollmentNumber: stu.enrollmentNumber || 'N/A',
        name: stu.name || 'Unknown',
        semester: stu.semester || 'N/A',
        attendance
      });
    }

    // Return the summary data
    return res.status(200).json({
      subjects: subjectsList.map(s => ({
        _id: s._id,
        name: s.name,
        code: s.code,
        totalClasses: subjectTotals[s._id.toString()] || 0
      })),
      students: studentRows
    });
  } catch (err) {
    console.error('Error in getAttendanceSummary:', err);
    return res.status(500).json({ error: err.message });
  }
};
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../utils/axios';

const StudentAttendanceDetail = () => {
  const { studentId, subjectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);
  const [subject, setSubject] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]); // Store all records for filtering
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, percentage: 0 });
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjectId || '');

  // Animation classes
  const fadeIn = "animate-fadeIn";
  const slideIn = "animate-slideInUp";

  // Effect that runs when selectedSubjectId changes
  // Function to handle subject selection from dropdown
  const handleSubjectChange = (newSubjectId) => {
    setSelectedSubjectId(newSubjectId);
    
    // Use the allRecords state which contains all unfiltered records
    if (newSubjectId) {
      // Find the selected subject object
      const selectedSubject = availableSubjects.find(s => s._id === newSubjectId);
      
      if (selectedSubject) {
        console.log("Filtering for subject:", selectedSubject.name);
        setSubject(selectedSubject);
        
        // Filter records by subject name (case-insensitive)
        const subjectName = selectedSubject.name.toLowerCase();
        
        // Clear debug
        console.log(`Filtering ${allRecords.length} records for subject: ${subjectName}`);
        
        // Debug the values we're matching
        if (allRecords.length > 0) {
          allRecords.forEach(record => {
            const recordSubject = typeof record.subject === 'string' 
              ? record.subject.toLowerCase() 
              : (record.subject?.name || record.subjectName || '').toLowerCase();
            
            // Log matches to help debug
            if (recordSubject.includes(subjectName) || subjectName.includes(recordSubject)) {
              console.log(`Potential match: '${recordSubject}' vs '${subjectName}'`);
            }
          });
        }
        
        // Flexible filtering - check for inclusion rather than exact match
        const filtered = allRecords.filter(record => {
          // Handle different ways subject could be stored
          const recordSubject = typeof record.subject === 'string' 
            ? record.subject.toLowerCase() 
            : (record.subject?.name || record.subjectName || '').toLowerCase();
            
          // More flexible matching
          return recordSubject.includes(subjectName) || subjectName.includes(recordSubject);
        });
        
        console.log(`Found ${filtered.length} records for subject: ${selectedSubject.name}`);
        
        if (filtered.length > 0) {
          // Update the filtered records
          setAttendanceRecords(filtered);
          
          // Update stats for this subject
          const totalClasses = filtered.length;
          const presentClasses = filtered.filter(r => r.status.toLowerCase() === 'present').length;
          const absentClasses = totalClasses - presentClasses;
          const percentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
          
          setStats({
            total: totalClasses,
            present: presentClasses,
            absent: absentClasses,
            percentage
          });
        } else {
          // No records found for this subject
          setAttendanceRecords([]);
          setStats({ total: 0, present: 0, absent: 0, percentage: 0 });
        }
        
        // Update URL
        navigate(`/student-attendance/${studentId}/${newSubjectId}`, { replace: true });
      }
    } else {
      // Reset to all subjects
      console.log("Resetting to all subjects");
      setSubject(null);
      setAttendanceRecords(allRecords);
      
      // Recalculate stats for all records
      const totalClasses = allRecords.length;
      const presentClasses = allRecords.filter(r => r.status.toLowerCase() === 'present').length;
      const absentClasses = totalClasses - presentClasses;
      const percentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
      
      setStats({
        total: totalClasses,
        present: presentClasses,
        absent: absentClasses,
        percentage
      });
      
      // Update URL
      navigate(`/student-attendance/${studentId}`, { replace: true });
    }
  };
  
  // Sync URL parameter with state
  useEffect(() => {
    if (selectedSubjectId !== subjectId) {
      setSelectedSubjectId(subjectId || '');
    }
  }, [subjectId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get authentication token
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        const headers = { Authorization: `Bearer ${token}` };
        
        // Step 1: Get student info from the summary endpoint
        try {
          const summaryRes = await axios.get('/attendance/summary', { headers });
          const studentList = summaryRes.data.students || [];
          const foundStudent = studentList.find(s => s._id === studentId);

          if (foundStudent) {
            setStudent({
              name: foundStudent.name,
              enrollmentNumber: foundStudent.enrollmentNumber,
              semester: foundStudent.semester,
              _id: foundStudent._id
            });
          }
          
          // Extract all unique subjects from the summary data
          if (summaryRes.data.subjects && Array.isArray(summaryRes.data.subjects)) {
            setAvailableSubjects(summaryRes.data.subjects);
            console.log('Available subjects:', summaryRes.data.subjects.length);
          }
        } catch (err) {
          console.warn('Could not fetch student info from summary:', err);
          // Continue even if we can't get student info from summary
        }
        
        // Step 2: Get subject info if a subject ID was provided
        if (subjectId) {
          try {
            const subjectRes = await axios.get(`/subject/${subjectId}`, { headers });
            setSubject(subjectRes.data);
          } catch (subjectErr) {
            console.warn('Could not fetch subject details:', subjectErr);
          }
        }
        
        // Step 3: Prepare to fetch attendance records
        console.log('Fetching attendance for student ID:', studentId);
        
        // First attempt to get ALL attendance records, then filter client-side
        // This approach works more reliably than server-side filtering
        const params = {
          page: 1,
          pageSize: 100,  // Get more records to ensure we have all the student's data
          sortBy: 'date',
          sortOrder: 'desc'
        };
        
        // Use the selectedSubjectId from state for filtering (which will match the URL param)
        const currentSubjectId = selectedSubjectId || subjectId;
        
        // Only add subject filter if specifically requested
        if (currentSubjectId) {
          console.log('Filtering by subject ID:', currentSubjectId);
          params.subject = currentSubjectId;
        }
        
        console.log('Attendance API request params:', params);
        
        // Step 4: Fetch attendance records
        const attendanceResponse = await axios.get('/attendance/records', { 
          params,
          headers
        });
        
        // Step 5: Process the attendance records
        const fetchedRecords = attendanceResponse.data.records || [];
        console.log('Fetched attendance records:', fetchedRecords.length);
        
        if (fetchedRecords.length > 0) {
          console.log('Sample record:', fetchedRecords[0]);
        }
        
        // Logging to help debug the structure
        console.log('Examining attendance records structure for filtering:');
        if (fetchedRecords.length > 0) {
          const sampleRecord = fetchedRecords[0];
          console.log('First record:', sampleRecord);
          console.log('Record keys:', Object.keys(sampleRecord));
          
          // If the record has a nested records array, log that structure too
          if (sampleRecord.records && Array.isArray(sampleRecord.records) && sampleRecord.records.length > 0) {
            console.log('This is a parent attendance record with nested student records');
            console.log('Sample nested record:', sampleRecord.records[0]);
          }
        }
        
        // Handle the case where attendance records might be stored in parent records
        let studentAttendanceRecords = [];
        
        // Try two approaches for filtering:
        
        // Based on server code inspection, records in the attendance API use this format:
        // _id: a._id + '-' + (r.student?._id || ''),
        // enrollmentNumber: r.student?.enrollmentNumber || 'N/A',
        // studentName: r.student?.name || 'N/A',
        // subject: a.subject?.name || 'N/A', (string, not object)
        // status: r.status,
        // date: a.date,
        
        // Get ALL records and filter for the ones containing this student's ID
        try {
          // Add 'student' as a query parameter to help filter server-side
          params.student = studentId;
          console.log('Trying server-side filtering with student ID...');
          
          // First strategy: Use student name filtering if available
          if (student && student.name) {
            console.log('Using student name for filtering:', student.name);
            params.student = student.name;
          }
          
          const attendanceWithFilter = await axios.get('/attendance/records', { 
            params, 
            headers 
          });
          
          const filteredRecords = attendanceWithFilter.data.records || [];
          console.log('Records after server filtering:', filteredRecords.length);
          
          // If we got results, use them
          if (filteredRecords.length > 0) {
            studentAttendanceRecords = filteredRecords;
          } else {
            // Second strategy: Get all records and filter client-side
            console.log('No records found with server filtering, trying client-side filtering');
            
            // Reset the filter and get all records
            delete params.student;
            const allRecordsResponse = await axios.get('/attendance/records', { 
              params, 
              headers 
            });
            
            const allAttendanceRecords = allRecordsResponse.data.records || [];
            console.log('Total records to filter through:', allAttendanceRecords.length);
            
            // Filter records based on the _id containing student ID
            // This works because the backend creates IDs like "attendanceID-studentID"
            studentAttendanceRecords = allAttendanceRecords.filter(record => {
              return record._id?.includes(studentId);
            });
            
            console.log('Records after client-side ID filtering:', studentAttendanceRecords.length);
            
            // If we still have no records, try one more approach
            if (studentAttendanceRecords.length === 0 && student?.name) {
              console.log('Trying to match by student name:', student.name);
              studentAttendanceRecords = allAttendanceRecords.filter(record => {
                return record.studentName === student.name;
              });
              console.log('Records after name filtering:', studentAttendanceRecords.length);
            }
          }
        } catch (filterErr) {
          console.error('Error during advanced filtering:', filterErr);
        }
        
        console.log('Total student attendance records found:', studentAttendanceRecords.length);
        
        // Save both the filtered records and store all records for filtering
        setAttendanceRecords(studentAttendanceRecords);
        setAllRecords(studentAttendanceRecords);
        
        // If there's a selected subject ID on initial load, filter immediately
        if (currentSubjectId && studentAttendanceRecords.length > 0) {
          const currentSubject = availableSubjects.find(s => s._id === currentSubjectId);
          if (currentSubject) {
            // Delay to ensure allRecords is set
            setTimeout(() => handleSubjectChange(currentSubjectId), 100);
          }
        }
        
        // Additional client-side filtering based on selected subject
        if (currentSubjectId) {
          console.log('Additional client-side filtering for subject:', currentSubjectId);
          
          // Get the selected subject name for string-based comparison
          const selectedSubject = availableSubjects.find(s => s._id === currentSubjectId);
          const selectedSubjectName = selectedSubject?.name?.toLowerCase();
          console.log('Selected subject name:', selectedSubjectName);
          
          // Debug: Log a sample record to understand its structure
          if (studentAttendanceRecords.length > 0) {
            console.log('Sample record structure:', JSON.stringify(studentAttendanceRecords[0]));
            console.log('Subject field type:', typeof studentAttendanceRecords[0].subject);
            console.log('Subject field value:', studentAttendanceRecords[0].subject);
          }
          
          studentAttendanceRecords = studentAttendanceRecords.filter(record => {
            // Check if the record's subject matches the selected subject
            // Handle different ways the subject might be represented
            
            // If we have a subject name to check against
            if (selectedSubjectName) {
              // Check if subject is a string name (most common case based on logs)
              if (typeof record.subject === 'string') {
                return record.subject.toLowerCase() === selectedSubjectName;
              }
              
              // If subject is an object with a name property
              if (record.subject && record.subject.name) {
                return record.subject.name.toLowerCase() === selectedSubjectName;
              }
              
              // If subject name is stored in subjectName field
              if (record.subjectName) {
                return record.subjectName.toLowerCase() === selectedSubjectName;
              }
            }
            
            // ID-based checks (less likely based on logs but keeping them)
            return (
              // If subject is an object with an _id
              (record.subject && record.subject._id === currentSubjectId) ||
              // If subject is an object with a subjectId
              (record.subject && record.subject.subjectId === currentSubjectId) ||
              // If subjectId exists directly on the record
              (record.subjectId === currentSubjectId) ||
              // If subject is a string ID
              (record.subject === currentSubjectId)
            );
          });
          console.log('After additional subject filtering:', studentAttendanceRecords.length);
        }
        
        // Calculate attendance statistics
        const totalClasses = studentAttendanceRecords.length;
        const presentCount = studentAttendanceRecords.filter(
          record => record.status.toLowerCase() === 'present'
        ).length;
        const absentCount = totalClasses - presentCount;
        const attendancePercentage = totalClasses > 0 
          ? Math.round((presentCount / totalClasses) * 100) 
          : 0; 
        // Update statistics state
        setStats({
          total: totalClasses,
          present: presentCount,
          absent: absentCount,
          percentage: attendancePercentage
        });
        
        console.log('Attendance statistics:', {
          total: totalClasses,
          present: presentCount,
          absent: absentCount,
          percentage: attendancePercentage
        });
        
        // Always try to get more complete student information from the records
        // This helps ensure we have the best data available
        if (studentAttendanceRecords.length > 0) {
          const firstRecord = studentAttendanceRecords[0];
          
          // Extract student info from whatever fields are available
          const studentName = firstRecord.studentName || 
                             (firstRecord.student && firstRecord.student.name) || 
                             'Student';
                             
          const enrollmentNumber = firstRecord.enrollmentNumber || 
                                  (firstRecord.student && firstRecord.student.enrollmentNumber) || 
                                  '';
                                  
          // Update the student state with the most complete information
          setStudent({
            name: studentName,
            enrollmentNumber: enrollmentNumber,
            semester: firstRecord.semester || (firstRecord.student && firstRecord.student.semester) || '',
            _id: studentId
          });
          
          // Also try to extract subject info if available
          if (firstRecord.subject && !subject) {
            const subjectName = typeof firstRecord.subject === 'string' 
                              ? firstRecord.subject 
                              : (firstRecord.subject.name || 'Subject');
                              
            setSubject({
              name: subjectName,
              _id: subjectId || (firstRecord.subject._id || '')
            });
          }
        }
      } catch (err) {
        console.error('Error fetching attendance details:', err);
        setError('Failed to load attendance details: ' + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [studentId, subjectId, selectedSubjectId]); // Include selectedSubjectId to refresh data when dropdown changes

  // Group attendance records by month
  const groupedByMonth = attendanceRecords.reduce((acc, record) => {
    // Skip invalid records
    if (!record || !record.date) {
      console.warn('Invalid record or missing date property:', record);
      return acc;
    }
    
    try {
      // Parse the date and create a formatted month-year string
      const date = new Date(record.date);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date in record:', record.date);
        return acc;
      }
      
      const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      
      // Initialize the array for this month if it doesn't exist yet
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      
      // Create a cleaned-up record with consistent properties
      const cleanedRecord = {
        _id: record._id || '',
        date: record.date,
        // Support different ways the status might be represented
        status: record.status || 'unknown',
        // Support both string and object subject formats
        subject: typeof record.subject === 'string' ? record.subject : 
                (record.subject?.name || record.subjectName || ''),
        // Support different student info formats
        studentName: record.studentName || (record.student?.name || ''),
        enrollmentNumber: record.enrollmentNumber || (record.student?.enrollmentNumber || ''),
        // Add formatted date for display
        formattedDate: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short'
        })
      };
      
      // Add the cleaned record to its month group
      acc[monthYear].push(cleanedRecord);
    } catch (err) {
      console.error('Error processing record for calendar view:', err);
    }
    
    return acc;
  }, {});

  const renderCalendarView = () => {
    return Object.entries(groupedByMonth).map(([month, records]) => (
      <div key={month} className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-3">{month}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {records.map((record, index) => {
            // Ensure status is handled consistently
            const statusLower = record.status?.toLowerCase() || 'unknown';
            const isPresent = statusLower === 'present';
            
            // Format status text for display
            const statusDisplay = record.status 
              ? record.status.charAt(0).toUpperCase() + record.status.slice(1).toLowerCase() 
              : 'Unknown';
              
            return (
              <div 
                key={index} 
                className={`p-3 rounded-lg shadow-sm border ${
                  isPresent
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                } transition-all hover:shadow-md hover:scale-105`}
              >
                <div className="font-semibold">{record.formattedDate}</div>
                <div className="text-sm flex items-center mt-1">
                  <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                    isPresent ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  {statusDisplay}
                </div>
                {record.subject && (
                  <div className="text-xs mt-1 text-gray-600 font-medium">
                    {typeof record.subject === 'string' ? record.subject : record.subject.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-cyan-100 to-white p-0">
      <div className="pt-28 px-4 pb-16 flex flex-col items-center">
        {/* Back button */}
        <div className="w-full max-w-6xl mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Attendance Records
          </button>
        </div>

        {/* Header with student info */}
        <div className={`text-center mb-8 ${fadeIn}`}>
          <h1 className="text-4xl font-extrabold text-gray-800 mb-3">
            Student Attendance Detail
          </h1>
          {student && (
            <div className="bg-white/80 backdrop-blur-sm py-3 px-6 rounded-lg inline-block shadow-sm">
              <p className="text-lg">
                <span className="font-semibold text-black">{student.name}</span>
                {student.enrollmentNumber && (
                  <span className="text-gray-600 ml-2">({student.enrollmentNumber})</span>
                )}
              </p>
              {student.semester && (
                <p className="text-gray-600">Semester: {student.semester}</p>
              )}
              {/* Subject Selection Dropdown */}
              <div className="mt-2">
                <label htmlFor="subject-filter" className="text-gray-600 mb-1 block">Subject:</label>
                <select 
                  id="subject-filter"
                  className="px-3 py-1 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-400 shadow-sm w-full max-w-xs"
                  value={selectedSubjectId || ''}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                >
                  <option value="">All Subjects</option>
                  {availableSubjects.map(subj => (
                    <option key={subj._id} value={subj._id}>
                      {subj.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-600 p-4 rounded-lg max-w-xl mx-auto">
            {error}
          </div>
        ) : (
          <>
            {/* Attendance Stats */}
            <div className={`w-full max-w-6xl mb-10 ${slideIn}`}>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Attendance Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-gray-500 text-sm mb-1">Total Classes</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-green-500 text-sm mb-1">Present</p>
                    <p className="text-3xl font-bold text-green-600">{stats.present}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <p className="text-red-500 text-sm mb-1">Absent</p>
                    <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${
                    stats.percentage >= 75 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    <p className="text-sm mb-1">Attendance</p>
                    <p className="text-3xl font-bold">{stats.percentage}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar view of attendance */}
            <div className={`w-full max-w-6xl ${fadeIn}`}>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Attendance Calendar</h2>
                {attendanceRecords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No attendance records found for this student.
                  </div>
                ) : (
                  renderCalendarView()
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentAttendanceDetail;

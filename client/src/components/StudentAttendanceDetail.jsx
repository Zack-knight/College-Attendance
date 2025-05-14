import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../utils/axios';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import {
  FadeIn,
  SlideInUp,
  Card3D,
  GlassCard,
  GradientBackground,
  MorphingBlob
} from './AnimationUtils';

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    },
    hover: {
      y: -5,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

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
      
      // Update stats for all subjects
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

  useEffect(() => {
    // Initialize with the subject from URL if provided
    if (subjectId) {
      setSelectedSubjectId(subjectId);
    }
    
    fetchData();
  }, [studentId, subjectId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch student details
      const studentResponse = await axios.get(`/user/${studentId}`);
      setStudent(studentResponse.data);
      
      // Fetch all attendance records for this student
      const attendanceResponse = await axios.get(`/attendance/student/${studentId}`);
      
      if (attendanceResponse.data && attendanceResponse.data.length > 0) {
        console.log(`Fetched ${attendanceResponse.data.length} attendance records`);
        
        // Process and normalize the attendance data
        const processedRecords = attendanceResponse.data.map(record => {
          // Ensure each record has a consistent structure
          return {
            _id: record._id,
            date: new Date(record.date),
            status: record.status || 'absent', // Default to absent if not specified
            subject: record.subject || record.subjectName || 'Unknown Subject',
            subjectId: record.subject?._id || record.subjectId || null,
            // Add any other fields needed
          };
        });
        
        // Sort by date (newest first)
        processedRecords.sort((a, b) => b.date - a.date);
        
        // Store all records
        setAllRecords(processedRecords);
        
        // Set initial records based on selected subject
        if (subjectId) {
          // Will be filtered when subjects are loaded
          console.log(`Initial subject filter: ${subjectId}`);
        } else {
          // Show all records initially
          setAttendanceRecords(processedRecords);
          
          // Calculate overall stats
          const totalClasses = processedRecords.length;
          const presentClasses = processedRecords.filter(r => r.status.toLowerCase() === 'present').length;
          const absentClasses = totalClasses - presentClasses;
          const percentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
          
          setStats({
            total: totalClasses,
            present: presentClasses,
            absent: absentClasses,
            percentage
          });
        }
      } else {
        console.log("No attendance records found");
        setAttendanceRecords([]);
        setAllRecords([]);
        setStats({ total: 0, present: 0, absent: 0, percentage: 0 });
      }
      
      // Fetch available subjects
      const subjectsResponse = await axios.get('/subject');
      if (subjectsResponse.data && subjectsResponse.data.length > 0) {
        setAvailableSubjects(subjectsResponse.data);
        
        // If we have a subjectId, filter records now that we have subjects
        if (subjectId) {
          const selectedSubject = subjectsResponse.data.find(s => s._id === subjectId);
          if (selectedSubject) {
            handleSubjectChange(subjectId);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(`Failed to fetch attendance data: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Group attendance records by month and year
  const groupedAttendance = attendanceRecords.reduce((groups, record) => {
    const date = new Date(record.date);
    const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
    
    if (!groups[monthYear]) {
      groups[monthYear] = {
        monthName: date.toLocaleString('default', { month: 'long' }),
        year: date.getFullYear(),
        records: []
      };
    }
    
    groups[monthYear].records.push(record);
    return groups;
  }, {});

  // Sort months chronologically (newest first)
  const sortedMonths = Object.keys(groupedAttendance).sort((a, b) => {
    const [monthA, yearA] = a.split('-').map(Number);
    const [monthB, yearB] = b.split('-').map(Number);
    
    if (yearA !== yearB) {
      return yearB - yearA; // Sort by year descending
    }
    return monthB - monthA; // Then by month descending
  });

  const renderCalendarView = () => {
    if (sortedMonths.length === 0) {
      return (
        <div className="text-center py-8 text-gray-300">
          No attendance records found for the selected period.
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {sortedMonths.map(monthKey => {
          const month = groupedAttendance[monthKey];
          
          return (
            <motion.div 
              key={monthKey}
              variants={itemVariants}
              className="mb-8"
            >
              <h3 className="text-lg font-semibold text-white mb-3">
                {month.monthName} {month.year}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {month.records.map(record => {
                  const date = new Date(record.date);
                  const isPresent = record.status.toLowerCase() === 'present';
                  
                  // Get subject name
                  let subjectName = '';
                  if (typeof record.subject === 'string') {
                    subjectName = record.subject;
                  } else if (record.subject?.name) {
                    subjectName = record.subject.name;
                  } else if (record.subjectName) {
                    subjectName = record.subjectName;
                  }
                  
                  return (
                    <motion.div
                      key={record._id}
                      variants={cardVariants}
                      whileHover="hover"
                      className={`p-3 rounded-lg ${
                        isPresent 
                          ? 'bg-green-500/30 text-green-300' 
                          : 'bg-red-500/30 text-red-300'
                      } backdrop-blur-sm`}
                    >
                      <div className="font-semibold text-lg">
                        {date.getDate()}
                      </div>
                      <div className="text-sm truncate">
                        {subjectName}
                      </div>
                      <div className="text-xs mt-1">
                        {isPresent ? 'Present' : 'Absent'}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <motion.div 
        className="min-h-screen bg-background overflow-hidden py-12 px-4 relative"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <GradientBackground gradient="from-teal-500/10 via-blue-600/10 to-purple-600/10" />
        
        <MorphingBlob 
          color="bg-teal-500" 
          size="w-64 h-64" 
          opacity="opacity-10" 
          className="absolute top-0 right-0 translate-x-1/4"
        />
        <MorphingBlob 
          color="bg-purple-500" 
          size="w-96 h-96" 
          opacity="opacity-10" 
          className="absolute bottom-0 left-0 -translate-x-1/4"
        />

        <div className="w-full max-w-7xl mx-auto relative z-10">
          <motion.div 
            className="flex flex-col items-center mb-8"
            variants={itemVariants}
          >
            <Link 
              to="/attendance-records" 
              className="self-start mb-4 inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Records
            </Link>

            <motion.h1 
              className="text-4xl font-extrabold text-center mb-6 tracking-tight"
              variants={itemVariants}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">
                Student Attendance History
              </span>
            </motion.h1>

            {student && (
              <GlassCard className="p-6 mb-8">
                <motion.div variants={itemVariants}>
                  <p className="text-lg">
                    <span className="font-semibold text-white">{student.name}</span>
                    {student.enrollmentNumber && (
                      <span className="text-gray-300 ml-2">({student.enrollmentNumber})</span>
                    )}
                  </p>
                  {student.semester && (
                    <p className="text-gray-300">Semester: {student.semester}</p>
                  )}
                  {/* Subject Selection Dropdown */}
                  <div className="mt-4">
                    <label htmlFor="subject-filter" className="text-gray-300 mb-1 block">Subject:</label>
                    <select 
                      id="subject-filter"
                      className="px-3 py-2 border border-gray-300/30 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-150 bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 w-full max-w-xs"
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
                </motion.div>
              </GlassCard>
            )}
          </motion.div>

          {loading ? (
            <motion.div 
              className="flex justify-center items-center h-64"
              variants={itemVariants}
            >
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </motion.div>
          ) : error ? (
            <motion.div 
              className="bg-red-500/20 backdrop-blur-sm border border-red-300/30 text-red-300 p-4 rounded-lg max-w-xl mx-auto"
              variants={itemVariants}
            >
              {error}
            </motion.div>
          ) : (
            <>
              {/* Attendance Stats */}
              <motion.div 
                className="w-full max-w-6xl mb-10"
                variants={itemVariants}
              >
                <GlassCard className="p-6">
                  <motion.h2 
                    className="text-xl font-bold text-white mb-6"
                    variants={itemVariants}
                  >
                    Attendance Overview
                  </motion.h2>
                  <motion.div 
                    className="grid grid-cols-2 md:grid-cols-4 gap-6"
                    variants={containerVariants}
                  >
                    <motion.div 
                      className="bg-white/10 backdrop-blur-sm p-4 rounded-lg text-center"
                      variants={itemVariants}
                    >
                      <p className="text-gray-300 text-sm mb-1">Total Classes</p>
                      <p className="text-3xl font-bold text-white">{stats.total}</p>
                    </motion.div>
                    <motion.div 
                      className="bg-green-500/20 backdrop-blur-sm p-4 rounded-lg text-center"
                      variants={itemVariants}
                    >
                      <p className="text-green-300 text-sm mb-1">Present</p>
                      <p className="text-3xl font-bold text-green-300">{stats.present}</p>
                    </motion.div>
                    <motion.div 
                      className="bg-red-500/20 backdrop-blur-sm p-4 rounded-lg text-center"
                      variants={itemVariants}
                    >
                      <p className="text-red-300 text-sm mb-1">Absent</p>
                      <p className="text-3xl font-bold text-red-300">{stats.absent}</p>
                    </motion.div>
                    <motion.div 
                      className={`p-4 rounded-lg text-center ${
                        stats.percentage >= 75 
                          ? 'bg-green-500/20 backdrop-blur-sm text-green-300' 
                          : 'bg-red-500/20 backdrop-blur-sm text-red-300'
                      }`}
                      variants={itemVariants}
                    >
                      <p className="text-sm mb-1">Attendance</p>
                      <p className="text-3xl font-bold">{stats.percentage}%</p>
                    </motion.div>
                  </motion.div>
                </GlassCard>
              </motion.div>

              {/* Calendar view of attendance */}
              <motion.div 
                className="w-full max-w-6xl"
                variants={itemVariants}
              >
                <GlassCard className="p-6">
                  <motion.h2 
                    className="text-xl font-bold text-white mb-6"
                    variants={itemVariants}
                  >
                    Attendance Calendar
                  </motion.h2>
                  {attendanceRecords.length === 0 ? (
                    <motion.div 
                      className="text-center py-8 text-gray-300"
                      variants={itemVariants}
                    >
                      No attendance records found for this student.
                    </motion.div>
                  ) : (
                    renderCalendarView()
                  )}
                </GlassCard>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default StudentAttendanceDetail;

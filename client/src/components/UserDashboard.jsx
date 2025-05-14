import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

// Icon Components
const FeedbackIcon = () => (
  <div className="mb-4 bg-pink-500/20 backdrop-blur-sm p-4 rounded-full text-pink-300 transform transition-transform group-hover:scale-110">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  </div>
);

const AttendanceIcon = () => (
  <div className="mb-4 bg-teal-500/20 backdrop-blur-sm p-4 rounded-full text-teal-300 transform transition-transform group-hover:scale-110">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  </div>
);

const CalendarIcon = () => (
  <div className="mb-4 bg-blue-500/20 backdrop-blur-sm p-4 rounded-full text-blue-300 transform transition-transform group-hover:scale-110">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
);

const UserDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [error, setError] = useState('');
  
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
      y: -10,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  useEffect(() => {
    // Fetch student information and attendance summary
    fetchStudentData();
  }, []);

  // Fetch student information and attendance summary
  const fetchStudentData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Get user info
      const userResponse = await axios.get('/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStudentInfo(userResponse.data);
      
      // Get attendance summary
      const attendanceResponse = await axios.get('/attendance/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAttendanceSummary(attendanceResponse.data);
    } catch (err) {
      console.error('Error fetching student data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate attendance overview from summary data
  const getAttendanceOverview = () => {
    if (!attendanceSummary || !attendanceSummary.subjects || !attendanceSummary.students || attendanceSummary.students.length === 0) {
      return { totalClasses: 0, totalAttended: 0, percentage: 0 };
    }
    
    // Get the student data (should be the only one in the array for students viewing their own data)
    const student = attendanceSummary.students[0];
    
    let totalClasses = 0;
    let totalAttended = 0;
    
    // Sum up attendance across all subjects
    Object.values(student.attendance).forEach(att => {
      totalClasses += att.total;
      totalAttended += att.attended;
    });
    
    // Calculate overall percentage
    const percentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;
    
    return {
      totalClasses,
      totalAttended,
      percentage
    };
  };

  const overview = getAttendanceOverview();

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
          <motion.div variants={itemVariants} className="text-center mb-12">
            <motion.h1 
              className="text-4xl font-extrabold mb-4 tracking-tight"
              variants={itemVariants}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">Student Dashboard</span>
            </motion.h1>
            {studentInfo && (
              <motion.p 
                className="text-gray-300 text-lg"
                variants={itemVariants}
              >
                Welcome, <span className="font-semibold">{studentInfo.name}</span>
              </motion.p>
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
              {/* Attendance Overview */}
              <motion.div 
                className="w-full max-w-5xl mx-auto mb-10"
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
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    variants={containerVariants}
                  >
                    <motion.div 
                      className="bg-white/10 backdrop-blur-sm p-4 rounded-lg text-center"
                      variants={itemVariants}
                    >
                      <p className="text-gray-300 text-sm mb-1">Total Classes</p>
                      <p className="text-3xl font-bold text-white">{overview.totalClasses}</p>
                    </motion.div>
                    <motion.div 
                      className="bg-teal-500/20 backdrop-blur-sm p-4 rounded-lg text-center"
                      variants={itemVariants}
                    >
                      <p className="text-teal-300 text-sm mb-1">Classes Attended</p>
                      <p className="text-3xl font-bold text-teal-300">{overview.totalAttended}</p>
                    </motion.div>
                    <motion.div 
                      className={`p-4 rounded-lg text-center ${
                        overview.percentage >= 75 
                          ? 'bg-green-500/20 backdrop-blur-sm text-green-300' 
                          : 'bg-red-500/20 backdrop-blur-sm text-red-300'
                      }`}
                      variants={itemVariants}
                    >
                      <p className="text-sm mb-1">Overall Attendance</p>
                      <p className="text-3xl font-bold">{overview.percentage}%</p>
                    </motion.div>
                  </motion.div>
                </GlassCard>
              </motion.div>

              {/* Quick Actions */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto mb-10"
                variants={containerVariants}
              >
                {/* View Attendance */}
                <Card3D className="bg-white/10 backdrop-blur-sm p-6">
                  <motion.div variants={itemVariants}>
                    <Link to="/view-attendance" className="flex flex-col items-center">
                      <AttendanceIcon />
                      <h3 className="text-xl font-bold text-white mb-2">View Attendance</h3>
                      <p className="text-gray-300 text-center mb-4">Check your detailed attendance records.</p>
                      <div className="mt-auto">
                        <span className="text-teal-400 font-semibold flex items-center group">
                          View Records
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                </Card3D>

                {/* Submit Feedback */}
                <Card3D className="bg-white/10 backdrop-blur-sm p-6">
                  <motion.div variants={itemVariants}>
                    <Link to="/feedback" className="flex flex-col items-center">
                      <FeedbackIcon />
                      <h3 className="text-xl font-bold text-white mb-2">Submit Feedback</h3>
                      <p className="text-gray-300 text-center mb-4">Share your experience or report attendance issues.</p>
                      <div className="mt-auto">
                        <span className="text-pink-400 font-semibold flex items-center group">
                          Submit Form
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                </Card3D>

                {/* Schedule */}
                <Card3D className="bg-white/10 backdrop-blur-sm p-6">
                  <motion.div variants={itemVariants}>
                    <div className="flex flex-col items-center">
                      <CalendarIcon />
                      <h3 className="text-xl font-bold text-white mb-2">Class Schedule</h3>
                      <p className="text-gray-300 text-center mb-4">Keep track of your upcoming classes and events.</p>
                      <div className="mt-auto">
                        <span className="text-blue-400 font-semibold flex items-center opacity-50">
                          Coming Soon
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Card3D>
              </motion.div>
              
              {/* Subjects List */}
              {attendanceSummary && attendanceSummary.subjects && attendanceSummary.subjects.length > 0 && (
                <motion.div 
                  className="w-full max-w-5xl mx-auto"
                  variants={itemVariants}
                >
                  <GlassCard className="p-6">
                    <motion.h2 
                      className="text-xl font-bold text-white mb-6"
                      variants={itemVariants}
                    >
                      Your Subjects
                    </motion.h2>
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      variants={containerVariants}
                    >
                      {attendanceSummary.subjects.map(subj => {
                        const studentData = attendanceSummary.students[0]; // For student, there's only one record (themselves)
                        const attendance = studentData?.attendance[subj._id] || { attended: 0, total: 0, percent: 0 };
                        
                        return (
                          <motion.div 
                            key={subj._id} 
                            variants={cardVariants}
                            whileHover="hover"
                            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 transition-all duration-300"
                          >
                            <h3 className="font-bold text-white border-b border-white/20 pb-2 mb-3">{subj.name}</h3>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                              <div className="bg-white/5 backdrop-blur-sm p-3 rounded-lg text-center">
                                <div className="text-xs text-gray-300 mb-1">Classes Held</div>
                                <div className="font-bold text-white">{attendance.total || subj.totalClasses}</div>
                              </div>
                              <div className="bg-white/5 backdrop-blur-sm p-3 rounded-lg text-center">
                                <div className="text-xs text-gray-300 mb-1">Attended</div>
                                <div className="font-bold text-white">{attendance.attended}</div>
                              </div>
                              <div className={`p-3 rounded-lg text-center col-span-2 ${
                                attendance.percent >= 75 
                                  ? 'bg-green-500/20 text-green-300' 
                                  : 'bg-red-500/20 text-red-300'
                              }`}>
                                <div className="text-xs mb-1">Attendance</div>
                                <div className="font-bold">{attendance.percent}%</div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </GlassCard>
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default UserDashboard;

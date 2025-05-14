import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';

// Icon Components
const FeedbackIcon = () => (
  <div className="mb-4 bg-pink-100 p-4 rounded-full text-pink-500 shadow-inner transform transition-transform group-hover:scale-110">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  </div>
);

const AttendanceIcon = () => (
  <div className="mb-4 bg-teal-100 p-4 rounded-full text-teal-500 shadow-inner transform transition-transform group-hover:scale-110">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  </div>
);

const CalendarIcon = () => (
  <div className="mb-4 bg-blue-100 p-4 rounded-full text-blue-500 shadow-inner transform transition-transform group-hover:scale-110">
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
  
  // Animation classes
  const fadeIn = "animate-fadeIn";
  const slideIn = "animate-slideInUp";
  
  // Function to get a random animation delay for staggered card animations
  const getRandomDelay = () => {
    const delays = ['delay-100', 'delay-200', 'delay-300', 'delay-400'];
    return delays[Math.floor(Math.random() * delays.length)];
  };

  useEffect(() => {
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
    
    fetchStudentData();
  }, []);

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
      totalClasses += att.total || 0;
      totalAttended += att.attended || 0;
    });
    
    const percentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;
    
    return { totalClasses, totalAttended, percentage };
  };
  
  const overview = getAttendanceOverview();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-cyan-100 to-white p-0">
      <div className="pt-28 px-4 pb-16 flex flex-col items-center">
        {/* Heading & Student Info */}
        <div className={`text-center mb-12 ${fadeIn}`}>
          <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-3 tracking-tight">
            Student <span className="text-teal-600">Dashboard</span>
          </h1>
          {studentInfo && (
            <div className="text-gray-600 bg-white/50 py-2 px-4 rounded-full backdrop-blur-sm inline-block">
              <span className="font-semibold">{studentInfo.name}</span> | 
              Enrollment: <span className="font-semibold">{studentInfo.enrollmentNumber || 'N/A'}</span>
              {studentInfo.semester && ` | Semester: ${studentInfo.semester}`}
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-600 p-4 rounded-lg max-w-xl mx-auto">{error}</div>
        ) : (
          <>
            {/* Attendance Overview */}
            <div className={`w-full max-w-5xl ${slideIn} mb-10`}>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <AttendanceIcon />
                  <span className="ml-2">Attendance Overview</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-gray-500 text-sm mb-1">Total Classes</p>
                    <p className="text-3xl font-bold text-gray-800">{overview.totalClasses}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-gray-500 text-sm mb-1">Classes Attended</p>
                    <p className="text-3xl font-bold text-gray-800">{overview.totalAttended}</p>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${overview.percentage >= 75 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    <p className="text-sm mb-1">Attendance Percentage</p>
                    <p className="text-3xl font-bold">{overview.percentage}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
              {/* View Detailed Attendance Records */}
              <Link
                to="/attendance-records"
                className={`${fadeIn} ${getRandomDelay()} group bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center transform hover:-translate-y-1 relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400/5 to-cyan-400/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                <AttendanceIcon />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Attendance Records</h3>
                <p className="text-gray-600 text-center">View your detailed attendance records for all subjects.</p>
                <div className="mt-4 flex">
                  <span className="text-teal-600 font-semibold group-hover:text-teal-700 transition-colors flex items-center">
                    View Records
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>

              {/* Submit Feedback */}
              <Link
                to="/feedback"
                className={`${fadeIn} ${getRandomDelay()} group bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center transform hover:-translate-y-1 relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/5 to-purple-400/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                <FeedbackIcon />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Submit Feedback</h3>
                <p className="text-gray-600 text-center">Share your experience or report attendance issues.</p>
                <div className="mt-4 flex">
                  <span className="text-pink-600 font-semibold group-hover:text-pink-700 transition-colors flex items-center">
                    Submit Form
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>

              {/* Schedule */}
              <div className={`${fadeIn} ${getRandomDelay()} group bg-white p-8 rounded-xl shadow-lg transition-all duration-300 flex flex-col items-center relative overflow-hidden`}>
                <CalendarIcon />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Class Schedule</h3>
                <p className="text-gray-600 text-center">Keep track of your upcoming classes and events.</p>
                <div className="mt-4 flex">
                  <span className="text-blue-600 font-semibold transition-colors flex items-center opacity-50">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
            
            {/* Recent Attendance */}
            {attendanceSummary && attendanceSummary.subjects && attendanceSummary.subjects.length > 0 && (
              <div className={`w-full max-w-5xl mt-10 ${slideIn}`}>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Your Subjects</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {attendanceSummary.subjects.map(subj => {
                      const studentData = attendanceSummary.students[0]; // For student, there's only one record (themselves)
                      const attendance = studentData?.attendance[subj._id] || { attended: 0, total: 0, percent: 0 };
                      const attendanceClass = attendance.percent >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
                      
                      return (
                        <div key={subj._id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <h3 className="font-bold text-gray-800 border-b pb-2 mb-2">{subj.name}</h3>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-white p-2 rounded text-center">
                              <div className="text-xs text-gray-500">Classes Held</div>
                              <div className="font-bold">{attendance.total || subj.totalClasses}</div>
                            </div>
                            <div className="bg-white p-2 rounded text-center">
                              <div className="text-xs text-gray-500">Attended</div>
                              <div className="font-bold">{attendance.attended}</div>
                            </div>
                            <div className={`${attendanceClass} p-2 rounded text-center col-span-2`}>
                              <div className="text-xs">Attendance</div>
                              <div className="font-bold">{attendance.percent}%</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;

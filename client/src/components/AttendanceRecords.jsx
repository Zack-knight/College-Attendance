import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { Link } from 'react-router-dom';
import React from 'react';
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

// CSV export helper
function toCSV(rows, columns) {
  const header = columns.map(col => `"${col.label}"`).join(',');
  const csvRows = rows.map(row =>
    columns.map(col => `"${(row[col.key] ?? '').toString().replace(/"/g, '""')}"`).join(',')
  );
  return [header, ...csvRows].join('\r\n');
}

const AttendanceRecords = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };
  
  const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: i => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }
    })
  };
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    subject: '',
    faculty: '',
    student: '',
    enrollmentNumber: '',
    course: '',
    semester: '',
    dateFrom: '',
    dateTo: '',
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [summary, setSummary] = useState({ subjects: [], students: [] });

  // Fetch filter options (subjects, faculties)
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token available for API requests');
          setError('Authentication required. Please log in again.');
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        console.log('Fetching subjects and faculties with token');
        
        // Get user info first to determine role
        let userRole = '';
        try {
          const userInfo = await axios.get('/user/me', { headers });
          userRole = userInfo.data.role;
          setUser(userInfo.data);
        } catch (userErr) {
          console.error('Error fetching user info:', userErr.message);
        }
        
        // For students, we only need subjects
        if (userRole === 'student') {
          const subjectsRes = await axios.get('/subject', { headers });
          console.log('Subjects data received:', subjectsRes.data.length, 'items');
          setSubjects(subjectsRes.data);
        } else {
          // For admin/faculty, get both subjects and faculties
          const [subjectsRes, facultiesRes] = await Promise.all([
            axios.get('/subject', { headers }),
            axios.get('/user/all', { headers }),
          ]);
          
          console.log('Subjects data received:', subjectsRes.data.length, 'items');
          console.log('Faculties data received:', facultiesRes.data.length, 'items');
          
          setSubjects(subjectsRes.data);
          setFaculties(facultiesRes.data.filter(u => u.role === 'teacher'));
        }
      } catch (err) {
        console.error('Error fetching options:', err.message);
        setError('Failed to load filter options: ' + err.message);
      }
    };
    fetchOptions();
  }, []);

  // Reset to page 1 and clear error when filters change
  useEffect(() => {
    setPage(1);
    setError('');
    
    // For student users, set enrollment number to their own
    if (user && user.role === 'student' && user.enrollmentNumber) {
      setFilters(f => ({ ...f, enrollmentNumber: user.enrollmentNumber }));
    }
  }, [filters, user]);

  // Fetch attendance with filters and pagination
  useEffect(() => {
    // Create a ref to track if the component is still mounted
    let isMounted = true;
    const controller = new AbortController(); // For cancelling requests
    
    const fetchAttendance = async () => {
      if (!isMounted) return; // Don't proceed if unmounted
      
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token available for attendance API request');
          setError('Authentication required. Please log in again.');
          setLoading(false);
          return;
        }
        
        console.log('Fetching attendance records with params:', { page, pageSize });
        
        // Build query parameters
        const params = { page, pageSize, sortBy, sortOrder };
        if (filters.status !== 'all') params.status = filters.status;
        if (filters.subject) params.subject = filters.subject;
        if (filters.faculty) params.faculty = filters.faculty;
        if (filters.student) params.student = filters.student;
        if (filters.enrollmentNumber) params.enrollmentNumber = filters.enrollmentNumber;
        if (filters.course) params.course = filters.course;
        if (filters.semester) params.semester = filters.semester;
        if (filters.dateFrom) params.dateFrom = filters.dateFrom;
        if (filters.dateTo) params.dateTo = filters.dateTo;
        
        // Use a longer timeout for attendance records which might be large
        const response = await axios.get('/attendance/records', { 
          params,
          timeout: 60000, // 60 seconds timeout for this specific request
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Only update state if component is still mounted
        if (isMounted) {
          console.log('Received attendance response:', response.data);
          
          if (response.data && Array.isArray(response.data.records)) {
            setAttendanceRecords(response.data.records);
            setTotalRecords(response.data.total || 0);
            if (response.data.records.length === 0) {
              setError('No attendance records found matching your criteria.');
            } else {
              setError('');
            }
          } else if (response.data && response.data.error) {
            setAttendanceRecords([]);
            setTotalRecords(0);
            setError(response.data.error);
          } else if (Array.isArray(response.data)) {
            // Handle case where API returns an array directly
            setAttendanceRecords(response.data);
            setTotalRecords(response.data.length || 0);
            if (response.data.length === 0) {
              setError('No attendance records found matching your criteria.');
            } else {
              setError('');
            }
          } else {
            console.error('Unexpected API response format:', response.data);
            setAttendanceRecords([]);
            setTotalRecords(0);
            setError('Unexpected data format received from server.');
          }
        }
      } catch (err) {
        // Only update state if component is still mounted
        if (isMounted) {
          setAttendanceRecords([]);
          setTotalRecords(0);
          
          // Handle specific error types
          if (err.code === 'ECONNABORTED') {
            console.error('Request timeout:', err);
            setError('The request timed out. Try limiting your search with more filters to reduce results.');
          } else if (err.name === 'CanceledError' || err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
            console.log('Request was cancelled - this is normal during navigation or filter changes');
            // Don't set error for cancelled requests as this is expected behavior
          } else {
            console.error('Error fetching attendance:', err);
            setError(err?.response?.data?.error || 'Failed to fetch attendance records: ' + err.message);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchAttendance();
    
    // Cleanup function to cancel the request if the component unmounts or dependencies change
    return () => {
      isMounted = false; // Mark component as unmounted
      controller.abort('Component unmounted or dependencies changed');
    };
  }, [filters, page, pageSize, sortBy, sortOrder]);

  // Fetch current user info for role-based access - only once when component mounts
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const fetchUser = async () => {
      try {
        console.log('Fetching user information...');
        const token = localStorage.getItem('token');
        
        // Check if we have a token first
        if (!token) {
          console.log('No token found in localStorage');
          if (isMounted) {
            setUser(null);
            setAuthChecked(true);
          }
          return;
        }
        
        // Extract token data first as a fallback
        let tokenData = null;
        try {
          tokenData = JSON.parse(atob(token.split('.')[1]));
          console.log('Token contains user role:', tokenData.role);
        } catch (tokenErr) {
          console.warn('Could not parse token data:', tokenErr);
        }
        
        // Use higher timeout for this request and ensure token is in header
        const res = await axios.get('/user/me', { 
          timeout: 20000,
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (isMounted) {
          console.log('User data received from API:', res.data);
          setUser(res.data);
        }
      } catch (err) {
        if (!isMounted) return;
        
        if (err.name === 'CanceledError' || err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
          console.log('User fetch request was cancelled');
          return;
        }
        
        console.error('Error fetching user:', err.message);
        // Attempt to extract user role from token as fallback
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            console.log('Using extracted token data as fallback:', tokenData);
            if (tokenData && tokenData.role) {
              // Create minimal user object from token
              setUser({ 
                role: tokenData.role, 
                _id: tokenData.id || tokenData._id || tokenData.userId,
                name: tokenData.name || 'User'
              });
              console.log('Using role from token:', tokenData.role);
            } else {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        } catch (tokenErr) {
          console.error('Error extracting token data:', tokenErr);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setAuthChecked(true);
        }
      }
    };
    
    fetchUser();
    
    return () => {
      isMounted = false;
      controller.abort('Component unmounted');
    };
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token available for API requests');
          setError('Authentication required. Please log in again.');
          setLoading(false);
          return;
        }
        
        const params = { ...filters };
        console.log('Fetching attendance summary with params:', params);
        
        const res = await axios.get('/attendance/summary', { 
          params,
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Summary data received:', res.data);
        setSummary(res.data);
      } catch (err) {
        console.error('Error fetching summary:', err.message);
        setError('Failed to load attendance summary: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [filters]);

  // Handle sort click
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Helper to show sort indicator
  const getSortIndicator = (column) => {
    if (sortBy !== column) return '';
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  const getStatusStyle = (status) =>
    status.toLowerCase() === 'present'
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700';

  // Export to CSV handler
  const handleExportCSV = async () => {
    try {
      const params = { ...filters, page: 1, pageSize: 10000, sortBy, sortOrder };
      const response = await axios.get('/attendance/records', { params });
      const records = response.data.records || [];
      if (!records.length) {
        alert('No records to export.');
        return;
      }
      const columns = [
        { key: 'enrollmentNumber', label: 'Enrollment No.' },
        { key: 'studentName', label: 'Student Name' },
        { key: 'subject', label: 'Subject' },
        { key: 'facultyName', label: 'Faculty' },
        { key: 'course', label: 'Course' },
        { key: 'semester', label: 'Semester' },
        { key: 'status', label: 'Status' },
        { key: 'date', label: 'Date' },
      ];
      const csv = toCSV(records.map(r => ({ ...r, date: new Date(r.date).toLocaleDateString() })), columns);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'attendance_records.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export CSV.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background overflow-hidden py-12 px-4 relative">
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
        
        <motion.div
          className="relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-3xl font-bold text-center text-white mb-8"
            })}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear Filters
          </motion.button>
                        <React.Fragment key={subj._id}>
                          <td className="px-2 py-2 text-center border-b border-gray-100">
                            {/* Make subject specific attendance detail accessible */}
                            {user && (user.role === 'teacher' || user.role === 'admin') ? (
                              <Link 
                                to={`/student-attendance/${stu._id}/${subj._id}`}
                                className="text-teal-600 hover:text-teal-800 hover:underline"
                                title={`View ${stu.name}'s attendance for ${subj.name}`}
                              >
                                {att.attended}
                              </Link>
                            ) : (
                              att.attended
                            )}
                          </td>
                          <td className={`px-2 py-2 text-center font-bold border-b border-gray-100 ${att.percent < 75 ? 'bg-red-200 text-red-700' : ''}`}>
                            {att.percent}%
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2 mt-6">
                <button
                  className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    className={`px-3 py-1 rounded font-semibold ${num === page ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setPage(num)}
                  >
                    {num}
                  </button>
                ))}
                <button
                  className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </button>
                <span className="ml-4 text-gray-600">Page {page} of {totalPages}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceRecords;

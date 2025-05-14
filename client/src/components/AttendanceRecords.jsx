import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { Link } from 'react-router-dom';
import React from 'react';

// CSV export helper
function toCSV(rows, columns) {
  const header = columns.map(col => `"${col.label}"`).join(',');
  const csvRows = rows.map(row =>
    columns.map(col => `"${(row[col.key] ?? '').toString().replace(/"/g, '""')}"`).join(',')
  );
  return [header, ...csvRows].join('\r\n');
}

const AttendanceRecords = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-cyan-100 to-white p-0">
      <div className="pt-28 px-4 flex flex-col items-center">
        {user && user.role === 'student' ? (
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-2 tracking-tight">
              📋 My Attendance
            </h1>
            <p className="text-gray-600">
              Enrollment Number: <span className="font-semibold">{user.enrollmentNumber}</span> | 
              Name: <span className="font-semibold">{user.name}</span>
            </p>
          </div>
        ) : (
          <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-10 tracking-tight">
            📋 Attendance <span className="text-teal-600">Records</span>
          </h1>
        )}

        {/* Export to CSV Button - Only visible for admin/faculty */}
        {user && user.role !== 'student' && (
          <div className="w-full max-w-6xl flex justify-end mb-2">
            <button
              className="px-4 py-2 bg-teal-500 text-white rounded-lg font-semibold shadow-sm hover:bg-teal-600 transition"
              onClick={handleExportCSV}
            >
              Export to CSV
            </button>
          </div>
        )}

        {/* Role-based access check */}
        {authChecked && (!user || (user.role !== 'admin' && user.role !== 'teacher' && user.role !== 'student')) && (
          <div className="w-full max-w-2xl mt-32 p-8 bg-red-100 text-red-700 rounded-lg font-semibold text-center shadow text-xl">
            You are not authorized to view this page.
            <p className="mt-2 text-sm font-normal">Error: {!user ? 'User not authenticated' : `Role '${user.role}' is not authorized`}</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Back to Home
            </button>
          </div>
        )}
        {authChecked && user && (user.role === 'admin' || user.role === 'teacher' || user.role === 'student') && (
          <>
            {/* Simplified Filters for Students */}
            {user && user.role === 'student' ? (
              <div className="mb-8 w-full max-w-6xl bg-white/90 rounded-xl shadow p-6 flex flex-wrap gap-4 items-end">
                <div className="min-w-[150px]">
                  <label className="block text-gray-700 font-medium mb-1">Date From</label>
                  <input type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-400 shadow-sm min-w-full" />
                </div>
                <div className="min-w-[150px]">
                  <label className="block text-gray-700 font-medium mb-1">Date To</label>
                  <input type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-400 shadow-sm min-w-full" />
                </div>
                <div className="min-w-[150px]">
                  <label className="block text-gray-700 font-medium mb-1">Subject</label>
                  <select value={filters.subject} onChange={e => setFilters(f => ({ ...f, subject: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-400 shadow-sm min-w-full">
                    <option value="" className="font-bold text-gray-900">All Subjects</option>
                    {subjects.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="min-w-[150px]">
                  <label className="block text-gray-700 font-medium mb-1">Status</label>
                  <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-400 shadow-sm min-w-full">
                    <option value="all" className="font-bold text-gray-900">All</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
                {/* Reset Filters Button */}
                <div className="min-w-[150px] flex items-end">
                  <button
                    type="button"
                    className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg font-semibold shadow-sm hover:bg-teal-600 transition"
                    onClick={() => setFilters({ status: 'all', subject: '', dateFrom: '', dateTo: '' })}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            ) : (
              /* Advanced Filters for Admin/Faculty */
              <div className="mb-8 w-full max-w-6xl bg-white/90 rounded-xl shadow p-6 flex flex-wrap gap-4 items-end">
                <div className="min-w-[150px]">
                  <label className="block text-gray-700 font-medium mb-1">Date From</label>
                  <input type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-400 shadow-sm min-w-full" />
                </div>
                <div className="min-w-[150px]">
                  <label className="block text-gray-700 font-medium mb-1">Date To</label>
                  <input type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-400 shadow-sm min-w-full" />
                </div>
                <div className="min-w-[150px]">
                  <label className="block text-gray-700 font-medium mb-1">Subject</label>
                  <select value={filters.subject} onChange={e => setFilters(f => ({ ...f, subject: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-400 shadow-sm min-w-full">
                    <option value="" className="font-bold text-gray-900">All</option>
                    {subjects.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="min-w-[150px]">
                  <label className="block text-gray-700 font-medium mb-1">Faculty</label>
                  <select value={filters.faculty} onChange={e => setFilters(f => ({ ...f, faculty: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-400 shadow-sm min-w-full">
                    <option value="" className="font-bold text-gray-900">All</option>
                    {faculties.map(f => <option key={f._id} value={f.name}>{f.name}</option>)}
                  </select>
                </div>
                <div className="min-w-[150px]">
                  <label className="block text-gray-700 font-medium mb-1">Student Name</label>
                  <input type="text" value={filters.student} onChange={e => setFilters(f => ({ ...f, student: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-400 shadow-sm min-w-full placeholder-gray-400" placeholder="Search by name" />
                </div>
                <div className="min-w-[150px]">
                  <label className="block text-gray-700 font-medium mb-1">Enrollment No.</label>
                  <input type="text" value={filters.enrollmentNumber} onChange={e => setFilters(f => ({ ...f, enrollmentNumber: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-400 shadow-sm min-w-full placeholder-gray-400" placeholder="Search by enrollment" />
                </div>
                <div className="min-w-[150px]">
                  <label className="block text-gray-700 font-medium mb-1">Semester</label>
                  <input type="text" value={filters.semester} onChange={e => setFilters(f => ({ ...f, semester: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-400 shadow-sm min-w-full placeholder-gray-400" placeholder="e.g. 5" />
                </div>
                <div className="min-w-[150px]">
                  <label className="block text-gray-700 font-medium mb-1">Status</label>
                  <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-400 shadow-sm min-w-full">
                    <option value="all" className="font-bold text-gray-900">All</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
                {/* Reset Filters Button */}
                <div className="min-w-[150px] flex items-end">
                  <button
                    type="button"
                    className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg font-semibold shadow-sm hover:bg-teal-600 transition"
                    onClick={() => setFilters({ status: 'all', subject: '', faculty: '', student: '', enrollmentNumber: '', course: '', semester: '', dateFrom: '', dateTo: '' })}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}

        {/* Table Section */}
            {error && (
              <div className="w-full max-w-6xl mb-4 p-4 bg-red-100 text-red-700 rounded-lg font-semibold text-center shadow">
                {error}
              </div>
            )}
        {/* Attendance Overview for Students */}
        {user && user.role === 'student' && summary.subjects.length > 0 && (
          <div className="w-full max-w-6xl mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {summary.subjects.map(subj => {
              const studentData = summary.students[0]; // For student, there's only one record (themselves)
              const attendance = studentData?.attendance[subj._id] || { attended: 0, total: 0, percent: 0 };
              const attendanceClass = attendance.percent >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
              
              return (
                <div key={subj._id} className="bg-white rounded-xl shadow-md p-4 transition-transform hover:scale-105">
                  <h3 className="font-bold text-gray-800 border-b pb-2 mb-2">{subj.name}</h3>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-gray-100 p-2 rounded text-center">
                      <div className="text-sm text-gray-500">Classes Held</div>
                      <div className="font-bold text-xl">{attendance.total || subj.totalClasses}</div>
                    </div>
                    <div className="bg-gray-100 p-2 rounded text-center">
                      <div className="text-sm text-gray-500">Attended</div>
                      <div className="font-bold text-xl">{attendance.attended}</div>
                    </div>
                    <div className={`${attendanceClass} p-2 rounded text-center col-span-2`}>
                      <div className="text-sm">Attendance Percentage</div>
                      <div className="font-bold text-xl">{attendance.percent}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="overflow-x-auto w-full max-w-7xl bg-white/90 rounded-2xl shadow-xl ring-1 ring-white/30">
          <table className="min-w-full text-sm text-gray-800 border border-gray-200">
            <thead>
              <tr className="bg-gradient-to-r from-teal-400 to-cyan-400 text-white text-left sticky top-0 z-10">
                <th className="px-4 py-2 border-b border-gray-200">S.No.</th>
                <th className="px-4 py-2 border-b border-gray-200">Enrollment No.</th>
                <th className="px-4 py-2 border-b border-gray-200">Student Name</th>
                {summary.subjects.map(subj => (
                  <th key={subj._id} colSpan={2} className="px-4 py-2 border-b border-gray-200 text-center">
                    <div className="font-semibold">{subj.name}</div>
                    {subj.code && <div className="text-xs font-normal">{subj.code}</div>}
                  </th>
                ))}
              </tr>
              <tr className="bg-gray-100 sticky top-12 z-10">
                <th colSpan={3} className="px-4 py-2 border-b border-gray-200"></th>
                {summary.subjects.map(subj => (
                  <React.Fragment key={subj._id}>
                    <th className="px-2 py-2 border-b border-gray-200 text-center font-semibold">Attended</th>
                    <th className="px-2 py-2 border-b border-gray-200 text-center font-semibold">%</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Total Classes Held Row */}
              <tr className="bg-yellow-50 font-bold">
                <td colSpan={3} className="px-4 py-2 text-right border-b border-gray-200">Total Classes Held</td>
                {summary.subjects.map(subj => (
                  <React.Fragment key={subj._id}>
                    <td className="px-2 py-2 text-center border-b border-gray-200">{subj.totalClasses}</td>
                    <td className="px-2 py-2 text-center border-b border-gray-200"></td>
                  </React.Fragment>
                ))}
              </tr>
              {/* Student Attendance Rows */}
              {loading ? (
                <tr>
                  <td colSpan={3 + summary.subjects.length * 2} className="text-center py-8 text-gray-500">Loading...</td>
                </tr>
              ) : summary.students.length === 0 ? (
                <tr>
                  <td colSpan={3 + summary.subjects.length * 2} className="text-center py-8 text-gray-500">No records found.</td>
                </tr>
              ) : (
                summary.students.map((stu, idx) => (
                  <tr key={stu.enrollmentNumber} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2 border-b border-gray-100">{idx + 1}</td>
                    <td className="px-4 py-2 border-b border-gray-100">{stu.enrollmentNumber}</td>
                    <td className="px-4 py-2 border-b border-gray-100">
                      {/* Only make names clickable for faculty and admin */}
                      {user && (user.role === 'teacher' || user.role === 'admin') ? (
                        <Link 
                          to={`/student-attendance/${stu._id}`} 
                          className="text-teal-600 hover:text-teal-800 hover:underline font-medium flex items-center"
                          title="View detailed attendance history"
                          onClick={() => console.log('Clicked on student:', stu.name, 'with ID:', stu._id)}
                        >
                          {stu.name}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </Link>
                      ) : (
                        stu.name
                      )}
                    </td>
                    {summary.subjects.map(subj => {
                      const att = stu.attendance[subj._id] || { attended: 0, percent: 0 };
                      return (
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

import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { Link } from 'react-router-dom';

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

  // Fetch filter options (subjects, faculties)
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [subjectsRes, facultiesRes] = await Promise.all([
          axios.get('/subject'),
          axios.get('/user/all'),
        ]);
        setSubjects(subjectsRes.data);
        setFaculties(facultiesRes.data.filter(u => u.role === 'teacher'));
      } catch {
        setError('Failed to load filter options.');
      }
    };
    fetchOptions();
  }, []);

  // Reset to page 1 and clear error when filters change
  useEffect(() => {
    setPage(1);
    setError('');
  }, [filters]);

  // Fetch attendance with filters and pagination
  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setError('');
      try {
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
        const response = await axios.get('/attendance/records', { params });
        if (response.data && Array.isArray(response.data.records)) {
          setAttendanceRecords(response.data.records);
          setTotalRecords(response.data.total || 0);
        } else if (response.data && response.data.error) {
          setAttendanceRecords([]);
          setTotalRecords(0);
          setError(response.data.error);
        } else {
          setAttendanceRecords([]);
          setTotalRecords(0);
          setError('Unknown error occurred.');
        }
      } catch (err) {
        setAttendanceRecords([]);
        setTotalRecords(0);
        setError(err?.response?.data?.error || 'Failed to fetch attendance records.');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [filters, page, pageSize, sortBy, sortOrder]);

  // Fetch current user info for role-based access
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/user/me');
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setAuthChecked(true);
      }
    };
    fetchUser();
  }, []);

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
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-10 tracking-tight">
          📋 Attendance <span className="text-teal-600">Records</span>
        </h1>

        {/* Export to CSV Button */}
        <div className="w-full max-w-6xl flex justify-end mb-2">
          <button
            className="px-4 py-2 bg-teal-500 text-white rounded-lg font-semibold shadow-sm hover:bg-teal-600 transition"
            onClick={handleExportCSV}
          >
            Export to CSV
          </button>
        </div>

        {/* Role-based access check */}
        {authChecked && (!user || (user.role !== 'admin' && user.role !== 'teacher')) && (
          <div className="w-full max-w-2xl mt-32 p-8 bg-red-100 text-red-700 rounded-lg font-semibold text-center shadow text-xl">
            You are not authorized to view this page.
          </div>
        )}
        {authChecked && user && (user.role === 'admin' || user.role === 'teacher') && (
          <>
            {/* Advanced Filters */}
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

            {/* Table Section */}
            {error && (
              <div className="w-full max-w-6xl mb-4 p-4 bg-red-100 text-red-700 rounded-lg font-semibold text-center shadow">
                {error}
              </div>
            )}
            <div className="overflow-x-auto w-full max-w-6xl bg-white/80 backdrop-blur-md rounded-2xl shadow-xl ring-1 ring-white/30">
              <table className="min-w-full text-sm text-gray-800">
                <thead>
                  <tr className="bg-gradient-to-r from-teal-400 to-cyan-400 text-white text-left">
                    <th className="px-6 py-4 font-semibold cursor-pointer select-none" onClick={() => handleSort('enrollmentNumber')}>Enrollment No.{getSortIndicator('enrollmentNumber')}</th>
                    <th className="px-6 py-4 font-semibold cursor-pointer select-none" onClick={() => handleSort('studentName')}>Student Name{getSortIndicator('studentName')}</th>
                    <th className="px-6 py-4 font-semibold cursor-pointer select-none" onClick={() => handleSort('subject')}>Subject{getSortIndicator('subject')}</th>
                    <th className="px-6 py-4 font-semibold cursor-pointer select-none" onClick={() => handleSort('facultyName')}>Faculty{getSortIndicator('facultyName')}</th>
                    <th className="px-6 py-4 font-semibold cursor-pointer select-none" onClick={() => handleSort('course')}>Course{getSortIndicator('course')}</th>
                    <th className="px-6 py-4 font-semibold cursor-pointer select-none" onClick={() => handleSort('semester')}>Semester{getSortIndicator('semester')}</th>
                    <th className="px-6 py-4 font-semibold cursor-pointer select-none" onClick={() => handleSort('status')}>Status{getSortIndicator('status')}</th>
                    <th className="px-6 py-4 font-semibold cursor-pointer select-none" onClick={() => handleSort('date')}>Date{getSortIndicator('date')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, idx) => (
                      <tr key={idx}>
                        {Array.from({ length: 8 }).map((_, colIdx) => (
                          <td key={colIdx} className="px-6 py-4">
                            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : Array.isArray(attendanceRecords) && attendanceRecords.length > 0 ? (
                    attendanceRecords.map((rec) => (
                      <tr key={rec._id} className="hover:bg-gray-100 transition">
                        <td className="px-6 py-4">{rec.enrollmentNumber}</td>
                        <td className="px-6 py-4">{rec.studentName}</td>
                        <td className="px-6 py-4">{rec.subject}</td>
                        <td className="px-6 py-4">{rec.facultyName || rec.faculty}</td>
                        <td className="px-6 py-4">{rec.course}</td>
                        <td className="px-6 py-4">{rec.semester}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(rec.status)}`}>
                            {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {new Date(rec.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-8 text-gray-500">
                        No attendance records found.
                      </td>
                    </tr>
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

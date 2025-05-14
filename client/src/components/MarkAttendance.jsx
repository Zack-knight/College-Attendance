import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { jwtDecode } from 'jwt-decode';

const MarkAttendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [allStudents, setAllStudents] = useState([]); // Store all students
  const [students, setStudents] = useState([]); // Filtered students to display
  const [selectedSubject, setSelectedSubject] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  
  // Filter states
  const [nameFilter, setNameFilter] = useState('');
  const [enrollmentFilter, setEnrollmentFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [availableBranches, setAvailableBranches] = useState([]);

  // Get user role from JWT
  let role = null;
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded.role;
    } catch {
      role = null;
    }
  }

  // Date helpers
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Fetch subjects and students on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [subjectsRes, studentsRes] = await Promise.all([
          axios.get('/subject'),
          axios.get('/user/students'),
        ]);
        setSubjects(subjectsRes.data);
        
        // Store all students
        setAllStudents(studentsRes.data);
        // Initialize filtered students with all students
        setStudents(studentsRes.data);
        
        // Extract unique branches for the filter dropdown
        const branches = studentsRes.data
          .map(student => student.branch)
          .filter((branch, index, self) => 
            branch && self.indexOf(branch) === index
          )
          .sort();
          
        setAvailableBranches(branches);
        
        // If we have subjects, preselect the first one
        if (subjectsRes.data && subjectsRes.data.length > 0) {
          // Find first valid subject for the current role
          const validSubject = role === 'admin' ?
            subjectsRes.data.find(s => s.type === 'course' || (s.type === 'event' && s.attendanceTracking)) :
            subjectsRes.data.find(s => s.type !== 'event');
            
          if (validSubject) {
            setSelectedSubject(validSubject._id);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.error || 'Failed to fetch subjects or students.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [role]);

  // Apply filters to students
  useEffect(() => {
    // Function to filter students based on criteria
    const filterStudents = () => {
      return allStudents.filter(student => {
        // Filter by name
        const nameMatch = !nameFilter || 
          student.name.toLowerCase().includes(nameFilter.toLowerCase());
        
        // Filter by enrollment number
        const enrollmentMatch = !enrollmentFilter || 
          (student.enrollmentNumber && 
           student.enrollmentNumber.toLowerCase().includes(enrollmentFilter.toLowerCase()));
        
        // Filter by branch
        const branchMatch = !branchFilter || 
          (student.branch && student.branch === branchFilter);
        
        // Return true if student matches all active filters
        return nameMatch && enrollmentMatch && branchMatch;
      });
    };
    
    setStudents(filterStudents());
  }, [allStudents, nameFilter, enrollmentFilter, branchFilter]);

  // Handle filter reset
  const resetFilters = () => {
    setNameFilter('');
    setEnrollmentFilter('');
    setBranchFilter('');
  };

  // Handle attendance change
  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!selectedSubject) {
      setError('Please select a subject.');
      return;
    }
    if (!date) {
      setError('Please select a date.');
      return;
    }
    if (students.length === 0) {
      setError('No students to mark attendance for.');
      return;
    }
    // Faculty: Only allow today and weekdays
    if (role === 'teacher') {
      if (date !== todayStr) {
        setError('Faculty can only mark attendance for today.');
        return;
      }
      if (isWeekend) {
        setError('Faculty cannot mark attendance on weekends.');
        return;
      }
    }
    const records = students.map((student) => ({
      student: student._id,
      status: attendance[student._id] || 'absent',
    }));
    setLoading(true);
    try {
      await axios.post('/attendance/mark', {
        subject: selectedSubject,
        date,
        records,
      });
      setSuccess('Attendance marked successfully!');
    } catch {
      setError('Failed to mark attendance.');
    } finally {
      setLoading(false);
    }
  };

  // Faculty: disable form on weekends
  const disableFacultyForm = role === 'teacher' && isWeekend;

  // Filter subjects for dropdown
  let filteredSubjects = [];
  if (role === 'admin') {
    // Admin: show all courses and events with attendanceTracking=true
    filteredSubjects = subjects.filter(
      (s) =>
        (s.type === 'course') ||
        (s.type === 'event' && s.attendanceTracking)
    );
  } else {
    // Faculty: show their own courses AND events with attendanceTracking=true
    filteredSubjects = subjects.filter(
      (s) => 
        (s.type === 'course') || 
        (s.type === 'event' && s.attendanceTracking === true)
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-cyan-100 to-white px-4 pt-28 pb-12">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Mark Attendance</h1>
      {subjects.length === 0 ? (
        <div className="max-w-xl mx-auto bg-white bg-opacity-90 rounded-xl shadow-lg p-8 text-center">
          <p className="text-lg text-gray-700 mb-4">You need to create a subject before you can mark attendance.</p>
          <p className="text-gray-500">Go to your dashboard and create a subject first.</p>
        </div>
      ) : disableFacultyForm ? (
        <div className="max-w-xl mx-auto bg-white bg-opacity-90 rounded-xl shadow-lg p-8 text-center">
          <p className="text-lg text-red-600 font-semibold mb-4">Faculty cannot mark attendance on weekends.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white bg-opacity-90 rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-800">Select Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800 bg-white"
              required
            >
              <option value="" className="text-gray-800 bg-white">-- Select --</option>
              {filteredSubjects.map((subject) => (
                <option
                  key={subject._id}
                  value={subject._id}
                  className="text-gray-800 bg-white"
                >
                  {subject.type === 'event'
                    ? `Event: ${subject.name}`
                    : `Course: ${subject.name}`}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800 bg-white"
              required
              min={role === 'teacher' ? todayStr : undefined}
              max={role === 'teacher' ? todayStr : undefined}
              disabled={role === 'teacher'}
            />
            {role === 'teacher' && (
              <p className="text-sm text-gray-500 mt-1">Faculty can only mark attendance for today (weekdays only).</p>
            )}
          </div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="font-semibold">Students</label>
              <div className="text-sm text-gray-600">{students.length} student{students.length !== 1 ? 's' : ''} showing</div>
            </div>
            
            {/* Filter Controls */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
              <div className="mb-2 font-medium text-gray-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter Students
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Student Name</label>
                  <input
                    type="text"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    placeholder="Search by name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Enrollment Number</label>
                  <input
                    type="text"
                    value={enrollmentFilter}
                    onChange={(e) => setEnrollmentFilter(e.target.value)}
                    placeholder="Search by enrollment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Branch/Degree</label>
                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800 bg-white text-sm"
                  >
                    <option value="">All branches</option>
                    {availableBranches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>
              </div>
              {(nameFilter || enrollmentFilter || branchFilter) && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            {students.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <p className="text-gray-600">No students found matching your filters.</p>
                <button 
                  onClick={resetFilters} 
                  className="mt-2 text-teal-600 hover:text-teal-800 font-medium text-sm"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <table className="min-w-full table-auto text-left bg-white rounded-lg">
                <thead>
                  <tr>
                    <th className="py-2 px-4 text-gray-800">Name</th>
                    <th className="py-2 px-4 text-gray-800">Enrollment No.</th>
                    <th className="py-2 px-4 text-gray-800">Branch</th>
                    <th className="py-2 px-4 text-gray-800">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td className="py-2 px-4 text-gray-800">{student.name}</td>
                      <td className="py-2 px-4 text-gray-800">{student.enrollmentNumber}</td>
                      <td className="py-2 px-4 text-gray-800">
                        {student.branch ? (
                          <span className="text-teal-600 font-medium">{student.branch}</span>
                        ) : (
                          <span className="text-gray-400 italic">Not specified</span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-gray-800">
                        <select
                          value={attendance[student._id] || 'absent'}
                          onChange={(e) => handleAttendanceChange(student._id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-gray-800 bg-white"
                        >
                          <option value="present" className="text-gray-800 bg-white">Present</option>
                          <option value="absent" className="text-gray-800 bg-white">Absent</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <button
            type="submit"
            className="bg-teal-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-600 transition"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Attendance'}
          </button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          {success && <p className="text-green-600 mt-4">{success}</p>}
        </form>
      )}
    </div>
  );
};

export default MarkAttendance;
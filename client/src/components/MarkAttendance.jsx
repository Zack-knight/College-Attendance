import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { jwtDecode } from 'jwt-decode';

const MarkAttendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

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
        setStudents(studentsRes.data);
      } catch {
        setError('Failed to fetch subjects or students.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
    // Faculty: show only their own courses (assuming backend returns only their courses)
    filteredSubjects = subjects.filter((s) => s.type !== 'event');
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
            <label className="block mb-2 font-semibold">Students</label>
            {students.length === 0 ? (
              <p>No students found.</p>
            ) : (
              <table className="min-w-full table-auto text-left bg-white rounded-lg">
                <thead>
                  <tr>
                    <th className="py-2 px-4 text-gray-800">Name</th>
                    <th className="py-2 px-4 text-gray-800">Enrollment No.</th>
                    <th className="py-2 px-4 text-gray-800">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td className="py-2 px-4 text-gray-800">{student.name}</td>
                      <td className="py-2 px-4 text-gray-800">{student.enrollmentNumber}</td>
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
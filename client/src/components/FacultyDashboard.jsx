import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import Navbar from './Navbar';

const FacultyDashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [subjectName, setSubjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch subjects for the logged-in faculty
  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/subject');
      setSubjects(res.data);
    } catch {
      setError('Failed to fetch subjects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Handle subject creation
  const handleCreateSubject = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!subjectName.trim()) {
      setError('Subject name is required.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/subject', { name: subjectName.trim() });
      setSuccess('Subject created successfully!');
      setSubjectName('');
      fetchSubjects();
    } catch {
      setError('Failed to create subject.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-sky-200 via-cyan-100 to-white p-0">
        <div className="pt-28 px-4 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-12 tracking-tight">
            Faculty <span className="text-teal-600">Dashboard</span>
          </h1>

          <div className="grid gap-10 max-w-6xl w-full md:grid-cols-2">
            {/* Mark Attendance Card */}
            <div className="bg-white bg-opacity-80 backdrop-blur-lg p-8 rounded-2xl shadow-xl hover:shadow-2xl transition">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                📋 Mark Attendance
              </h2>
              <p className="text-gray-700 mb-4">
                Mark attendance for your students for the current session.
              </p>
              <Link
                to="/mark-attendance"
                className="bg-teal-500 text-white font-bold px-6 py-3 rounded-full shadow-md hover:bg-teal-400 transition"
              >
                Go to Mark Attendance
              </Link>
            </div>

            {/* View Attendance Records Card */}
            <div className="bg-white bg-opacity-80 backdrop-blur-lg p-8 rounded-2xl shadow-xl hover:shadow-2xl transition">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                📊 View Attendance Records
              </h2>
              <p className="text-gray-700 mb-4">
                View the detailed attendance records for all students.
              </p>
              <Link
                to="/attendance-records"
                className="bg-teal-500 text-white font-bold px-6 py-3 rounded-full shadow-md hover:bg-teal-400 transition"
              >
                Go to Attendance Records
              </Link>
            </div>
          </div>

          <div className="grid gap-10 max-w-6xl w-full md:grid-cols-2 mt-10">
            {/* View Feedback Card */}
            <div className="bg-white bg-opacity-80 backdrop-blur-lg p-8 rounded-2xl shadow-xl hover:shadow-2xl transition">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                💬 View Feedback
              </h2>
              <p className="text-gray-700 mb-4">
                View feedback submitted by students for your sessions.
              </p>
              <Link
                to="/feedback-list"
                className="bg-teal-500 text-white font-bold px-6 py-3 rounded-full shadow-md hover:bg-teal-400 transition"
              >
                Go to Feedback List
              </Link>
            </div>
          </div>

          <div className="max-w-xl mx-auto bg-white bg-opacity-90 rounded-xl shadow-lg p-8 mb-10 mt-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Course</h2>
            <form onSubmit={handleCreateSubject} className="flex flex-col gap-4">
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Enter course name"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800"
                disabled={loading}
              />
              <button
                type="submit"
                className="bg-teal-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-600 transition"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Create Course'}
              </button>
            </form>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {success && <p className="text-green-600 mt-2">{success}</p>}
          </div>

          <div className="max-w-2xl mx-auto bg-white bg-opacity-90 rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-4 text-black">Your Courses</h2>
            {loading ? (
              <p>Loading...</p>
            ) : subjects.length === 0 ? (
              <p>No courses found.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {subjects.map((subject) => (
                  <li key={subject._id} className="py-3 px-2 text-lg text-gray-700">
                    {subject.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FacultyDashboard;

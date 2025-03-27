import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';

const UserDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [error, setError] = useState('');

  // Fetch enrolled courses and attendance
  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesResponse = await axios.get('/course/student');
        const attendanceResponse = await axios.get('/attendance/student');
        setCourses(coursesResponse.data);
        setAttendance(attendanceResponse.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-dark p-8 pt-20">
      <h1 className="text-2xl font-bold mb-6 text-center text-primary">Student Dashboard</h1>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      {/* Enrolled Courses Section */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-primary">Your Courses</h2>
        {courses.length === 0 ? (
          <p className="text-text">You are not enrolled in any courses.</p>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course._id} className="p-4 border rounded-lg">
                <h3 className="font-bold text-primary">{course.name} ({course.code})</h3>
                <p className="text-text">Taught by: {course.faculty.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attendance Records Section */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4 text-primary">Attendance Records</h2>
        {attendance.length === 0 ? (
          <p className="text-text">No attendance records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-primary to-secondary">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Course</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {attendance.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-700 transition duration-300">
                    <td className="px-6 py-4 text-sm text-text">{record.course.name}</td>
                    <td className="px-6 py-4 text-sm text-text">{record.status}</td>
                    <td className="px-6 py-4 text-sm text-text">{new Date(record.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
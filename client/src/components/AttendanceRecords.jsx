import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { Link } from 'react-router-dom';

const AttendanceRecords = () => {
  const [attendance, setAttendance] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get('/attendance/records');
        setAttendance(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAttendance();
  }, []);

  // Flatten all records for easier filtering and display
  const allRecords = attendance.flatMap((item) =>
    item.records.map((rec) => ({
      _id: item._id + '-' + rec.student._id,
      enrollmentNumber: rec.student?.enrollmentNumber || 'N/A',
      studentName: rec.student?.name || 'N/A',
      subject: item.subject?.name || 'N/A',
      status: rec.status,
      date: item.date,
    }))
  );

  const filteredRecords =
    filter === 'all' ? allRecords : allRecords.filter((rec) => rec.status.toLowerCase() === filter.toLowerCase());

  const getStatusStyle = (status) =>
    status.toLowerCase() === 'present'
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700';

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-cyan-100 to-white p-0">
      {/* Navbar with Gradient */}
      <nav className="w-full fixed top-0 z-50 bg-gradient-to-r from-teal-400 to-cyan-400 shadow-md px-8 py-4 flex justify-between items-center border-b border-white/30">
        <div className="text-2xl font-bold text-white">AMS</div>
        <div className="flex space-x-6 font-medium text-white">
          <Link to="/" className="hover:text-teal-200 transition">Home</Link>
          <Link to="/register" className="hover:text-teal-200 transition">Register</Link>
          <Link to="/login" className="hover:text-teal-200 transition">Login</Link>
        </div>
      </nav>

      <div className="pt-28 px-4 flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-10 tracking-tight">
          📋 Attendance <span className="text-teal-600">Records</span>
        </h1>

        {/* Filter Dropdown */}
        <div className="mb-8 w-full max-w-4xl text-right">
          <label className="mr-3 text-gray-700 font-medium">Filter by Status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white text-gray-800"
          >
            <option value="all">All</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto w-full max-w-6xl bg-white/80 backdrop-blur-md rounded-2xl shadow-xl ring-1 ring-white/30">
          <table className="min-w-full text-sm text-gray-800">
            <thead>
              <tr className="bg-gradient-to-r from-teal-400 to-cyan-400 text-white text-left">
                <th className="px-6 py-4 font-semibold">Enrollment No.</th>
                <th className="px-6 py-4 font-semibold">Student Name</th>
                <th className="px-6 py-4 font-semibold">Subject</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => (
                  <tr key={rec._id} className="hover:bg-gray-100 transition">
                    <td className="px-6 py-4">{rec.enrollmentNumber}</td>
                    <td className="px-6 py-4">{rec.studentName}</td>
                    <td className="px-6 py-4">{rec.subject}</td>
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
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceRecords;

import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';

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

  const filteredAttendance = filter === 'all' ? attendance : attendance.filter((record) => record.status === filter);

  return (
    <div className="min-h-screen bg-gradient-dark p-8 pt-20">
      <h1 className="text-2xl font-bold mb-6 text-center text-primary">Attendance Records</h1>
      <div className="mb-4">
        <label className="mr-2 text-text">Filter by Status:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-text"
        >
          <option value="all">All</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        </select>
      </div>
      <div className="overflow-x-auto card">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-primary to-secondary">
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">Enrollment Number</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">Subject</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">Session</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredAttendance.map((record) => (
              <tr key={record._id} className="hover:bg-gray-700 transition duration-300">
                <td className="px-6 py-4 text-sm text-text">{record.enrollmentNumber}</td>
                <td className="px-6 py-4 text-sm text-text">{record.subject}</td>
                <td className="px-6 py-4 text-sm text-text">{record.session}</td>
                <td className="px-6 py-4 text-sm text-text">{record.status}</td>
                <td className="px-6 py-4 text-sm text-text">{new Date(record.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceRecords;
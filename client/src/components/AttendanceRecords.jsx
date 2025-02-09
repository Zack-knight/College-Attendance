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
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Attendance Records</h1>
      <div className="mb-4">
        <label className="mr-2">Filter by Status:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        </select>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Session</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAttendance.map((record) => (
              <tr key={record._id} className="hover:bg-gray-50 transition duration-300">
                <td className="px-6 py-4 text-sm text-gray-900">{record.studentName}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{record.subject}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{record.session}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{record.status}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{new Date(record.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceRecords;
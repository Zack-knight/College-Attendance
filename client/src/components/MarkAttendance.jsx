import React, { useState } from 'react';
import axios from '../utils/axios';

const MarkAttendance = () => {
  const [formData, setFormData] = useState({
    enrollmentNumber: '',
    subject: '',
    session: '',
    status: 'Present',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/attendance/mark', formData);
      alert(response.data.message);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-8 pt-20">
      <div className="card w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-primary">Mark Attendance</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enrollment Number"
            value={formData.enrollmentNumber}
            onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-text"
          />
          <input
            type="text"
            placeholder="Subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-text"
          />
          <input
            type="text"
            placeholder="Session"
            value={formData.session}
            onChange={(e) => setFormData({ ...formData, session: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-text"
          />
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-text"
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
          <button type="submit" className="btn-primary w-full">
            Mark Attendance
          </button>
        </form>
      </div>
    </div>
  );
};

export default MarkAttendance;
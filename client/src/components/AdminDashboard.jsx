import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Dashboard</h1>
      <div className="space-y-4">
        <Link
          to="/attendance-records"
          className="block bg-blue-500 text-white py-2 px-4 rounded-lg text-center hover:bg-blue-600 transition duration-300"
        >
          View Attendance Records
        </Link>
        <Link
          to="/feedback-list"
          className="block bg-blue-500 text-white py-2 px-4 rounded-lg text-center hover:bg-blue-600 transition duration-300"
        >
          View Feedback
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
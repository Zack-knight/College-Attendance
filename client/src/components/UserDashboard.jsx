import React from 'react';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">User Dashboard</h1>
      <div className="space-y-4">
        <Link
          to="/feedback"
          className="block bg-blue-500 text-white py-2 px-4 rounded-lg text-center hover:bg-blue-600 transition duration-300"
        >
          Submit Feedback
        </Link>
        <Link
          to="/attendance-records"
          className="block bg-blue-500 text-white py-2 px-4 rounded-lg text-center hover:bg-blue-600 transition duration-300"
        >
          View Attendance Records
        </Link>
      </div>
    </div>
  );
};

export default UserDashboard;
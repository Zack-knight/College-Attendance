import React from 'react';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-dark p-8 pt-20">
      <h1 className="text-2xl font-bold mb-6 text-center text-primary">User Dashboard</h1>
      <div className="space-y-4">
        <Link
          to="/feedback"
          className="btn-primary block text-center"
        >
          Submit Feedback
        </Link>
        <Link
          to="/attendance-records"
          className="btn-primary block text-center"
        >
          View Attendance Records
        </Link>
      </div>
    </div>
  );
};

export default UserDashboard;
import React from 'react';
import { Link } from 'react-router-dom';

const FacultyDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-dark p-8 pt-20">
      <h1 className="text-2xl font-bold mb-6 text-center text-primary">Faculty Dashboard</h1>
      <div className="space-y-4">
        <Link
          to="/mark-attendance"
          className="btn-primary block text-center"
        >
          Mark Attendance
        </Link>
        <Link
          to="/attendance-records"
          className="btn-primary block text-center"
        >
          View Attendance Records
        </Link>
        <Link
          to="/feedback-list"
          className="btn-primary block text-center"
        >
          View Feedback
        </Link>
      </div>
    </div>
  );
};

export default FacultyDashboard;
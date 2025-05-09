import React from 'react';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-cyan-100 to-white px-4 pt-28 pb-16 flex flex-col items-center">
      {/* Heading */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-12 tracking-tight">
        Welcome To <span className="text-teal-600">Student Dashboard</span>
      </h1>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl w-full">
        {/* Submit Feedback */}
        <Link
          to="/feedback"
          className="group bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-3xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="text-3xl text-pink-500 group-hover:scale-110 transition">📝</div>
            <h2 className="text-2xl font-semibold text-gray-800 group-hover:text-pink-600 transition">
              Submit Attendance Issue Note
            </h2>
          </div>
          <p className="text-gray-600 text-sm">
            Share your experience or suggestions with the faculty or admin for improvement.
          </p>
        </Link>

        {/* View Attendance Records */}
        <Link
          to="/attendance-records"
          className="group bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-3xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="text-3xl text-teal-500 group-hover:scale-110 transition">📊</div>
            <h2 className="text-2xl font-semibold text-gray-800 group-hover:text-teal-600 transition">
              Attendance Records
            </h2>
          </div>
          <p className="text-gray-600 text-sm">
            View your attendance summary and stay updated with your class presence.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default UserDashboard;

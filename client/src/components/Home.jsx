import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-cyan-100 to-white p-0">

      <div className="pt-28 px-4 flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-12 tracking-tight">
          Welcome to the <br />
          <span className="text-teal-600">Attendance Management System</span>
        </h1>

        <div className="grid gap-10 max-w-6xl w-full md:grid-cols-2">
          {/* Documentation Card */}
          <div className="bg-white bg-opacity-80 backdrop-blur-lg p-8 rounded-2xl shadow-xl hover:shadow-2xl transition">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              📘 Documentation
            </h2>
            <p className="text-gray-700 mb-4">
              This app manages attendance, feedback, and user roles for Students, Teachers, and Admins.
            </p>
            <h3 className="text-xl text-gray-800 font-medium mb-2">🌟 Features</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Student Registration with Enrollment Number</li>
              <li>Role-Based Access Control (Student, Faculty, Admin)</li>
              <li>Mark Attendance for Students</li>
              <li>Submit and View Attendance Issue Note</li>
              <li>View Attendance Records</li>
            </ul>
          </div>

          {/* How to Use Card */}
          <div className="bg-white bg-opacity-80 backdrop-blur-lg p-8 rounded-2xl shadow-xl hover:shadow-2xl transition">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              🛠️ How to Use
            </h2>
            <ol className="list-decimal list-inside text-gray-700 space-y-1">
              <li>Register as a Student, Teacher, or Admin.</li>
              <li>Log in with your credentials.</li>
              <li>Use the dashboard to perform actions based on your role.</li>
            </ol>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="mt-12 flex flex-col md:flex-row gap-6">
          <Link
            to="/register"
            className="bg-teal-500 text-white font-bold px-8 py-3 rounded-full shadow-md hover:bg-teal-400 transition"
          >
            Register
          </Link>
          <Link
            to="/login"
            className="bg-pink-500 text-white font-bold px-8 py-3 rounded-full shadow-md hover:bg-pink-400 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;

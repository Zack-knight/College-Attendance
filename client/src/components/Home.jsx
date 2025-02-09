import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Welcome to the Attendance Management System</h1>
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Documentation</h2>
        <p className="mb-4 text-gray-700">
          This application is designed to manage attendance, feedback, and user roles for students, teachers, and admins.
        </p>
        <h3 className="text-xl font-bold mb-2 text-gray-800">Features</h3>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Student Registration with Enrollment Number</li>
          <li>Role-Based Access Control (Student, Teacher, Admin)</li>
          <li>Mark Attendance for Students</li>
          <li>Submit and View Feedback</li>
          <li>View Attendance Records</li>
        </ul>
        <h3 className="text-xl font-bold mb-2 text-gray-800">How to Use</h3>
        <ol className="list-decimal list-inside mb-4 text-gray-700">
          <li>Register as a Student, Teacher, or Admin.</li>
          <li>Log in with your credentials.</li>
          <li>Use the dashboard to perform actions based on your role.</li>
        </ol>
        <div className="flex justify-center space-x-4">
          <Link
            to="/register"
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Register
          </Link>
          <Link
            to="/login"
            className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
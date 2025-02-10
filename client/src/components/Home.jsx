import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-dark p-8 pt-20">
      <h1 className="text-4xl font-bold mb-8 text-center text-text">Welcome to the Attendance Management System</h1>
      <div className="max-w-4xl mx-auto card">
        <h2 className="text-2xl font-bold mb-4 text-primary">Documentation</h2>
        <p className="mb-4 text-text">
          This application is designed to manage attendance, feedback, and user roles for students, teachers, and admins.
        </p>
        <h3 className="text-xl font-bold mb-2 text-primary">Features</h3>
        <ul className="list-disc list-inside mb-4 text-text">
          <li>Student Registration with Enrollment Number</li>
          <li>Role-Based Access Control (Student, Teacher, Admin)</li>
          <li>Mark Attendance for Students</li>
          <li>Submit and View Feedback</li>
          <li>View Attendance Records</li>
        </ul>
        <h3 className="text-xl font-bold mb-2 text-primary">How to Use</h3>
        <ol className="list-decimal list-inside mb-4 text-text">
          <li>Register as a Student, Teacher, or Admin.</li>
          <li>Log in with your credentials.</li>
          <li>Use the dashboard to perform actions based on your role.</li>
        </ol>
        <div className="flex justify-center space-x-4">
          <Link to="/register" className="btn-primary">
            Register
          </Link>
          <Link to="/login" className="btn-accent">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
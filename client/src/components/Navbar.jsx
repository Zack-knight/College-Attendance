import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); // Check if user is logged in

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    navigate('/login'); // Redirect to login page
  };

  return (
    <nav className="bg-gradient-to-r from-primary to-secondary p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">
          Attendance System
        </Link>
        <div className="flex space-x-4">
          <Link to="/attendance-records" className="text-white hover:text-gray-200 transition duration-300">
            Attendance Records
          </Link>
          <Link to="/feedback-list" className="text-white hover:text-gray-200 transition duration-300">
            Feedback List
          </Link>
          <Link to="/mark-attendance" className="text-white hover:text-gray-200 transition duration-300">
            Mark Attendance
          </Link>
          <Link to="/user-dashboard" className="text-white hover:text-gray-200 transition duration-300">
            User Dashboard
          </Link>
          <Link to="/faculty-dashboard" className="text-white hover:text-gray-200 transition duration-300">
            Faculty Dashboard
          </Link>
          <Link to="/admin-dashboard" className="text-white hover:text-gray-200 transition duration-300">
            Admin Dashboard
          </Link>
          {token && ( // Show logout button only if user is logged in
            <button
              onClick={handleLogout}
              className="btn-danger"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
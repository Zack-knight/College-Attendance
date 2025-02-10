import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/user/all');
        setUsers(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/user/${id}`);
      setUsers(users.filter((user) => user._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark p-8 pt-20">
      <h1 className="text-2xl font-bold mb-6 text-center text-primary">Admin Dashboard</h1>
      <div className="space-y-4">
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
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 text-primary">All Users</h2>
        <div className="overflow-x-auto card">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-primary to-secondary">
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Enrollment Number</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-700 transition duration-300">
                  <td className="px-6 py-4 text-sm text-text">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-text">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-text">{user.role}</td>
                  <td className="px-6 py-4 text-sm text-text">{user.enrollmentNumber}</td>
                  <td className="px-6 py-4 text-sm text-text">
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
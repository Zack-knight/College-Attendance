import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');

  // Fetch all users and courses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await axios.get('/user/all');
        const coursesResponse = await axios.get('/course/all');
        setUsers(usersResponse.data);
        setCourses(coursesResponse.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`/user/${id}`);
      setUsers(users.filter(user => user._id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark p-8 pt-20">
      <h1 className="text-2xl font-bold mb-6 text-center text-primary">Admin Dashboard</h1>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      {/* Users Management */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-primary">All Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-primary to-secondary">
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-gray-700 transition duration-300">
                  <td className="px-6 py-4 text-sm text-text">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-text">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-text capitalize">{user.role}</td>
                  <td className="px-6 py-4 text-sm text-text">
                    {user.role === 'student' ? user.enrollmentNumber : user.employeeId}
                  </td>
                  <td className="px-6 py-4 text-sm text-text">
                    <button
                      onClick={() => handleDeleteUser(user._id)}
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

      {/* Courses Management */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4 text-primary">All Courses</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-primary to-secondary">
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Code</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Faculty</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Students</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {courses.map(course => (
                <tr key={course._id} className="hover:bg-gray-700 transition duration-300">
                  <td className="px-6 py-4 text-sm text-text">{course.name}</td>
                  <td className="px-6 py-4 text-sm text-text">{course.code}</td>
                  <td className="px-6 py-4 text-sm text-text">{course.faculty?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-text">{course.students?.length || 0}</td>
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
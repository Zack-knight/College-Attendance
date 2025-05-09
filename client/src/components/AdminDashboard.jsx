import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import Navbar from './Navbar';
import AdminCreateCourseOrEvent from './AdminCreateCourseOrEvent';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/user/all');
        setUsers(response.data);
      } catch {
        setError('Failed to fetch users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/user/${id}`);
      setUsers(users.filter((user) => user._id !== id));
    } catch {
      setError('Failed to delete user.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-sky-200 via-cyan-100 to-white px-4 pt-28 pb-16 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10 tracking-tight">
          <span className="text-teal-600">Admin Dashboard</span>
        </h1>
        <div className="grid gap-8 w-full max-w-4xl md:grid-cols-2 mb-10">
          <Link
            to="/attendance-records"
            className="bg-white bg-opacity-80 backdrop-blur-lg p-8 rounded-2xl shadow-xl hover:shadow-2xl transition flex flex-col items-center btn-primary"
          >
            <span className="text-2xl font-semibold text-gray-800 mb-2">📊 View Attendance Records</span>
            <span className="text-gray-600">See all attendance data for students.</span>
          </Link>
          <Link
            to="/feedback-list"
            className="bg-white bg-opacity-80 backdrop-blur-lg p-8 rounded-2xl shadow-xl hover:shadow-2xl transition flex flex-col items-center btn-primary"
          >
            <span className="text-2xl font-semibold text-gray-800 mb-2">💬 View Feedback</span>
            <span className="text-gray-600">Review all attendance issue notes.</span>
          </Link>
          <Link
            to="/mark-attendance"
            className="bg-white bg-opacity-80 backdrop-blur-lg p-8 rounded-2xl shadow-xl hover:shadow-2xl transition flex flex-col items-center btn-primary"
          >
            <span className="text-2xl font-semibold text-gray-800 mb-2">📝 Mark Attendance</span>
            <span className="text-gray-600">Mark attendance for any course or event.</span>
          </Link>
        </div>
        <AdminCreateCourseOrEvent />
        <div className="w-full max-w-6xl bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-xl p-8 ring-1 ring-white/30">
          <h2 className="text-2xl font-bold mb-6 text-teal-600">All Users</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {loading ? (
            <p className="text-center text-gray-700 text-lg">Loading users...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-800">
                <thead>
                  <tr className="bg-gradient-to-r from-teal-400 to-cyan-400 text-white text-left">
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Enrollment No.</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-100 transition">
                        <td className="px-6 py-4">{user.name}</td>
                        <td className="px-6 py-4">{user.email}</td>
                        <td className="px-6 py-4 capitalize">{user.role}</td>
                        <td className="px-6 py-4">{user.enrollmentNumber || '-'}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="btn-danger px-4 py-1 text-sm font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
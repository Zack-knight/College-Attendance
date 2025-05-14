import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import Navbar from './Navbar';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Animation classes for elements when they appear
  const fadeIn = "animate-fadeIn";
  const slideIn = "animate-slideInRight";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const response = await axios.get('/user/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users: ' + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      await axios.delete(`/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter((user) => user._id !== id));
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user: ' + (err.response?.data?.error || err.message));
    }
  };

  // Filter and sort users
  const filteredUsers = users.filter(user => {
    // Apply role filter
    if (filterRole !== 'all' && user.role !== filterRole) return false;
    
    // Apply search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        (user.enrollmentNumber && user.enrollmentNumber.toLowerCase().includes(search))
      );
    }
    return true;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let valueA = a[sortField];
    let valueB = b[sortField];
    
    if (sortField === 'enrollmentNumber') {
      valueA = valueA || '';
      valueB = valueB || '';
    }
    
    if (typeof valueA === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }
    
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort indicator
  const getSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // Role badges with colors
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-medium">Admin</span>;
      case 'teacher':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">Teacher</span>;
      case 'student':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">Student</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full font-medium capitalize">{role}</span>;
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-sky-200 via-cyan-100 to-white px-4 pt-28 pb-16 flex flex-col items-center">
        <div className={`flex flex-col items-center ${fadeIn}`}>
          <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-4 tracking-tight">
            <span className="text-teal-600">User Management</span>
          </h1>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl text-center">
            View, filter, and manage all users in the system.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 w-full max-w-6xl mb-6">
            <Link to="/admin-dashboard" className="bg-gray-100 hover:bg-gray-200 transition-all duration-300 text-gray-700 py-2 px-4 rounded-lg flex items-center justify-center md:justify-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
        
        <div className={`w-full max-w-6xl bg-white rounded-2xl shadow-xl p-8 ${slideIn}`}>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-teal-600">All Users</h2>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800 w-full md:w-64"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>
          
          {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-800 animate-fadeIn">
                <thead>
                  <tr className="bg-gradient-to-r from-teal-400 to-cyan-400 text-white">
                    <th 
                      className="px-6 py-4 font-semibold cursor-pointer hover:bg-teal-500 transition"
                      onClick={() => handleSort('name')}
                    >
                      Name {getSortIndicator('name')}
                    </th>
                    <th 
                      className="px-6 py-4 font-semibold cursor-pointer hover:bg-teal-500 transition"
                      onClick={() => handleSort('email')}
                    >
                      Email {getSortIndicator('email')}
                    </th>
                    <th 
                      className="px-6 py-4 font-semibold cursor-pointer hover:bg-teal-500 transition"
                      onClick={() => handleSort('role')}
                    >
                      Role {getSortIndicator('role')}
                    </th>
                    <th 
                      className="px-6 py-4 font-semibold cursor-pointer hover:bg-teal-500 transition"
                      onClick={() => handleSort('enrollmentNumber')}
                    >
                      Enrollment No. {getSortIndicator('enrollmentNumber')}
                    </th>
                    <th 
                      className="px-6 py-4 font-semibold cursor-pointer hover:bg-teal-500 transition"
                      onClick={() => handleSort('branch')}
                    >
                      Branch {getSortIndicator('branch')}
                    </th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500">
                        No users found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    sortedUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition animate-fadeIn">
                        <td className="px-6 py-4">{user.name}</td>
                        <td className="px-6 py-4">{user.email}</td>
                        <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                        <td className="px-6 py-4">{user.enrollmentNumber || '-'}</td>
                        <td className="px-6 py-4">
                          {user.role === 'student' ? (
                            user.branch ? (
                              <span className="text-teal-600 font-medium">{user.branch}</span>
                            ) : (
                              <span className="text-gray-400 italic">Not specified</span>
                            )
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {confirmDelete === user._id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleDelete(user._id)}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded transition"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(user._id)}
                              className="px-4 py-1 text-sm font-semibold text-red-600 hover:text-red-800 hover:underline transition"
                            >
                              Delete
                            </button>
                          )}
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

export default UserList;

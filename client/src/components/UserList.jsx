import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import Navbar from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FadeIn,
  SlideInUp,
  Card3D,
  GlassCard,
  GradientBackground,
  MorphingBlob
} from './AnimationUtils';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
        return <span className="px-3 py-1 bg-red-500/30 text-red-300 rounded-full font-medium">Admin</span>;
      case 'teacher':
        return <span className="px-3 py-1 bg-blue-500/30 text-blue-300 rounded-full font-medium">Teacher</span>;
      case 'student':
        return <span className="px-3 py-1 bg-green-500/30 text-green-300 rounded-full font-medium">Student</span>;
      default:
        return <span className="px-3 py-1 bg-gray-500/30 text-gray-300 rounded-full font-medium capitalize">{role}</span>;
    }
  };

  return (
    <>
      <Navbar />
      <motion.div 
        className="min-h-screen bg-background overflow-hidden py-12 px-4 relative"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <GradientBackground gradient="from-teal-500/10 via-blue-600/10 to-purple-600/10" />
        
        <MorphingBlob 
          color="bg-teal-500" 
          size="w-64 h-64" 
          opacity="opacity-10" 
          className="absolute top-0 right-0 translate-x-1/4"
        />
        <MorphingBlob 
          color="bg-purple-500" 
          size="w-96 h-96" 
          opacity="opacity-10" 
          className="absolute bottom-0 left-0 -translate-x-1/4"
        />

        <div className="w-full max-w-6xl mx-auto relative z-10">
          <motion.div className="flex flex-col items-center mb-8" variants={itemVariants}>
            <h1 className="text-4xl font-extrabold text-center mb-4 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">User Management</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl text-center">
              View, filter, and manage all users in the system.
            </p>

            <div className="flex flex-wrap gap-4 justify-center w-full">
              <Link
                to="/admin-dashboard"
                className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Dashboard
              </Link>
            </div>
          </motion.div>
          
          {error && (
            <motion.div 
              className="bg-red-500/20 backdrop-blur-sm border border-red-300/30 text-red-300 p-4 mb-6 w-full rounded-lg"
              variants={itemVariants}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          <GlassCard className="p-6 w-full">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <motion.h2 
                className="text-2xl font-bold text-white"
                variants={itemVariants}
              >
                All Users
              </motion.h2>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-teal-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, email or ID..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300/30 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-150 bg-white/10 backdrop-blur-sm text-white placeholder-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select
                  className="px-4 py-2 border border-gray-300/30 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-150 bg-white/10 backdrop-blur-sm text-white"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
              </div>
            </div>
            
            {loading ? (
              <motion.div 
                className="flex justify-center items-center py-12"
                variants={itemVariants}
              >
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
              </motion.div>
            ) : (
              <motion.div 
                className="overflow-x-auto"
                variants={itemVariants}
              >
                <table className="min-w-full text-sm text-white">
                  <thead>
                    <tr className="bg-teal-600/30 text-white">
                      <th 
                        className="px-6 py-4 font-semibold cursor-pointer hover:bg-teal-500/40 transition"
                        onClick={() => handleSort('name')}
                      >
                        Name {getSortIndicator('name')}
                      </th>
                      <th 
                        className="px-6 py-4 font-semibold cursor-pointer hover:bg-teal-500/40 transition"
                        onClick={() => handleSort('email')}
                      >
                        Email {getSortIndicator('email')}
                      </th>
                      <th 
                        className="px-6 py-4 font-semibold cursor-pointer hover:bg-teal-500/40 transition"
                        onClick={() => handleSort('role')}
                      >
                        Role {getSortIndicator('role')}
                      </th>
                      <th 
                        className="px-6 py-4 font-semibold cursor-pointer hover:bg-teal-500/40 transition"
                        onClick={() => handleSort('enrollmentNumber')}
                      >
                        Enrollment No. {getSortIndicator('enrollmentNumber')}
                      </th>
                      <th className="px-6 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/20">
                    {sortedUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-gray-300">
                          No users found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      sortedUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-white/10 transition">
                          <td className="px-6 py-4 text-white">{user.name}</td>
                          <td className="px-6 py-4 text-white">{user.email}</td>
                          <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                          <td className="px-6 py-4 text-white">{user.enrollmentNumber || '-'}</td>
                          <td className="px-6 py-4">
                            {confirmDelete === user._id ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleDelete(user._id)}
                                  className="px-3 py-1 bg-red-500/80 hover:bg-red-600/80 text-white rounded transition"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  className="px-3 py-1 bg-gray-300/30 hover:bg-gray-400/30 text-white rounded transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDelete(user._id)}
                                className="px-4 py-1 text-sm font-semibold text-red-400 hover:text-red-300 hover:underline transition"
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
              </motion.div>
            )}
          </GlassCard>
        </div>
      </motion.div>
    </>
  );
};

export default UserList;

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import Navbar from './Navbar';
import { motion } from 'framer-motion';
import {
  FadeIn,
  SlideInUp,
  Card3D,
  GlassCard,
  GradientBackground,
  MorphingBlob
} from './AnimationUtils';

const FacultySubjectList = () => {
  const [subjects, setSubjects] = useState([]);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectType, setSubjectType] = useState('course');
  const [attendanceTracking, setAttendanceTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [activeTab, setActiveTab] = useState('all');
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };
  
  const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: i => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }
    })
  };

  // Icons
  const SubjectsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );

  const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );

  // Fetch subjects for the logged-in faculty
  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/subject');
      setSubjects(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Reset form fields
  const resetForm = () => {
    setSubjectName('');
    setSubjectCode('');
    setSubjectType('course');
    setAttendanceTracking(false);
    setEditingSubject(null);
  };

  // Set up form for editing
  const handleEdit = (subject) => {
    setEditingSubject(subject._id);
    setSubjectName(subject.name);
    setSubjectCode(subject.code || '');
    setSubjectType(subject.type || 'course');
    setAttendanceTracking(subject.attendanceTracking || false);
    setError(null);
    setSuccess(null);
  };

  // Handle subject creation or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!subjectName.trim()) {
      setError('Subject name is required');
      return;
    }
    
    if (!subjectCode.trim()) {
      setError('Subject code is required');
      return;
    }
    
    // Validate subject code format (6-12 digits)
    if (!/^\d{6,12}$/.test(subjectCode)) {
      setError('Subject code must be between 6-12 digits (numbers only)');
      return;
    }
    
    setLoading(true);
    
    try {
      const data = {
        name: subjectName.trim(),
        code: subjectCode.trim(),
        type: subjectType,
        attendanceTracking: subjectType === 'event' ? attendanceTracking : false
      };
      
      if (editingSubject) {
        // Update existing subject
        await axios.put(`/subject/${editingSubject}`, data);
        setSuccess('Subject updated successfully!');
      } else {
        // Create new subject
        await axios.post('/subject', data);
        setSuccess('Subject created successfully!');
      }
      
      // Refresh the subject list and reset form
      fetchSubjects();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save subject');
    } finally {
      setLoading(false);
    }
  };

  // Handle subject deletion
  const handleDelete = async (id) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await axios.delete(`/subject/${id}`);
      setSuccess('Subject deleted successfully!');
      setDeleteConfirm(null);
      
      // Refresh the subject list
      fetchSubjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete subject');
    } finally {
      setLoading(false);
    }
  };

  // Filter subjects based on search term and active tab
  const filteredSubjects = subjects.filter(subject => {
    // Filter by search term
    const matchesSearch = 
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.code && subject.code.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by type tab
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'courses') return matchesSearch && subject.type === 'course';
    if (activeTab === 'events') return matchesSearch && subject.type === 'event';
    
    return matchesSearch;
  });

  // Sort subjects
  const sortedSubjects = [...filteredSubjects].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle undefined values
    if (aValue === undefined) aValue = '';
    if (bValue === undefined) bValue = '';
    
    // Convert to lowercase for string comparison
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    
    // Sort direction
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Get sort indicator
  const getSortIndicator = (field) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and reset direction to asc
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background overflow-hidden py-12 px-4 relative">
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
        
        <motion.div
          className="relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="flex flex-col items-center mb-8" variants={itemVariants}>
            <Link 
              to="/faculty-dashboard" 
              className="self-start mb-4 inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </Link>
            <motion.div className="flex items-center mb-2" variants={itemVariants}>
              <SubjectsIcon />
              <h1 className="text-4xl font-extrabold text-center tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">Manage Subjects</span>
              </h1>
            </motion.div>
            <motion.p className="text-gray-300 text-lg max-w-2xl text-center" variants={itemVariants}>
              Create, edit, and manage your subjects and courses.
            </motion.p>
          </motion.div>

          <motion.div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8" variants={containerVariants}>
            {/* Subject Form */}
            <motion.div className="lg:col-span-1" variants={itemVariants}>
              <GlassCard className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  {editingSubject ? 'Edit Subject' : 'Create New Subject'}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-1">Subject Name</label>
                    <input
                      type="text"
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-gray-300/30 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-150 text-white placeholder-gray-400"
                      placeholder="e.g., Data Structures"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-1">Subject Code</label>
                    <input
                      type="text"
                      value={subjectCode}
                      onChange={(e) => setSubjectCode(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-gray-300/30 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-150 text-white placeholder-gray-400"
                      placeholder="e.g., 123456"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">Must be 6-12 digits</p>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-1">Type</label>
                    <select
                      value={subjectType}
                      onChange={(e) => setSubjectType(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-gray-300/30 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-150 text-white"
                    >
                      <option value="course">Course</option>
                      <option value="event">Event</option>
                    </select>
                  </div>
                  {subjectType === 'event' && (
                    <div className="mb-4">
                      <label className="flex items-center text-gray-300">
                        <input
                          type="checkbox"
                          checked={attendanceTracking}
                          onChange={(e) => setAttendanceTracking(e.target.checked)}
                          className="mr-2 h-4 w-4 text-teal-500 focus:ring-teal-400 rounded"
                        />
                        Track Attendance for this Event
                      </label>
                    </div>
                  )}
                  
                  <div className="flex gap-3 mt-6">
                    <motion.button
                      type="submit"
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-semibold relative overflow-hidden group flex items-center"
                      disabled={loading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <span className="relative z-10 flex items-center">
                        <PlusIcon />
                        {editingSubject ? 'Update Subject' : 'Create Subject'}
                      </span>
                    </motion.button>
                    
                    {editingSubject && (
                      <motion.button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 border border-gray-300/30 text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
                        disabled={loading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Cancel
                      </motion.button>
                    )}
                  </div>
                  
                  {error && (
                    <motion.div 
                      className="mt-4 p-3 bg-red-500/20 backdrop-blur-sm border border-red-300/30 text-red-300 rounded-lg"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {error}
                    </motion.div>
                  )}
                  
                  {success && (
                    <motion.div 
                      className="mt-4 p-3 bg-green-500/20 backdrop-blur-sm border border-green-300/30 text-green-300 rounded-lg"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {success}
                    </motion.div>
                  )}
                </form>
              </GlassCard>
            </motion.div>
            
            {/* Subject List */}
            <motion.div className="lg:col-span-2" variants={itemVariants}>
              <GlassCard className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white mb-4 md:mb-0">Your Subjects</h2>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Type Filter Tabs */}
                    <div className="flex bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden">
                      <button
                        className={`px-4 py-2 ${activeTab === 'all' ? 'bg-teal-500 text-white' : 'text-gray-300 hover:bg-white/10'}`}
                        onClick={() => setActiveTab('all')}
                      >
                        All
                      </button>
                      <button
                        className={`px-4 py-2 ${activeTab === 'courses' ? 'bg-teal-500 text-white' : 'text-gray-300 hover:bg-white/10'}`}
                        onClick={() => setActiveTab('courses')}
                      >
                        Courses
                      </button>
                      <button
                        className={`px-4 py-2 ${activeTab === 'events' ? 'bg-teal-500 text-white' : 'text-gray-300 hover:bg-white/10'}`}
                        onClick={() => setActiveTab('events')}
                      >
                        Events
                      </button>
                    </div>
                    
                    {/* Search */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search subjects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 pl-10 bg-white/10 backdrop-blur-sm border border-gray-300/30 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-150 text-white placeholder-gray-400"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                {loading && subjects.length === 0 ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                  </div>
                ) : subjects.length === 0 ? (
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 text-center">
                    <p className="text-gray-300 mb-4">No subjects found. Create your first subject!</p>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                ) : filteredSubjects.length === 0 ? (
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 text-center">
                    <p className="text-gray-300">No subjects match your search criteria.</p>
                  </div>
                ) : (
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden">
                    <table className="min-w-full text-sm text-gray-200">
                      <thead>
                        <tr className="bg-gradient-to-r from-teal-500/30 to-cyan-500/30 text-white">
                          <th 
                            className="px-6 py-4 font-semibold cursor-pointer hover:bg-teal-500/40 transition-colors"
                            onClick={() => handleSort('name')}
                          >
                            Name {getSortIndicator('name')}
                          </th>
                          <th 
                            className="px-6 py-4 font-semibold cursor-pointer hover:bg-teal-500/40 transition-colors"
                            onClick={() => handleSort('code')}
                          >
                            Code {getSortIndicator('code')}
                          </th>
                          <th 
                            className="px-6 py-4 font-semibold cursor-pointer hover:bg-teal-500/40 transition-colors"
                            onClick={() => handleSort('type')}
                          >
                            Type {getSortIndicator('type')}
                          </th>
                          <th className="px-6 py-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/30">
                        {sortedSubjects.map((subject, i) => (
                          <motion.tr 
                            key={subject._id} 
                            custom={i}
                            variants={tableRowVariants}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-4">{subject.name}</td>
                            <td className="px-6 py-4 font-medium">{subject.code || 'N/A'}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full font-medium ${
                                subject.type === 'event' 
                                  ? 'bg-purple-500/20 text-purple-300' 
                                  : 'bg-green-500/20 text-green-300'
                              }`}>
                                {subject.type === 'event' ? 'Event' : 'Course'}
                                {subject.type === 'event' && subject.attendanceTracking && ' (Attendance)'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-2">
                                <motion.button
                                  onClick={() => handleEdit(subject)}
                                  className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
                                  disabled={loading}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  Edit
                                </motion.button>
                                {deleteConfirm === subject._id ? (
                                  <div className="flex space-x-2">
                                    <motion.button
                                      onClick={() => handleDelete(subject._id)}
                                      className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                                      disabled={loading}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      Confirm
                                    </motion.button>
                                    <motion.button
                                      onClick={() => setDeleteConfirm(null)}
                                      className="px-3 py-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-lg transition-colors"
                                      disabled={loading}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      Cancel
                                    </motion.button>
                                  </div>
                                ) : (
                                  <motion.button
                                    onClick={() => setDeleteConfirm(subject._id)}
                                    className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                                    disabled={loading}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    Delete
                                  </motion.button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default FacultySubjectList;

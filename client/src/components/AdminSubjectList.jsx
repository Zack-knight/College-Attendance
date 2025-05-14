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

const AdminSubjectList = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectType, setSubjectType] = useState('course');
  const [attendanceTracking, setAttendanceTracking] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Animation classes
  const fadeIn = "animate-fadeIn";
  const slideIn = "animate-slideInRight";

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const response = await axios.get('/subject', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubjects(response.data);
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError('Failed to fetch subjects: ' + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  // Reset form fields
  const resetForm = () => {
    setSubjectName('');
    setSubjectCode('');
    setSubjectType('course');
    setAttendanceTracking(false);
    setEditingSubject(null);
    setError(null);
    setSuccess(null);
  };

  // Cancel form
  const handleCancel = () => {
    resetForm();
    setShowForm(false);
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
    setShowForm(true);
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
    
    setFormSubmitting(true);
    
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
      
      resetForm();
      fetchSubjects();
      setShowForm(false);
    } catch (err) {
      console.error('Error saving subject:', err);
      const errorMessage = err.response?.data?.error || 'Failed to save subject';
      const errorDetails = err.response?.data?.details;
      
      if (Array.isArray(errorDetails) && errorDetails.length > 0) {
        setError(`${errorMessage}: ${errorDetails.join(', ')}`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      await axios.delete(`/subject/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(subjects.filter((subject) => subject._id !== id));
      setConfirmDelete(null);
      setSuccess('Subject deleted successfully!');
    } catch (err) {
      console.error('Error deleting subject:', err);
      setError('Failed to delete subject: ' + (err.response?.data?.error || err.message));
    }
  };

  // Filter and sort subjects
  const filteredSubjects = subjects.filter(subject => {
    // Apply type filter
    if (filterType !== 'all' && subject.type !== filterType) return false;
    
    // Apply search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        subject.name.toLowerCase().includes(search) ||
        subject.code.toLowerCase().includes(search) ||
        (subject.faculty && subject.faculty.name && 
         subject.faculty.name.toLowerCase().includes(search))
      );
    }
    return true;
  });

  // Sort subjects
  const sortedSubjects = [...filteredSubjects].sort((a, b) => {
    let valueA, valueB;
    
    if (sortField === 'faculty') {
      valueA = a.faculty?.name || '';
      valueB = b.faculty?.name || '';
    } else {
      valueA = a[sortField];
      valueB = b[sortField];
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
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  // Format faculty display
  const formatFaculty = (faculty) => {
    return faculty ? faculty.name : 'Admin';
  };

  // Type badges with colors
  const getTypeBadge = (type) => {
    switch (type) {
      case 'course':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">Course</span>;
      case 'event':
        return <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">Event</span>;
            View, filter, and manage all subjects in the system.
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
        
        {/* Subject Form Section */}
        {!showForm && (
          <div className="w-full max-w-6xl flex justify-end mb-4">
            <button
              onClick={() => setShowForm(true)}
              className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Subject
            </button>
          </div>
        )}

        {showForm && (
          <div className={`w-full max-w-6xl bg-white rounded-2xl shadow-xl p-8 mb-6 ${slideIn}`}>
            <h2 className="text-2xl font-bold text-teal-600 mb-6">
              {editingSubject ? 'Edit Subject' : 'Create New Subject'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="subjectName" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="subjectName"
                    type="text"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="Enter subject name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800"
                    disabled={formSubmitting}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="subjectCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="subjectCode"
                    type="text"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter subject code (numbers only)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800"
                    disabled={formSubmitting}
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">Must be between 6-12 digits (numbers only)</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="subjectType" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Type
                  </label>
                  <select
                    id="subjectType"
                    value={subjectType}
                    onChange={(e) => setSubjectType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800"
                    disabled={formSubmitting}
                  >
                    <option value="course">Regular Course</option>
                    <option value="event">Event/Special Session</option>
                  </select>
                </div>
                
                {subjectType === 'event' && (
                  <div className="flex items-center">
                    <input
                      id="attendanceTracking"
                      type="checkbox"
                      checked={attendanceTracking}
                      onChange={(e) => setAttendanceTracking(e.target.checked)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      disabled={formSubmitting}
                    />
                    <label htmlFor="attendanceTracking" className="ml-2 block text-sm text-gray-700">
                      Track attendance for this event
                    </label>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition flex-1"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? 
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span> : editingSubject ? 'Update Subject' : 'Create Subject'}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Error message - displayed prominently at the top */}
        {error && (
          <div className="w-full max-w-6xl mb-6">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md animate-fadeIn">
              <div className="flex items-center">
                <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-medium text-lg">Validation Error</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Success message */}
        {success && (
          <div className="w-full max-w-6xl mb-6">
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md animate-fadeIn">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="font-medium">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className={`w-full max-w-6xl bg-white rounded-2xl shadow-xl p-8 ${slideIn}`}>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-teal-600">All Subjects</h2>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800 w-full md:w-64"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800"
              >
                <option value="all">All Types</option>
                <option value="course">Courses</option>
                <option value="event">Events</option>
              </select>
            </div>
          </div>
          
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
                      onClick={() => handleSort('code')}
                    >
                      Subject Code {getSortIndicator('code')}
                    </th>
                    <th 
                      className="px-6 py-4 font-semibold cursor-pointer hover:bg-teal-500 transition"
                      onClick={() => handleSort('name')}
                    >
                      Name {getSortIndicator('name')}
                    </th>
                    <th 
                      className="px-6 py-4 font-semibold cursor-pointer hover:bg-teal-500 transition"
                      onClick={() => handleSort('type')}
                    >
                      Type {getSortIndicator('type')}
                    </th>
                    <th 
                      className="px-6 py-4 font-semibold cursor-pointer hover:bg-teal-500 transition"
                      onClick={() => handleSort('faculty')}
                    >
                      Created By {getSortIndicator('faculty')}
                    </th>
                    <th 
                      className="px-6 py-4 font-semibold"
                    >
                      Attendance
                    </th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedSubjects.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-gray-500">
                        No subjects found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    sortedSubjects.map((subject) => (
                      <tr key={subject._id} className="hover:bg-gray-50 transition animate-fadeIn">
                        <td className="px-6 py-4 font-medium">{subject.code}</td>
                        <td className="px-6 py-4">{subject.name}</td>
                        <td className="px-6 py-4">{getTypeBadge(subject.type)}</td>
                        <td className="px-6 py-4">{formatFaculty(subject.faculty)}</td>
                        <td className="px-6 py-4">
                          {subject.attendanceTracking ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg className="mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                                <circle cx="4" cy="4" r="3" />
                              </svg>
                              Enabled
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <svg className="mr-1.5 h-2 w-2 text-gray-400" fill="currentColor" viewBox="0 0 8 8">
                                <circle cx="4" cy="4" r="3" />
                              </svg>
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {confirmDelete === subject._id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleDelete(subject._id)}
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
                              onClick={() => setConfirmDelete(subject._id)}
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

export default AdminSubjectList;

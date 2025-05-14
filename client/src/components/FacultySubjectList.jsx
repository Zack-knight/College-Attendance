import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import Navbar from './Navbar';

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
  
  // Animation classes
  const fadeIn = "animate-fadeIn";
  const slideIn = "animate-slideInRight";
  const pulseAnimation = "hover:animate-pulse";
  
  // Helper to get a random animation delay for staggered animations
  const getRandomDelay = () => {
    const delays = ['delay-100', 'delay-200', 'delay-300', 'delay-400'];
    return delays[Math.floor(Math.random() * delays.length)];
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
      
      resetForm();
      fetchSubjects();
    } catch (err) {
      console.error('Error saving subject:', err);
      const errorMessage = err.response?.data?.error || 'Failed to save subject';
      const errorDetails = err.response?.data?.details;
      
      if (errorDetails) {
        if (Array.isArray(errorDetails)) {
          setError(`${errorMessage}: ${errorDetails.join(', ')}`);
        } else {
          setError(`${errorMessage}: ${errorDetails}`);
        }
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle subject deletion
  const handleDelete = async (id) => {
    if (deleteConfirm === id) {
      setLoading(true);
      try {
        await axios.delete(`/subject/${id}`);
        setSuccess('Subject deleted successfully!');
        setDeleteConfirm(null);
        fetchSubjects();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete subject');
      } finally {
        setLoading(false);
      }
    } else {
      setDeleteConfirm(id);
    }
  };

  // Filter and sort subjects
  const filteredSubjects = subjects.filter(subject => {
    // Apply type filter
    if (activeTab !== 'all' && subject.type !== activeTab) return false;
    
    // Apply search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        subject.name.toLowerCase().includes(search) ||
        subject.code.toLowerCase().includes(search)
      );
    }
    return true;
  });

  // Sort subjects
  const sortedSubjects = [...filteredSubjects].sort((a, b) => {
    let valueA = a[sortField];
    let valueB = b[sortField];
    
    if (typeof valueA === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }
    
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Get sort indicator
  const getSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  // Handle sort
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-sky-200 via-cyan-100 to-white px-4 pt-28 pb-16 flex flex-col items-center">
        <div className={`flex flex-col items-center ${fadeIn}`}>
          <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-500">Your Subjects</span>
          </h1>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl text-center">
            Create, manage, and organize all your courses and events in one place.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 w-full max-w-6xl mb-6">
            <Link to="/faculty-dashboard" className="bg-gray-100 hover:bg-gray-200 transition-all duration-300 text-gray-700 py-2 px-4 rounded-lg flex items-center justify-center md:justify-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
        
        {/* Create Subject Section */}
        <div className={`w-full max-w-6xl bg-white rounded-xl shadow-lg p-8 mb-10 ${fadeIn}`}>
          <h2 className="text-2xl font-bold text-teal-600 mb-6 flex items-center">
            <PlusIcon />
            {editingSubject ? 'Edit Subject' : 'Create New Subject'}
          </h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    disabled={loading}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="subjectCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Code <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="subjectCode"
                      type="text"
                      value={subjectCode}
                      onChange={(e) => setSubjectCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Enter subject code (numbers only)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800"
                      disabled={loading}
                      required
                      maxLength={12}
                    />
                    {subjectCode && (
                      <div className={`absolute right-3 top-2.5 rounded-full text-xs font-bold ${subjectCode.length >= 6 && subjectCode.length <= 12 ? 'text-green-600' : 'text-red-500'}`}>
                        {subjectCode.length}/6-12
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    <span className="font-medium">Required:</span> Between 6-12 digits (numbers only)
                  </p>
                  {subjectCode && subjectCode.length < 6 && (
                    <p className="mt-1 text-xs text-red-500">Code is too short (minimum 6 digits)</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="subjectType" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Type
                  </label>
                  <select
                    id="subjectType"
                    value={subjectType}
                    onChange={(e) => setSubjectType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800"
                    disabled={loading}
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
                      disabled={loading}
                    />
                    <label htmlFor="attendanceTracking" className="ml-2 block text-sm text-gray-700">
                      Track attendance for this event
                    </label>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className={`bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition flex-1 ${pulseAnimation}`}
                  disabled={loading}
                >
                  {loading ? 
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span> : editingSubject ? 'Update Subject' : 'Create Subject'}
                </button>
                
                {editingSubject && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mt-4 animate-fadeIn">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="font-medium">Error</p>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}
            {success && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mt-4 animate-fadeIn">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="font-medium">{success}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subjects List Section */}
        <div className={`w-full max-w-6xl bg-white rounded-xl shadow-lg p-8 mb-10 ${slideIn}`}>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-teal-600 flex items-center">
              <SubjectsIcon className="h-6 w-6 mr-2" />
              Your Subjects
            </h2>
            
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
              
              <div className="flex rounded-lg overflow-hidden border border-gray-300">
                <button 
                  onClick={() => setActiveTab('all')} 
                  className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setActiveTab('course')} 
                  className={`px-4 py-2 font-medium ${activeTab === 'course' ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  Courses
                </button>
                <button 
                  onClick={() => setActiveTab('event')} 
                  className={`px-4 py-2 font-medium ${activeTab === 'event' ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  Events
                </button>
              </div>
            </div>
          </div>
          
          {loading && !subjects.length ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          ) : sortedSubjects.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <SubjectsIcon />
              <p className="text-gray-600 mt-2">
                {subjects.length === 0 ? 
                  "You haven't created any subjects yet." : 
                  "No subjects match your search criteria."}
              </p>
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
                      onClick={() => handleSort('code')}
                    >
                      Code {getSortIndicator('code')}
                    </th>
                    <th 
                      className="px-6 py-4 font-semibold cursor-pointer hover:bg-teal-500 transition"
                      onClick={() => handleSort('type')}
                    >
                      Type {getSortIndicator('type')}
                    </th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedSubjects.map((subject) => (
                    <tr key={subject._id} className="hover:bg-gray-50 transition animate-fadeIn">
                      <td className="px-6 py-4">{subject.name}</td>
                      <td className="px-6 py-4 font-medium">{subject.code || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 ${subject.type === 'event' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'} rounded-full font-medium`}>
                          {subject.type === 'event' ? 'Event' : 'Course'}
                          {subject.type === 'event' && subject.attendanceTracking && ' (Attendance)'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(subject)}
                            className="text-blue-600 hover:text-blue-800 hover:underline transition"
                            disabled={loading}
                          >
                            Edit
                          </button>
                          {deleteConfirm === subject._id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleDelete(subject._id)}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition"
                                disabled={loading}
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded transition"
                                disabled={loading}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDelete(subject._id)}
                              className="text-red-600 hover:text-red-800 hover:underline transition"
                              disabled={loading}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FacultySubjectList;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import Navbar from './Navbar';

// Import icons
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const AttendanceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const SubjectsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const FeedbackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const FacultyDashboard = () => {
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
  
  // Animation classes
  const fadeIn = "animate-fadeIn";
  const slideIn = "animate-slideInRight";
  const pulseAnimation = "hover:animate-pulse";
  
  // Helper to get a random animation delay for staggered animations
  const getRandomDelay = () => {
    const delays = ['delay-100', 'delay-200', 'delay-300', 'delay-400'];
    return delays[Math.floor(Math.random() * delays.length)];
  };

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
      setError(err.response?.data?.error || 'Failed to save subject');
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
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      subject.name.toLowerCase().includes(search) ||
      subject.code.toLowerCase().includes(search)
    );
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
        <div className={`${fadeIn} w-full max-w-7xl`}>
          <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-500">Faculty Dashboard</span>
          </h1>
          <p className="text-gray-600 text-lg mb-12 max-w-2xl mx-auto text-center">
            Manage your courses, mark attendance, and view important student data.  
          </p>
        </div>

        {/* Dashboard Cards Section */}
        <div className={`grid gap-8 w-full max-w-7xl md:grid-cols-2 lg:grid-cols-3 mb-14 ${slideIn}`}>
          {/* Card 1 - Mark Attendance */}
          <Link
            to="/mark-attendance"
            className={`${fadeIn} ${getRandomDelay()} group bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center transform hover:-translate-y-1 relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400/5 to-blue-400/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            <AttendanceIcon />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Mark Attendance</h3>
            <p className="text-gray-600 text-center">Record attendance for your courses and events.</p>
            <div className="mt-4 flex">
              <span className="text-teal-600 font-semibold group-hover:text-teal-700 transition-colors flex items-center">
                Mark Now
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>

          {/* Card 2 - Attendance Records */}
          <Link
            to="/attendance-records"
            className={`${fadeIn} ${getRandomDelay()} group bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center transform hover:-translate-y-1 relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400/5 to-blue-400/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            <DashboardIcon />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Attendance Records</h3>
            <p className="text-gray-600 text-center">View and export attendance data for all your courses.</p>
            <div className="mt-4 flex">
              <span className="text-teal-600 font-semibold group-hover:text-teal-700 transition-colors flex items-center">
                View Records
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>

          {/* Card 3 - View Feedback */}
          <Link
            to="/feedback-list"
            className={`${fadeIn} ${getRandomDelay()} group bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center transform hover:-translate-y-1 relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400/5 to-blue-400/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            <FeedbackIcon />
            <h3 className="text-xl font-bold text-gray-800 mb-2">View Feedback</h3>
            <p className="text-gray-600 text-center">Review all feedback and notes from your students.</p>
            <div className="mt-4 flex">
              <span className="text-teal-600 font-semibold group-hover:text-teal-700 transition-colors flex items-center">
                View Feedback
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>

          {/* Card 4 - Manage Subjects */}
          <Link
            to="/faculty-subjects"
            className={`${fadeIn} ${getRandomDelay()} group bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center transform hover:-translate-y-1 relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400/5 to-blue-400/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            <SubjectsIcon />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Manage Subjects</h3>
            <p className="text-gray-600 text-center">Create and manage your courses and events in one place.</p>
            <div className="mt-4 flex">
              <span className="text-teal-600 font-semibold group-hover:text-teal-700 transition-colors flex items-center">
                View Subjects
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Actions Section */}
        <div className={`w-full max-w-7xl bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl shadow-lg p-8 text-white mb-10 ${slideIn}`}>
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link to="/mark-attendance" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center transition-all duration-300 hover:transform hover:scale-105">
              <AttendanceIcon />
              <span className="font-medium">Mark Attendance</span>
            </Link>
            <Link to="/attendance-records" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center transition-all duration-300 hover:transform hover:scale-105">
              <DashboardIcon />
              <span className="font-medium">View Records</span>
            </Link>
            <Link to="/feedback-list" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center transition-all duration-300 hover:transform hover:scale-105">
              <FeedbackIcon />
              <span className="font-medium">View Feedback</span>
            </Link>
            <Link to="/faculty-subjects" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center transition-all duration-300 hover:transform hover:scale-105">
              <SubjectsIcon />
              <span className="font-medium">Manage Subjects</span>
            </Link>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className={`w-full max-w-7xl bg-white rounded-xl shadow-lg p-8 mb-10 ${fadeIn}`}>
          <h2 className="text-2xl font-bold text-teal-600 mb-6">Faculty Resources</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Quick Tips</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li>Use the <span className="text-teal-600 font-medium">Mark Attendance</span> feature to record student attendance for your courses and events.</li>
                  <li>View detailed attendance statistics in the <span className="text-teal-600 font-medium">Attendance Records</span> section.</li>
                  <li>Create and manage your subjects from the <span className="text-teal-600 font-medium">Manage Subjects</span> page.</li>
                  <li>Check student feedback in the <span className="text-teal-600 font-medium">View Feedback</span> section.</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Recent Updates</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-500 text-sm">May 14, 2025</p>
                    <p className="text-gray-700">Added subject code field to improve organization</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">May 10, 2025</p>
                    <p className="text-gray-700">Updated UI for better user experience</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">May 5, 2025</p>
                    <p className="text-gray-700">Added new attendance tracking features</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FacultyDashboard;

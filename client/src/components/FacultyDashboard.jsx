import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import Navbar from './Navbar';
import { motion } from 'framer-motion';
import {
  FadeIn,
  SlideInUp,
  SlideInLeft,
  SlideInRight,
  Card3D,
  GlassCard,
  GradientBackground,
  MorphingBlob
} from './AnimationUtils';

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
      <div className="min-h-screen bg-background overflow-hidden py-8 px-4 relative">
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
          className="max-w-7xl mx-auto space-y-8 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-3xl font-bold text-white mb-2"
            variants={itemVariants}
          >
            Faculty Dashboard
          </motion.h1>
          <motion.p 
            className="text-gray-300 mb-8"
            variants={itemVariants}
          >
            Manage your courses, events, and student attendance
          </motion.p>
          
          {/* Dashboard Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div variants={itemVariants}>
            <Card3D>
              <Link to="/mark-attendance" className="block h-full">
                <GlassCard className="p-6 h-full">
                  <div className="flex flex-col items-center text-center h-full">
                    <AttendanceIcon />
                    <h2 className="text-xl font-bold text-white mb-2">Mark Attendance</h2>
                    <p className="text-gray-300 flex-grow">Record student attendance for your courses and events</p>
                    <motion.span 
                      className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg relative overflow-hidden group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="relative z-10">Start Now</span>
                    </motion.span>
                  </div>
                </GlassCard>
              </Link>
            </Card3D>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card3D>
              <Link to="/attendance-records" className="block h-full">
                <GlassCard className="p-6 h-full">
                  <div className="flex flex-col items-center text-center h-full">
                    <DashboardIcon />
                    <h2 className="text-xl font-bold text-white mb-2">View Records</h2>
                    <p className="text-gray-300 flex-grow">Access and analyze attendance records for your subjects</p>
                    <motion.span 
                      className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg relative overflow-hidden group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="relative z-10">View Now</span>
                    </motion.span>
                  </div>
                </GlassCard>
              </Link>
            </Card3D>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card3D>
              <Link to="/faculty-subjects" className="block h-full">
                <GlassCard className="p-6 h-full">
                  <div className="flex flex-col items-center text-center h-full">
                    <SubjectsIcon />
                    <h2 className="text-xl font-bold text-white mb-2">Manage Subjects</h2>
                    <p className="text-gray-300 flex-grow">Create and manage your courses and events</p>
                    <motion.span 
                      className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg relative overflow-hidden group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="relative z-10">Manage</span>
                    </motion.span>
                  </div>
                </GlassCard>
              </Link>
            </Card3D>
          </motion.div>
          </div>
          
          {/* Quick Actions Section */}
          <motion.div 
            variants={itemVariants}
            className="w-full max-w-7xl rounded-xl p-8 text-white mb-10 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-90"></div>
            <div className="absolute inset-0 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/mark-attendance" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center transition-all duration-300">
                    <AttendanceIcon />
                    <span className="font-medium">Mark Attendance</span>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/attendance-records" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center transition-all duration-300">
                    <DashboardIcon />
                    <span className="font-medium">View Records</span>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/feedback-list" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center transition-all duration-300">
                    <FeedbackIcon />
                    <span className="font-medium">View Feedback</span>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/faculty-subjects" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center transition-all duration-300">
                    <SubjectsIcon />
                    <span className="font-medium">Manage Subjects</span>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Additional Information Section */}
          <motion.div variants={itemVariants} className="w-full max-w-7xl mb-10">
            <GlassCard className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Faculty Resources</h2>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div 
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    className="bg-white/20 backdrop-blur-sm p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-white mb-3">Quick Tips</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-200">
                      <li>Use the <span className="text-teal-300 font-medium">Mark Attendance</span> feature to record student attendance for your courses and events.</li>
                      <li>View detailed attendance statistics in the <span className="text-teal-300 font-medium">Attendance Records</span> section.</li>
                      <li>Create and manage your subjects from the <span className="text-teal-300 font-medium">Manage Subjects</span> page.</li>
                      <li>Check student feedback in the <span className="text-teal-300 font-medium">View Feedback</span> section.</li>
                    </ul>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    className="bg-white/20 backdrop-blur-sm p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-white mb-3">Recent Updates</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-300 text-sm">May 14, 2025</p>
                        <p className="text-gray-100">Added subject code field to improve organization</p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-sm">May 10, 2025</p>
                        <p className="text-gray-100">Updated UI for better user experience</p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-sm">May 5, 2025</p>
                        <p className="text-gray-100">Added new attendance tracking features</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default FacultyDashboard;

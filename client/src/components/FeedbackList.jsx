import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { motion, AnimatePresence } from 'framer-motion';

const FeedbackApp = () => {
  const [feedback, setFeedback] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
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
  
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5
      }
    },
    hover: {
      y: -5,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 300
      }
    }
  };

  const fetchFeedback = async () => {
    setFetching(true);
    setError(null);
    try {
      const response = await axios.get('/feedback/all');
      setFeedback(response.data);
    } catch (err) {
      setError('Failed to fetch feedback. Please try again later.');
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await axios.delete(`/feedback/${id}`);
        setFeedback(feedback.filter((item) => item._id !== id));
      } catch (err) {
        setError('Failed to delete feedback. Please try again later.');
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  // Filter feedback based on search term
  const filteredFeedback = feedback.filter(item => {
    const studentName = item.student?.name?.toLowerCase() || '';
    const message = item.message?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    return studentName.includes(searchLower) || message.includes(searchLower);
  });

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-sky-200 via-cyan-100 to-white px-4 pt-28 pb-12"
    >
      <motion.div variants={itemVariants} className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6 tracking-tight flex flex-col sm:flex-row items-center justify-center">
          <motion.span
            className="inline-block text-white bg-gradient-to-r from-teal-500 to-cyan-500 p-2 rounded-lg shadow-lg mr-3 mb-4 sm:mb-0"
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </motion.span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">Attendance Issue Reports</span>
        </h1>
        
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          View and manage all student-reported attendance issues. These reports help identify and resolve discrepancies in attendance records.  
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by student name or message content..."
            className="pl-10 pr-4 py-2 w-full border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 max-w-3xl mx-auto rounded-r-lg shadow-md"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {fetching ? (
          <motion.div 
            key="loading" 
            variants={itemVariants}
            className="flex flex-col items-center justify-center space-y-4 py-12"
          >
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1] 
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
              }}
              className="h-16 w-16 border-4 border-teal-500 border-t-transparent rounded-full"
            />
            <p className="text-gray-600 font-medium">Loading attendance issues...</p>
          </motion.div>
        ) : feedback.length === 0 ? (
          <motion.div 
            key="empty" 
            variants={cardVariants} 
            className="max-w-2xl mx-auto bg-white bg-opacity-90 rounded-xl shadow-lg p-8 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-50 rounded-full mb-4">
              <svg className="h-8 w-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Attendance Issues</h2>
            <p className="text-gray-600">There are currently no attendance issues reported by students.</p>
          </motion.div>
        ) : (
          <motion.div
            key="table"
            variants={cardVariants}
            className="max-w-6xl mx-auto bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-teal-50"
          >
            <div className="p-6 bg-gradient-to-r from-teal-500 to-cyan-600 flex justify-between items-center">
              <h2 className="text-white font-semibold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                {filteredFeedback.length} Reported Issue{filteredFeedback.length !== 1 ? 's' : ''}
              </h2>
              {searchTerm && (
                <div className="text-xs text-white bg-white bg-opacity-20 px-3 py-1 rounded-full">
                  Filtered results for "{searchTerm}"
                </div>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-teal-700 uppercase tracking-wider border-b border-gray-200">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-teal-700 uppercase tracking-wider border-b border-gray-200">Branch</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-teal-700 uppercase tracking-wider border-b border-gray-200">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-teal-700 uppercase tracking-wider border-b border-gray-200">Date</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-teal-700 uppercase tracking-wider border-b border-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {filteredFeedback.map((item) => (
                      <motion.tr 
                        key={item._id} 
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, x: -100 }}
                        whileHover={{ backgroundColor: "rgba(240, 253, 250, 0.6)" }}
                        transition={{ duration: 0.2 }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 text-white flex items-center justify-center font-bold mr-3">
                              {(item.student?.name || 'U')[0]}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.student?.name || 'Unknown'}</div>
                              <div className="text-xs text-gray-500">{item.student?.enrollmentNumber || '-'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-teal-600">
                            {item.student?.branch || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 max-w-xs md:max-w-sm whitespace-normal">{item.message}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">{new Date(item.date).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">{new Date(item.date).toLocaleTimeString()}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: '#FEE2E2' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(item._id)}
                            className="inline-flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-1.5 rounded-md transition-colors duration-200"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            
            {filteredFeedback.length === 0 && searchTerm && (
              <div className="py-8 px-6 text-center">
                <p className="text-gray-600">No issues found matching "{searchTerm}"</p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-teal-600 hover:text-teal-800 font-medium"
                >
                  Clear search
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FeedbackApp;

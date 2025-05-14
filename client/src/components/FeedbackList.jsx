import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import {
  FadeIn,
  SlideInUp,
  Card3D,
  GlassCard,
  GradientBackground,
  MorphingBlob
} from './AnimationUtils';

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
    <>
      <Navbar />
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-background overflow-hidden py-12 px-4 relative"
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
      <motion.div variants={itemVariants} className="max-w-6xl mx-auto mb-8 relative z-10">
        <h1 className="text-4xl font-extrabold text-center mb-6 tracking-tight flex flex-col sm:flex-row items-center justify-center">
          <motion.span
            className="inline-block text-white bg-gradient-to-r from-teal-500 to-cyan-500 p-2 rounded-lg shadow-lg mr-3 mb-4 sm:mb-0"
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </motion.span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">Attendance Issue Reports</span>
        </h1>
        
        <p className="text-center text-gray-300 mb-8 max-w-2xl mx-auto">
          View and manage all student-reported attendance issues. These reports help identify and resolve discrepancies in attendance records.  
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-teal-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by student name or issue..."
            className="block w-full pl-10 pr-4 py-2 border border-gray-300/30 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-150 bg-white/10 backdrop-blur-sm text-white placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {fetching ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center py-12"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </motion.div>
        ) : error ? (
          <motion.div 
            variants={itemVariants}
            className="bg-red-500/20 backdrop-blur-sm border border-red-300/30 text-red-300 px-4 py-3 rounded-lg max-w-3xl mx-auto"
          >
            <p>{error}</p>
            <button 
              onClick={fetchFeedback}
              className="mt-2 text-sm font-medium text-red-300 hover:text-red-200 underline"
            >
              Try again
            </button>
          </motion.div>
        ) : feedback.length === 0 ? (
          <motion.div 
            key="empty" 
            variants={cardVariants} 
            className="max-w-2xl mx-auto bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-teal-50"
          >
            <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 flex justify-between items-center rounded-t-lg">
              <h2 className="text-white text-lg font-semibold">No Reported Issues</h2>
              <div className="text-white text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
                No issues found
              </div>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-300">There are currently no attendance issues reported by students.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="table"
            variants={cardVariants}
            className="max-w-6xl mx-auto bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-teal-50"
          >
            <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 flex justify-between items-center rounded-t-lg">
              <h2 className="text-white text-lg font-semibold">All Reported Issues</h2>
              <div className="text-white text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
                {filteredFeedback.length} {filteredFeedback.length === 1 ? 'issue' : 'issues'} found
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200/20">
                <thead className="bg-teal-600/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-white/20">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-white/20">Issue</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-white/20">Date</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-b border-white/20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/20">
                  <AnimatePresence>
                    {filteredFeedback.map((item) => (
                      <motion.tr 
                        key={item._id} 
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, x: -100 }}
                        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                        transition={{ duration: 0.2 }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 text-white flex items-center justify-center font-bold mr-3">
                              {(item.student?.name || 'U')[0]}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{item.student?.name || 'Unknown'}</div>
                              <div className="text-xs text-gray-400">{item.student?.enrollmentNumber || '-'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300 max-w-xs md:max-w-sm whitespace-normal">{item.message}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300">{new Date(item.date).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-400">{new Date(item.date).toLocaleTimeString()}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.3)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(item._id)}
                            className="inline-flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium px-3 py-1.5 rounded-md transition-colors duration-200"
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
                <p className="text-gray-300">No issues found matching "{searchTerm}"</p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-teal-400 hover:text-teal-300 font-medium"
                >
                  Clear search
                </button>
              </div>
            )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </>
  );
};

export default FeedbackApp;

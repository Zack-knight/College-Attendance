import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
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
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [studentDetails, setStudentDetails] = useState(null);

  // Enhanced Animation Variants
  const pageTransition = {
    hidden: { 
      opacity: 0,
      y: 50,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        mass: 1,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    },
    exit: {
      opacity: 0,
      y: -50,
      transition: {
        duration: 0.3
      }
    }
  };

  const formAnimation = {
    hidden: { 
      opacity: 0,
      x: -100,
      rotateZ: -2
    },
    visible: {
      opacity: 1,
      x: 0,
      rotateZ: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const listAnimation = {
    hidden: { 
      opacity: 0,
      x: 100,
      rotateZ: 2
    },
    visible: {
      opacity: 1,
      x: 0,
      rotateZ: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemAnimation = {
    hidden: { 
      opacity: 0,
      y: 20,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.98
    }
  };

  const buttonAnimation = {
    rest: {
      scale: 1,
      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)"
    },
    hover: {
      scale: 1.05,
      boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.95,
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)"
    }
  };

  const messageAnimation = {
    initial: { 
      opacity: 0,
      y: -20,
      scale: 0.8
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  // Get user role from localStorage
  const userRole = localStorage.getItem('role');
  const isAdmin = userRole === 'admin';

  // Fetch student details on mount if student
  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const decoded = jwtDecode(token);
        if (decoded.role === 'student') {
          const res = await axios.get('/user/me');
          setStudentDetails(res.data);
        }
      } catch {
        // ignore
      }
    };
    fetchStudentDetails();
  }, []);

  const fetchFeedback = async () => {
    if (!isAdmin) return; // Only fetch feedback if user is admin
    setFetching(true);
    setError(null);
    try {
      const response = await axios.get('/feedback/all');
      setFeedback(response.data);
    } catch (error) {
      setError('Failed to fetch feedback. Please try again later.');
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Message is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await axios.post('/feedback/submit', {
        message: message.trim(),
      });
      setMessage('');
      setSuccessMessage('Feedback submitted successfully!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setError('Failed to submit feedback. Please try again later.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await axios.delete(`/feedback/${id}`);
        setFeedback(feedback.filter((item) => item._id !== id));
      } catch (error) {
        setError('Failed to delete feedback. Please try again later.');
        console.error(error);
      }
    }
  };

  return (
    <>
      <Navbar />
      <motion.div 
        className="min-h-screen bg-background overflow-hidden py-12 px-4 relative"
        initial="hidden"
        animate="visible"
        variants={pageTransition}
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
        <motion.h1 
          className="text-4xl md:text-5xl font-extrabold text-center mb-2 tracking-tight"
          variants={itemAnimation}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">Student Feedback</span>
        </motion.h1>
        <motion.p 
          className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto text-center"
          variants={itemAnimation}
        >
          {isAdmin ? 'View and manage student feedback' : 'Share your thoughts, issues, or suggestions'}
        </motion.p>
        {/* Student Details */}
        {studentDetails && (
          <motion.div 
            className="bg-white/10 backdrop-blur-sm shadow-md rounded-lg overflow-hidden"
            variants={itemAnimation}
          >
            <table className="min-w-full divide-y divide-gray-200/20">
              <tbody className="divide-y divide-gray-200/20">
                <tr>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 text-white flex items-center justify-center font-bold mr-3">
                        {(studentDetails.name || 'U')[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{studentDetails.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-400">{studentDetails.enrollmentNumber || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300 max-w-md whitespace-normal">{studentDetails.semester}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        )}
        {/* Feedback Form */}
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          variants={itemAnimation}
        >
          <motion.h2 
            className="text-2xl font-bold text-white mb-6"
            variants={itemAnimation}
          >
            Submit Your Feedback
          </motion.h2>
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error-message"
                variants={messageAnimation}
                initial="initial"
                animate="animate"
                exit="exit"
                className="mt-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-300/30 rounded-lg text-red-300 flex items-center"
              >
                <motion.p
                  animate={{
                    x: [-4, 4, -2, 2, 0],
                    transition: { duration: 0.5 }
                  }}
                  className="text-red-500 mb-4 bg-red-50 p-3 rounded-lg border border-red-200"
                >
                  {error}
                </motion.p>
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                key="success-message"
                variants={messageAnimation}
                initial="initial"
                animate="animate"
                exit="exit"
                className="mt-6 p-4 bg-green-500/20 backdrop-blur-sm border border-green-300/30 rounded-lg text-green-300 flex items-center"
              >
                <motion.p
                  animate={{
                    scale: [1, 1.05, 1],
                    transition: { duration: 0.3 }
                  }}
                  className="text-green-500 mb-4 bg-green-50 p-3 rounded-lg border border-green-200"
                >
                  {successMessage}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div variants={itemAnimation}>
            <label htmlFor="message" className="block text-sm font-medium text-white mb-1">Your Message</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none bg-white/10 backdrop-blur-sm text-white placeholder-gray-400"
              placeholder="Describe your issue or suggestion in detail..."
              required
            ></textarea>
          </motion.div>
          <p className="mt-2 text-sm text-gray-500">Be specific about the date, subject, and nature of the issue.</p>
          <motion.div className="flex justify-end" variants={itemAnimation}>
            <motion.button
              type="submit"
              disabled={loading}
              variants={buttonAnimation}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold relative overflow-hidden group"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="relative z-10">{loading ? 'Submitting...' : 'Submit Feedback'}</span>
            </motion.button>
          </motion.div>
        </motion.form>
        {/* Feedback List - Only shown to admin users */}
        <AnimatePresence>
          {isAdmin && (
            <motion.div
              key="feedback-list"
              variants={listAnimation}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-lg mb-12"
            >
              <GlassCard className="p-8">
                <motion.h2 
                  className="text-2xl font-bold text-white mb-4 flex items-center"
                  variants={itemAnimation}
                >
                  <motion.span
                    className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400"
                  >
                    All Attendance Issues
                  </motion.span>
                </motion.h2>
                {fetching ? (
                  <motion.div 
                    className="flex justify-center items-center h-64"
                    variants={itemAnimation}
                  >
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                  </motion.div>
                ) : feedback.length === 0 ? (
                  <motion.div 
                    className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-gray-300 text-center"
                    variants={itemAnimation}
                  >
                    No feedback entries found.
                  </motion.div>
                ) : (
                  <motion.div
                    variants={itemAnimation}
                    className="overflow-hidden backdrop-blur-md rounded-2xl shadow-xl border border-teal-100"
                    whileHover={{
                      boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-4 flex justify-between items-center">
                      <h3 className="text-white font-semibold flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        {feedback.length} Reported Issue{feedback.length !== 1 ? 's' : ''}
                      </h3>
                      <div className="text-xs text-white bg-white bg-opacity-20 px-3 py-1 rounded-full">
                        Last updated: {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                    <table className="min-w-full bg-white bg-opacity-95 table-auto">
                      <thead className="bg-teal-600/30">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-white/20">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-white/20">
                            Issue Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-white/20">
                            Date Reported
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-b border-white/20">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100/20">
                        <AnimatePresence>
                          {feedback.map((item, index) => (
                            <motion.tr
                              key={item._id}
                              variants={itemAnimation}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              custom={index}
                              whileHover={{
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                                transition: { duration: 0.2 }
                              }}
                              className="relative overflow-hidden"
                className="overflow-hidden backdrop-blur-md rounded-2xl shadow-xl border border-teal-100"
                whileHover={{
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
              >
                <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-4 flex justify-between items-center">
                  <h3 className="text-white font-semibold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    {feedback.length} Reported Issue{feedback.length !== 1 ? 's' : ''}
                  </h3>
                  <div className="text-xs text-white bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
                <table className="min-w-full bg-white bg-opacity-95 table-auto">
                  <thead className="bg-teal-600/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-white/20">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-white/20">
                        Issue Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-white/20">
                        Date Reported
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-b border-white/20">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/20">
                    <AnimatePresence>
                      {feedback.map((item, index) => (
                        <motion.tr
                          key={item._id}
                          variants={itemAnimation}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          custom={index}
                          whileHover={{
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            transition: { duration: 0.2 }
                          }}
                          className="relative overflow-hidden"
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
                            <div className="text-sm text-gray-300 max-w-md whitespace-normal">{item.message}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-300">{new Date(item.date).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-400">{new Date(item.date).toLocaleTimeString()}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <motion.button
                              variants={buttonAnimation}
                              initial="rest"
                              whileHover="hover"
                              whileTap="tap"
                              onClick={() => handleDelete(item._id)}
                              className="inline-flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium px-3 py-1.5 rounded-md transition-colors duration-200"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>Delete</span>
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </motion.div>
            )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.div>
    </>
  );
};

export default FeedbackApp;

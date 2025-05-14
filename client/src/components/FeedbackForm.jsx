import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';

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
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageTransition}
      className="min-h-screen bg-gradient-to-br from-sky-200 via-cyan-100 to-white px-4 pt-28 pb-16 flex flex-col items-center"
    >
      <motion.h1 
        variants={itemAnimation}
        whileHover="hover"
        className="text-4xl font-extrabold text-center text-gray-800 mb-10"
      >
        <motion.span
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
            times: [0, 0.5, 0.8, 1],
            repeat: Infinity,
            repeatDelay: 3
          }}
          className="inline-block"
        >
          📢
        </motion.span>
        {" "}
        <motion.span
          initial={{ backgroundPosition: "0 0" }}
          animate={{ backgroundPosition: "200% 0" }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-pink-500 to-teal-600 bg-[length:200%_100%]"
        >
          Attendance Issue Note
        </motion.span>
      </motion.h1>

      {/* Student Details */}
      {studentDetails && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 w-full max-w-2xl bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-teal-100 relative overflow-hidden"
        >
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-cyan-50 to-teal-50 opacity-50"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <h3 className="text-lg font-semibold text-teal-700 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Student Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-teal-50 p-3 rounded-lg">
              <p className="text-xs text-teal-600 uppercase font-semibold">Name</p>
              <p className="text-gray-800 font-medium">{studentDetails.name}</p>
            </div>
            <div className="bg-cyan-50 p-3 rounded-lg">
              <p className="text-xs text-cyan-600 uppercase font-semibold">Enrollment No.</p>
              <p className="text-gray-800 font-medium">{studentDetails.enrollmentNumber}</p>
            </div>
            <div className="bg-teal-50 p-3 rounded-lg">
              <p className="text-xs text-teal-600 uppercase font-semibold">Semester</p>
              <p className="text-gray-800 font-medium">{studentDetails.semester}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Feedback Form */}
      <motion.form
        variants={formAnimation}
        onSubmit={handleSubmit}
        className="bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-3xl shadow-xl w-full max-w-2xl mb-12 relative overflow-hidden"
        whileHover={{
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          translateY: -5
        }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-teal-100 to-pink-100 opacity-50"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.h2 
          variants={itemAnimation}
          className="text-2xl font-semibold text-gray-800 mb-4 relative"
        >
          Submit Your Attendance Issue
        </motion.h2>
        
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              variants={messageAnimation}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative"
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
              variants={messageAnimation}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative"
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

        <motion.div variants={itemAnimation} className="mb-6 relative">
          <label htmlFor="message" className="block mb-2 font-medium text-gray-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
            </svg>
            Describe Your Attendance Issue
          </label>
          <div className="relative rounded-xl overflow-hidden group">
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ height: 'calc(100% - 2px)', width: 'calc(100% - 2px)', top: '1px', left: '1px', borderRadius: 'calc(0.5rem - 2px)' }}
            />
            <motion.textarea
              whileFocus={{
                scale: 1.01,
                boxShadow: "0 0 20px rgba(45, 212, 191, 0.3)"
              }}
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:border-teal-400 text-gray-800 bg-white transition-all duration-200 relative z-10"
              placeholder="Please provide details about the attendance issue you're facing..."
              rows={5}
              required
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">Be specific about the date, subject, and nature of the issue.</p>
        </motion.div>

        <motion.div className="flex justify-between items-center">
          <motion.button
            variants={buttonAnimation}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            type="submit"
            disabled={loading}
            className={`relative bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex items-center justify-center">
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Submit Issue</span>
                </>
              )}
            </div>
            {!loading && (
              <motion.div
                className="absolute inset-0 bg-white rounded-xl"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{
                  scale: 1.05,
                  opacity: 0.2,
                  transition: { duration: 0.3 }
                }}
              />
            )}
          </motion.button>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500 italic"
          >
            Your issue will be reviewed by faculty
          </motion.p>
        </motion.div>
      </motion.form>

      {/* Feedback List - Only shown to admin users */}
      <AnimatePresence mode="wait">
        {isAdmin && (
          <motion.div
            variants={listAnimation}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="w-full max-w-5xl"
          >
            <motion.h2 
              variants={itemAnimation}
              className="text-2xl font-semibold text-gray-800 mb-4 flex items-center"
            >
              <motion.span
                className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-2 rounded-lg mr-3 shadow-md flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </motion.span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600">
                All Attendance Issues
              </span>
            </motion.h2>
            
            {fetching ? (
              <motion.div 
                className="flex justify-center items-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    rotate: {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear"
                    },
                    scale: {
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                  className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full"
                />
              </motion.div>
            ) : feedback.length === 0 ? (
              <motion.div 
                variants={itemAnimation}
                className="text-center py-12 px-6 bg-gradient-to-br from-white to-teal-50 rounded-xl shadow-md flex flex-col items-center"
              >
                <div className="bg-teal-100 p-4 rounded-full mb-4 text-teal-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-teal-700 mb-2">No Issues Reported</h3>
                <p className="text-gray-600 max-w-md">
                  There are currently no attendance issues reported by students. When students submit issues, they will appear here for review.
                </p>
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
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-teal-700 uppercase tracking-wider border-b border-gray-200">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-teal-700 uppercase tracking-wider border-b border-gray-200">
                        Issue Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-teal-700 uppercase tracking-wider border-b border-gray-200">
                        Date Reported
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-teal-700 uppercase tracking-wider border-b border-gray-200">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
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
                            backgroundColor: "rgba(240, 253, 250, 0.6)",
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
                                <div className="text-sm font-medium text-gray-900">{item.student?.name || 'Unknown'}</div>
                                <div className="text-xs text-gray-500">{item.student?.enrollmentNumber || '-'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700 max-w-md whitespace-normal">{item.message}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700">{new Date(item.date).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">{new Date(item.date).toLocaleTimeString()}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <motion.button
                              variants={buttonAnimation}
                              initial="rest"
                              whileHover="hover"
                              whileTap="tap"
                              onClick={() => handleDelete(item._id)}
                              className="inline-flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-1.5 rounded-md transition-colors duration-200"
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FeedbackApp;

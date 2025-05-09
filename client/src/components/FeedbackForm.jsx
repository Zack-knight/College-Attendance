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
        <div className="mb-8 w-full max-w-2xl bg-white bg-opacity-95 rounded-xl shadow p-6 flex flex-col gap-2">
          <div className="flex flex-wrap gap-6">
            <div><span className="font-bold text-black">Name:</span> <span className="text-black">{studentDetails.name}</span></div>
            <div><span className="font-bold text-black">Enrollment No.:</span> <span className="text-black">{studentDetails.enrollmentNumber}</span></div>
            <div><span className="font-bold text-black">Semester:</span> <span className="text-black">{studentDetails.semester}</span></div>
          </div>
        </div>
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
          <label htmlFor="message" className="block mb-1 font-medium text-gray-700">
            Message
          </label>
          <motion.textarea
            whileFocus={{
              scale: 1.01,
              boxShadow: "0 0 0 2px rgba(45, 212, 191, 0.2)"
            }}
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 text-black transition-all duration-200"
            placeholder="Write your feedback here..."
            rows={4}
            required
          />
        </motion.div>

        <motion.button
          variants={buttonAnimation}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
          type="submit"
          disabled={loading}
          className={`relative bg-gradient-to-r from-teal-500 to-teal-400 text-white font-semibold px-8 py-3 rounded-full shadow-md transition-all ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <motion.span
            animate={loading ? {
              opacity: [1, 0.5, 1],
              transition: { duration: 1, repeat: Infinity }
            } : {}}
          >
            {loading ? 'Submitting...' : 'Submit '}
          </motion.span>
          {!loading && (
            <motion.div
              className="absolute inset-0 bg-white rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{
                scale: 1.5,
                opacity: 0.2,
                transition: { duration: 0.3 }
              }}
            />
          )}
        </motion.button>
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
              className="text-2xl font-semibold text-gray-800 mb-4"
            >
              All Attendance Issue Note
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
              <motion.p 
                variants={itemAnimation}
                className="text-center text-gray-600 py-8"
              >
                No issue available
              </motion.p>
            ) : (
              <motion.div
                variants={itemAnimation}
                className="overflow-hidden bg-white bg-opacity-90 backdrop-blur-md rounded-2xl shadow-xl"
                whileHover={{
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
              >
                <table className="min-w-full table-auto">
                  <thead className="bg-gradient-to-r from-teal-500 to-pink-500 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Student Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Message</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
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
                            backgroundColor: "rgba(243, 244, 246, 0.8)",
                            transition: { duration: 0.2 }
                          }}
                          className="relative overflow-hidden"
                        >
                          <td className="px-6 py-4 text-sm text-gray-700">{item.student?.name || 'Unknown'}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{item.message}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {new Date(item.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <motion.button
                              variants={buttonAnimation}
                              initial="rest"
                              whileHover="hover"
                              whileTap="tap"
                              onClick={() => handleDelete(item._id)}
                              className="relative text-red-600 hover:text-red-800 font-medium px-4 py-1 rounded-full overflow-hidden"
                            >
                              <span className="relative z-10">Delete</span>
                              <motion.div
                                className="absolute inset-0 bg-red-100 rounded-full"
                                initial={{ scale: 0 }}
                                whileHover={{
                                  scale: 1,
                                  transition: { duration: 0.2 }
                                }}
                              />
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

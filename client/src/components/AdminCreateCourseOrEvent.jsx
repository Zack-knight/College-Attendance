import { useState } from 'react';
import axios from '../utils/axios';
import { motion } from 'framer-motion';

const AdminCreateCourseOrEvent = () => {
  const [type, setType] = useState('course');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [attendanceTracking, setAttendanceTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 24,
        staggerChildren: 0.1
      }
    }
  };
  
  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 24
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validate name
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    
    // Validate name format
    if (!/^[A-Za-z ]{2,50}$/.test(name)) {
      setError('Subject name must be 2-50 characters long and contain only letters and spaces');
      return;
    }
    
    // Validate code is present
    if (!code.trim()) {
      setError('Subject code is required.');
      return;
    }
    
    // Validate code format (6-12 digits)
    if (!/^\d{6,12}$/.test(code)) {
      setError('Subject code must be between 6-12 digits (numbers only)');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post('/subject', {
        name: name.trim(),
        code: code.trim(),
        type,
        attendanceTracking: type === 'event' ? attendanceTracking : undefined,
      });
      setSuccess(`${type === 'course' ? 'Course' : 'Event'} created successfully!`);
      setName('');
      setCode('');
      setAttendanceTracking(false);
    } catch (err) {
      // Handle detailed error messages from server
      console.error('Error creating subject:', err);
      const errorMessage = err.response?.data?.error || 'Failed to create subject';
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={formVariants}
      className="w-full"
    >
      <motion.form 
        onSubmit={handleSubmit} 
        className="flex flex-col gap-4"
        variants={formVariants}
      >
        <motion.div 
          className="flex gap-4 items-center"
          variants={inputVariants}
        >
          <label className="font-medium text-white">Type:</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="px-4 py-2 border border-gray-300/30 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-150 bg-white/10 backdrop-blur-sm text-white placeholder-gray-400"
          >
            <option value="course">Course</option>
            <option value="event">Event</option>
          </select>
        </motion.div>
        
        <motion.div 
          className="flex flex-col gap-1"
          variants={inputVariants}
        >
          <label className="text-sm font-medium text-white">Name <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={`Enter ${type} name`}
            className="px-4 py-2 border border-gray-300/30 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-150 bg-white/10 backdrop-blur-sm text-white placeholder-gray-400"
            disabled={loading}
          />
          <p className="text-xs text-gray-300">Must contain only letters and spaces, 2-50 characters</p>
        </motion.div>
        
        <motion.div 
          className="flex flex-col gap-1"
          variants={inputVariants}
        >
          <label className="text-sm font-medium text-white">Code <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder={`Enter ${type} code (numbers only)`}
            className="px-4 py-2 border border-gray-300/30 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-150 bg-white/10 backdrop-blur-sm text-white placeholder-gray-400"
            disabled={loading}
          />
          <p className="text-xs text-gray-300">Must be between 6-12 digits (numbers only)</p>
        </motion.div>
        
        {type === 'event' && (
          <motion.div 
            className="flex items-center gap-2"
            variants={inputVariants}
          >
            <input
              type="checkbox"
              id="attendanceTracking"
              checked={attendanceTracking}
              onChange={e => setAttendanceTracking(e.target.checked)}
              className="h-4 w-4 text-teal-500 border-gray-300/30 rounded focus:ring-teal-500 bg-white/10"
            />
            <label htmlFor="attendanceTracking" className="text-white">Attendance Tracking</label>
          </motion.div>
        )}
        
        <motion.button
          type="submit"
          className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold relative overflow-hidden group mt-2"
          disabled={loading}
          variants={inputVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          <span className="relative z-10">
            {loading ? 'Processing...' : `Create ${type.charAt(0).toUpperCase() + type.slice(1)}`}
          </span>
        </motion.button>
      </motion.form>
      
      {error && (
        <motion.div 
          className="bg-red-500/20 backdrop-blur-sm border border-red-300/30 text-red-300 p-4 rounded-lg mt-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </motion.div>
      )}
      
      {success && (
        <motion.div 
          className="bg-green-500/20 backdrop-blur-sm border border-green-300/30 text-green-300 p-4 rounded-lg mt-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">{success}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminCreateCourseOrEvent;

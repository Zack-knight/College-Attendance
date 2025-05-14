import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import {
  FadeIn,
  SlideInUp,
  Card3D,
  GlassCard,
  GradientBackground,
  MorphingBlob
} from './AnimationUtils';

const MarkAttendance = () => {
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
  
  const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: i => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }
    })
  };

  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Get user role from JWT
  let role = null;
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded.role;
    } catch {
      role = null;
    }
  }

  // Date helpers
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Fetch subjects and students on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [subjectsRes, studentsRes] = await Promise.all([
          axios.get('/subject'),
          axios.get('/user/students'),
        ]);
        setSubjects(subjectsRes.data);
        setStudents(studentsRes.data);
        
        // If we have subjects, preselect the first one
        if (subjectsRes.data && subjectsRes.data.length > 0) {
          // Find first valid subject for the current role
          const validSubject = role === 'admin' ?
            subjectsRes.data.find(s => s.type === 'course' || (s.type === 'event' && s.attendanceTracking)) :
            subjectsRes.data.find(s => s.type !== 'event');
            
          if (validSubject) {
            setSelectedSubject(validSubject._id);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.error || 'Failed to fetch subjects or students.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [role]);

  // Handle attendance change
  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!selectedSubject) {
      setError('Please select a subject.');
      return;
    }
    if (!date) {
      setError('Please select a date.');
      return;
    }
    if (students.length === 0) {
      setError('No students to mark attendance for.');
      return;
    }
    // Faculty: Only allow today and weekdays
    if (role === 'teacher') {
      if (date !== todayStr) {
        setError('Faculty can only mark attendance for today.');
        return;
      }
      if (isWeekend) {
        setError('Faculty cannot mark attendance on weekends.');
        return;
      }
    }
    const records = students.map((student) => ({
      student: student._id,
      status: attendance[student._id] || 'absent',
    }));
    setLoading(true);
    try {
      await axios.post('/attendance/mark', {
        subject: selectedSubject,
        date,
        records,
      });
      setSuccess('Attendance marked successfully!');
    } catch {
      setError('Failed to mark attendance.');
    } finally {
      setLoading(false);
    }
  };

  // Faculty: disable form on weekends
  const disableFacultyForm = role === 'teacher' && isWeekend;

  // Filter subjects for dropdown
  let filteredSubjects = [];
  if (role === 'admin') {
    // Admin: show all courses and events with attendanceTracking=true
    filteredSubjects = subjects.filter(
      (s) =>
        (s.type === 'course') ||
        (s.type === 'event' && s.attendanceTracking)
    );
  } else {
    // Faculty: show their own courses AND events with attendanceTracking=true
    filteredSubjects = subjects.filter(
      (s) => 
        (s.type === 'course') ||
        (s.type === 'event' && s.attendanceTracking)
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background overflow-hidden py-12 px-4 relative">
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
          className="relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-3xl font-bold text-center text-white mb-8"
            variants={itemVariants}
          >
            Mark Attendance
          </motion.h1>
          
          {subjects.length === 0 ? (
            <motion.div variants={itemVariants} className="max-w-xl mx-auto">
              <GlassCard className="p-8 text-center">
                <motion.p 
                  className="text-lg text-white mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  You need to create a subject before you can mark attendance.
                </motion.p>
                <p className="text-gray-300">Go to your dashboard and create a subject first.</p>
              </GlassCard>
            </motion.div>
          ) : disableFacultyForm ? (
            <motion.div variants={itemVariants} className="max-w-xl mx-auto">
              <GlassCard className="p-8 text-center">
                <motion.p 
                  className="text-xl text-red-400 mb-4"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ yoyo: Infinity, duration: 2 }}
                >
                  Faculty cannot mark attendance on weekends.
                </motion.p>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.form 
              onSubmit={handleSubmit} 
              variants={itemVariants}
              className="max-w-3xl mx-auto"
            >
              <GlassCard className="p-8">
                <motion.div className="mb-6" variants={itemVariants}>
                  <label className="block mb-2 font-semibold text-white">Select Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800 bg-white backdrop-blur-sm"
                    required
                  >
                    <option value="" className="text-gray-800 bg-white">-- Select --</option>
                    {filteredSubjects.map((subject) => (
                      <option
                        key={subject._id}
                        value={subject._id}
                        className="text-gray-800 bg-white"
                      >
                        {subject.type === 'event'
                          ? `Event: ${subject.name}`
                          : `Course: ${subject.name}`}
                      </option>
                    ))}
                  </select>
                </motion.div>
                
                <motion.div className="mb-6" variants={itemVariants}>
                  <label className="block mb-2 font-semibold text-white">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800 bg-white backdrop-blur-sm"
                    required
                    min={role === 'teacher' ? todayStr : undefined}
                    max={role === 'teacher' ? todayStr : undefined}
                    disabled={role === 'teacher'}
                  />
                  {role === 'teacher' && (
                    <p className="text-sm text-gray-300 mt-1">Faculty can only mark attendance for today (weekdays only).</p>
                  )}
                </motion.div>
                
                <motion.div className="mb-6" variants={itemVariants}>
                  <label className="block mb-2 font-semibold text-white">Students</label>
                  {students.length === 0 ? (
                    <p className="text-gray-300">No students found.</p>
                  ) : (
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden">
                      <table className="min-w-full table-auto text-left">
                        <thead>
                          <tr className="bg-teal-600/30 border-b border-white/20">
                            <th className="py-3 px-4 text-white font-semibold">Name</th>
                            <th className="py-3 px-4 text-white font-semibold">Enrollment No.</th>
                            <th className="py-3 px-4 text-white font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((student, i) => (
                            <motion.tr 
                              key={student._id}
                              custom={i}
                              variants={tableRowVariants}
                              className="border-b border-white/10 hover:bg-white/5 transition-colors"
                            >
                              <td className="py-3 px-4 text-gray-200">{student.name}</td>
                              <td className="py-3 px-4 text-gray-200">{student.enrollmentNumber}</td>
                              <td className="py-3 px-4">
                                <select
                                  value={attendance[student._id] || 'absent'}
                                  onChange={(e) => handleAttendanceChange(student._id, e.target.value)}
                                  className="px-3 py-1 border border-gray-300 rounded text-gray-800 bg-white backdrop-blur-sm"
                                >
                                  <option value="present" className="text-gray-800 bg-white">Present</option>
                                  <option value="absent" className="text-gray-800 bg-white">Absent</option>
                                </select>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
                
                <motion.button
                  type="submit"
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-3 rounded-lg font-semibold relative overflow-hidden group"
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  variants={itemVariants}
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative z-10">{loading ? 'Submitting...' : 'Submit Attendance'}</span>
                </motion.button>
                
                {error && (
                  <motion.p 
                    className="text-red-400 mt-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {error}
                  </motion.p>
                )}
                
                {success && (
                  <motion.p 
                    className="text-green-400 mt-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {success}
                  </motion.p>
                )}
              </GlassCard>
            </motion.form>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default MarkAttendance;

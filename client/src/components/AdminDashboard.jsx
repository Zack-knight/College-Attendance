import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import AdminCreateCourseOrEvent from './AdminCreateCourseOrEvent';
import { motion } from 'framer-motion';
import {
  FadeIn,
  SlideInUp,
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

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const SubjectsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const AttendanceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const FeedbackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    },
    hover: {
      y: -10,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
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
        variants={containerVariants}
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

        <div className="w-full max-w-7xl mx-auto relative z-10">
          <motion.div variants={itemVariants} className="text-center mb-12">
            <motion.h1 
              className="text-4xl font-extrabold mb-4 tracking-tight"
              variants={itemVariants}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">Admin Dashboard</span>
            </motion.h1>
            <motion.p 
              className="text-gray-300 text-lg max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Welcome to the admin dashboard. Manage users, courses, events, and view attendance records.
            </motion.p>
          </motion.div>

          {/* Dashboard Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            variants={containerVariants}
          >
            {/* Card 1 - User Management */}
            <Card3D className="bg-white/10 backdrop-blur-sm p-8 text-white">
              <motion.div variants={itemVariants}>
                <Link to="/user-list" className="flex flex-col items-center">
                  <UsersIcon />
                  <h3 className="text-xl font-bold text-white mb-2">User Management</h3>
                  <p className="text-gray-300 text-center mb-4">View and manage all users in the system.</p>
                  <div className="mt-auto">
                    <span className="text-teal-400 font-semibold flex items-center group">
                      Manage Users
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </motion.div>
            </Card3D>

            {/* Card 2 - Attendance Records */}
            <Card3D className="bg-white/10 backdrop-blur-sm p-8 text-white">
              <motion.div variants={itemVariants}>
                <Link to="/attendance-records" className="flex flex-col items-center">
                  <AttendanceIcon />
                  <h3 className="text-xl font-bold text-white mb-2">Attendance Records</h3>
                  <p className="text-gray-300 text-center mb-4">View and manage attendance records for all courses.</p>
                  <div className="mt-auto">
                    <span className="text-teal-400 font-semibold flex items-center group">
                      View Records
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </motion.div>
            </Card3D>

            {/* Card 3 - Mark Attendance */}
            <Card3D className="bg-white/10 backdrop-blur-sm p-8 text-white">
              <motion.div variants={itemVariants}>
                <Link to="/mark-attendance" className="flex flex-col items-center">
                  <DashboardIcon />
                  <h3 className="text-xl font-bold text-white mb-2">Mark Attendance</h3>
                  <p className="text-gray-300 text-center mb-4">Mark attendance for courses and events.</p>
                  <div className="mt-auto">
                    <span className="text-teal-400 font-semibold flex items-center group">
                      Mark Attendance
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </motion.div>
            </Card3D>

            {/* Card 4 - Feedback */}
            <Card3D className="bg-white/10 backdrop-blur-sm p-8 text-white">
              <motion.div variants={itemVariants}>
                <Link to="/feedback-list" className="flex flex-col items-center">
                  <FeedbackIcon />
                  <h3 className="text-xl font-bold text-white mb-2">Student Feedback</h3>
                  <p className="text-gray-300 text-center mb-4">View and manage student feedback and issues.</p>
                  <div className="mt-auto">
                    <span className="text-teal-400 font-semibold flex items-center group">
                      View Feedback
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </motion.div>
            </Card3D>

            {/* Card 5 - Manage Subjects */}
            <Card3D className="bg-white/10 backdrop-blur-sm p-8 text-white">
              <motion.div variants={itemVariants}>
                <Link to="/admin-subjects" className="flex flex-col items-center">
                  <SubjectsIcon />
                  <h3 className="text-xl font-bold text-white mb-2">Manage Subjects</h3>
                  <p className="text-gray-300 text-center mb-4">View and manage all subjects and courses in the system.</p>
                  <div className="mt-auto">
                    <span className="text-teal-400 font-semibold flex items-center group">
                      View Subjects
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </motion.div>
            </Card3D>
          </motion.div>

          {/* Create Course/Event Section */}
          <motion.div variants={itemVariants} className="mb-12">
            <GlassCard className="p-8">
              <motion.h2 
                className="text-2xl font-bold text-white mb-6 flex items-center"
                variants={itemVariants}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Course or Event
              </motion.h2>
              <motion.div 
                className="bg-white/5 backdrop-blur-sm p-6 rounded-lg"
                variants={itemVariants}
              >
                <AdminCreateCourseOrEvent />
              </motion.div>
            </GlassCard>
          </motion.div>

          {/* Quick Actions Section */}
          <motion.div variants={itemVariants} className="mb-10">
            <GlassCard className="p-8 bg-gradient-to-r from-teal-500/30 to-cyan-500/30 backdrop-blur-sm">
              <motion.h2 
                className="text-2xl font-bold text-white mb-6"
                variants={itemVariants}
              >
                Quick Actions
              </motion.h2>
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                variants={containerVariants}
              >
                <motion.div variants={itemVariants}>
                  <Link to="/user-list" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center transition-all duration-300 hover:transform hover:scale-105">
                    <UsersIcon />
                    <span className="font-medium text-white">Manage Users</span>
                  </Link>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Link to="/attendance-records" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center transition-all duration-300 hover:transform hover:scale-105">
                    <AttendanceIcon />
                    <span className="font-medium text-white">View Records</span>
                  </Link>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Link to="/mark-attendance" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center transition-all duration-300 hover:transform hover:scale-105">
                    <DashboardIcon />
                    <span className="font-medium text-white">Mark Attendance</span>
                  </Link>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Link to="/feedback-list" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center transition-all duration-300 hover:transform hover:scale-105">
                    <FeedbackIcon />
                    <span className="font-medium text-white">View Feedback</span>
                  </Link>
                </motion.div>
              </motion.div>
            </GlassCard>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default AdminDashboard;

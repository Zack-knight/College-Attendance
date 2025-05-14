import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
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
        stiffness: 100,
        damping: 10
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
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
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.95
    }
  };
  
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-sky-200 via-cyan-100 to-white p-0 overflow-hidden"
    >
      {/* Background Animated Elements */}
      <motion.div 
        className="absolute top-20 right-10 w-64 h-64 rounded-full bg-gradient-to-r from-teal-300 to-cyan-300 opacity-20 blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, 40, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-20 left-10 w-72 h-72 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 opacity-20 blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, -40, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="pt-28 px-4 flex flex-col items-center relative z-10">
        <motion.h1 
          variants={itemVariants}
          className="text-4xl md:text-6xl font-extrabold text-center text-gray-800 mb-6 tracking-tight"
        >
          Welcome to the <br />
          <motion.span 
            className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600"
            animate={{
              backgroundPosition: ["0% center", "100% center", "0% center"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              backgroundSize: "200% auto",
            }}
          >
            Attendance Management System
          </motion.span>
        </motion.h1>

        <motion.p 
          variants={itemVariants} 
          className="text-gray-600 text-xl text-center max-w-3xl mb-12"
        >
          A modern platform for efficiently tracking and managing attendance for educational institutions
        </motion.p>

        <motion.div className="grid gap-10 max-w-6xl w-full md:grid-cols-2 mb-12" variants={itemVariants}>
          {/* Documentation Card */}
          <motion.div 
            variants={cardVariants}
            whileHover="hover"
            className="bg-white bg-opacity-90 backdrop-blur-lg p-8 rounded-2xl shadow-xl relative overflow-hidden border border-teal-50"
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-50"
              animate={{
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  Documentation
                </h2>
              </div>
              <p className="text-gray-700 mb-6">
                This app manages attendance, feedback, and user roles for Students, Faculty, and Administrators.
              </p>
              <h3 className="text-xl text-gray-800 font-medium mb-4 flex items-center">
                <span className="inline-block w-8 h-8 bg-teal-100 rounded-full text-teal-600 flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </span>
                Key Features
              </h3>
              <ul className="space-y-3">
                {[
                  "Student Registration with Enrollment Number",
                  "Role-Based Access Control (Student, Faculty, Admin)",
                  "Mark Attendance for Students",
                  "Submit and View Attendance Issue Reports",
                  "View Detailed Attendance Records and Analytics"
                ].map((feature, index) => (
                  <motion.li 
                    key={index} 
                    className="flex items-start gap-2 text-gray-700"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <svg className="h-5 w-5 text-teal-500 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* How to Use Card */}
          <motion.div 
            variants={cardVariants}
            whileHover="hover"
            className="bg-white bg-opacity-90 backdrop-blur-lg p-8 rounded-2xl shadow-xl relative overflow-hidden border border-teal-50"
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-cyan-50 to-teal-50 opacity-50"
              animate={{
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  Getting Started
                </h2>
              </div>

              <div className="mb-6">
                <h3 className="text-xl text-gray-800 font-medium mb-4 flex items-center">
                  <span className="inline-block w-8 h-8 bg-cyan-100 rounded-full text-cyan-600 flex items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                  </span>
                  How to Use
                </h3>
                
                <div className="space-y-4">
                  {[
                    { title: "Register", description: "Create an account as a Student, Faculty, or Admin." },
                    { title: "Login", description: "Sign in with your credentials to access your personalized dashboard." },
                    { title: "Navigate", description: "Use the dashboard to perform actions specific to your role." }
                  ].map((step, index) => (
                    <motion.div 
                      key={index} 
                      className="flex gap-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{step.title}</h4>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 italic">
                  For students, registration requires a valid enrollment number starting with MCCA
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Buttons Section */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-6 mb-16"
        >
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Link
              to="/register"
              className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold px-10 py-4 rounded-xl shadow-lg inline-flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              Register
            </Link>
          </motion.div>
          
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Link
              to="/login"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-10 py-4 rounded-xl shadow-lg inline-flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Login
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;

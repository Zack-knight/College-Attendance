import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Card3D,
  FadeIn,
  SlideInUp,
  SlideInLeft,
  SlideInRight,
  GlowingText,
  MorphingBlob,
  GradientBackground,
  GlassCard,
  PulseEffect,
  GradientText
} from './AnimationUtils';

const Home = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden text-white flex flex-col relative">
      {/* Animated Gradient Background */}
      <GradientBackground gradient="from-cyan-500/20 via-blue-600/20 to-purple-600/20" />
      
      {/* Animated Morphing Blobs */}
      <MorphingBlob 
        color="bg-cyan-500" 
        size="w-64 h-64" 
        opacity="opacity-10" 
        className="top-0 left-0 -translate-x-1/4"
      />
      <MorphingBlob 
        color="bg-purple-500" 
        size="w-96 h-96" 
        opacity="opacity-10" 
        className="bottom-0 right-0 translate-x-1/4"
      />
      <MorphingBlob 
        color="bg-blue-500" 
        size="w-80 h-80" 
        opacity="opacity-10" 
        className="top-1/2 right-1/4 -translate-y-1/2"
      />
      
      <main className="flex-grow flex flex-col items-center justify-center p-6 md:p-10 z-10">
        {/* Main Content */}
        <FadeIn className="text-center z-10 max-w-5xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              textShadow: ["0 0 5px #06b6d4", "0 0 15px #06b6d4", "0 0 5px #06b6d4"]
            }}
            transition={{ 
              duration: 1, 
              textShadow: { repeat: Infinity, duration: 2 }
            }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-400 bg-clip-text text-transparent pb-2"
          >
            College Attendance System
          </motion.h1>
          
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-1 bg-gradient-to-r from-cyan-500 to-teal-500 mx-auto mb-8 rounded-full"
          />
          
          <SlideInUp delay={0.3} className="mb-10">
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              A modern approach to <GlowingText>tracking</GlowingText> and <GlowingText>managing</GlowingText> attendance for students, faculty, and administrators.
            </p>
          </SlideInUp>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            <SlideInLeft delay={0.6}>
              <Card3D className="h-full">
                <GlassCard className="p-6 h-full">
                  <div className="flex flex-col h-full">
                    <div className="w-14 h-14 bg-gradient-teal rounded-full flex items-center justify-center mb-4 shadow-soft-3d">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-cyan-300">Track Attendance</h3>
                    <p className="text-gray-300 flex-grow">Easily record and monitor attendance for multiple classes and events.</p>
                  </div>
                </GlassCard>
              </Card3D>
            </SlideInLeft>
            
            <FadeIn delay={0.7}>
              <Card3D className="h-full">
                <GlassCard className="p-6 h-full">
                  <div className="flex flex-col h-full">
                    <div className="w-14 h-14 bg-gradient-cyan rounded-full flex items-center justify-center mb-4 shadow-soft-3d">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-cyan-300">Generate Reports</h3>
                    <p className="text-gray-300 flex-grow">Create detailed attendance reports to identify trends and patterns.</p>
                  </div>
                </GlassCard>
              </Card3D>
            </FadeIn>
            
            <SlideInRight delay={0.8}>
              <Card3D className="h-full">
                <GlassCard className="p-6 h-full">
                  <div className="flex flex-col h-full">
                    <div className="w-14 h-14 bg-gradient-azure rounded-full flex items-center justify-center mb-4 shadow-soft-3d">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-cyan-300">Get Notified</h3>
                    <p className="text-gray-300 flex-grow">Stay informed with automated notifications for absences and updates.</p>
                  </div>
                </GlassCard>
              </Card3D>
            </SlideInRight>
          </div>
          
          {/* Steps Section */}
          <div className="mb-12 w-full max-w-4xl">
            <FadeIn delay={1.0}>
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Get Started in 3 Simple Steps</h2>
            </FadeIn>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((step, index) => (
                <FadeIn key={step} delay={1.1 + index * 0.1}>
                  <div className="relative">
                    <div className="absolute -left-3 -top-3 w-12 h-12 bg-gradient-cyan rounded-full flex items-center justify-center text-xl font-bold shadow-neo-pop z-10">
                      {step}
                    </div>
                    <div className="bg-card border border-gray-700 p-6 pt-10 rounded-lg shadow-inner-glow hover:shadow-soft-3d transition-all duration-300 h-full">
                      {step === 1 && (
                        <>
                          <h3 className="text-xl font-semibold mb-2 text-white">Create an Account</h3>
                          <p className="text-gray-300">Register with your college email and create a secure password.</p>
                        </>
                      )}
                      {step === 2 && (
                        <>
                          <h3 className="text-xl font-semibold mb-2 text-white">Set Up Your Profile</h3>
                          <p className="text-gray-300">Complete your profile with relevant information as student or faculty.</p>
                        </>
                      )}
                      {step === 3 && (
                        <>
                          <h3 className="text-xl font-semibold mb-2 text-white">Start Using the System</h3>
                          <p className="text-gray-300">Mark attendance, view reports, or manage courses based on your role.</p>
                        </>
                      )}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
          
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <SlideInLeft delay={1.4}>
              <Link to="/register">
                <motion.button 
                  className="px-8 py-4 font-bold text-lg rounded-lg bg-gradient-teal relative overflow-hidden group shadow-neo-pop"  
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative inline-flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Register Now
                  </span>
                </motion.button>
              </Link>
            </SlideInLeft>
            
            <SlideInRight delay={1.5}>
              <Link to="/login">
                <motion.button 
                  className="px-8 py-4 font-bold text-lg rounded-lg bg-transparent border-2 border-cyan-500 text-cyan-400 hover:text-white relative overflow-hidden group shadow-neo-brutal"  
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="absolute inset-0 w-0 bg-cyan-500 opacity-80 group-hover:w-full transition-all duration-300"></span>
                  <span className="relative inline-flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm1 4h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1zm-1 4a1 1 0 100 2h14a1 1 0 100-2H3z" clipRule="evenodd" />
                    </svg>
                    Login
                  </span>
                </motion.button>
              </Link>
            </SlideInRight>
          </div>
        </FadeIn>
      </main>
    </div>
  );
};

export default Home;

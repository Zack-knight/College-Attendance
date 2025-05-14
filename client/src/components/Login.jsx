import { jwtDecode } from 'jwt-decode';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../utils/axios';
import { motion } from 'framer-motion';
import {
  FadeIn,
  SlideInUp,
  GlassCard,
  GradientBackground,
  MorphingBlob
} from './AnimationUtils';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Email domain validation before login (for instant feedback)
    const emailLower = formData.email.toLowerCase();
    if (emailLower.includes('student') && !emailLower.endsWith('@mits.in')) {
      setError('Student email must end with @mits.in');
      setLoading(false);
      return;
    }
    
    if (emailLower.includes('faculty') && !emailLower.endsWith('@mitsgwalior.in')) {
      setError('Faculty email must end with @mitsgwalior.in');
      setLoading(false);
      return;
    }
   
    try {
      const response = await axios.post('/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      const decoded = jwtDecode(response.data.token);
      if (!decoded) throw new Error('Invalid token');
      
      // Post-login domain check
      if (decoded.role === 'student' && !formData.email.endsWith('@mits.in')) {
        setError('Student email must end with @mits.in');
        localStorage.removeItem('token');
        setLoading(false);
        return;
      }
      
      if (decoded.role === 'teacher' && !formData.email.endsWith('@mitsgwalior.in')) {
        setError('Faculty email must end with @mitsgwalior.in');
        localStorage.removeItem('token');
        setLoading(false);
        return;
      }
      
      // Redirect based on role
      if (decoded.role === 'student') {
        navigate('/user-dashboard');
      } else if (decoded.role === 'teacher') {
        navigate('/faculty-dashboard');
      } else if (decoded.role === 'admin') {
        navigate('/admin-dashboard');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      console.error('Login error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden flex items-center justify-center px-4 py-12 relative">
      {/* Animated Gradient Background */}
      <GradientBackground gradient="from-cyan-500/10 via-blue-600/10 to-purple-600/10" />
      <MorphingBlob 
        color="bg-cyan-500" 
        size="w-64 h-64" 
        opacity="opacity-10" 
        className="absolute top-0 left-0 -translate-x-1/4"
      />
      <MorphingBlob 
        color="bg-purple-500" 
        size="w-96 h-96" 
        opacity="opacity-10" 
        className="absolute bottom-0 right-0 translate-x-1/4"
      />
      
      <FadeIn className="z-10">
        <motion.div 
          className="relative"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          whileHover={{ scale: 1.01, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        >
          <GlassCard className="p-8 w-full max-w-md border border-white/30 transition-all duration-300">
        <div className="flex justify-center mb-6">
          <motion.div 
            className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
            whileHover={{ scale: 1.1, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
          </motion.div>
        </div>
        <motion.h1 
          className="text-3xl font-bold text-center text-white mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Welcome Back
        </motion.h1>
        <motion.p 
          className="text-center text-gray-200 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Sign in to your account
        </motion.p>

        {error && (
          <motion.div 
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {error}
          </motion.div>
        )}

        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="space-y-1">
            <label className="block text-white text-sm font-medium">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <motion.input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-gray-800 transition-all duration-200 bg-white bg-opacity-90 shadow-sm group-hover:shadow-md"
                whileFocus={{ scale: 1.01, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}
                required
              />
            </div>
            <p className="text-xs text-gray-300">
              Students use @mits.in | Faculty use @mitsgwalior.in
            </p>
          </div>
          
          <div className="space-y-1">
            <label className="block text-white text-sm font-medium">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <motion.input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-gray-800 transition-all duration-200 bg-white bg-opacity-90 shadow-sm group-hover:shadow-md"
                whileFocus={{ scale: 1.01, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}
                required
              />
            </div>
          </div>

          <motion.button
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center relative overflow-hidden group"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Sign In
              </>
            )}
          </motion.button>
        </motion.form>
        
        <motion.div 
          className="mt-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-gray-200">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-400 hover:text-teal-300 font-medium transition-colors duration-200 relative group">
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-500 group-hover:w-full transition-all duration-300"></span>
              Register here
            </Link>
          </p>
        </motion.div>
          </GlassCard>
        </motion.div>
      </FadeIn>
      {/* Additional Animated Elements */}
      <motion.div 
        className="absolute top-20 right-40 w-64 h-64 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 10, 0],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.div 
        className="absolute top-60 left-20 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          scale: [1, 1.1, 1],
          x: [0, -10, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 1
        }}
      />
      <motion.div 
        className="absolute -bottom-20 right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 15, 0],
          y: [0, 10, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 2
        }}
      />
    </div>
  );
};

export default Login;

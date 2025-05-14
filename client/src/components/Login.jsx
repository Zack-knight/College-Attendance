import { jwtDecode } from 'jwt-decode';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

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
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-cyan-50 to-sky-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-xl p-8 w-full max-w-md border border-white/30 transition-all duration-300 animate-fadeIn hover:shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg animate-slideInUp">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2 animate-fadeIn">Welcome Back</h1>
        <p className="text-center text-gray-500 mb-6 animate-fadeIn">Sign in to your account</p>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 animate-fadeIn">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5 animate-fadeIn">
          <div className="space-y-1">
            <label className="block text-gray-700 text-sm font-medium">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-gray-800 transition-all duration-200 bg-white bg-opacity-90 shadow-sm group-hover:shadow-md"
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              Students use @mits.in | Faculty use @mitsgwalior.in
            </p>
          </div>
          
          <div className="space-y-1">
            <label className="block text-gray-700 text-sm font-medium">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-gray-800 transition-all duration-200 bg-white bg-opacity-90 shadow-sm group-hover:shadow-md"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 animate-fadeIn flex items-center justify-center"
            disabled={loading}
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
          </button>
        </form>
        
        <div className="mt-6 text-center animate-fadeIn">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-teal-600 hover:text-teal-500 font-medium transition-colors duration-200">
              Register here
            </a>
          </p>
        </div>
      </div>
      
      {/* Animated background elements */}
      <div className="fixed top-20 right-40 w-64 h-64 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="fixed top-60 left-20 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="fixed -bottom-20 right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>
  );
};

export default Login;

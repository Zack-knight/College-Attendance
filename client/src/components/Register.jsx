import React, { useState } from 'react';
import customAxios from '../utils/axios';
import axios from 'axios'; // Import the original axios library
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    enrollmentNumber: '',
    semester: '',
    branch: '', // New field for branch/degree name
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Email domain validation
    if (formData.role === 'student' && !formData.email.endsWith('@mits.in')) {
      setError('Student email must end with @mits.in');
      return;
    }
    if (formData.role === 'teacher' && !formData.email.endsWith('@mitsgwalior.in')) {
      setError('Faculty email must end with @mitsgwalior.in');
      return;
    }
    if (formData.role === 'student' && !formData.semester.trim()) {
      setError('Semester is required for students.');
      return;
    }
    
    // Branch/degree validation for students
    if (formData.role === 'student' && !formData.branch.trim()) {
      setError('Branch or degree name is required for students.');
      return;
    }
    
    // Enrollment number validation
    if (formData.role === 'student') {
      // Check if enrollment number starts with MCCA for students
      if (!formData.enrollmentNumber.trim()) {
        setError('Enrollment number is required for students.');
        return;
      }
      if (!formData.enrollmentNumber.toUpperCase().startsWith('MCCA')) {
        setError('Student enrollment number must start with MCCA.');
        return;
      }
    }
    
    // Faculty enrollment validation
    if (formData.role === 'teacher') {
      // Check if enrollment number starts with MSF for faculty
      if (!formData.enrollmentNumber.trim()) {
        setError('Faculty ID is required.');
        return;
      }
      if (!formData.enrollmentNumber.toUpperCase().startsWith('MSF')) {
        setError('Faculty ID must start with MSF.');
        return;
      }
    }
    
    // Admin ID validation
    if (formData.role === 'admin') {
      // Check if admin ID starts with ADM
      if (!formData.enrollmentNumber.trim()) {
        setError('Admin ID is required.');
        return;
      }
      if (!formData.enrollmentNumber.toUpperCase().startsWith('ADM')) {
        setError('Admin ID must start with ADM.');
        return;
      }
    }
    try {
      // Use direct axios without the interceptors that add auth headers
      await axios.post('http://localhost:5000/api/auth/register', formData);
      setError('');
      // Show success message before redirecting
      alert('Registration successful! You can now log in.');
      navigate('/login');
    } catch (err) {
      // Show more specific error message if available
      const errorMessage = err.response?.data?.message || 'Registration failed. Please check your details.';
      setError(errorMessage);
      console.error('Registration error:', err.response?.data || err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-cyan-50 to-sky-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-xl p-8 w-full max-w-md border border-white/30 transition-all duration-300 animate-fadeIn hover:shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg animate-slideInUp">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
              <path d="M16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2 animate-fadeIn">Register</h1>
        <p className="text-center text-gray-500 mb-6 animate-fadeIn">Create your account to get started</p>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 animate-fadeIn">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5 animate-fadeIn">
          <div className="space-y-1">
            <label className="block text-gray-700 text-sm font-medium">Full Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-gray-800 transition-all duration-200 bg-white bg-opacity-90 shadow-sm group-hover:shadow-md"
                required
              />
            </div>
          </div>
          
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
                placeholder={formData.role === 'student' ? 'student@mits.in' : 
                              formData.role === 'teacher' ? 'faculty@mitsgwalior.in' : 'admin@example.com'}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-gray-800 transition-all duration-200 bg-white bg-opacity-90 shadow-sm group-hover:shadow-md"
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              {formData.role === 'student' ? 'Must end with @mits.in' : 
               formData.role === 'teacher' ? 'Must end with @mitsgwalior.in' : ''}
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
                minLength={6}
              />
            </div>
            <p className="text-xs text-gray-500">Minimum 6 characters required</p>
          </div>
          <div className="space-y-1">
            <label className="block text-gray-700 text-sm font-medium">
              {formData.role === 'student' ? 'Enrollment Number' : formData.role === 'teacher' ? 'Faculty ID' : 'Admin ID'}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
                <span className="text-gray-500 font-medium border-r border-gray-300 pr-2">
                  {formData.role === 'student' ? 'MCCA' : formData.role === 'teacher' ? 'MSF' : formData.role === 'admin' ? 'ADM' : ''}
                </span>
              </div>
              <input
                type="text"
                placeholder={formData.role === 'student' ? 'e.g., MCCA24O1058' : 
                           formData.role === 'teacher' ? 'e.g., MSF15A876' : 
                           formData.role === 'admin' ? 'e.g., ADM001' : 'Enter ID'}
                value={formData.enrollmentNumber}
                onChange={(e) => {
                  // Auto-prefix based on role
                  let value = e.target.value;
                  const prefix = formData.role === 'student' ? 'MCCA' : 
                               formData.role === 'teacher' ? 'MSF' : 
                               formData.role === 'admin' ? 'ADM' : '';
                  
                  // Only add prefix if the field was empty before and doesn't already have it
                  if (value && !value.toUpperCase().startsWith(prefix) && !formData.enrollmentNumber && prefix) {
                    value = prefix + value;
                  }
                  
                  setFormData({ ...formData, enrollmentNumber: value });
                }}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-gray-800 transition-all duration-200 bg-white bg-opacity-90 shadow-sm group-hover:shadow-md pl-20`}
                required
              />
            </div>
            {formData.role === 'student' ? (
              <p className="text-xs text-gray-500">Must start with MCCA (e.g., MCCA24O1058)</p>
            ) : formData.role === 'teacher' ? (
              <p className="text-xs text-gray-500">Must start with MSF (e.g., MSF15A876)</p>
            ) : formData.role === 'admin' ? (
              <p className="text-xs text-gray-500">Must start with ADM (e.g., ADM001)</p>
            ) : null}
          </div>
          
          <div className="space-y-1">
            <label className="block text-gray-700 text-sm font-medium">Select Role</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-gray-800 transition-all duration-200 bg-white bg-opacity-90 shadow-sm group-hover:shadow-md appearance-none"
              >
                <option value="student">Student</option>
                <option value="teacher">Faculty</option>
                <option value="admin">Admin</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Fields only for students */}
          {formData.role === 'student' && (
            <>
              {/* Branch/Degree field */}
              <div className="space-y-1 animate-fadeIn">
                <label className="block text-gray-700 text-sm font-medium">Branch/Degree Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.496 2.132a1 1 0 00-.992 0l-7 4A1 1 0 003 8v7a1 1 0 100 2h14a1 1 0 100-2V8a1 1 0 00.496-1.868l-7-4zM6 9a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1zm3 1a1 1 0 012 0v3a1 1 0 11-2 0v-3zm5-1a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g., Computer Science Engineering"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-gray-800 transition-all duration-200 bg-white bg-opacity-90 shadow-sm group-hover:shadow-md"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">Enter your branch or degree name (e.g., CSE, IT, MCA)</p>
              </div>

              {/* Semester field */}
              <div className="space-y-1 animate-fadeIn mt-4">
                <label className="block text-gray-700 text-sm font-medium">Semester</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g., 4th"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-gray-800 transition-all duration-200 bg-white bg-opacity-90 shadow-sm group-hover:shadow-md"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">Enter your current semester (e.g., 1st, 2nd, 3rd)</p>
              </div>
            </>
          )}
          
          <button
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 animate-fadeIn"
          >
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Account
            </div>
          </button>
        </form>
        
        <div className="mt-6 text-center animate-fadeIn">
          <p className="text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-teal-600 hover:text-teal-500 font-medium transition-colors duration-200">
              Log in here
            </a>
          </p>
        </div>
      </div>
      
      {/* Animated background elements */}
      <div className="fixed top-20 left-20 w-64 h-64 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="fixed top-40 right-20 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="fixed -bottom-20 left-40 w-80 h-80 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>
  );
};

export default Register;

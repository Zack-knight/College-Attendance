import { jwtDecode } from 'jwt-decode';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Email domain validation before login (optional, for instant feedback)
   
    try {
      const response = await axios.post('/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      const decoded = jwtDecode(response.data.token);
      if (!decoded) throw new Error('Invalid token');
      // Post-login domain check
      if (decoded.role === 'student' && !formData.email.endsWith('@mits.in')) {
        setError('Student email must end with @mits.in');
        localStorage.removeItem('token');
        return;
      }
      if (decoded.role === 'Admin' && !formData.email.endsWith('@gmail.com')) {
        setError('Student email must end with @gmail.com');
        localStorage.removeItem('token');
        return;
      }
      if (decoded.role === 'teacher' && !formData.email.endsWith('@mitsgwalior.in')) {
        setError('Faculty email must end with @mitsgwalior.in');
        localStorage.removeItem('token');
        return;
      }
      if (decoded.role === 'student') navigate('/user-dashboard');
      else if (decoded.role === 'teacher') navigate('/faculty-dashboard');
      else if (decoded.role === 'admin') navigate('/admin-dashboard');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-cyan-100 to-white flex items-center justify-center px-4 py-12">
      <div className="bg-white bg-opacity-80 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-teal-600 mb-6">Login</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="relative">
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`peer w-full px-4 pt-5 pb-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400`}
              required
            />
            <label
              htmlFor="email"
              className={`absolute left-4 text-sm text-gray-500 transition-all 
                transform scale-90 origin-left top-2.5 
                peer-focus:top-2 peer-focus:scale-90 
                ${formData.email ? 'top-2 scale-90' : 'top-4 scale-100 text-base text-gray-400'}`}
            >
              Email
            </label>
          </div>

          {/* Password Field */}
          <div className="relative">
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`peer w-full px-4 pt-5 pb-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400`}
              required
            />
            <label
              htmlFor="password"
              className={`absolute left-4 text-sm text-gray-500 transition-all 
                transform scale-90 origin-left top-2.5 
                peer-focus:top-2 peer-focus:scale-90 
                ${formData.password ? 'top-2 scale-90' : 'top-4 scale-100 text-base text-gray-400'}`}
            >
              Password
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-500 hover:bg-teal-400 text-white font-semibold py-2 rounded-lg shadow-md transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    enrollmentNumber: '',
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
    try {
      await axios.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Please check your details.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-cyan-100 to-white flex items-center justify-center px-4 py-12">
      <div className="bg-white bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-xl p-8 w-full max-w-md border border-white/30">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Register</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800"
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800"
          />
          <input
            type="text"
            placeholder="Enrollment Number"
            value={formData.enrollmentNumber}
            onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800"
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800 bg-white"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="w-full bg-teal-500 hover:bg-teal-400 text-white font-semibold py-2 rounded-lg shadow-md transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;

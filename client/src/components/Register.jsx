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
    employeeId: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate data based on role
      if (formData.role === 'student' && !formData.enrollmentNumber) {
        throw new Error('Enrollment number is required for students');
      }
      if (formData.role === 'teacher' && !formData.employeeId) {
        throw new Error('Employee ID is required for faculty');
      }

      const response = await axios.post('/auth/register', formData);
      if (response.data.message) {
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-8 pt-20">
      <div className="card w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-primary">Register</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-text"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-text"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-text"
            required
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-text"
          >
            <option value="student">Student</option>
            <option value="teacher">Faculty</option>
          </select>
          {formData.role === 'student' && (
            <input
              type="text"
              placeholder="Enrollment Number"
              value={formData.enrollmentNumber}
              onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-text"
              required
            />
          )}
          {formData.role === 'teacher' && (
            <input
              type="text"
              placeholder="Employee ID"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-text"
              required
            />
          )}
          <button type="submit" className="btn-primary w-full">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
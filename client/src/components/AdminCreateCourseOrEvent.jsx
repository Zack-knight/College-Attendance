import { useState } from 'react';
import axios from '../utils/axios';

const AdminCreateCourseOrEvent = () => {
  const [type, setType] = useState('course');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [attendanceTracking, setAttendanceTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validate name
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    
    // Validate name format
    if (!/^[A-Za-z ]{2,50}$/.test(name)) {
      setError('Subject name must be 2-50 characters long and contain only letters and spaces');
      return;
    }
    
    // Validate code is present
    if (!code.trim()) {
      setError('Subject code is required.');
      return;
    }
    
    // Validate code format (6-12 digits)
    if (!/^\d{6,12}$/.test(code)) {
      setError('Subject code must be between 6-12 digits (numbers only)');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post('/subject', {
        name: name.trim(),
        code: code.trim(),
        type,
        attendanceTracking: type === 'event' ? attendanceTracking : undefined,
      });
      setSuccess(`${type === 'course' ? 'Course' : 'Event'} created successfully!`);
      setName('');
      setCode('');
      setAttendanceTracking(false);
    } catch (err) {
      // Handle detailed error messages from server
      console.error('Error creating subject:', err);
      const errorMessage = err.response?.data?.error || 'Failed to create subject';
      const errorDetails = err.response?.data?.details;
      
      if (errorDetails) {
        if (Array.isArray(errorDetails)) {
          setError(`${errorMessage}: ${errorDetails.join(', ')}`);
        } else {
          setError(`${errorMessage}: ${errorDetails}`);
        }
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white bg-opacity-90 rounded-xl shadow-lg p-8 mb-10 mt-10">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Course or Event</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-4 items-center">
          <label className="font-medium text-gray-700">Type:</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800 bg-white"
          >
            <option value="course">Course</option>
            <option value="event">Event</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={`Enter ${type} name`}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800"
            disabled={loading}
          />
          <p className="text-xs text-gray-500">Must contain only letters and spaces, 2-50 characters</p>
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Code <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder={`Enter ${type} code (numbers only)`}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800"
            disabled={loading}
          />
          <p className="text-xs text-gray-500">Must be between 6-12 digits (numbers only)</p>
        </div>
        {type === 'event' && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="attendanceTracking"
              checked={attendanceTracking}
              onChange={e => setAttendanceTracking(e.target.checked)}
              className="h-4 w-4 text-teal-600 border-gray-300 rounded"
            />
            <label htmlFor="attendanceTracking" className="text-gray-700">Attendance Tracking</label>
          </div>
        )}
        <button
          type="submit"
          className="bg-teal-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-600 transition"
          disabled={loading}
        >
          {loading ? 'Processing...' : `Create ${type.charAt(0).toUpperCase() + type.slice(1)}`}
        </button>
      </form>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mt-4 animate-fadeIn">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mt-4 animate-fadeIn">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">{success}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCreateCourseOrEvent; 
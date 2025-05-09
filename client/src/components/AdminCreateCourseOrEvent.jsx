import { useState } from 'react';
import axios from '../utils/axios';

const AdminCreateCourseOrEvent = () => {
  const [type, setType] = useState('course');
  const [name, setName] = useState('');
  const [attendanceTracking, setAttendanceTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/subject', {
        name: name.trim(),
        type,
        attendanceTracking: type === 'event' ? attendanceTracking : undefined,
      });
      setSuccess(`${type === 'course' ? 'Course' : 'Event'} created successfully!`);
      setName('');
      setAttendanceTracking(false);
    } catch {
      setError('Failed to create.');
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
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={`Enter ${type} name`}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800"
          disabled={loading}
        />
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
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-600 mt-2">{success}</p>}
    </div>
  );
};

export default AdminCreateCourseOrEvent; 
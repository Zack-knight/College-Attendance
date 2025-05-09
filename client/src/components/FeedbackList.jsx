import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';

const FeedbackApp = () => {
  const [feedback, setFeedback] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeedback = async () => {
    setFetching(true);
    setError(null);
    try {
      const response = await axios.get('/feedback/all');
      setFeedback(response.data);
    } catch (err) {
      setError('Failed to fetch feedback. Please try again later.');
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await axios.delete(`/feedback/${id}`);
        setFeedback(feedback.filter((item) => item._id !== id));
      } catch (err) {
        setError('Failed to delete feedback. Please try again later.');
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-cyan-100 to-white px-4 pt-28 pb-12">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10 tracking-tight">
        📋 <span className="text-teal-600">Attendance Issue Note List</span>
      </h1>

      {error && (
        <p className="text-center text-red-600 font-semibold mb-4">{error}</p>
      )}

      {fetching ? (
        <p className="text-center text-gray-700 text-lg">Loading ...</p>
      ) : feedback.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No Note found.</p>
      ) : (
        <div className="max-w-6xl mx-auto bg-white bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-xl p-6 overflow-x-auto">
          <table className="min-w-full table-auto text-left">
            <thead>
              <tr className="text-gray-800 text-sm border-b border-gray-300">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Message</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {feedback.map((item) => (
                <tr key={item._id} className="hover:bg-gray-100 transition">
                  <td className="py-3 px-4">{item.student?.name || 'Unknown'}</td>
                  <td className="py-3 px-4">{item.message}</td>
                  <td className="py-3 px-4">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="bg-red-500 text-white px-4 py-1 rounded-full hover:bg-red-400 transition text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FeedbackApp;

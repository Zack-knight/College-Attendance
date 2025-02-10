import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';

const FeedbackList = () => {
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await axios.get('/feedback/all');
        setFeedback(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFeedback();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/feedback/${id}`);
      setFeedback(feedback.filter((item) => item._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark p-8 pt-20">
      <h1 className="text-2xl font-bold mb-6 text-center text-primary">Feedback List</h1>
      <div className="overflow-x-auto card">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-primary to-secondary">
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">Enrollment Number</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">Message</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {feedback.map((item) => (
              <tr key={item._id} className="hover:bg-gray-700 transition duration-300">
                <td className="px-6 py-4 text-sm text-text">{item.enrollmentNumber}</td>
                <td className="px-6 py-4 text-sm text-text">{item.message}</td>
                <td className="px-6 py-4 text-sm text-text">{new Date(item.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm text-text">
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeedbackList;
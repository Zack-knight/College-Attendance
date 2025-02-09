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
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Feedback List</h1>
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Message</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {feedback.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50 transition duration-300">
                <td className="px-6 py-4 text-sm text-gray-900">{item.studentName}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.message}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{new Date(item.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-red-500 hover:text-red-700 transition duration-300"
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
import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';

const MarkAttendance = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    courseId: '',
    enrollmentNumber: '',
    status: 'Present'
  });
  const [error, setError] = useState('');

  // Fetch faculty's courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/course/faculty');
        setCourses(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch courses');
      }
    };
    fetchCourses();
  }, []);

  // Fetch students when course is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (formData.courseId) {
        try {
          const response = await axios.get(`/course/${formData.courseId}/students`);
          setStudents(response.data);
        } catch (err) {
          setError(err.response?.data?.error || 'Failed to fetch students');
        }
      }
    };
    fetchStudents();
  }, [formData.courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/attendance/mark', formData);
      alert('Attendance marked successfully');
      setFormData({ ...formData, enrollmentNumber: '', status: 'Present' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark attendance');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-8 pt-20">
      <div className="card w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-primary">Mark Attendance</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={formData.courseId}
            onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-text"
            required
          >
            <option value="">Select Course</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.name} ({course.code})
              </option>
            ))}
          </select>

          <select
            value={formData.enrollmentNumber}
            onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-text"
            required
            disabled={!formData.courseId}
          >
            <option value="">Select Student</option>
            {students.map(student => (
              <option key={student._id} value={student.enrollmentNumber}>
                {student.name} ({student.enrollmentNumber})
              </option>
            ))}
          </select>

          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-text"
            required
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>

          <button type="submit" className="btn-primary w-full">
            Mark Attendance
          </button>
        </form>
      </div>
    </div>
  );
};

export default MarkAttendance;
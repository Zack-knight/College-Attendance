import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';

const FacultyDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
  });
  const [enrollmentData, setEnrollmentData] = useState({
    courseId: '',
    enrollmentNumber: '',
  });
  const [error, setError] = useState('');

  // Fetch courses taught by the faculty
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

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/course/create', formData);
      setCourses([...courses, response.data.course]);
      setFormData({ name: '', code: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create course');
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/course/enroll', enrollmentData);
      setEnrollmentData({ ...enrollmentData, enrollmentNumber: '' });
      alert('Student enrolled successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to enroll student');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark p-8 pt-20">
      <h1 className="text-2xl font-bold mb-6 text-center text-primary">Faculty Dashboard</h1>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      {/* Create Course Section */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-primary">Create Course</h2>
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <input
            type="text"
            placeholder="Course Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-text"
            required
          />
          <input
            type="text"
            placeholder="Course Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-text"
            required
          />
          <button type="submit" className="btn-primary w-full">
            Create Course
          </button>
        </form>
      </div>

      {/* Enroll Student Section */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-primary">Enroll Student</h2>
        <form onSubmit={handleEnrollStudent} className="space-y-4">
          <select
            value={enrollmentData.courseId}
            onChange={(e) => setEnrollmentData({ ...enrollmentData, courseId: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-text"
            required
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.name} ({course.code})
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Student Enrollment Number"
            value={enrollmentData.enrollmentNumber}
            onChange={(e) => setEnrollmentData({ ...enrollmentData, enrollmentNumber: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-text"
            required
          />
          <button type="submit" className="btn-primary w-full">
            Enroll Student
          </button>
        </form>
      </div>

      {/* Courses List Section */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4 text-primary">Your Courses</h2>
        {courses.length === 0 ? (
          <p className="text-text">No courses found.</p>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course._id} className="p-4 border rounded-lg">
                <h3 className="font-bold text-primary">{course.name} ({course.code})</h3>
                <p className="text-text">Enrolled Students: {course.students.length}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;
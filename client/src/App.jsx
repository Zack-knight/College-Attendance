import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import FeedbackForm from './components/FeedbackForm';
import FeedbackList from './components/FeedbackList';
import MarkAttendance from './components/MarkAttendance';
import AttendanceRecords from './components/AttendanceRecords';
import UserDashboard from './components/UserDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/feedback"
          element={
            <ProtectedRoute roles={['student']}>
              <FeedbackForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback-list"
          element={
            <ProtectedRoute roles={['teacher', 'admin']}>
              <FeedbackList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mark-attendance"
          element={
            <ProtectedRoute roles={['teacher']}>
              <MarkAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance-records"
          element={
            <ProtectedRoute roles={['student', 'teacher', 'admin']}>
              <AttendanceRecords />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute roles={['student']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty-dashboard"
          element={
            <ProtectedRoute roles={['teacher']}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
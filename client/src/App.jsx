import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import FeedbackForm from './components/FeedbackForm';
import FeedbackList from './components/FeedbackList';
import MarkAttendance from './components/MarkAttendance';
import AttendanceRecords from './components/AttendanceRecords';
import StudentAttendanceDetail from './components/StudentAttendanceDetail';
import UserDashboard from './components/UserDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import FacultySubjectList from './components/FacultySubjectList';
import AdminDashboard from './components/AdminDashboard';
import UserList from './components/UserList';
import AdminSubjectList from './components/AdminSubjectList';
import Home from './components/Home';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar'; 

const App = () => {
  return (
    <Router>
      <Navbar /> {/* Add Navbar here */}
      <Routes>
        <Route path="/" element={<Home />} />
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
            <ProtectedRoute roles={['teacher', 'admin']}>
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
          path="/faculty-subjects"
          element={
            <ProtectedRoute roles={['teacher']}>
              <FacultySubjectList />
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
        <Route
          path="/user-list"
          element={
            <ProtectedRoute roles={['admin']}>
              <UserList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-subjects"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminSubjectList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-attendance/:studentId/:subjectId?"
          element={
            <ProtectedRoute roles={['teacher', 'admin']}>
              <StudentAttendanceDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
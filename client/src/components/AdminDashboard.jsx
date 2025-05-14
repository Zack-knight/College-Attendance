import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import AdminCreateCourseOrEvent from './AdminCreateCourseOrEvent';

// Import icons
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const SubjectsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const AttendanceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const FeedbackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Animation classes
  const fadeIn = "animate-fadeIn";
  const slideIn = "animate-slideInRight";
  const pulseAnimation = "hover:animate-pulse";
  
  // Helper to get a random animation delay for staggered animations
  const getRandomDelay = () => {
    const delays = ['delay-100', 'delay-200', 'delay-300', 'delay-400'];
    return delays[Math.floor(Math.random() * delays.length)];
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-sky-200 via-cyan-100 to-white px-4 pt-28 pb-16 flex flex-col items-center">
        <div className={`${fadeIn} w-full max-w-7xl`}>
          <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-500">Admin Dashboard</span>
          </h1>
          <p className="text-gray-600 text-lg mb-12 max-w-2xl mx-auto text-center">
            Manage courses, events, users, and view important data from your institution.  
          </p>
        </div>

        {/* Dashboard Cards Section */}
        <div className={`grid gap-8 w-full max-w-7xl md:grid-cols-2 lg:grid-cols-3 mb-14 ${slideIn}`}>
          {/* Card 1 - View Users */}
          <Link
            to="/user-list"
            className={`${fadeIn} ${getRandomDelay()} group bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center transform hover:-translate-y-1 relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400/5 to-blue-400/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            <UsersIcon />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Manage Users</h3>
            <p className="text-gray-600 text-center">View, filter, and manage all users in the system.</p>
            <div className="mt-4 flex">
              <span className="text-teal-600 font-semibold group-hover:text-teal-700 transition-colors flex items-center">
                View Users
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>

          {/* Card 2 - Attendance Records */}
          <Link
            to="/attendance-records"
            className={`${fadeIn} ${getRandomDelay()} group bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center transform hover:-translate-y-1 relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400/5 to-blue-400/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            <AttendanceIcon />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Attendance Records</h3>
            <p className="text-gray-600 text-center">View and export attendance data for all courses and events.</p>
            <div className="mt-4 flex">
              <span className="text-teal-600 font-semibold group-hover:text-teal-700 transition-colors flex items-center">
                View Records
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>

          {/* Card 3 - Mark Attendance */}
          <Link
            to="/mark-attendance"
            className={`${fadeIn} ${getRandomDelay()} group bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center transform hover:-translate-y-1 relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400/5 to-blue-400/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            <DashboardIcon />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Mark Attendance</h3>
            <p className="text-gray-600 text-center">Mark attendance for any course or event as an administrator.</p>
            <div className="mt-4 flex">
              <span className="text-teal-600 font-semibold group-hover:text-teal-700 transition-colors flex items-center">
                Mark Now
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>

          {/* Card 4 - View Feedback */}
          <Link
            to="/feedback-list"
            className={`${fadeIn} ${getRandomDelay()} group bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center transform hover:-translate-y-1 relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400/5 to-blue-400/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            <FeedbackIcon />
            <h3 className="text-xl font-bold text-gray-800 mb-2">View Feedback</h3>
            <p className="text-gray-600 text-center">Review all feedback and notes from students and faculty.</p>
            <div className="mt-4 flex">
              <span className="text-teal-600 font-semibold group-hover:text-teal-700 transition-colors flex items-center">
                View Feedback
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>

          {/* Card 5 - Manage Subjects */}
          <Link
            to="/admin-subjects"
            className={`${fadeIn} ${getRandomDelay()} group bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center transform hover:-translate-y-1 relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400/5 to-blue-400/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            <SubjectsIcon />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Manage Subjects</h3>
            <p className="text-gray-600 text-center">View and manage all subjects and courses in the system.</p>
            <div className="mt-4 flex">
              <span className="text-teal-600 font-semibold group-hover:text-teal-700 transition-colors flex items-center">
                View Subjects
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
        </div>

        {/* Create Course/Event Section */}
        <div className={`w-full max-w-7xl bg-white rounded-xl shadow-lg p-8 mb-10 ${fadeIn}`}>
          <h2 className="text-2xl font-bold text-teal-600 mb-6 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Course or Event
          </h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <AdminCreateCourseOrEvent />
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className={`w-full max-w-7xl bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl shadow-lg p-8 text-white mb-10 ${slideIn}`}>
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/user-list" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center transition-all duration-300 hover:transform hover:scale-105">
              <UsersIcon />
              <span className="font-medium">Manage Users</span>
            </Link>
            <Link to="/attendance-records" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center transition-all duration-300 hover:transform hover:scale-105">
              <AttendanceIcon />
              <span className="font-medium">View Records</span>
            </Link>
            <Link to="/mark-attendance" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center transition-all duration-300 hover:transform hover:scale-105">
              <DashboardIcon />
              <span className="font-medium">Mark Attendance</span>
            </Link>
            <Link to="/feedback-list" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center transition-all duration-300 hover:transform hover:scale-105">
              <FeedbackIcon />
              <span className="font-medium">View Feedback</span>
            </Link>
            <Link to="/admin-subjects" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg flex flex-col items-center transition-all duration-300 hover:transform hover:scale-105">
              <SubjectsIcon />
              <span className="font-medium">Manage Subjects</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
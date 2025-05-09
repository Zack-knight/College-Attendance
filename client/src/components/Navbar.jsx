import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  let role = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded.role;
    } catch {
      role = null;
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="w-full fixed top-0 z-50 bg-gradient-to-r from-primary to-secondary p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">
          Attendance System
        </Link>
        <div className="flex space-x-6 font-medium text-white items-center">
          {/* Guest Links */}
          {!token && (
            <>
              <Link to="/" className="hover:text-gray-200 transition duration-300">Home</Link>
              <Link to="/register" className="hover:text-gray-200 transition duration-300">Register</Link>
              <Link to="/login" className="hover:text-gray-200 transition duration-300">Login</Link>
            </>
          )}
          {/* Student Links */}
          {token && role === 'student' && (
            <>
              <Link to="/user-dashboard" className="hover:text-gray-200 transition duration-300">Student Dashboard</Link>
              <Link to="/attendance-records" className="hover:text-gray-200 transition duration-300">Attendance Records</Link>
              <Link to="/feedback" className="hover:text-gray-200 transition duration-300">Attendance Issue Note</Link>
            </>
          )}
          {/* Teacher Links */}
          {token && role === 'teacher' && (
            <>
              <Link to="/faculty-dashboard" className="hover:text-gray-200 transition duration-300">Faculty Dashboard</Link>
              <Link to="/mark-attendance" className="hover:text-gray-200 transition duration-300">Mark Attendance</Link>
              <Link to="/attendance-records" className="hover:text-gray-200 transition duration-300">Attendance Records</Link>
              <Link to="/feedback-list" className="hover:text-gray-200 transition duration-300">Feedback List</Link>
            </>
          )}
          {/* Admin Links */}
          {token && role === 'admin' && (
            <>
              <Link to="/admin-dashboard" className="hover:text-gray-200 transition duration-300">Admin Dashboard</Link>
              <Link to="/attendance-records" className="hover:text-gray-200 transition duration-300">Attendance Records</Link>
              <Link to="/feedback-list" className="hover:text-gray-200 transition duration-300">Feedback List</Link>
              <Link to="/mark-attendance" className="hover:text-gray-200 transition duration-300">Mark Attendance</Link>
            </>
          )}
          {/* Logout Button for Authenticated Users */}
          {token && (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white font-bold px-6 py-2 rounded-full shadow-md hover:bg-red-400 transition ml-2"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

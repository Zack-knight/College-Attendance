import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState('');
  const [userName, setUserName] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check token validity and update state on component mount and route changes
  useEffect(() => {
    const checkAuthStatus = () => {
      // Check if token exists and is valid
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const decoded = jwtDecode(storedToken);
          
          // Check if token is expired
          const currentTime = Date.now() / 1000;
          if (decoded.exp && decoded.exp < currentTime) {
            // Token expired, clean up
            console.log('Token expired');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setRole('');
            setUserName('');
          } else {
            // Valid token
            setToken(storedToken);
            setRole(decoded.role);
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setRole('');
        }
      } else {
        // No token found
        setToken(null);
        setRole('');
      }
    };
    
    // Check auth status immediately and whenever route changes
    checkAuthStatus();
  }, [location.pathname]); // Re-run when route changes
  
  const handleScroll = () => {
    if (window.scrollY > 20) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };
  
  // Load user name from localStorage after authentication state is updated
  useEffect(() => {
    const updateUserName = () => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          let userName = '';
          
          // Try to get user from localStorage
          try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
              const user = JSON.parse(userStr);
              userName = user?.name || '';
            }
          } catch (e) {
            console.error('Error parsing user from localStorage:', e);
          }
          
          // Fallback to decoded token name if available
          if (!userName && decoded?.name) {
            userName = decoded.name;
          }
          
          setUserName(userName);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      } else {
        // Clear username if no token
        setUserName('');
      }
    };
    
    updateUserName();
  }, [token, location.pathname]); // Re-run when token changes or route changes
  
  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Update state to reflect logged out status
    setToken(null);
    setRole('');
    setUserName('');
    
    // Navigate to home page
    navigate('/');
  };

  return (
    <nav className={`w-full fixed top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-gradient-to-r from-teal-500 to-cyan-500'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className={`${scrolled ? 'text-teal-600' : 'text-white'} text-xl font-bold transition-all duration-300 hover:opacity-80 flex items-center`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              <span className="font-bold">Attendance System</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className={`inline-flex items-center justify-center p-2 rounded-md ${scrolled ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' : 'text-white hover:text-white hover:bg-teal-600'} focus:outline-none transition duration-150 ease-in-out`}
              aria-label="Main menu"
              aria-expanded="false"
            >
              {!isOpen ? (
                <svg className="block h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden lg:flex lg:items-center">
            <div className="flex space-x-4">
              {/* Guest Links */}
              {!token && (
                <>
                  <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600 hover:bg-opacity-30'} transition duration-150 ease-in-out`}>Home</Link>
                  <Link to="/register" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600 hover:bg-opacity-30'} transition duration-150 ease-in-out`}>Register</Link>
                  <Link to="/login" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600 hover:bg-opacity-30'} transition duration-150 ease-in-out`}>Login</Link>
                </>
              )}
              {/* Student Links */}
              {token && role === 'student' && (
                <>
                  <Link to="/user-dashboard" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600 hover:bg-opacity-30'} transition duration-150 ease-in-out`}>Dashboard</Link>
                  <Link to="/attendance-records" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600 hover:bg-opacity-30'} transition duration-150 ease-in-out`}>My Attendance</Link>
                  <Link to="/feedback" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600 hover:bg-opacity-30'} transition duration-150 ease-in-out`}>Report Issue</Link>
                </>
              )}
              {/* Teacher Links */}
              {token && role === 'teacher' && (
                <>
                  <Link to="/faculty-dashboard" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600 hover:bg-opacity-30'} transition duration-150 ease-in-out`}>Dashboard</Link>
                  <Link to="/mark-attendance" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600 hover:bg-opacity-30'} transition duration-150 ease-in-out`}>Mark Attendance</Link>
                  <Link to="/attendance-records" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600 hover:bg-opacity-30'} transition duration-150 ease-in-out`}>Records</Link>
                  <Link to="/faculty-subjects" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600 hover:bg-opacity-30'} transition duration-150 ease-in-out`}>Subjects</Link>
                  <Link to="/feedback-list" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600 hover:bg-opacity-30'} transition duration-150 ease-in-out`}>Issues</Link>
                </>
              )}
              {/* Admin Links */}
              {token && role === 'admin' && (
                <>
                  <Link to="/admin-dashboard" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600 hover:bg-opacity-30'} transition duration-150 ease-in-out`}>Dashboard</Link>
                  <Link to="/admin-subjects" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600 hover:bg-opacity-30'} transition duration-150 ease-in-out`}>Subjects</Link>
                  <Link to="/attendance-records" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600 hover:bg-opacity-30'} transition duration-150 ease-in-out`}>Attendance</Link>
                  <Link to="/feedback-list" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600 hover:bg-opacity-30'} transition duration-150 ease-in-out`}>Issues</Link>
                </>
              )}
            </div>
            
            {/* User Profile/Logout */}
            {token && (
              <div className="ml-4 flex items-center">
                <div className="relative">
                  <div className="flex items-center">
                    <div className={`mr-3 ${scrolled ? 'text-gray-700' : 'text-white'} font-medium text-sm hidden md:block`}>
                      {userName ? `Hi, ${userName}` : 'Welcome'}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L12 12.586V9z" clipRule="evenodd" />
                        </svg>
                        Logout
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:hidden`}>
        <div className={`pt-2 pb-3 px-2 space-y-1 ${scrolled ? 'bg-white' : 'bg-teal-500'}`}>
          {/* Guest Links */}
          {!token && (
            <>
              <Link to="/" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600'} transition duration-150 ease-in-out`}>Home</Link>
              <Link to="/register" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600'} transition duration-150 ease-in-out`}>Register</Link>
              <Link to="/login" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600'} transition duration-150 ease-in-out`}>Login</Link>
            </>
          )}
          {/* Student Links */}
          {token && role === 'student' && (
            <>
              <Link to="/user-dashboard" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600'} transition duration-150 ease-in-out`}>Dashboard</Link>
              <Link to="/attendance-records" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600'} transition duration-150 ease-in-out`}>My Attendance</Link>
              <Link to="/feedback" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600'} transition duration-150 ease-in-out`}>Report Issue</Link>
            </>
          )}
          {/* Teacher Links */}
          {token && role === 'teacher' && (
            <>
              <Link to="/faculty-dashboard" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600'} transition duration-150 ease-in-out`}>Dashboard</Link>
              <Link to="/mark-attendance" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600'} transition duration-150 ease-in-out`}>Mark Attendance</Link>
              <Link to="/attendance-records" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600'} transition duration-150 ease-in-out`}>Records</Link>
              <Link to="/faculty-subjects" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600'} transition duration-150 ease-in-out`}>Subjects</Link>
              <Link to="/feedback-list" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600'} transition duration-150 ease-in-out`}>Issues</Link>
            </>
          )}
          {/* Admin Links */}
          {token && role === 'admin' && (
            <>
              <Link to="/admin-dashboard" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600'} transition duration-150 ease-in-out`}>Dashboard</Link>
              <Link to="/admin-subjects" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600'} transition duration-150 ease-in-out`}>Subjects</Link>
              <Link to="/attendance-records" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600'} transition duration-150 ease-in-out`}>Attendance</Link>
              <Link to="/feedback-list" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600'} transition duration-150 ease-in-out`}>Issues</Link>
            </>
          )}
          {/* Logout Button for Mobile */}
          {token && (
            <div className="pt-4 pb-2">
              <div className={`${scrolled ? 'text-gray-700' : 'text-white'} text-sm font-medium mb-2 px-3`}>
                {userName ? `Signed in as ${userName}` : 'Signed in'}
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L12 12.586V9z" clipRule="evenodd" />
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

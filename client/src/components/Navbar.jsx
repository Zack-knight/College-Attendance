import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState('');
  const [userName, setUserName] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Animation variants
  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };
  
  const linkVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: i => ({ 
      opacity: 1, 
      y: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }),
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };
  
  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: "auto",
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3
      }
    }
  };

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
    
    // Close mobile menu if open
    setIsOpen(false);
    
    // Navigate to home page
    navigate('/');
  };

  return (
    <motion.nav 
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className={`w-full fixed top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-background/80 backdrop-blur-md shadow-lg border-b border-white/10' 
          : 'bg-gradient-to-r from-teal-500/80 to-cyan-500/80 backdrop-blur-md'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <motion.div 
                className={`text-2xl font-bold ${scrolled ? 'text-teal-500' : 'text-white'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">
                  College Attendance
                </span>
              </motion.div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* Public Links */}
            {!token && (
              <>
                <motion.div custom={0} variants={linkVariants} whileHover="hover">
                  <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Home</Link>
                </motion.div>
                <motion.div custom={1} variants={linkVariants} whileHover="hover">
                  <Link to="/login" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Login</Link>
                </motion.div>
                <motion.div custom={2} variants={linkVariants} whileHover="hover">
                  <Link to="/register" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'bg-teal-500 text-white hover:bg-teal-600' : 'bg-white/20 text-white hover:bg-white/30'} transition duration-150 ease-in-out`}>Register</Link>
                </motion.div>
              </>
            )}
            
            {/* Student Links */}
            {token && role === 'student' && (
              <>
                <motion.div custom={0} variants={linkVariants} whileHover="hover">
                  <Link to="/user-dashboard" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Dashboard</Link>
                </motion.div>
                <motion.div custom={1} variants={linkVariants} whileHover="hover">
                  <Link to="/view-attendance" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Attendance</Link>
                </motion.div>
                <motion.div custom={2} variants={linkVariants} whileHover="hover">
                  <Link to="/feedback" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Report Issue</Link>
                </motion.div>
              </>
            )}
            
            {/* Teacher Links */}
            {token && role === 'teacher' && (
              <>
                <motion.div custom={0} variants={linkVariants} whileHover="hover">
                  <Link to="/faculty-dashboard" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Dashboard</Link>
                </motion.div>
                <motion.div custom={1} variants={linkVariants} whileHover="hover">
                  <Link to="/mark-attendance" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Mark Attendance</Link>
                </motion.div>
                <motion.div custom={2} variants={linkVariants} whileHover="hover">
                  <Link to="/attendance-records" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Records</Link>
                </motion.div>
                <motion.div custom={3} variants={linkVariants} whileHover="hover">
                  <Link to="/faculty-subjects" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Subjects</Link>
                </motion.div>
                <motion.div custom={4} variants={linkVariants} whileHover="hover">
                  <Link to="/feedback-list" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Issues</Link>
                </motion.div>
              </>
            )}
            
            {/* Admin Links */}
            {token && role === 'admin' && (
              <>
                <motion.div custom={0} variants={linkVariants} whileHover="hover">
                  <Link to="/admin-dashboard" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Dashboard</Link>
                </motion.div>
                <motion.div custom={1} variants={linkVariants} whileHover="hover">
                  <Link to="/user-list" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Users</Link>
                </motion.div>
                <motion.div custom={2} variants={linkVariants} whileHover="hover">
                  <Link to="/admin-subjects" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Subjects</Link>
                </motion.div>
                <motion.div custom={3} variants={linkVariants} whileHover="hover">
                  <Link to="/attendance-records" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Attendance</Link>
                </motion.div>
                <motion.div custom={4} variants={linkVariants} whileHover="hover">
                  <Link to="/feedback-list" className={`px-3 py-2 rounded-md text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Issues</Link>
                </motion.div>
              </>
            )}
            
            {/* Logout Button for Desktop */}
            {token && (
              <motion.div custom={5} variants={linkVariants} whileHover="hover">
                <button
                  onClick={handleLogout}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    scrolled 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-red-500/80 text-white hover:bg-red-600/80'
                  } transition duration-150 ease-in-out flex items-center`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L12 12.586V9z" clipRule="evenodd" />
                  </svg>
                  Sign out
                </button>
              </motion.div>
            )}
          </div>
          
          {/* User Name Display (Desktop) */}
          {token && userName && (
            <div className="hidden md:flex md:items-center">
              <motion.div 
                className={`text-sm font-medium ${scrolled ? 'text-gray-700' : 'text-white'} mr-4`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="opacity-70">Signed in as</span> {userName}
              </motion.div>
            </div>
          )}
          
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md ${
                scrolled 
                  ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' 
                  : 'text-white hover:bg-teal-600/30'
              } transition duration-150 ease-in-out focus:outline-none`}
              whileTap={{ scale: 0.95 }}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="md:hidden bg-white/10 backdrop-blur-md overflow-hidden"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {/* Public Links */}
              {!token && (
                <>
                  <motion.div variants={linkVariants} custom={0}>
                    <Link to="/" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Home</Link>
                  </motion.div>
                  <motion.div variants={linkVariants} custom={1}>
                    <Link to="/login" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Login</Link>
                  </motion.div>
                  <motion.div variants={linkVariants} custom={2}>
                    <Link to="/register" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'bg-teal-500 text-white hover:bg-teal-600' : 'bg-white/20 text-white hover:bg-white/30'} transition duration-150 ease-in-out`}>Register</Link>
                  </motion.div>
                </>
              )}
              
              {/* Student Links */}
              {token && role === 'student' && (
                <>
                  <motion.div variants={linkVariants} custom={0}>
                    <Link to="/user-dashboard" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Dashboard</Link>
                  </motion.div>
                  <motion.div variants={linkVariants} custom={1}>
                    <Link to="/view-attendance" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Attendance</Link>
                  </motion.div>
                  <motion.div variants={linkVariants} custom={2}>
                    <Link to="/feedback" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Report Issue</Link>
                  </motion.div>
                </>
              )}
              
              {/* Teacher Links */}
              {token && role === 'teacher' && (
                <>
                  <motion.div variants={linkVariants} custom={0}>
                    <Link to="/faculty-dashboard" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Dashboard</Link>
                  </motion.div>
                  <motion.div variants={linkVariants} custom={1}>
                    <Link to="/mark-attendance" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Mark Attendance</Link>
                  </motion.div>
                  <motion.div variants={linkVariants} custom={2}>
                    <Link to="/attendance-records" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Records</Link>
                  </motion.div>
                  <motion.div variants={linkVariants} custom={3}>
                    <Link to="/faculty-subjects" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Subjects</Link>
                  </motion.div>
                  <motion.div variants={linkVariants} custom={4}>
                    <Link to="/feedback-list" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Issues</Link>
                  </motion.div>
                </>
              )}
              
              {/* Admin Links */}
              {token && role === 'admin' && (
                <>
                  <motion.div variants={linkVariants} custom={0}>
                    <Link to="/admin-dashboard" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Dashboard</Link>
                  </motion.div>
                  <motion.div variants={linkVariants} custom={1}>
                    <Link to="/user-list" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Users</Link>
                  </motion.div>
                  <motion.div variants={linkVariants} custom={2}>
                    <Link to="/admin-subjects" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Subjects</Link>
                  </motion.div>
                  <motion.div variants={linkVariants} custom={3}>
                    <Link to="/attendance-records" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Attendance</Link>
                  </motion.div>
                  <motion.div variants={linkVariants} custom={4}>
                    <Link to="/feedback-list" className={`block px-3 py-2 rounded-md text-base font-medium ${scrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-gray-100' : 'text-white hover:bg-teal-600/30'} transition duration-150 ease-in-out`}>Issues</Link>
                  </motion.div>
                </>
              )}
              
              {/* Logout Button for Mobile */}
              {token && (
                <motion.div variants={linkVariants} custom={5} className="pt-4 pb-2">
                  <div className={`${scrolled ? 'text-gray-700' : 'text-white'} text-sm font-medium mb-2 px-3`}>
                    {userName ? `Signed in as ${userName}` : 'Signed in'}
                  </div>
                  <motion.button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L12 12.586V9z" clipRule="evenodd" />
                    </svg>
                    Sign out
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;

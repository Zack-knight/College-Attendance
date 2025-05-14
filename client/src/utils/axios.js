import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api', // Base URL for all requests
  timeout: 30000, // Increased to 30 seconds timeout for larger responses
});

// Function to get a new token
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await axios.post('/auth/refresh-token', { refreshToken });
    const { token } = response.data;
    localStorage.setItem('token', token);
    return token;
  } catch (error) {
    // If refresh fails, log out the user
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
    throw error;
  }
};

// Add a request interceptor to include the token in headers
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Make sure we're setting the token in the correct format
      config.headers.Authorization = `Bearer ${token}`;
      
      // Add additional debugging
      console.log('Adding auth token to request:', config.url);
    } else {
      console.log('No token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration and bad requests
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log('Response error:', error.message, 'for URL:', originalRequest?.url);

    // If the error is due to an unauthorized request and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Attempting to refresh token for 401 error');
      originalRequest._retry = true;
      try {
        const newToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return Promise.reject(refreshError);
      }
    }
    
    // If it's a 400 error, it might be due to an invalid token format
    if (error.response?.status === 400 && !originalRequest._retry400) {
      console.log('Attempting to fix authorization for 400 error');
      originalRequest._retry400 = true;
      
      try {
        // Try to reformat the token or send it in a different way
        const token = localStorage.getItem('token');
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          // Try the request again
          return instance(originalRequest);
        }
      } catch (tokenFixError) {
        console.error('Token format fix failed:', tokenFixError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper functions for authentication
export const login = async (email, password) => {
  try {
    const response = await instance.post('/auth/login', { email, password });
    const { token, user, refreshToken } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    throw error.response?.data || new Error('Login failed');
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export default instance;
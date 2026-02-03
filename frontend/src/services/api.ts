import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include user ID from localStorage
api.interceptors.request.use((config) => {
  const currentUserId = localStorage.getItem('currentUserId');
  if (currentUserId) {
    config.headers['X-User-Id'] = currentUserId;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;

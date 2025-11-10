import axios from 'axios';
import { isTokenExpired } from '../utils/tokenUtils';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Check if token is expired before sending request
      if (isTokenExpired(token)) {
        // Token expired, remove it and trigger logout
        localStorage.removeItem('token');
        // Dispatch custom event to trigger logout in AuthContext
        window.dispatchEvent(new Event('tokenExpired'));
        return Promise.reject(new Error('Token expired'));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses (unauthorized - token expired/invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      // Dispatch custom event to trigger logout in AuthContext
      window.dispatchEvent(new Event('tokenExpired'));
    }
    return Promise.reject(error);
  }
);

// Auth
export const signup = (name, email, password) => {
  return api.post('/auth/signup', { name, email, password });
};

export const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

// Onboarding
export const savePreferences = (assets, investorType, contentTypes) => {
  return api.post('/onboarding', { assets, investorType, contentTypes });
};

// Dashboard
export const getDashboard = () => {
  return api.get('/dashboard');
};

// Feedback
export const submitFeedback = (targetType, targetId, vote) => {
  return api.post('/feedback', { targetType, targetId, vote });
};

// Profile
export const getProfile = () => {
  return api.get('/profile');
};

export const updateProfile = (assets, investorType, contentTypes) => {
  return api.put('/profile', { assets, investorType, contentTypes });
};


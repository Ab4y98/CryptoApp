import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { getProfile } from '../services/api';
import { isTokenExpired } from '../utils/tokenUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const expirationCheckInterval = useRef(null);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear expiration check interval
    if (expirationCheckInterval.current) {
      clearInterval(expirationCheckInterval.current);
      expirationCheckInterval.current = null;
    }
  }, []);

  // Check token expiration periodically
  const startExpirationCheck = useCallback((currentToken) => {
    // Clear existing interval if any
    if (expirationCheckInterval.current) {
      clearInterval(expirationCheckInterval.current);
    }

    if (!currentToken) return;

    // Check expiration every minute
    expirationCheckInterval.current = setInterval(() => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken || isTokenExpired(storedToken)) {
        console.log('Token expired, logging out...');
        logout();
        // Redirect to login page
        window.location.href = '/';
      }
    }, 60000); // Check every 60 seconds

    // Also check immediately
    if (isTokenExpired(currentToken)) {
      console.log('Token already expired, logging out...');
      logout();
      window.location.href = '/';
    }
  }, [logout]);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        // Check if token is expired before making API call
        if (isTokenExpired(token)) {
          console.log('Token expired on initialization, logging out...');
          logout();
          setLoading(false);
          return;
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Fetch user data from API
        try {
          const response = await getProfile();
          setUser({
            id: response.data._id,
            name: response.data.name,
            email: response.data.email,
            hasPreferences: !!response.data.preferences?.investorType,
          });
          
          // Start expiration check after successful login
          startExpirationCheck(token);
        } catch (error) {
          // Token might be invalid, clear it
          console.error('Failed to fetch user profile:', error);
          logout();
        }
      } else {
        delete axios.defaults.headers.common['Authorization'];
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen for token expiration events from API interceptor
    const handleTokenExpired = () => {
      console.log('Token expiration event received, logging out...');
      logout();
      window.location.href = '/';
    };

    window.addEventListener('tokenExpired', handleTokenExpired);

    // Cleanup
    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
      if (expirationCheckInterval.current) {
        clearInterval(expirationCheckInterval.current);
      }
    };
  }, [token, logout, startExpirationCheck]);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setToken(token);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Start expiration check after login
    startExpirationCheck(token);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};


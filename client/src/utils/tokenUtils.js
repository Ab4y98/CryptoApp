// Utility functions for JWT token handling

/**
 * Decode JWT token without verification (for checking expiration)
 * @param {string} token - JWT token
 * @returns {object|null} Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  if (!token) return null;
  
  try {
    // JWT tokens have 3 parts separated by dots: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (second part)
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired or invalid
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  
  return currentTime >= expirationTime;
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {number|null} Expiration timestamp in milliseconds or null
 */
export const getTokenExpiration = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;
  
  return decoded.exp * 1000; // Convert to milliseconds
};

/**
 * Get time until token expires (in milliseconds)
 * @param {string} token - JWT token
 * @returns {number|null} Milliseconds until expiration or null
 */
export const getTimeUntilExpiration = (token) => {
  const expirationTime = getTokenExpiration(token);
  if (!expirationTime) return null;
  
  return expirationTime - Date.now();
};


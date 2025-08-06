/**
 * Authentication utility functions
 */

/**
 * Get the authentication token from localStorage
 * @returns {string | null} The auth token if exists, null otherwise
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Set the authentication token in localStorage
 * @param {string} token - The JWT token to store
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

/**
 * Remove the authentication token from localStorage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

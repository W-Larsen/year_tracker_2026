/**
 * API configuration
 * Uses environment variable in production, localhost in development
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export { API_URL };

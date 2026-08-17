import axios from 'axios';

/**
 * Centralized Axios instance configured for API communication.
 * Key setting: withCredentials: true ensures HTTP-only cookies (JWT) 
 * are included automatically with cross-origin HTTP requests.
 */
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // CRITICAL: Allows sending & receiving HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

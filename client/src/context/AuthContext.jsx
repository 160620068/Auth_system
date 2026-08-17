import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Check authentication state on initial application load / refresh
   * Requests /auth/me; backend verifies JWT from HTTP-only cookie.
   */
  const checkAuth = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      if (res.data && res.data.success) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // 401 Unauthorized expected if user has no valid cookie
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Register new user with email/password
   */
  const register = async (formData) => {
    try {
      setError(null);
      const res = await api.post('/auth/register', formData);
      if (res.data && res.data.user) {
        setUser(res.data.user);
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      return { success: false, message };
    }
  };

  /**
   * Login user with email/password
   */
  const login = async (formData) => {
    try {
      setError(null);
      const res = await api.post('/auth/login', formData);
      if (res.data && res.data.user) {
        setUser(res.data.user);
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password.';
      setError(message);
      return { success: false, message };
    }
  };

  /**
   * Logout user by clearing HTTP-Only Cookie on backend
   */
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        checkAuth,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

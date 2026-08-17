import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

/**
 * ProtectedRoute Component:
 * Guards protected pages (like /home). Redirects unauthenticated users to /login.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex items-center space-x-3 text-sky-400 bg-slate-900/80 px-6 py-4 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
          <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
          <span className="font-medium text-slate-200">Verifying security credentials...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;

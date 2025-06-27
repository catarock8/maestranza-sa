import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from '../api';

export default function ProtectedRoute() {
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

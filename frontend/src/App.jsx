import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Movements from './pages/Movements';
import Batches from './pages/Batches';
import Reports from './pages/Reports';
import Test from './pages/Test';
import './index.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/products" element={<Products />} />
      <Route path="/movements" element={<Movements />} />
      <Route path="/batches" element={<Batches />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/test" element={<Test />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

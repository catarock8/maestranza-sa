import React, { useState, useEffect } from 'react';
import api from './api';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ username: '', password: '' });
  const [newProd, setNewProd] = useState({ name: '', serial_number: '', location: '', quantity: 0 });

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProducts();
    }
  }, [token]);

  function handleLogin(e) {
    e.preventDefault();
    api.post('/token', { username: form.username, password: form.password })
      .then(res => {
        const t = res.data.access_token;
        setToken(t);
        localStorage.setItem('token', t);
      })
      .catch(() => alert('Login failed'));
  }

  function fetchProducts() {
    api.get('/products')
      .then(res => setProducts(res.data))
      .catch(() => alert('Error fetching products'));
  }

  function handleAddProduct(e) {
    e.preventDefault();
    api.post('/products', newProd)
      .then(() => { setNewProd({ name: '', serial_number: '', location: '', quantity: 0 }); fetchProducts(); })
      .catch(() => alert('Error adding product'));
  }

  if (!token) {
    return (
      <div className="container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input placeholder="Usuario" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
          <input type="password" placeholder="Contraseña" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <button>Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

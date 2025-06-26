import React, { useState, useEffect } from 'react';
import api from './api';
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
    <div className="container">
      <h1>Productos</h1>
      <table>
        <thead>
          <tr><th>Nombre</th><th>Serie</th><th>Ubicación</th><th>Cantidad</th></tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}><td>{p.name}</td><td>{p.serial_number}</td><td>{p.location}</td><td>{p.quantity}</td></tr>
          ))}
        </tbody>
      </table>
      <h2>Agregar Producto</h2>
      <form onSubmit={handleAddProduct} className="small-form">
        <input placeholder="Nombre" value={newProd.name} onChange={e => setNewProd({ ...newProd, name: e.target.value })} />
        <input placeholder="Serie" value={newProd.serial_number} onChange={e => setNewProd({ ...newProd, serial_number: e.target.value })} />
        <input placeholder="Ubicación" value={newProd.location} onChange={e => setNewProd({ ...newProd, location: e.target.value })} />
        <input type="number" placeholder="Cantidad" value={newProd.quantity} onChange={e => setNewProd({ ...newProd, quantity: parseInt(e.target.value) })} />
        <button>Agregar</button>
      </form>
    </div>
  );
}

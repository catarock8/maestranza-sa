import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/token', form);
      localStorage.setItem('token', res.data.access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
      navigate('/dashboard');
    } catch (error) {
      alert('Credenciales inválidas');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Maestranzas Unidos S.A.</h1>
        <h2>Sistema de Control de Inventarios</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Usuario"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button type="submit">Ingresar</button>
        </form>
      </div>
    </div>
  );
}

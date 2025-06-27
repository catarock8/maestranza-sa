import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Intentando login con:', { username: form.username });
      console.log('API URL:', import.meta.env.VITE_API_URL);
      
      // Crear FormData para OAuth2PasswordRequestForm
      const formData = new FormData();
      formData.append('username', form.username);
      formData.append('password', form.password);
      
      const res = await api.post('/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      console.log('Login exitoso:', res.data);
      localStorage.setItem('token', res.data.access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
      navigate('/dashboard');
    } catch (error) {
      console.error('Error de login:', error);
      if (error.response) {
        setError(`Error: ${error.response.data.detail || 'Credenciales inválidas'}`);
      } else if (error.request) {
        setError('No se pudo conectar al servidor. Verifique la conexión.');
      } else {
        setError('Error de conexión');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Maestranzas Unidos S.A.</h1>
        <h2>Sistema de Control de Inventarios</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Usuario"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        
        <div className="login-help">
          <small>Usuario de prueba: admin / admin123</small>
        </div>
      </div>
    </div>
  );
}

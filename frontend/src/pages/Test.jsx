import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Test() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await api.get('/');
      setStatus(`✅ Conexión exitosa: ${response.data.message}`);
    } catch (error) {
      setStatus(`❌ Error de conexión: ${error.message}`);
    }
    setLoading(false);
  };

  const createSampleProducts = async () => {
    setLoading(true);
    try {
      const response = await api.post('/create-sample-products');
      setStatus(`✅ ${response.data.msg} (Total: ${response.data.total_products})`);
    } catch (error) {
      setStatus(`❌ Error creando productos: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Test de Conexión</h1>
        <Link to="/dashboard" className="back-btn">← Volver al Dashboard</Link>
      </div>
      
      <div className="content-card">
        <h2>Pruebas del Sistema</h2>
        
        <div style={{marginBottom: '20px'}}>
          <p><strong>Backend URL:</strong> {import.meta.env.VITE_API_URL}</p>
        </div>

        <div style={{marginBottom: '20px'}}>
          <button onClick={testConnection} disabled={loading}>
            {loading ? 'Probando...' : 'Probar Conexión'}
          </button>
          <button onClick={createSampleProducts} disabled={loading} style={{marginLeft: '10px'}}>
            {loading ? 'Creando...' : 'Crear Productos de Muestra'}
          </button>
        </div>

        {status && (
          <div style={{
            padding: '15px',
            borderRadius: '5px',
            background: status.includes('✅') ? '#d4edda' : '#f8d7da',
            color: status.includes('✅') ? '#155724' : '#721c24',
            marginTop: '20px'
          }}>
            {status}
          </div>
        )}

        <div style={{marginTop: '30px', fontSize: '14px', color: '#666'}}>
          <p><strong>Instrucciones:</strong></p>
          <ol>
            <li>Primero prueba la conexión al backend</li>
            <li>Si la conexión funciona, crea productos de muestra</li>
            <li>Luego ve a la página de Productos para verlos</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

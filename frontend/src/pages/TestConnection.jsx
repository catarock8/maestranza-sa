import React, { useState, useEffect } from 'react';
import api from '../api';

export default function TestConnection() {
  const [status, setStatus] = useState('Conectando...');
  const [backendInfo, setBackendInfo] = useState(null);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    try {
      setStatus('Probando conexión...');
      setError(null);
      
      console.log('Testing connection to:', import.meta.env.VITE_API_URL);
      
      const response = await api.get('/');
      setBackendInfo(response.data);
      setStatus('✅ Conexión exitosa');
    } catch (err) {
      console.error('Error de conexión:', err);
      setError(err);
      setStatus('❌ Error de conexión');
    }
  };

  const createInitialUser = async () => {
    try {
      setStatus('Creando usuario inicial...');
      const response = await api.post('/create-initial-user');
      console.log('Usuario creado:', response.data);
      setStatus('✅ Usuario inicial creado');
      setBackendInfo({ ...backendInfo, userCreated: response.data });
    } catch (err) {
      console.error('Error creando usuario:', err);
      setError(err);
      setStatus('❌ Error creando usuario');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Test de Conexión Backend</h1>
      
      <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <h3>Configuración:</h3>
        <p><strong>API URL:</strong> {import.meta.env.VITE_API_URL}</p>
        <p><strong>Estado:</strong> {status}</p>
      </div>

      {backendInfo && (
        <div style={{ background: '#d4edda', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
          <h3>Respuesta del Backend:</h3>
          <pre>{JSON.stringify(backendInfo, null, 2)}</pre>
        </div>
      )}

      {error && (
        <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
          <h3>Error:</h3>
          <p><strong>Mensaje:</strong> {error.message}</p>
          {error.response && (
            <div>
              <p><strong>Status:</strong> {error.response.status}</p>
              <p><strong>Data:</strong> {JSON.stringify(error.response.data)}</p>
            </div>
          )}
          {error.request && !error.response && (
            <p><strong>Request Error:</strong> No se recibió respuesta del servidor</p>
          )}
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <button onClick={testConnection} style={{ marginRight: '10px', padding: '10px 20px' }}>
          Probar Conexión
        </button>
        <button onClick={createInitialUser} style={{ padding: '10px 20px' }}>
          Crear Usuario Inicial
        </button>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', background: '#fff3cd', borderRadius: '5px' }}>
        <h3>Instrucciones:</h3>
        <ol>
          <li>Primero verifica que la conexión al backend funcione</li>
          <li>Si la conexión es exitosa, crea el usuario inicial</li>
          <li>Usa las credenciales: <strong>admin / admin123</strong></li>
        </ol>
      </div>
    </div>
  );
}

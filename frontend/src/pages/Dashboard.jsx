import React from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const modules = [
    { name: 'Inventario', path: '/products', icon: '📦', description: 'Gestión de productos y stock' },
    { name: 'Movimientos', path: '/movements', icon: '🔄', description: 'Entradas y salidas de inventario' },
    { name: 'Lotes', path: '/batches', icon: '🏷️', description: 'Control de lotes y vencimientos' },
    { name: 'Reportes', path: '/reports', icon: '📊', description: 'Informes y estadísticas' },
    { name: 'Test Conexión', path: '/test', icon: '🔧', description: 'Probar conexión con backend' }
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Sistema de Control de Inventarios</h1>
        <p>Maestranzas Unidos S.A. - Copiapó, Atacama</p>
        <div style={{marginTop: '10px', fontSize: '14px', color: '#666'}}>
          Backend: {import.meta.env.VITE_API_URL}
        </div>
      </header>
      
      <div className="modules-grid">
        {modules.map((module) => (
          <Link key={module.name} to={module.path} className="module-card">
            <div className="module-icon">{module.icon}</div>
            <h3>{module.name}</h3>
            <p>{module.description}</p>
          </Link>
        ))}
      </div>
      
      <div className="dashboard-footer">
        <p>Sistema simplificado para pruebas - Versión 1.0</p>
      </div>
    </div>
  );
}

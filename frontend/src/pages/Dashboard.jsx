import React from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const modules = [
    { name: 'Inventario', path: '/products', icon: '📦', description: 'Gestión de productos y stock' },
    { name: 'Movimientos', path: '/movements', icon: '🔄', description: 'Entradas y salidas de inventario' },
    { name: 'Lotes', path: '/batches', icon: '🏷️', description: 'Control de lotes y vencimientos' },
    { name: 'Reportes', path: '/reports', icon: '📊', description: 'Informes y estadísticas' },
    { name: 'Agregar Producto', path: '/add-product', icon: '➕', description: 'Registrar un nuevo producto en inventario' },
    { name: 'Test Conexión', path: '/test', icon: '🔧', description: 'Probar conexión con backend' }
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'linear-gradient(90deg, #1e293b 0%, #3b82f6 100%)',
        color: '#fff',
        borderRadius: 18,
        padding: '32px 16px 24px 16px',
        marginBottom: 32,
        boxShadow: '0 4px 24px rgba(30,41,59,0.08)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          marginBottom: 10
        }}>
          <div style={{
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #fbbf24 0%, #f87171 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(251,191,36,0.15)'
          }}>
            {/* Logo tipo engranaje y martillo */}
            <span style={{fontSize: 38, fontWeight: 700, color: '#fff', textShadow: '0 2px 8px #f59e42'}}>
              <span role="img" aria-label="Engranaje">⚙️</span>
              <span style={{marginLeft: -8, marginRight: -8}} role="img" aria-label="Martillo">🔨</span>
            </span>
          </div>
          <div>
            <h1 style={{margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: 1}}>Sistema de Control de Inventarios</h1>
            <div style={{fontSize: 18, fontWeight: 500, color: '#e0e7ef', marginTop: 2, letterSpacing: 0.5}}>
              Maestranzas Unidos S.A. <span style={{color: '#fbbf24', fontWeight: 700}}>- Copiapó, Atacama</span>
            </div>
          </div>
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

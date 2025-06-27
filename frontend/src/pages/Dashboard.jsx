import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const modules = [
    { name: 'Inventario', path: '/products', icon: '📦', description: 'Gestión de productos y stock' },
    { name: 'Movimientos', path: '/movements', icon: '🔄', description: 'Entradas y salidas de inventario' },
    { name: 'Lotes', path: '/batches', icon: '🏷️', description: 'Control de lotes y vencimientos' },
    { name: 'Alertas', path: '/alerts', icon: '⚠️', description: 'Notificaciones de stock bajo' },
    { name: 'Proveedores', path: '/suppliers', icon: '🏢', description: 'Gestión de proveedores' },
    { name: 'Proyectos', path: '/projects', icon: '🚧', description: 'Proyectos de la maestranza' },
    { name: 'Reportes', path: '/reports', icon: '📊', description: 'Informes y estadísticas' },
    { name: 'Usuarios', path: '/users', icon: '👥', description: 'Administración de usuarios' }
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Sistema de Control de Inventarios</h1>
        <p>Maestranzas Unidos S.A. - Copiapó, Atacama</p>
        <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
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
    </div>
  );
}

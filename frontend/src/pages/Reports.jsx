import React from 'react';
import { Link } from 'react-router-dom';

export default function Reports() {
  const inventoryStats = {
    totalProducts: 4,
    totalQuantity: 515,
    lowStock: 1,
    nearExpiry: 1
  };

  const topProducts = [
    { name: 'Tornillo M6x20', quantity: 200 },
    { name: 'Tuerca M8', quantity: 150 },
    { name: 'Perno M10x30', quantity: 90 },
    { name: 'Arandela 8mm', quantity: 75 }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Reportes y Estadísticas</h1>
        <Link to="/dashboard" className="back-btn">← Volver al Dashboard</Link>
      </div>
      
      <div className="reports-container">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Productos</h3>
            <div className="stat-number">{inventoryStats.totalProducts}</div>
          </div>
          <div className="stat-card">
            <h3>Cantidad Total</h3>
            <div className="stat-number">{inventoryStats.totalQuantity}</div>
          </div>
          <div className="stat-card">
            <h3>Stock Bajo</h3>
            <div className="stat-number danger">{inventoryStats.lowStock}</div>
          </div>
          <div className="stat-card">
            <h3>Próximos a Vencer</h3>
            <div className="stat-number warning">{inventoryStats.nearExpiry}</div>
          </div>
        </div>

        <div className="content-card">
          <h2>Top Productos por Cantidad</h2>
          <div className="top-products">
            {topProducts.map((product, index) => (
              <div key={index} className="product-row">
                <span className="product-name">{product.name}</span>
                <span className="product-quantity">{product.quantity} unidades</span>
              </div>
            ))}
          </div>
        </div>

        <div className="content-card">
          <h2>Acciones Rápidas</h2>
          <div className="quick-actions">
            <button className="btn-primary">Generar Reporte PDF</button>
            <button className="btn-secondary">Exportar Excel</button>
            <button className="btn-secondary">Configurar Alertas</button>
          </div>
        </div>
      </div>
    </div>
  );
}

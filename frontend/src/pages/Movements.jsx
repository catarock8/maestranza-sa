import React from 'react';
import { Link } from 'react-router-dom';

export default function Movements() {
  const movements = [
    { id: 1, product: 'Tuerca M8', type: 'Entrada', quantity: 50, date: '2025-06-27', user: 'Admin' },
    { id: 2, product: 'Tornillo M6x20', type: 'Salida', quantity: 25, date: '2025-06-26', user: 'Operador1' },
    { id: 3, product: 'Arandela 8mm', type: 'Entrada', quantity: 100, date: '2025-06-25', user: 'Admin' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Movimientos de Inventario</h1>
        <Link to="/dashboard" className="back-btn">← Volver al Dashboard</Link>
      </div>
      
      <div className="content-card">
        <div className="section-header">
          <h2>Últimos Movimientos</h2>
          <button className="btn-primary">+ Registrar Movimiento</button>
        </div>
        
        <div className="movements-table">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Fecha</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {movements.map(movement => (
                <tr key={movement.id}>
                  <td>{movement.product}</td>
                  <td>
                    <span className={`badge ${movement.type === 'Entrada' ? 'badge-success' : 'badge-warning'}`}>
                      {movement.type}
                    </span>
                  </td>
                  <td>{movement.quantity}</td>
                  <td>{movement.date}</td>
                  <td>{movement.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

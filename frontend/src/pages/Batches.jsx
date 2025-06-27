import React from 'react';
import { Link } from 'react-router-dom';

export default function Batches() {
  const batches = [
    { id: 1, product: 'Tuerca M8', lot_number: 'LOT-2025-001', expiry_date: '2026-06-27', quantity: 100 },
    { id: 2, product: 'Tornillo M6x20', lot_number: 'LOT-2025-002', expiry_date: '2026-12-15', quantity: 150 },
    { id: 3, product: 'Arandela 8mm', lot_number: 'LOT-2025-003', expiry_date: '2025-08-30', quantity: 75 },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Lotes</h1>
        <Link to="/dashboard" className="back-btn">← Volver al Dashboard</Link>
      </div>
      
      <div className="content-card">
        <div className="section-header">
          <h2>Lotes Registrados</h2>
          <button className="btn-primary">+ Crear Lote</button>
        </div>
        
        <div className="batches-grid">
          {batches.map(batch => (
            <div key={batch.id} className="batch-card">
              <h3>{batch.product}</h3>
              <div className="batch-info">
                <p><strong>Lote:</strong> {batch.lot_number}</p>
                <p><strong>Vencimiento:</strong> {batch.expiry_date}</p>
                <p><strong>Cantidad:</strong> {batch.quantity}</p>
                <div className="batch-status">
                  {new Date(batch.expiry_date) < new Date(Date.now() + 30*24*60*60*1000) ? 
                    <span className="badge badge-danger">Próximo a vencer</span> :
                    <span className="badge badge-success">Vigente</span>
                  }
                </div>
              </div>
              <div className="batch-actions">
                <button className="btn-secondary">Editar</button>
                <button className="btn-danger">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

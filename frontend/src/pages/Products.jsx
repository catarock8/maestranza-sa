import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
    api.get('/products')
      .then(res => setProducts(res.data))
      .catch(() => alert('Error al cargar productos'));
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Inventario</h1>
        <Link to="/dashboard" className="back-btn">← Volver al Dashboard</Link>
      </div>
      
      <div className="content-card">
        <h2>Productos en Inventario</h2>
        <ul className="products-list">
          {products.map(p => (
            <li key={p.id}>
              <div className="product-info">
                <div className="product-name">{p.name}</div>
                <div className="product-details">
                  Serie: {p.serial_number || 'N/A'} | Ubicación: {p.location || 'N/A'}
                </div>
              </div>
              <div className="product-quantity">{p.quantity} unidades</div>
            </li>
          ))}
        </ul>
        {products.length === 0 && (
          <p style={{textAlign: 'center', color: '#666', padding: '40px'}}>
            No hay productos registrados en el inventario
          </p>
        )}
      </div>
    </div>
  );
}

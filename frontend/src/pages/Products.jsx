import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products from:', import.meta.env.VITE_API_URL);
      const response = await api.get('/products');
      setProducts(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('No se pudo conectar al backend. Mostrando datos de ejemplo.');
      
      // Datos de ejemplo como fallback
      const mockProducts = [
        { id: 1, name: 'Tuerca M8', serial_number: 'TM8-001', location: 'Estante A1', quantity: 150 },
        { id: 2, name: 'Tornillo M6x20', serial_number: 'TM6-020', location: 'Estante A2', quantity: 200 },
        { id: 3, name: 'Arandela 8mm', serial_number: 'AR8-001', location: 'Estante B1', quantity: 75 },
        { id: 4, name: 'Perno M10x30', serial_number: 'PM10-030', location: 'Estante B2', quantity: 90 },
      ];
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Inventario</h1>
        <Link to="/dashboard" className="back-btn">← Volver al Dashboard</Link>
      </div>
      
      <div className="content-card">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h2>Productos en Inventario</h2>
          <button onClick={fetchProducts} disabled={loading}>
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>
        
        {error && (
          <div style={{background: '#fff3cd', padding: '10px', borderRadius: '5px', marginBottom: '20px', color: '#856404'}}>
            {error}
          </div>
        )}
        
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
        {products.length === 0 && !loading && (
          <p style={{textAlign: 'center', color: '#666', padding: '40px'}}>
            No hay productos registrados en el inventario
          </p>
        )}
      </div>
    </div>
  );
}

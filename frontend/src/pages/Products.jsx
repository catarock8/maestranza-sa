import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products from:', import.meta.env.VITE_API_URL);
      
      // Construir URL con filtro de categoría si está seleccionada
      const url = selectedCategory ? `/products?category_id=${selectedCategory}` : '/products';
      const response = await api.get(url);
      
      setProducts(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('No se pudo conectar al backend. Mostrando datos de ejemplo.');
      
      // Datos de ejemplo como fallback
      const mockProducts = [
        { id: 1, name: 'Tuerca M8', serial_number: 'TM8-001', location: 'Estante A1', brand: 'ACME', quantity: 150, category_name: 'Sujetadores' },
        { id: 2, name: 'Tornillo M6x20', serial_number: 'TM6-020', location: 'Estante A2', brand: 'Stanley', quantity: 200, category_name: 'Sujetadores' },
        { id: 3, name: 'Arandela 8mm', serial_number: 'AR8-001', location: 'Estante B1', brand: 'Bosch', quantity: 75, category_name: 'Sujetadores' },
        { id: 4, name: 'Perno M10x30', serial_number: 'PM10-030', location: 'Estante B2', brand: 'Makita', quantity: 90, category_name: 'Sujetadores' },
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
          <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: 'white'
              }}
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button onClick={fetchProducts} disabled={loading}>
              {loading ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>
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
                  Serie: {p.serial_number || 'N/A'} | Marca: {p.brand || 'N/A'} | 
                  Categoría: {p.category_name || 'Sin categoría'} | Ubicación: {p.location || 'N/A'}
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

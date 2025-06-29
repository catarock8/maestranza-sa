import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [minStock, setMinStock] = useState('');
  const [maxStock, setMaxStock] = useState('');
  const [orderBy, setOrderBy] = useState('name');
  const [orderDir, setOrderDir] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedBrand, searchTerm, minStock, maxStock, orderBy, orderDir]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await api.get('/brands');
      setBrands(response.data);
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products from:', import.meta.env.VITE_API_URL);
      
      // Construir parámetros de query
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category_id', selectedCategory);
      if (selectedBrand) params.append('brand', selectedBrand);
      if (searchTerm) params.append('search', searchTerm);
      if (minStock) params.append('min_stock', minStock);
      if (maxStock) params.append('max_stock', maxStock);
      if (orderBy) params.append('order_by', orderBy);
      if (orderDir) params.append('order_dir', orderDir);
      
      const queryString = params.toString();
      const url = queryString ? `/products?${queryString}` : '/products';
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

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedBrand('');
    setMinStock('');
    setMaxStock('');
    setOrderBy('name');
    setOrderDir('asc');
  };
  
  const setLowStockFilter = () => {
    setMinStock('');
    setMaxStock('10');
    setOrderBy('quantity');
    setOrderDir('asc');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Inventario</h1>
        <Link to="/dashboard" className="back-btn">← Volver al Dashboard</Link>
      </div>
      
      <div className="content-card">
        {/* Panel de filtros mejorado */}
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{margin: '0 0 15px 0', color: '#495057'}}>🔍 Filtros de Búsqueda</h3>
          
          {/* Primera fila de filtros */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Buscar:</label>
              <input
                type="text"
                placeholder="Nombre o número de serie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Categoría:</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Marca:</label>
              <select 
                value={selectedBrand} 
                onChange={(e) => setSelectedBrand(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="">Todas las marcas</option>
                {brands.map(brand => (
                  <option key={brand.name} value={brand.name}>{brand.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Segunda fila de filtros */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Stock mínimo:</label>
              <input
                type="number"
                placeholder="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Stock máximo:</label>
              <input
                type="number"
                placeholder="1000"
                value={maxStock}
                onChange={(e) => setMaxStock(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Ordenar por:</label>
              <select 
                value={orderBy} 
                onChange={(e) => setOrderBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="name">Nombre</option>
                <option value="quantity">Cantidad</option>
                <option value="brand">Marca</option>
                <option value="serial_number">Serie</option>
              </select>
            </div>
            
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Dirección:</label>
              <select 
                value={orderDir} 
                onChange={(e) => setOrderDir(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="asc">Ascendente</option>
                <option value="desc">Descendente</option>
              </select>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
            <button 
              onClick={setLowStockFilter}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: '1px solid #dc3545',
                backgroundColor: 'white',
                color: '#dc3545',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ⚠️ Stock bajo
            </button>
            <button 
              onClick={clearFilters}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: '1px solid #6c757d',
                backgroundColor: 'white',
                color: '#6c757d',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🗑️ Limpiar filtros
            </button>
            <button 
              onClick={fetchProducts} 
              disabled={loading}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: '#007bff',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {loading ? '⏳ Cargando...' : '🔄 Actualizar'}
            </button>
          </div>
        </div>

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h2>Productos en Inventario ({products.length})</h2>
        </div>
        
        {error && (
          <div style={{background: '#fff3cd', padding: '10px', borderRadius: '5px', marginBottom: '20px', color: '#856404'}}>
            {error}
          </div>
        )}
        
        <ul className="products-list">
          {products.map(p => {
            const stockStatus = p.quantity <= 10 ? 'low' : p.quantity <= 50 ? 'medium' : 'high';
            const stockColor = stockStatus === 'low' ? '#dc3545' : stockStatus === 'medium' ? '#ffc107' : '#28a745';
            
            return (
              <li key={p.id} style={{
                border: `1px solid ${stockStatus === 'low' ? '#dc3545' : '#e9ecef'}`,
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '10px',
                backgroundColor: stockStatus === 'low' ? '#fff5f5' : 'white'
              }}>
                <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
                  <div className="product-info" style={{flex: 1}}>
                    <div className="product-name" style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#495057',
                      marginBottom: '8px'
                    }}>
                      {p.name}
                      {stockStatus === 'low' && <span style={{marginLeft: '10px', fontSize: '14px'}}>⚠️</span>}
                    </div>
                    <div className="product-details" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '10px',
                      fontSize: '14px',
                      color: '#6c757d'
                    }}>
                      <div><strong>Serie:</strong> {p.serial_number || 'N/A'}</div>
                      <div><strong>Marca:</strong> {p.brand || 'N/A'}</div>
                      <div><strong>Categoría:</strong> {p.category_name || 'Sin categoría'}</div>
                      <div><strong>Ubicación:</strong> {p.location || 'N/A'}</div>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    marginLeft: '20px'
                  }}>
                    <div style={{
                      textAlign: 'center',
                      minWidth: '80px',
                      maxWidth: '90px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: stockColor,
                      color: 'white'
                    }}>
                      <div style={{fontSize: '16px', fontWeight: 'bold'}}>{p.quantity}</div>
                      <div style={{fontSize: '10px', opacity: 0.9}}>unidades</div>
                      {stockStatus === 'low' && (
                        <div style={{fontSize: '9px', marginTop: '2px'}}>STOCK BAJO</div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
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

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
  const [expandedProducts, setExpandedProducts] = useState(new Set()); // Para controlar productos expandidos

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
      
      // Verificar que la respuesta sea un array
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else if (response.data && Array.isArray(response.data.products)) {
        // Si viene en formato { products: [...] }
        setProducts(response.data.products);
      } else {
        console.error('Response is not an array:', response.data);
        setProducts([]);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('No se pudo conectar al backend. Mostrando datos de ejemplo.');
      
      // Datos de ejemplo como fallback
      const mockProducts = [
        { id: 1, name: 'Tuerca M8', serial_number: 'TM8-001', location: 'Estante A1', brand: 'ACME', quantity: 150, category_name: 'Sujetadores', image_url: 'https://via.placeholder.com/80x80?text=🔩' },
        { id: 2, name: 'Tornillo M6x20', serial_number: 'TM6-020', location: 'Estante A2', brand: 'Stanley', quantity: 200, category_name: 'Sujetadores', image_url: 'https://via.placeholder.com/80x80?text=🔧' },
        { id: 3, name: 'Arandela 8mm', serial_number: 'AR8-001', location: 'Estante B1', brand: 'Bosch', quantity: 75, category_name: 'Sujetadores', image_url: null },
        { id: 4, name: 'Perno M10x30', serial_number: 'PM10-030', location: 'Estante B2', brand: 'Makita', quantity: 90, category_name: 'Sujetadores', image_url: 'https://via.placeholder.com/80x80?text=⚙️' },
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

  const toggleProductExpansion = (productId) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
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
          <h2>Productos en Inventario ({Array.isArray(products) ? products.length : 0})</h2>
        </div>
        
        {error && (
          <div style={{background: '#fff3cd', padding: '10px', borderRadius: '5px', marginBottom: '20px', color: '#856404'}}>
            {error}
          </div>
        )}
        
        <ul className="products-list">
          {Array.isArray(products) && products.map(p => {
            const stockStatus = p.quantity <= 10 ? 'low' : p.quantity <= 50 ? 'medium' : 'high';
            const stockColor = stockStatus === 'low' ? '#dc3545' : stockStatus === 'medium' ? '#ffc107' : '#28a745';
            const isExpanded = expandedProducts.has(p.id);
            
            return (
              <li key={p.id} style={{
                border: `1px solid ${stockStatus === 'low' ? '#dc3545' : '#e9ecef'}`,
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '10px',
                backgroundColor: stockStatus === 'low' ? '#fff5f5' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isExpanded ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)'
              }}
              onClick={() => toggleProductExpansion(p.id)}
              >
                <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
                  {/* Contenedor de imagen */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    marginRight: '15px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '2px solid #e9ecef',
                    backgroundColor: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {p.image_url && p.image_url.trim() !== '' ? (
                      <img 
                        src={p.image_url} 
                        alt={p.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{
                      display: (p.image_url && p.image_url.trim() !== '') ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      fontSize: '24px',
                      color: '#6c757d'
                    }}>
                      📦
                    </div>
                  </div>
                  
                  {/* Información básica del producto */}
                  <div className="product-info" style={{flex: 1}}>
                    <div className="product-name" style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#495057',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {p.name}
                      {stockStatus === 'low' && <span style={{marginLeft: '10px', fontSize: '14px'}}>⚠️</span>}
                      <span style={{
                        marginLeft: 'auto',
                        fontSize: '14px',
                        color: '#6c757d',
                        transition: 'transform 0.2s ease',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}>
                        ▼
                      </span>
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
                  
                  {/* Indicador de cantidad */}
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
                
                {/* Panel expandido con información adicional */}
                {isExpanded && (
                  <div style={{
                    marginTop: '15px',
                    paddingTop: '15px',
                    borderTop: '1px solid #e9ecef',
                    backgroundColor: '#f8f9fa',
                    margin: '15px -15px -15px -15px',
                    padding: '20px',
                    borderRadius: '0 0 8px 8px'
                  }}>
                    <h4 style={{margin: '0 0 15px 0', color: '#495057', fontSize: '16px'}}>
                      📋 Información Detallada
                    </h4>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '15px',
                      marginBottom: '15px'
                    }}>
                      <div className="detail-card" style={{
                        backgroundColor: 'white',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #e9ecef'
                      }}>
                        <div style={{fontWeight: '600', color: '#495057', marginBottom: '8px'}}>🏷️ Identificación</div>
                        <div style={{fontSize: '14px', color: '#6c757d', lineHeight: '1.4'}}>
                          <div><strong>SKU:</strong> {p.sku || 'No asignado'}</div>
                          <div><strong>N° Serie:</strong> {p.serial_number || 'No asignado'}</div>
                          <div><strong>Descripción:</strong> {p.description || 'Sin descripción'}</div>
                        </div>
                      </div>
                      
                      <div className="detail-card" style={{
                        backgroundColor: 'white',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #e9ecef'
                      }}>
                        <div style={{fontWeight: '600', color: '#495057', marginBottom: '8px'}}>📊 Control de Stock</div>
                        <div style={{fontSize: '14px', color: '#6c757d', lineHeight: '1.4'}}>
                          <div><strong>Stock Actual:</strong> <span style={{color: stockColor, fontWeight: 'bold'}}>{p.quantity}</span></div>
                          <div><strong>Stock Mínimo:</strong> {p.min_stock || 0}</div>
                          <div><strong>Stock Máximo:</strong> {p.max_stock || 'Sin límite'}</div>
                          <div><strong>Unidad:</strong> {p.unit_of_measure || 'unidades'}</div>
                        </div>
                      </div>
                      
                      <div className="detail-card" style={{
                        backgroundColor: 'white',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #e9ecef'
                      }}>
                        <div style={{fontWeight: '600', color: '#495057', marginBottom: '8px'}}>⚙️ Estado y Control</div>
                        <div style={{fontSize: '14px', color: '#6c757d', lineHeight: '1.4'}}>
                          <div><strong>Estado:</strong> 
                            <span style={{
                              marginLeft: '8px',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              backgroundColor: p.is_active ? '#d4edda' : '#f8d7da',
                              color: p.is_active ? '#155724' : '#721c24'
                            }}>
                              {p.is_active ? '✅ Activo' : '❌ Inactivo'}
                            </span>
                          </div>
                          <div><strong>Control de Vencimiento:</strong> 
                            <span style={{
                              marginLeft: '8px',
                              color: p.requires_expiry_control ? '#dc3545' : '#6c757d'
                            }}>
                              {p.requires_expiry_control ? '⏰ Requerido' : '🔒 No aplica'}
                            </span>
                          </div>
                          <div><strong>Ubicación:</strong> {p.location || 'Sin ubicación'}</div>
                        </div>
                      </div>
                      
                      <div className="detail-card" style={{
                        backgroundColor: 'white',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #e9ecef'
                      }}>
                        <div style={{fontWeight: '600', color: '#495057', marginBottom: '8px'}}>📅 Fechas</div>
                        <div style={{fontSize: '14px', color: '#6c757d', lineHeight: '1.4'}}>
                          <div><strong>Creado:</strong> {formatDate(p.created_at)}</div>
                          <div><strong>Actualizado:</strong> {formatDate(p.updated_at)}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Sección de imagen expandida si existe */}
                    {p.image_url && p.image_url.trim() !== '' && (
                      <div style={{
                        backgroundColor: 'white',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #e9ecef',
                        textAlign: 'center'
                      }}>
                        <div style={{fontWeight: '600', color: '#495057', marginBottom: '8px'}}>🖼️ Imagen del Producto</div>
                        <img 
                          src={p.image_url} 
                          alt={p.name}
                          style={{
                            maxWidth: '200px',
                            maxHeight: '200px',
                            borderRadius: '8px',
                            border: '1px solid #e9ecef'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div style={{display: 'none', color: '#6c757d', fontStyle: 'italic'}}>
                          Error cargando imagen
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        {(!Array.isArray(products) || products.length === 0) && !loading && (
          <p style={{textAlign: 'center', color: '#666', padding: '40px'}}>
            No hay productos registrados en el inventario
          </p>
        )}
      </div>
    </div>
  );
}

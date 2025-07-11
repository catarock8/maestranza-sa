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
  const [imageModal, setImageModal] = useState({ isOpen: false, imageUrl: '', productName: '' }); // Para el modal de imagen

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
    setMinStock('0');
    setMaxStock('10');
    setOrderBy('quantity');
    setOrderDir('asc');
    // Forzar recarga inmediata de productos al aplicar filtro de stock bajo
    setTimeout(fetchProducts, 0);
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

  const openImageModal = (imageUrl, productName) => {
    setImageModal({ isOpen: true, imageUrl, productName });
  };

  const closeImageModal = () => {
    setImageModal({ isOpen: false, imageUrl: '', productName: '' });
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
        
        <ul className="products-list" style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
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
                boxShadow: isExpanded ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)',
                display: 'block',
                width: '100%',
                boxSizing: 'border-box',
                maxWidth: '100%',
                overflow: 'hidden'
              }}
              onClick={() => toggleProductExpansion(p.id)}
              >
                <div style={{display: 'flex', alignItems: 'center', width: '100%', boxSizing: 'border-box', minWidth: 0}}>
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
                    flexShrink: 0,
                    cursor: p.image_url && p.image_url.trim() !== '' ? 'pointer' : 'default',
                    transition: 'transform 0.2s ease'
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // Evitar que se expanda el producto al hacer clic en la imagen
                    if (p.image_url && p.image_url.trim() !== '') {
                      openImageModal(p.image_url, p.name);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (p.image_url && p.image_url.trim() !== '') {
                      e.target.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}
                  >
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
                
                {/* Panel expandido con información adicional - DENTRO DEL CONTENEDOR */}
                {isExpanded && (
                  <div style={{
                    width: '100%',
                    maxWidth: '100%',
                    marginTop: '20px',
                    borderTop: '2px solid #e9ecef',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '0 0 8px 8px',
                    padding: window.innerWidth <= 768 ? '10px' : '15px',
                    clear: 'both',
                    display: 'block',
                    boxSizing: 'border-box',
                    overflow: 'hidden'
                  }}>
                    <h4 style={{margin: '0 0 15px 0', color: '#495057', fontSize: '18px', textAlign: 'center'}}>
                      📋 Información Detallada
                    </h4>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: window.innerWidth <= 768 
                        ? '1fr' 
                        : window.innerWidth <= 1024 
                          ? 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))' 
                          : 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))',
                      gap: window.innerWidth <= 768 ? '10px' : '15px',
                      marginBottom: '0',
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box'
                    }}>
                      <div className="detail-card" style={{
                        backgroundColor: 'white',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #e9ecef',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        minWidth: 0,
                        overflow: 'hidden'
                      }}>
                        <div style={{fontWeight: '600', color: '#495057', marginBottom: '10px', fontSize: '14px'}}>🏷️ Identificación</div>
                        <div style={{fontSize: '13px', color: '#6c757d', lineHeight: '1.4'}}>
                          <div style={{marginBottom: '4px', wordBreak: 'break-word'}}><strong>SKU:</strong> {p.sku || 'No asignado'}</div>
                          <div style={{marginBottom: '4px', wordBreak: 'break-word'}}><strong>N° Serie:</strong> {p.serial_number || 'No asignado'}</div>
                          <div style={{wordBreak: 'break-word'}}><strong>Descripción:</strong> {p.description || 'Sin descripción'}</div>
                        </div>
                      </div>
                      
                      <div className="detail-card" style={{
                        backgroundColor: 'white',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #e9ecef',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        minWidth: 0,
                        overflow: 'hidden'
                      }}>
                        <div style={{fontWeight: '600', color: '#495057', marginBottom: '10px', fontSize: '14px'}}>📊 Control de Stock</div>
                        <div style={{fontSize: '13px', color: '#6c757d', lineHeight: '1.4'}}>
                          <div style={{marginBottom: '4px'}}><strong>Stock Actual:</strong> <span style={{color: stockColor, fontWeight: 'bold'}}>{p.quantity}</span></div>
                          <div style={{marginBottom: '4px'}}><strong>Stock Mínimo:</strong> {p.min_stock || 0}</div>
                          <div style={{marginBottom: '4px'}}><strong>Stock Máximo:</strong> {p.max_stock || 'Sin límite'}</div>
                          <div><strong>Unidad:</strong> {p.unit_of_measure || 'unidades'}</div>
                        </div>
                      </div>
                      
                      <div className="detail-card" style={{
                        backgroundColor: 'white',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #e9ecef',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        minWidth: 0,
                        overflow: 'hidden'
                      }}>
                        <div style={{fontWeight: '600', color: '#495057', marginBottom: '10px', fontSize: '14px'}}>⚙️ Estado y Control</div>
                        <div style={{fontSize: '13px', color: '#6c757d', lineHeight: '1.4'}}>
                          <div style={{marginBottom: '4px'}}><strong>Estado:</strong> 
                            <span style={{
                              marginLeft: '6px',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              backgroundColor: p.is_active ? '#d4edda' : '#f8d7da',
                              color: p.is_active ? '#155724' : '#721c24'
                            }}>
                              {p.is_active ? '✅ Activo' : '❌ Inactivo'}
                            </span>
                          </div>
                          <div style={{marginBottom: '4px'}}><strong>Control de Vencimiento:</strong> 
                            <span style={{
                              marginLeft: '6px',
                              color: p.requires_expiry_control ? '#dc3545' : '#6c757d',
                              fontSize: '12px'
                            }}>
                              {p.requires_expiry_control ? '⏰ Requerido' : '🔒 No aplica'}
                            </span>
                          </div>
                          {p.requires_expiry_control && p.expiry_date && (
                            <div style={{marginBottom: '4px'}}>
                              <strong>Vence el:</strong> <span style={{color: '#dc3545', fontWeight: 600}}>{formatDate(p.expiry_date)}</span>
                            </div>
                          )}
                          <div style={{wordBreak: 'break-word'}}><strong>Ubicación:</strong> {p.location || 'Sin ubicación'}</div>
                        </div>
                      </div>
                      
                      <div className="detail-card" style={{
                        backgroundColor: 'white',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #e9ecef',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        minWidth: 0,
                        overflow: 'hidden'
                      }}>
                        <div style={{fontWeight: '600', color: '#495057', marginBottom: '10px', fontSize: '14px'}}>📅 Fechas</div>
                        <div style={{fontSize: '13px', color: '#6c757d', lineHeight: '1.4'}}>
                          <div style={{marginBottom: '4px'}}><strong>Creado:</strong> {formatDate(p.created_at)}</div>
                          <div><strong>Actualizado:</strong> {formatDate(p.updated_at)}</div>
                        </div>
                      </div>
                    </div>
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
      
      {/* Modal para mostrar imagen ampliada */}
      {imageModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={closeImageModal}
        >
          <div style={{
            position: 'relative',
            maxWidth: '90%',
            maxHeight: '90%',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={closeImageModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
            <h3 style={{margin: '0 0 15px 0', color: '#495057', textAlign: 'center'}}>
              {imageModal.productName}
            </h3>
            <img 
              src={imageModal.imageUrl} 
              alt={imageModal.productName}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                borderRadius: '8px',
                display: 'block',
                margin: '0 auto'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div style={{
              display: 'none', 
              textAlign: 'center', 
              color: '#6c757d', 
              fontStyle: 'italic',
              marginTop: '20px'
            }}>
              Error cargando imagen
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';


import { Link } from 'react-router-dom';
import api from '../api';

export default function Reports() {
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalQuantity: 0,
    lowStock: 0,
    nearExpiry: 0
  });
  const [topProducts, setTopProducts] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Obtener todos los productos
      const response = await api.get('/products');
      let products = Array.isArray(response.data) ? response.data : (response.data.products || []);
      // DEBUG: guardar productos en archivo para inspección
      try {
        await fetch('/src/debug_products.json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(products)
        });
      } catch (e) { /* ignorar */ }
      // Normalizar quantity y min_stock a número
      products = products.map(p => ({
        ...p,
        quantity: typeof p.quantity === 'string' ? parseFloat(p.quantity) : (p.quantity ?? 0),
        min_stock: typeof p.min_stock === 'string' ? parseFloat(p.min_stock) : (p.min_stock ?? undefined)
      }));

      // Total productos
      const totalProducts = products.length;
      // Cantidad total
      const totalQuantity = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
      // Stock bajo (criterio igual a Products.jsx: quantity <= 10)
      const lowStockList = products.filter(p => p.quantity <= 10);
      const lowStock = lowStockList.length;
      // Próximos a vencer (expiry_date en los próximos 30 días)
      const now = new Date();
      const in30d = new Date(now.getTime() + 30*24*60*60*1000);
      const nearExpiry = products.filter(p => p.expiry_date && new Date(p.expiry_date) <= in30d && new Date(p.expiry_date) >= now).length;
      // Top productos por cantidad
      const topProductsSorted = [...products].sort((a, b) => (b.quantity || 0) - (a.quantity || 0)).slice(0, 4);

      // Productos por categoría
      const categoryMap = {};
      products.forEach(p => {
        const cat = p.category_name || 'Sin categoría';
        if (!categoryMap[cat]) categoryMap[cat] = 0;
        categoryMap[cat] += 1;
      });
      const productsByCategory = Object.entries(categoryMap).map(([category, count]) => ({ category, count }));

      // Productos registrados este mes
      const nowDate = new Date();
      const thisMonth = nowDate.getMonth();
      const thisYear = nowDate.getFullYear();
      const recentProducts = products.filter(p => {
        if (!p.created_at) return false;
        const d = new Date(p.created_at);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      }).map(p => ({
        name: p.name,
        created_at: p.created_at
      }));

      setStats({ totalProducts, totalQuantity, lowStock, nearExpiry });
      setTopProducts(topProductsSorted.map(p => ({
        name: p.name,
        quantity: p.quantity,
        brand: p.brand,
        category: p.category_name || (p.categories && p.categories.name),
        location: p.location,
        image_url: p.image_url
      })));
      setProductsByCategory(productsByCategory);
      setRecentProducts(recentProducts);
      setLowStockProducts(lowStockList);
      setError('');
    } catch (err) {
      setError('No se pudo obtener estadísticas.');
    } finally {
      setLoading(false);
    }
  };

  // Generar PDF profesional del informe de inventario
  const handleGeneratePDF = async () => {
    setGeneratingPDF(true);
    try {
      const [{ default: jsPDF }, autoTable] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);
      const doc = new jsPDF('p', 'pt');
      // Resumen de estadísticas y tablas
      const pageWidth = doc.internal.pageSize.getWidth();
      const now = new Date();
      // Portada
      doc.setFontSize(22);
      doc.text('Informe de Inventario', pageWidth / 2, 60, { align: 'center' });
      doc.setFontSize(13);
      doc.text(`Fecha de generación: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, pageWidth / 2, 85, { align: 'center' });
      doc.setLineWidth(1);
      doc.line(40, 100, pageWidth - 40, 100);

      // Resumen de estadísticas
      doc.setFontSize(16);
      doc.text('Resumen General', 50, 130);
      doc.setFontSize(12);
      autoTable.default(doc, {
        startY: 140,
        head: [['Total Productos', 'Cantidad Total', 'Stock Bajo', 'Próximos a Vencer']],
        body: [[
          stats.totalProducts,
          stats.totalQuantity,
          stats.lowStock,
          stats.nearExpiry
        ]],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        bodyStyles: { fontStyle: 'bold' },
        styles: { halign: 'center' }
      });

      // Productos por categoría
      let y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 30 : 200;
      doc.setFontSize(15);
      doc.text('Productos por Categoría', 50, y);
      autoTable.default(doc, {
        startY: y + 10,
        head: [['Categoría', 'Cantidad de Productos']],
        body: productsByCategory.map(row => [row.category, row.count]),
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219], textColor: 255 },
        styles: { fontSize: 11 }
      });

      // Top productos por cantidad
      y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 30 : y + 100;
      doc.setFontSize(15);
      doc.text('Top Productos por Cantidad', 50, y);
      autoTable.default(doc, {
        startY: y + 10,
        head: [['Nombre', 'Cantidad', 'Marca', 'Categoría', 'Ubicación']],
        body: topProducts.map(p => [
          p.name,
          p.quantity,
          p.brand || '-',
          p.category || '-',
          p.location || '-'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [39, 174, 96], textColor: 255 },
        styles: { fontSize: 11 }
      });

      // Productos registrados este mes
      y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 30 : y + 100;
      doc.setFontSize(15);
      doc.text('Productos Registrados Este Mes', 50, y);
      autoTable.default(doc, {
        startY: y + 10,
        head: [['Nombre', 'Fecha de Registro']],
        body: recentProducts.map(p => [p.name, p.created_at ? new Date(p.created_at).toLocaleDateString() : '-']),
        theme: 'grid',
        headStyles: { fillColor: [241, 196, 15], textColor: 44 },
        styles: { fontSize: 11 }
      });

      // Productos en stock bajo
      y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 30 : y + 100;
      doc.setFontSize(15);
      doc.text('Productos en Stock Bajo', 50, y);
      autoTable.default(doc, {
        startY: y + 10,
        head: [['Nombre', 'Cantidad', 'Mínimo', 'Marca', 'Categoría', 'Ubicación']],
        body: lowStockProducts.map(p => [
          p.name,
          p.quantity,
          p.min_stock ?? 10,
          p.brand || '-',
          p.category || p.category_name || (p.categories && p.categories.name) || '-',
          p.location || '-'
        ]),
        theme: 'grid',
        headStyles: { fillColor: [231, 76, 60], textColor: 255 },
        bodyStyles: row => ({ textColor: row.row.index % 2 === 0 ? [44,44,44] : [220,53,69] }),
        styles: { fontSize: 11 }
      });

      // Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Maestranza S.A. · Informe generado el ${now.toLocaleString()} · Página ${i} de ${pageCount}`,
          pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' });
      }

      doc.save(`informe_inventario_${now.toLocaleDateString().replace(/\//g,'-')}.pdf`);
    } catch (err) {
      alert('Error al generar el PDF. Intenta recargar la página.');
    } finally {
      setGeneratingPDF(false);
    }
  };
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
            <div className="stat-number">{loading ? '...' : stats.totalProducts}</div>
          </div>
          <div className="stat-card">
            <h3>Cantidad Total</h3>
            <div className="stat-number">{loading ? '...' : stats.totalQuantity}</div>
          </div>
          <div className="stat-card">
            <h3>Stock Bajo</h3>
            <div className="stat-number danger">{loading ? '...' : stats.lowStock}</div>
          </div>
          <div className="stat-card">
            <h3>Próximos a Vencer</h3>
            <div className="stat-number warning">{loading ? '...' : stats.nearExpiry}</div>
          </div>
        </div>

        {/* Resúmenes adicionales */}
        <div className="content-card" style={{marginBottom: 32}}>
          <h2>Productos por Categoría</h2>
          <div className="category-summary">
            {loading ? (
              <div>Cargando...</div>
            ) : (
              <table style={{width: '100%', marginBottom: 16, borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{background: '#e3f0fa'}}>
                    <th style={{padding: 8, textAlign: 'left'}}>Categoría</th>
                    <th style={{padding: 8, textAlign: 'right'}}>Cantidad de Productos</th>
                  </tr>
                </thead>
                <tbody>
                  {productsByCategory.map((row, idx) => (
                    <tr key={idx} style={{borderBottom: '1px solid #e9ecef'}}>
                      <td style={{padding: 8}}>{row.category}</td>
                      <td style={{padding: 8, textAlign: 'right'}}>{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="content-card" style={{marginBottom: 32}}>
          <h2>Productos Registrados Este Mes</h2>
          <div className="recent-products-summary">
            {loading ? (
              <div>Cargando...</div>
            ) : recentProducts.length === 0 ? (
              <div style={{ color: '#28a745' }}>No hay productos registrados este mes.</div>
            ) : (
              <table style={{width: '100%', marginBottom: 16, borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{background: '#fffbe6'}}>
                    <th style={{padding: 8, textAlign: 'left'}}>Nombre</th>
                    <th style={{padding: 8, textAlign: 'left'}}>Fecha de Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProducts.map((row, idx) => (
                    <tr key={idx} style={{borderBottom: '1px solid #e9ecef'}}>
                      <td style={{padding: 8}}>{row.name}</td>
                      <td style={{padding: 8}}>{row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Resto de los reportes */}
        <div className="content-card" style={{marginBottom: 32}}>
          <h2>Top Productos por Cantidad</h2>
          <div className="top-products">
            {loading ? (
              <div>Cargando...</div>
            ) : (
              topProducts.map((product, index) => (
                <div key={index} className="product-row" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: index !== topProducts.length - 1 ? '1px solid #e9ecef' : 'none',
                  fontSize: '16px',
                  fontWeight: 500
                }}>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} style={{
                        width: 48,
                        height: 48,
                        objectFit: 'cover',
                        borderRadius: 8,
                        marginRight: 16,
                        border: '1px solid #e9ecef',
                        background: '#f8f9fa'
                      }} />
                    ) : (
                      <div style={{
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 8,
                        marginRight: 16,
                        border: '1px solid #e9ecef',
                        background: '#f8f9fa',
                        fontSize: 28
                      }}>
                        <span role="img" aria-label="Sin imagen">📦</span>
                      </div>
                    )}
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                      <span className="product-name" style={{fontWeight: 600, color: '#222'}}>{product.name}</span>
                      <span style={{fontSize: '13px', color: '#666'}}>
                        {product.brand && <span>Marca: <b>{product.brand}</b> </span>}
                        {product.category && <span>· Categoría: <b>{product.category}</b> </span>}
                        {product.location && <span>· Ubicación: <b>{product.location}</b></span>}
                      </span>
                    </div>
                  </div>
                  <span className="product-quantity" style={{
                    background: '#f1f3f4',
                    borderRadius: '16px',
                    padding: '6px 18px',
                    fontWeight: 700,
                    color: '#333',
                    fontSize: '15px',
                    minWidth: '90px',
                    textAlign: 'center'
                  }}>{product.quantity} unidades</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="content-card" style={{marginBottom: 32}}>
          <h2>Productos en Stock Bajo</h2>
          <div className="low-stock-products">
            {loading ? (
              <div>Cargando...</div>
            ) : lowStockProducts.length === 0 ? (
              <div style={{ color: '#28a745' }}>No hay productos en stock bajo.</div>
            ) : (
              lowStockProducts.map((product, index) => {
                // Asegurar que category esté presente
                const category = product.category || product.category_name || (product.categories && product.categories.name) || '';
                return (
                  <div key={index} className="product-row" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: index !== lowStockProducts.length - 1 ? '1px solid #e9ecef' : 'none',
                    fontSize: '16px',
                    fontWeight: 500
                  }}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} style={{
                          width: 48,
                          height: 48,
                          objectFit: 'cover',
                          borderRadius: 8,
                          marginRight: 16,
                          border: '1px solid #e9ecef',
                          background: '#f8f9fa'
                        }} />
                      ) : (
                        <div style={{
                          width: 48,
                          height: 48,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 8,
                          marginRight: 16,
                          border: '1px solid #e9ecef',
                          background: '#f8f9fa',
                          fontSize: 28
                        }}>
                          <span role="img" aria-label="Sin imagen">📦</span>
                        </div>
                      )}
                      <div style={{display: 'flex', flexDirection: 'column'}}>
                        <span className="product-name" style={{fontWeight: 600, color: '#222'}}>{product.name}</span>
                        <span style={{fontSize: '13px', color: '#666'}}>
                          {product.brand && <span>Marca: <b>{product.brand}</b> </span>}
                          {category && <span>· Categoría: <b>{category}</b> </span>}
                          {product.location && <span>· Ubicación: <b>{product.location}</b></span>}
                        </span>
                      </div>
                    </div>
                    <span className="product-quantity danger" style={{
                      background: '#ffe5e9', // rojo muy claro
                      borderRadius: '16px',
                      padding: '6px 18px',
                      fontWeight: 700,
                      color: '#c82333',
                      fontSize: '15px',
                      minWidth: '90px',
                      textAlign: 'center',
                      display: 'inline-block',
                      boxShadow: '0 2px 8px rgba(220,53,69,0.04)'
                    }}>{product.quantity} <span style={{fontWeight: 400, fontSize: '13px'}}>/ mín. {product.min_stock ?? 10}</span></span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="content-card" style={{marginBottom: 32}}>
          <h2>Acciones Rápidas</h2>
          <div className="quick-actions">
            <button className="btn-primary" onClick={handleGeneratePDF} disabled={generatingPDF}>
              {generatingPDF ? 'Generando PDF...' : 'Generar Reporte PDF'}
            </button>
            <button className="btn-secondary" disabled={generatingPDF}>Exportar Excel</button>
            <button className="btn-secondary" disabled={generatingPDF}>Configurar Alertas</button>
          </div>
          {generatingPDF && (
            <div style={{marginTop: 12, color: '#007bff', fontWeight: 500}}>
              Generando informe PDF, por favor espera...
            </div>
          )}
        </div>
        {error && <div style={{color: 'red', marginTop: 20}}>{error}</div>}
      </div>
    </div>


  );
}


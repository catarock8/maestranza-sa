import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { fetchCategories } from '../api.categories';

export default function AddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    brand: '',
    location: '',
    quantity: 0,
    min_stock: 0,
    max_stock: '',
    unit_of_measure: 'unidades',
    unit_cost: '',
    image_url: '',
    requires_expiry_control: false,
    category_id: '',
    expiry_date: ''
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    fetchCategories().then(data => {
      setCategories(Array.isArray(data) ? data : (data.categories || []));
    });
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // 1. Crear producto
      const { expiry_date, ...productData } = form;
      const resp = await api.post('/products', productData);
      // 2. Si requiere vencimiento y hay fecha, crear registro en expiries
      if (form.requires_expiry_control && expiry_date && resp.data && resp.data.id) {
        await api.post('/expiries', { product_id: resp.data.id, expiry_date });
      }
      setSuccess('Producto agregado correctamente');
      setTimeout(() => navigate('/products'), 1200);
    } catch (err) {
      setError('Error al agregar producto. Revisa los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page" style={{maxWidth: 600, margin: '0 auto', padding: 32}}>
      <h2>Agregar Nuevo Producto</h2>
      <form onSubmit={handleSubmit} className="add-product-form" style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <label>
          Nombre del producto
          <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre" required />
        </label>
        <label>
          Descripción
          <input name="description" value={form.description} onChange={handleChange} placeholder="Descripción" />
        </label>
        <label>
          Categoría
          <select name="category_id" value={form.category_id} onChange={handleChange} required>
            <option value="">Selecciona una categoría</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </label>
        <label>
          Marca
          <input name="brand" value={form.brand} onChange={handleChange} placeholder="Marca" />
        </label>
        <label>
          Ubicación
          <input name="location" value={form.location} onChange={handleChange} placeholder="Ubicación" />
        </label>
        <label>
          Cantidad
          <input name="quantity" type="number" value={form.quantity} onChange={handleChange} placeholder="Cantidad" required />
        </label>
        <label>
          Stock Mínimo
          <input name="min_stock" type="number" value={form.min_stock} onChange={handleChange} placeholder="Stock Mínimo" />
        </label>
        <label>
          Stock Máximo
          <input name="max_stock" type="number" value={form.max_stock} onChange={handleChange} placeholder="Stock Máximo" />
        </label>
        <label>
          Unidad de Medida
          <input name="unit_of_measure" value={form.unit_of_measure} onChange={handleChange} placeholder="Unidad de Medida" />
        </label>
        <label>
          Costo Unitario
          <input name="unit_cost" type="number" value={form.unit_cost} onChange={handleChange} placeholder="Costo Unitario" />
        </label>
        <label>
          URL Imagen
          <input name="image_url" value={form.image_url} onChange={handleChange} placeholder="URL Imagen" />
        </label>
        <label style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <input name="requires_expiry_control" type="checkbox" checked={form.requires_expiry_control} onChange={handleChange} />
          Requiere control de vencimiento
        </label>
        {form.requires_expiry_control && (
          <label>
            Fecha de vencimiento
            <input
              name="expiry_date"
              type="date"
              value={form.expiry_date}
              onChange={handleChange}
              required={form.requires_expiry_control}
            />
          </label>
        )}
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Agregando...' : 'Agregar Producto'}</button>
        {error && <div style={{color: 'red'}}>{error}</div>}
        {success && <div style={{color: 'green'}}>{success}</div>}
      </form>
    </div>
  );
}

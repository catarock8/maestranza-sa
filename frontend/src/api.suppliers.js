import api from './api';

export async function fetchSuppliers() {
  const res = await api.get('/suppliers');
  return res.data;
}

export async function addExpiry(product_id, expiry_date) {
  // expiry_date debe ser YYYY-MM-DD
  return api.post('/expiries', { product_id, expiry_date });
}

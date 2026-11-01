import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../../services/api.js'

function ProductForm({ initial = null }) {
  const navigate = useNavigate(); const { id } = useParams(); const [form, setForm] = useState(initial || { name: '', category: 'iPhone', storage: '', color: '', description: '', price: '', image_url: '', stock: 0 }); const [error, setError] = useState('')
  const submit = async (e) => { e.preventDefault(); try { const payload = { ...form, price: Number(form.price), stock: Number(form.stock) }; if (id) await API.put(`/admin/products/${id}`, payload); else await API.post('/admin/products', payload); navigate('/admin/products') } catch (err) { setError(err.response?.data?.message || 'Unable to save product.') } }
  return <form className="card bg-dark border-secondary p-4" onSubmit={submit}>{error && <div className="alert alert-danger">{error}</div>}<div className="row g-3">{[['name', 'Name'], ['category', 'Category'], ['storage', 'Storage'], ['color', 'Color'], ['price', 'Price'], ['image_url', 'Image URL'], ['stock', 'Stock']].map(([key, label]) => <label className="col-md-6 form-label" key={key}>{label}<input className="form-control bg-black text-light border-secondary mt-2" required={['name', 'storage', 'color', 'price'].includes(key)} type={key === 'price' || key === 'stock' ? 'number' : 'text'} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>)}<label className="col-12 form-label">Description<textarea className="form-control bg-black text-light border-secondary mt-2" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label></div><button className="btn btn-light" type="submit">{id ? 'Update product' : 'Create product'}</button></form>
}
export default ProductForm

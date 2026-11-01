import { useEffect, useState } from 'react'
import API from '../services/api.js'

const emptyProduct = { name: '', category: 'iPhone', storage: '', color: '', description: '', price: '', image_url: '', stock: 0, featured: false }

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0 })
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [productForm, setProductForm] = useState(emptyProduct)
  const [message, setMessage] = useState('')

  const loadData = async () => {
    const [statsResponse, usersResponse, productsResponse, ordersResponse] = await Promise.all([API.get('/admin/stats'), API.get('/admin/users'), API.get('/admin/products'), API.get('/admin/orders')])
    setStats(statsResponse.data.stats); setUsers(usersResponse.data.users); setProducts(productsResponse.data.products); setOrders(ordersResponse.data.orders)
  }
  useEffect(() => { loadData().catch((error) => setMessage(error.response?.data?.message || 'Unable to load admin data.')) }, [])
  const createProduct = async (event) => {
    event.preventDefault()
    try { await API.post('/admin/products', { ...productForm, price: Number(productForm.price), stock: Number(productForm.stock) }); setProductForm(emptyProduct); setMessage('Product created.'); await loadData() } catch (error) { setMessage(error.response?.data?.message || 'Unable to create product.') }
  }
  const updateRole = async (id, role) => { await API.patch(`/admin/users/${id}/role`, { role }); await loadData() }
  const deleteUser = async (id) => { if (window.confirm('Delete this customer?')) { await API.delete(`/admin/users/${id}`); await loadData() } }
  const deleteProduct = async (id) => { if (window.confirm('Delete this product?')) { await API.delete(`/admin/products/${id}`); await loadData() } }
  const updateStatus = async (id, status) => { await API.patch(`/admin/orders/${id}/status`, { status }); await loadData() }
  const field = (key, label) => <label className="col-md-6 form-label" key={key}>{label}<input className="form-control bg-black text-light border-secondary mt-2" required={key !== 'image_url'} value={productForm[key]} onChange={(event) => setProductForm({ ...productForm, [key]: event.target.value })} /></label>

  return <section>
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"><div><p className="text-secondary text-uppercase small fw-semibold mb-1">Operations</p><h1>Admin dashboard.</h1></div><span className="badge bg-secondary">Administrator</span></div>
    {message && <div className="alert alert-secondary">{message}</div>}
    <nav className="nav nav-pills mb-4 gap-2" aria-label="Admin sections">{['overview', 'products', 'users', 'orders'].map((tab) => <button className={`btn ${activeTab === tab ? 'btn-light' : 'btn-outline-secondary'}`} key={tab} type="button" onClick={() => setActiveTab(tab)}>{tab}</button>)}</nav>
    {activeTab === 'overview' && <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3">{[['Users', stats.users], ['Products', stats.products], ['Orders', stats.orders], ['Revenue', `$${Number(stats.revenue).toLocaleString()}`]].map(([label, value]) => <article className="col" key={label}><div className="card bg-dark border-secondary h-100"><div className="card-body"><p className="text-secondary mb-2">{label}</p><strong className="fs-3">{value}</strong></div></div></article>)}</div>}
    {activeTab === 'products' && <div className="row g-4"><form className="col-lg-5 card bg-dark border-secondary p-4" onSubmit={createProduct}><h2 className="h4 mb-3">Add product</h2><div className="row g-3">{['name', 'storage', 'color', 'price', 'image_url'].map((key) => field(key, key.replace('_', ' ')))}<label className="col-12 form-label">Description<textarea className="form-control bg-black text-light border-secondary mt-2" required value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} /></label><label className="col-12 form-label">Stock<input className="form-control bg-black text-light border-secondary mt-2" type="number" min="0" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} /></label></div><button className="btn btn-light mt-3" type="submit">Add product</button></form><div className="col-lg-7 table-responsive"><h2 className="h4">Catalogue</h2><table className="table table-dark table-hover"><thead><tr><th>Product</th><th>Price</th><th>Stock</th><th /></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td>{product.name}</td><td>${Number(product.price).toLocaleString()}</td><td>{product.stock}</td><td><button className="btn btn-outline-danger btn-sm" type="button" onClick={() => deleteProduct(product.id)}>Delete</button></td></tr>)}</tbody></table></div></div>}
    {activeTab === 'users' && <div className="table-responsive"><h2 className="h4">Customers</h2><table className="table table-dark table-hover"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th /></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td><select className="form-select form-select-sm bg-dark text-light border-secondary" value={user.role} onChange={(event) => updateRole(user.id, event.target.value)}><option value="customer">Customer</option><option value="admin">Admin</option></select></td><td><button className="btn btn-outline-danger btn-sm" type="button" onClick={() => deleteUser(user.id)}>Delete</button></td></tr>)}</tbody></table></div>}
    {activeTab === 'orders' && <div className="table-responsive"><h2 className="h4">Orders</h2><table className="table table-dark table-hover"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td>#{order.id}</td><td>{order.customer_name}<br /><small className="text-secondary">{order.customer_email}</small></td><td>${Number(order.total).toLocaleString()}</td><td><select className="form-select form-select-sm bg-dark text-light border-secondary" value={order.status} onChange={(event) => updateStatus(order.id, event.target.value)}>{['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div>}
  </section>
}

export default AdminDashboard

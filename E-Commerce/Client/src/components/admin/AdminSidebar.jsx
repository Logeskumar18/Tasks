import { NavLink } from 'react-router-dom'

const links = [['Dashboard', '/admin'], ['Products', '/admin/products'], ['Orders', '/admin/orders'], ['Customers', '/admin/customers'], ['Categories', '/admin/categories'], ['Sales Reports', '/admin/reports']]

function AdminSidebar() {
  return <aside className="col-12 col-lg-2 bg-dark border-end border-secondary p-3"><div className="fw-bold fs-5 mb-4">ShopEase <span className="badge bg-secondary">ADMIN</span></div><nav className="nav nav-pills flex-lg-column gap-1">{links.map(([label, path]) => <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active bg-light text-dark' : 'text-light'}`} key={path} to={path} end={path === '/admin'}>{label}</NavLink>)}</nav></aside>
}

export default AdminSidebar

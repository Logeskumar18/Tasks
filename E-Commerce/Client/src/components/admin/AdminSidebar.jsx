import { NavLink } from 'react-router-dom'

const links = [
  ['Dashboard', '/admin', 'bi-grid-1x2-fill'],
  ['Products', '/admin/products', 'bi-box-seam'],
  ['Orders', '/admin/orders', 'bi-cart-check'],
  ['Customers', '/admin/customers', 'bi-people'],
  ['Categories', '/admin/categories', 'bi-tags'],
  ['Sales Reports', '/admin/reports', 'bi-bar-chart-line'],
]

function AdminSidebar() {
  return (
    <aside
      className="col-12 col-lg-2 bg-dark border-end border-secondary p-3 sticky-lg-top"
      style={{ minHeight: 'calc(100vh - 78px)' }}
    >
      <div className="d-flex align-items-center gap-2 fw-bold fs-5 mb-4">
     
        <span>
          IPlant <span className="badge bg-secondary align-middle">ADMIN</span>
        </span>
      </div>

      <p className="text-secondary text-uppercase small fw-semibold mb-2">Workspace</p>
      <nav className="nav nav-pills flex-lg-column gap-1" aria-label="Admin navigation">
        {links.map(([label, path, icon]) => (
          <NavLink
            className={({ isActive }) => `nav-link d-flex align-items-center gap-3 ${isActive ? 'active bg-light text-dark' : 'text-light'}`}
            key={path}
            to={path}
            end={path === '/admin'}
          >
            <i className={`bi ${icon}`} aria-hidden="true"></i>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default AdminSidebar

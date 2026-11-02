
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

function Navbar({
  cartCount = 0,
  isAuthenticated = false,
  isAdmin = false,
  onLogout,
}) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSearch = (event) => {
    event.preventDefault()
    const search = query.trim()
    navigate(search ? `/products?search=${encodeURIComponent(search)}` : '/products')
  }

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark shadow-sm py-3">
      <div className="container">

        {/* Brand */}
        <Link
          className="navbar-brand fw-bold fs-4"
          to="/"
        >
          <i className="bi bi-flower1 text-success me-2"></i>
          IPlant<span className="text-success">.</span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#siteNav"
          aria-controls="siteNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links */}
        <div className="collapse navbar-collapse" id="siteNav">
          <div className="navbar-nav ms-auto align-items-md-center gap-md-2 pt-3 pt-md-0">

            <form className="d-flex my-2 my-md-0" onSubmit={handleSearch} role="search">
              <label className="visually-hidden" htmlFor="navbar-product-search">
                Search products
              </label>
              <div className="input-group input-group-sm">
                <input
                  id="navbar-product-search"
                  className="form-control bg-black border-secondary text-white"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products"
                  aria-label="Search products"
                />
                <button className="btn btn-outline-light" type="submit" aria-label="Submit product search">
                  <i className="bi bi-search" aria-hidden="true" />
                </button>
              </div>
            </form>

            <NavLink
              className={({ isActive }) =>
                `nav-link px-3 ${isActive ? 'active text-success fw-semibold' : 'text-light'}`
              }
              to="/"
              end
            >
              Home
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `nav-link px-3 ${isActive ? 'active text-success fw-semibold' : 'text-light'}`
              }
              to="/products"
            >
              Products
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `nav-link px-3 ${isActive ? 'active text-success fw-semibold' : 'text-light'}`
              }
              to="/orders"
            >
              Orders
            </NavLink>

            {isAdmin && (
              <NavLink
                className={({ isActive }) =>
                  `nav-link px-3 ${isActive ? 'active text-success fw-semibold' : 'text-light'}`
                }
                to="/admin"
              >
                Admin
              </NavLink>
            )}

            {isAuthenticated ? (
              <button
                className="btn btn-outline-light btn-sm rounded-pill px-3"
                type="button"
                onClick={onLogout}
              >
                <i className="bi bi-box-arrow-right me-1"></i>
                Log out
              </button>
            ) : (
              <NavLink
                className={({ isActive }) =>
                  `nav-link px-3 ${isActive ? 'active text-success fw-semibold' : 'text-light'}`
                }
                to="/login"
              >
                Login
              </NavLink>
            )}

            <NavLink
              className={({ isActive }) =>
                `nav-link px-3 ${isActive ? 'active text-success fw-semibold' : 'text-light'}`
              }
              to="/cart"
            >
              <i className="bi bi-bag me-1"></i>
              Cart
              <span className="badge rounded-pill bg-success ms-1">
                {cartCount}
              </span>
            </NavLink>

            <Link
              className="btn btn-success btn-sm rounded-pill px-4 ms-md-2 fw-semibold"
              to="/register"
            >
              Create account
            </Link>

          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

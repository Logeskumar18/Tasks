function AdminNavbar({ user, onLogout }) {
  return (
    <nav className="navbar navbar-dark bg-dark border-bottom border-secondary px-3 px-lg-5 py-3 sticky-top">
      <div className="container-fluid">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 bg-light text-dark d-flex align-items-center justify-content-center fw-bold fs-5 p-2">S</div>
          <div>
            <p className="text-secondary fw-semibold text-uppercase small mb-1">
              <i className="bi bi-stars me-2"></i>
              IPlant / Admin
            </p>
            <h5 className="fw-bold text-white mb-0">Welcome back, {user?.name || 'Admin'}</h5>
          </div>
        </div>
        <div className="d-none d-md-flex align-items-center gap-2 ms-auto me-4">
         
          <span className="text-secondary small">Control Center</span>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="d-none d-sm-flex align-items-center gap-2">
            <div className="rounded-circle bg-secondary text-white fw-bold d-flex align-items-center justify-content-center p-2">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="d-none d-lg-block">
              <div className="fw-semibold text-white">{user?.name || 'Admin'}</div>
              <small className="text-secondary">Administrator</small>
            </div>
          </div>
          <button type="button" className="btn btn-outline-light rounded-pill btn-sm px-3 py-2 fw-semibold" onClick={onLogout}>
            <i className="bi bi-box-arrow-right me-2"></i>
            Log out
          </button>
        </div>
      </div>
    </nav>
  )
}

export default AdminNavbar

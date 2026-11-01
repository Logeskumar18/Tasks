
import { useEffect, useState } from 'react'
import API from '../../services/api.js'


function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
  })

  useEffect(() => {
    API.get('/admin/dashboard')
      .then(({ data }) => setStats(data.stats))
      .catch((error) => console.error('Dashboard loading failed:', error))
  }, [])

  const cards = [
    {
      label: 'Total Products',
      value: stats.products,
      note: 'Live catalogue',
      icon: 'bi-box-seam',
      color: 'primary',
    },
    {
      label: 'Total Orders',
      value: stats.orders,
      note: 'All time orders',
      icon: 'bi-cart-check',
      color: 'success',
    },
    {
      label: 'Customers',
      value: stats.users,
      note: 'Registered users',
      icon: 'bi-people',
      color: 'warning',
    },
    {
      label: 'Total Revenue',
      value: `₹${Number(stats.revenue).toLocaleString('en-IN')}`,
      note: 'Completed orders',
      icon: 'bi-currency-rupee',
      color: 'info',
    },
  ]

  return (
    <section className="py-2">

      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <p className="text-secondary fw-semibold text-uppercase small mb-1">
            Overview
          </p>
          <h2 className="fw-bold mb-1">Dashboard</h2>
          <p className="text-secondary mb-0">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>

        <span className="badge bg-secondary rounded-pill px-3 py-2">
          <i className="bi bi-circle-fill me-2 small"></i>
          Admin Panel
        </span>
      </div>

      {/* Statistics Cards */}
      <div className="row g-4 mb-4">
        {cards.map((card) => (
          <div className="col-12 col-sm-6 col-xl-3" key={card.label}>
            <div className="card bg-dark border-secondary h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-secondary fw-medium">
                    {card.label}
                  </span>

                  <div className="text-light fs-4">
                    <i className={`bi ${card.icon}`}></i>
                  </div>
                </div>

                <h3 className="fw-bold mb-1">
                  {card.value}
                </h3>

                <small className="text-secondary">
                  <i className="bi bi-arrow-up-right me-1 text-success"></i>
                  {card.note}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Welcome Section */}
      <div className="card bg-dark border-secondary overflow-hidden">
        <div className="card-body p-4 p-lg-5">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <span className="badge bg-light text-dark rounded-pill mb-3 px-3 py-2">
                <i className="bi bi-stars me-2"></i>
                ShopEase Admin
              </span>

              <h2 className="fw-bold mb-3">
                One clear view of your store.
              </h2>

              <p className="mb-0 text-secondary">
                Manage your products, customers, orders, categories,
                and sales performance — all from one place.
              </p>
            </div>

            <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
              <i className="bi bi-shop dashboard-shop-icon"></i>
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}

export default Dashboard

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Hero() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSearch = (event) => {
    event.preventDefault()
    const search = query.trim()
    navigate(search ? `/products?search=${encodeURIComponent(search)}` : '/products')
  }

  return (
    <section className="container py-4 py-lg-5">
      <div className="bg-dark border border-secondary rounded-4 overflow-hidden">
      <div className="row align-items-center g-0">
        <div className="col-lg-7 p-4 p-md-5">
          <p className="text-success text-uppercase small fw-semibold mb-3">
            Technology, considered
          </p>
          <h1 className="display-3 fw-bold text-white mb-3">
            Find what fits your next move.
          </h1>
          <p className="lead text-secondary mb-4">
            Thoughtfully selected devices and accessories for work, play, and everything in between.
          </p>

          <form className="mb-4" onSubmit={handleSearch} role="search">
            <label className="visually-hidden" htmlFor="home-product-search">
              Search products
            </label>
          
          </form>

          <div className="d-flex flex-wrap gap-3 align-items-center">
            <Link className="btn btn-success btn-lg px-4" to="/products">
              Explore collection <span aria-hidden="true">↗</span>
            </Link>
            <span className="text-secondary small">
              Free delivery on orders over $500
            </span>
          </div>
        </div>

        <div className="col-lg-5 p-4 p-md-5">
          <div
            className="bg-black border border-secondary rounded-4 p-4 p-md-5 text-center"
            role="img"
            aria-label="Premium technology collection"
          >
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-25 p-4 mb-4">
              <i className="bi bi-phone display-3 text-success" aria-hidden="true" />
            </div>
            <p className="text-white h4 mb-2">Made for more.</p>
            <p className="text-secondary mb-4">Premium technology, refined.</p>
            <div className="row g-3 text-start">
              <div className="col-6">
                <strong className="d-block text-white">11+</strong>
                <span className="text-secondary small">Products</span>
              </div>
              <div className="col-6">
                <strong className="d-block text-white">24hr</strong>
                <span className="text-secondary small">Dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}

export default Hero

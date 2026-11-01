import { Link } from 'react-router-dom'

function Hero() {
  return (
    <section className="container py-5">
      <div className="row align-items-center g-5 py-lg-5">
      <div className="col-lg-6">
        <p className="text-secondary text-uppercase small fw-semibold">The next chapter</p>
        <h1 className="display-2 fw-bold text-white">iPhone 18 Series</h1>
        <p className="lead text-secondary">A new generation of possibilities.</p>
        <Link className="btn btn-light btn-lg" to="/products">Explore collection</Link>
      </div>
      <div className="col-lg-6">
        <div className="bg-dark border border-secondary rounded-4 p-5 text-center" role="img" aria-label="iPhone 18 Series product photography">
          <i className="bi bi-phone display-1 text-light" />
          <p className="text-secondary mt-3 mb-0">Premium technology, refined.</p>
        </div>
      </div>
      </div>
    </section>
  )
}

export default Hero

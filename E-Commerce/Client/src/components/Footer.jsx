
function Footer() {
  return (
    <footer className="bg-dark text-light pt-5 pb-3">
      <div className="container">

        {/* Footer Main */}
        <div className="row g-4 pb-4">

          {/* Brand */}
          <div className="col-12 col-md-5">
            <a
              href="/"
              className="text-white fw-bold fs-3 text-decoration-none"
            >
              <i className="bi bi-flower1 text-success me-2"></i>
              IPlant<span className="text-success">.</span>
            </a>

            <p className="text-secondary mt-3 mb-0">
              Thoughtful things, simply found.
              Bringing nature closer to your everyday life.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-md-3">
            <h6 className="text-white fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/" className="text-secondary text-decoration-none">
                  Home
                </a>
              </li>
              <li className="mb-2">
                <a href="/products" className="text-secondary text-decoration-none">
                  Products
                </a>
              </li>
              <li className="mb-2">
                <a href="/about" className="text-secondary text-decoration-none">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-secondary text-decoration-none">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div className="col-6 col-md-4">
            <h6 className="text-white fw-bold mb-3">Follow Us</h6>

            <div className="d-flex gap-3">
              <a href="#" className="text-secondary fs-5" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="text-secondary fs-5" aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-secondary fs-5" aria-label="Twitter">
                <i className="bi bi-twitter-x"></i>
              </a>
            </div>

            <p className="text-secondary small mt-3 mb-0">
              Stay connected with us for updates and inspiration.
            </p>
          </div>

        </div>

        {/* Copyright */}
        <hr className="border-secondary opacity-50" />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 pt-2">
          <small className="text-secondary">
            © {new Date().getFullYear()} IPlant. All rights reserved.
          </small>

          <small className="text-secondary">
            Made with <i className="bi bi-heart-fill text-danger"></i> for nature.
          </small>
        </div>

      </div>
    </footer>
  )
}

export default Footer

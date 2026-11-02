import { Link } from 'react-router-dom'

function ProductCard({ product, onAdd }) {
  return (
    <article className="card h-100 bg-dark border-secondary text-light">
      <Link to={`/products/${product.id}`} className="ratio ratio-4x3 bg-black">
        <img
          src={product.image_url || '/product-placeholder.svg'}
          alt={product.name}
          className="card-img-top object-fit-cover"
          onError={(event) => {
            event.currentTarget.onerror = null
            event.currentTarget.src = '/product-placeholder.svg'
          }}
        />
      </Link>
      <div className="card-body d-flex flex-column">
        <div>
          <p className="text-secondary small mb-1">{product.category}</p>
          <h3 className="h5"><Link className="text-white text-decoration-none" to={`/products/${product.id}`}>{product.name}</Link></h3>
          <p className="text-secondary small">{product.storage} · {product.color}</p>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-auto pt-3">
          <strong>${Number(product.price).toLocaleString()}</strong>
          <button type="button" className="btn btn-outline-light btn-sm" onClick={() => onAdd(product)} aria-label={`Add ${product.name} to cart`}>Add</button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard

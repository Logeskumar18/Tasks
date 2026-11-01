import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import API from '../services/api.js'

function ProductDetails({ onAdd, isAuthenticated }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [status, setStatus] = useState('Loading product...')

  useEffect(() => {
    API.get(`/products/${id}`)
      .then(({ data }) => { setProduct(data.product); setStatus('') })
      .catch(() => setStatus('Product not found.'))
  }, [id])

  if (!product) return <section className="container py-5"><p className="text-secondary">{status}</p><Link to="/products" className="btn btn-light">Back to collection</Link></section>
  const handleAdd = () => {
    if (!isAuthenticated) return navigate('/login', { state: { from: `/products/${id}` } })
    onAdd(product)
  }

  return (
    <section className="container py-5">
      <Link className="text-light d-inline-block mb-4" to="/products">← Back to collection</Link>
      <div className="row align-items-center g-5">
        <div className="col-lg-6"><div className="ratio ratio-1x1 bg-dark rounded-4 overflow-hidden"><img src={product.image_url} alt={product.name} className="w-100 h-100 object-fit-cover" /></div></div>
        <div className="col-lg-6">
          <p className="text-secondary text-uppercase small fw-semibold">{product.category}</p>
          <h1 className="display-4 fw-bold">{product.name}</h1>
          <p className="fs-4">${Number(product.price).toLocaleString()}</p>
          <p className="text-secondary">{product.description}</p>
          <dl className="border-top border-bottom border-secondary py-2 mb-4"><div className="d-flex justify-content-between py-2"><dt className="text-secondary">Storage</dt><dd>{product.storage}</dd></div><div className="d-flex justify-content-between py-2"><dt className="text-secondary">Finish</dt><dd>{product.color}</dd></div><div className="d-flex justify-content-between py-2"><dt className="text-secondary">Availability</dt><dd>{product.stock > 0 ? 'In stock' : 'Sold out'}</dd></div></dl>
          <button className="btn btn-light" type="button" onClick={handleAdd} disabled={product.stock < 1}>Add to cart</button>
        </div>
      </div>
    </section>
  )
}

export default ProductDetails

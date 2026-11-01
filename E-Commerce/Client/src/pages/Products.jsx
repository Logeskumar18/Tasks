import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import API from '../services/api.js'

function Products({ onAdd, isAuthenticated }) {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('Loading the collection...')
  const handleAdd = (product) => {
    if (!isAuthenticated) return navigate('/login', { state: { from: '/products' } })
    onAdd(product)
  }

  useEffect(() => {
    API.get('/products')
      .then(({ data }) => {
        setProducts(data.products)
        setStatus('')
      })
      .catch(() => setStatus('The collection is unavailable right now.'))
  }, [])

  return (
    <section className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-5">
        <div><p className="text-secondary text-uppercase small fw-semibold">The collection</p><h1 className="display-4 fw-bold">Explore the lineup.</h1></div>
        <p className="text-secondary mb-2">Precision, power, and a finish worth keeping.</p>
      </div>
      {status && <p className="text-secondary">{status}</p>}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">{products.map((product) => <div className="col" key={product.id}><ProductCard product={product} onAdd={handleAdd} /></div>)}</div>
    </section>
  )
}

export default Products

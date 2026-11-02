import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import API from '../services/api.js'

function Products({ onAdd, isAuthenticated }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search')?.trim() || ''
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('Loading the collection...')
  const handleAdd = (product) => {
    if (!isAuthenticated) return navigate('/login', { state: { from: '/products' } })
    onAdd(product)
  }

  useEffect(() => {
    API.get('/products')
      .then(({ data }) => {
        const normalizedQuery = searchQuery.toLowerCase()
        const matchingProducts = normalizedQuery
          ? data.products.filter((product) =>
              [product.name, product.category, product.storage, product.color]
                .some((value) => value.toLowerCase().includes(normalizedQuery))
            )
          : data.products
        setProducts(matchingProducts)
        setStatus('')
      })
      .catch(() => setStatus('The collection is unavailable right now.'))
  }, [searchQuery])

  return (
    <section className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-5">
        <div>
          <p className="text-secondary text-uppercase small fw-semibold">The collection</p>
          <h1 className="display-4 fw-bold">{searchQuery ? `Results for “${searchQuery}”` : 'Explore the lineup.'}</h1>
        </div>
        <p className="text-secondary mb-2">Precision, power, and a finish worth keeping.</p>
      </div>
      {status && <p className="text-secondary">{status}</p>}
      {!status && products.length === 0 && (
        <div className="border border-secondary rounded-4 p-5 text-center">
          <i className="bi bi-search display-5 text-secondary" aria-hidden="true" />
          <p className="h4 mt-3">No products found.</p>
          <p className="text-secondary mb-0">Try a different search term or browse the full collection.</p>
        </div>
      )}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">{products.map((product) => <div className="col" key={product.id}><ProductCard product={product} onAdd={handleAdd} /></div>)}</div>
    </section>
  )
}

export default Products

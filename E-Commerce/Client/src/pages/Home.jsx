
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Hero from '../components/Hero.jsx'
import ProductCard from '../components/ProductCard.jsx'
import API from '../services/api.js'

function Home({ onAdd, isAuthenticated }) {
    const navigate = useNavigate()

    const [products, setProducts] = useState([])
    const [status, setStatus] = useState('Loading the collection...')

    // Fetch featured products
    useEffect(() => {
        API.get('/products')
            .then(({ data }) => {
                setProducts(data.products.slice(0, 4))
                setStatus('')
            })
            .catch(() => {
                setStatus('The collection is unavailable right now.')
            })
    }, [])

    // Handle add to cart
    const handleAdd = (product) => {
        if (!isAuthenticated) {
            return navigate('/login', {
                state: { from: '/' }
            })
        }

        onAdd(product)
    }

    return (
        <>
            {/* Hero Section */}
            <Hero />

            {/* Featured Products Section */}
            <section className="container py-5">

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">

                    <div>
                        <p className="text-secondary text-uppercase small fw-semibold">
                            Featured collection
                        </p>

                        <h2 className="display-6 fw-bold">
                            Selected for you.
                        </h2>
                    </div>

                    <Link
                        className="text-light fw-semibold"
                        to="/products"
                    >
                        See all products <span>↗</span>
                    </Link>

                </div>

                {/* Loading / Error Status */}
                {status && (
                    <p className="text-secondary">
                        {status}
                    </p>
                )}

                {/* Product Grid */}
                <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">

                    {products.map((product) => (
                        <div className="col" key={product.id}>
                            <ProductCard
                                product={product}
                                onAdd={handleAdd}
                            />
                        </div>
                    ))}

                </div>

            </section>

            {/* Brand Information Section */}
            <section className="container py-5 border-top border-secondary">

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">

                    <div>
                        <p className="text-secondary text-uppercase small fw-semibold">
                            ShopEase.
                        </p>

                        <h2 className="display-6 fw-bold">
                            Considered technology.
                            <br />
                            Beautifully selected.
                        </h2>
                    </div>

                    <Link
                        className="text-light fw-semibold"
                        to="/products"
                    >
                        See all products <span>↗</span>
                    </Link>

                </div>

            </section>
        </>
    )
}

export default Home

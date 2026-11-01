
import { useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'

import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'

import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Products from './pages/Products.jsx'
import ProductDetails from './pages/ProductDetails.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import Orders from './pages/Orders.jsx'

import AdminLayout from './components/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import AdminProducts from './pages/admin/Products.jsx'
import AddProduct from './pages/admin/AddProduct.jsx'
import EditProduct from './pages/admin/EditProduct.jsx'
import AdminOrders from './pages/admin/Orders.jsx'
import OrderDetails from './pages/admin/OrderDetails.jsx'
import Customers from './pages/admin/Customers.jsx'
import Categories from './pages/admin/Categories.jsx'
import Reports from './pages/admin/Reports.jsx'

function App() {
    const [cart, setCart] = useState([])
    const [orders, setOrders] = useState([])

    const [currentUser, setCurrentUser] = useState(() =>
        JSON.parse(localStorage.getItem('shopEaseUser') || 'null')
    )

    const isAuthenticated = Boolean(currentUser)

    // Add product to cart
    const addToCart = (product) => {
        setCart((current) => {
            const existing = current.find(
                (item) => item.id === product.id
            )

            if (existing) {
                return current.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }

            return [...current, { ...product, quantity: 1 }]
        })
    }

    // Update cart quantity
    const updateCart = (id, quantity) => {
        setCart((current) =>
            quantity < 1
                ? current.filter((item) => item.id !== id)
                : current.map((item) =>
                    item.id === id
                        ? { ...item, quantity }
                        : item
                )
        )
    }

    // Remove product from cart
    const removeFromCart = (id) => {
        setCart((current) =>
            current.filter((item) => item.id !== id)
        )
    }

    // Complete order
    const completeOrder = (order) => {
        setOrders((current) => [...current, order])
        setCart([])
    }

    // Logout user
    const logout = () => {
        localStorage.removeItem('shopEaseUser')
        localStorage.removeItem('shopEaseToken')

        setCurrentUser(null)
        setCart([])
    }

    // Calculate total cart items
    const cartCount = cart.reduce(
        (total, item) => total + item.quantity,
        0
    )

    return (
        <BrowserRouter>
            <div className="min-vh-100 bg-black text-light d-flex flex-column">

                <ConditionalNavbar
                    cartCount={cartCount}
                    isAuthenticated={isAuthenticated}
                    isAdmin={currentUser?.role === 'admin'}
                    onLogout={logout}
                />

                <main className="flex-grow-1">
                    <Routes>

                        {/* Home */}
                        <Route
                            path="/"
                            element={
                                <Home
                                    onAdd={addToCart}
                                    isAuthenticated={isAuthenticated}
                                />
                            }
                        />

                        {/* Authentication */}
                        <Route
                            path="/login"
                            element={<Login onLogin={setCurrentUser} />}
                        />

                        <Route
                            path="/register"
                            element={<Register />}
                        />

                        {/* Products */}
                        <Route
                            path="/products"
                            element={
                                <Products
                                    onAdd={addToCart}
                                    isAuthenticated={isAuthenticated}
                                />
                            }
                        />

                        <Route
                            path="/products/:id"
                            element={
                                <ProductDetails
                                    onAdd={addToCart}
                                    isAuthenticated={isAuthenticated}
                                />
                            }
                        />

                        {/* Customer Routes */}
                        <Route
                            path="/cart"
                            element={
                                isAuthenticated
                                    ? (
                                        <Cart
                                            cart={cart}
                                            onUpdate={updateCart}
                                            onRemove={removeFromCart}
                                        />
                                    )
                                    : <LoginPrompt />
                            }
                        />

                        <Route
                            path="/checkout"
                            element={
                                isAuthenticated
                                    ? (
                                        <Checkout
                                            cart={cart}
                                            onOrder={completeOrder}
                                        />
                                    )
                                    : <LoginPrompt />
                            }
                        />

                        <Route
                            path="/orders"
                            element={
                                isAuthenticated
                                    ? <Orders orders={orders} />
                                    : <LoginPrompt />
                            }
                        />

                        {/* Admin Routes */}
                        <Route
                            path="/admin"
                            element={
                                <AdminLayout
                                    user={currentUser}
                                    onLogout={logout}
                                />
                            }
                        >
                            <Route
                                index
                                element={<AdminDashboard />}
                            />

                            <Route
                                path="products"
                                element={<AdminProducts />}
                            />

                            <Route
                                path="products/new"
                                element={<AddProduct />}
                            />

                            <Route
                                path="products/:id/edit"
                                element={<EditProduct />}
                            />

                            <Route
                                path="orders"
                                element={<AdminOrders />}
                            />

                            <Route
                                path="orders/:id"
                                element={<OrderDetails />}
                            />

                            <Route
                                path="customers"
                                element={<Customers />}
                            />

                            <Route
                                path="categories"
                                element={<Categories />}
                            />

                            <Route
                                path="reports"
                                element={<Reports />}
                            />
                        </Route>

                    </Routes>
                </main>

                <Footer />

            </div>
        </BrowserRouter>
    )
}

function ConditionalNavbar(props) {
    const location = useLocation()

    if (location.pathname.startsWith('/admin')) return null

    return <Navbar {...props} />
}

// Login Prompt Component
function LoginPrompt() {
    return (
        <section className="container py-5">
            <p className="text-secondary text-uppercase small fw-semibold">
                Members only
            </p>

            <h1 className="display-4 fw-bold">
                Sign in to continue.
            </h1>

            <p className="text-secondary">
                Your cart and orders are saved for registered customers.
            </p>

            <a className="btn btn-light" href="/login">
                Go to login
            </a>
        </section>
    )
}

export default App

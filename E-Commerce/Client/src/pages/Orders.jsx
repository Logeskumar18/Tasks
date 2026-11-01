import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../services/api.js'

function Orders({ orders }) {
  const [remoteOrders, setRemoteOrders] = useState(orders)
  useEffect(() => { API.get('/orders').then(({ data }) => setRemoteOrders(data.orders)).catch(() => {}) }, [])
  return <section className="container py-5"><p className="text-secondary text-uppercase small fw-semibold">Your history</p><h1 className="display-4 fw-bold mb-4">My orders.</h1>{remoteOrders.length === 0 ? <div className="py-4"><p className="text-secondary">Your completed orders will appear here.</p><Link className="btn btn-light" to="/products">Browse products</Link></div> : <div className="list-group">{remoteOrders.map((order, index) => <article className="list-group-item list-group-item-dark d-flex justify-content-between align-items-center border-secondary" key={order.id || `${order.total}-${index}`}><div><strong>Order #{String(order.id || index + 1).padStart(4, '0')}</strong><p className="text-secondary mb-0">{Array.isArray(order.items) ? order.items.length : JSON.parse(order.items || '[]').length} items · {order.shipping_city || order.city}</p></div><strong>${Number(order.total).toLocaleString()}</strong></article>)}</div>}</section>
}

export default Orders

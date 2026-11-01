import { Link, useParams } from 'react-router-dom'
function OrderDetails() { const { id } = useParams(); return <section><p className="text-secondary text-uppercase small fw-semibold mb-1">Fulfilment</p><h1 className="mb-4">Order #{id}</h1><p className="text-secondary">Order details are managed from the Orders table.</p><Link className="btn btn-light" to="/admin/orders">Back to orders</Link></section> }
export default OrderDetails

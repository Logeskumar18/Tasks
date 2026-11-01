import pool from '../config/db.js'

const createOrder = async (req, res) => {
  const { total, items, shippingName, shippingAddress, shippingCity, shippingPostalCode } = req.body
  if (!total || !Array.isArray(items) || !items.length || !shippingName || !shippingAddress || !shippingCity || !shippingPostalCode) return res.status(400).json({ message: 'Order and shipping details are required.' })
  const [result] = await pool.query('INSERT INTO orders (user_id, total, shipping_name, shipping_address, shipping_city, shipping_postal_code, items) VALUES (?, ?, ?, ?, ?, ?, ?)', [req.user.id, total, shippingName, shippingAddress, shippingCity, shippingPostalCode, JSON.stringify(items)])
  return res.status(201).json({ message: 'Order placed successfully.', orderId: result.insertId })
}

const getMyOrders = async (req, res) => {
  const [orders] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id])
  return res.json({ orders })
}

export { createOrder, getMyOrders }

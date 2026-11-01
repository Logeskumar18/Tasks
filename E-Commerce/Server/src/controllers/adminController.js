import pool from '../config/db.js'

const getStats = async (req, res) => {
  const [[users]] = await pool.query('SELECT COUNT(*) AS total FROM users')
  const [[products]] = await pool.query('SELECT COUNT(*) AS total FROM products')
  const [[orders]] = await pool.query('SELECT COUNT(*) AS total FROM orders')
  const [[revenue]] = await pool.query("SELECT COALESCE(SUM(total), 0) AS total FROM orders WHERE status != 'cancelled'")
  return res.json({ stats: { users: users.total, products: products.total, orders: orders.total, revenue: revenue.total } })
}

const getUsers = async (req, res) => {
  const [users] = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC')
  return res.json({ users })
}

const updateUserRole = async (req, res) => {
  const role = req.body.role === 'admin' ? 'admin' : 'customer'
  const [result] = await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id])
  if (!result.affectedRows) return res.status(404).json({ message: 'User not found.' })
  return res.json({ message: 'User role updated.' })
}

const deleteUser = async (req, res) => {
  if (Number(req.params.id) === req.user.id) return res.status(400).json({ message: 'You cannot delete your own account.' })
  const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id])
  if (!result.affectedRows) return res.status(404).json({ message: 'User not found.' })
  return res.json({ message: 'User deleted.' })
}

const getProducts = async (req, res) => {
  const [products] = await pool.query('SELECT * FROM products ORDER BY created_at DESC')
  return res.json({ products })
}

const createProduct = async (req, res) => {
  const { name, category, storage, color, description, price, image_url, stock, featured } = req.body
  if (!name || !storage || !color || !description || price === undefined || !image_url) return res.status(400).json({ message: 'Name, storage, color, description, price, and image are required.' })
  const [result] = await pool.query('INSERT INTO products (name, category, storage, color, description, price, image_url, stock, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [name, category || 'iPhone', storage, color, description, price, image_url, stock || 0, Boolean(featured)])
  return res.status(201).json({ message: 'Product created.', productId: result.insertId })
}

const updateProduct = async (req, res) => {
  const { name, category, storage, color, description, price, image_url, stock, featured } = req.body
  const [result] = await pool.query('UPDATE products SET name = ?, category = ?, storage = ?, color = ?, description = ?, price = ?, image_url = ?, stock = ?, featured = ? WHERE id = ?', [name, category, storage, color, description, price, image_url, stock, Boolean(featured), req.params.id])
  if (!result.affectedRows) return res.status(404).json({ message: 'Product not found.' })
  return res.json({ message: 'Product updated.' })
}

const deleteProduct = async (req, res) => {
  const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id])
  if (!result.affectedRows) return res.status(404).json({ message: 'Product not found.' })
  return res.json({ message: 'Product deleted.' })
}

const getOrders = async (req, res) => {
  const [orders] = await pool.query('SELECT o.*, u.name AS customer_name, u.email AS customer_email FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC')
  return res.json({ orders })
}

const updateOrderStatus = async (req, res) => {
  const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid order status.' })
  const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [req.body.status, req.params.id])
  if (!result.affectedRows) return res.status(404).json({ message: 'Order not found.' })
  return res.json({ message: 'Order status updated.' })
}

const getCategories = async (req, res) => {
  const [categories] = await pool.query('SELECT id, category_name, created_at FROM categories ORDER BY category_name')
  return res.json({ categories })
}

const createCategory = async (req, res) => {
  const categoryName = typeof req.body.category_name === 'string' ? req.body.category_name.trim() : ''
  if (!categoryName) return res.status(400).json({ message: 'Category name is required.' })
  try {
    const [result] = await pool.query('INSERT INTO categories (category_name) VALUES (?)', [categoryName])
    return res.status(201).json({ message: 'Category created.', categoryId: result.insertId })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Category already exists.' })
    throw error
  }
}

const getReports = async (req, res) => {
  const [monthly] = await pool.query("SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue FROM orders WHERE status != 'cancelled' GROUP BY month ORDER BY month DESC LIMIT 12")
  return res.json({ report: monthly })
}

export { createCategory, createProduct, deleteProduct, deleteUser, getCategories, getOrders, getProducts, getReports, getStats, getUsers, updateOrderStatus, updateProduct, updateUserRole }

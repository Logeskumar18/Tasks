import pool from '../config/db.js'

const getProducts = async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM products ORDER BY featured DESC, id ASC')
    return res.json({ products })
  } catch (error) {
    console.error('Products lookup failed:', error)
    return res.status(500).json({ message: 'Unable to load products.' })
  }
}

const getProduct = async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM products WHERE id = ? LIMIT 1', [req.params.id])
    if (!products.length) return res.status(404).json({ message: 'Product not found.' })
    return res.json({ product: products[0] })
  } catch (error) {
    console.error('Product lookup failed:', error)
    return res.status(500).json({ message: 'Unable to load product.' })
  }
}

export { getProduct, getProducts }

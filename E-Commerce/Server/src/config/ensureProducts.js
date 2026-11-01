import pool from './db.js'

const seedProducts = [
  ['iPhone 18', 'iPhone', '256GB', 'Silver', 'A clean, capable everyday phone with a bright display and all-day confidence.', 999, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=85', 24, 1],
  ['iPhone 18 Pro', 'iPhone', '512GB', 'Titanium', 'Pro performance in a refined titanium finish, built for the work between the moments.', 1299, 'https://images.unsplash.com/photo-1592286927505-2fd0c1e1b5b3?auto=format&fit=crop&w=900&q=85', 12, 1],
  ['iPhone 18 Pro Max', 'iPhone', '1TB', 'Natural Titanium', 'The largest display, the longest battery, and a camera system made for distance.', 1499, 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=900&q=85', 8, 1],
  ['AirPods Pro', 'Accessories', 'USB-C', 'White', 'Immersive sound with a pocket-sized case and a calmer commute.', 249, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85', 30, 0],
]

const ensureProducts = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(150) NOT NULL,
      category VARCHAR(80) NOT NULL DEFAULT 'iPhone',
      storage VARCHAR(40) NOT NULL,
      color VARCHAR(80) NOT NULL,
      description TEXT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      image_url VARCHAR(500) NOT NULL,
      stock INT NOT NULL DEFAULT 0,
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  const [[count]] = await pool.query('SELECT COUNT(*) AS total FROM products')
  if (count.total === 0) {
    await pool.query(
      'INSERT INTO products (name, category, storage, color, description, price, image_url, stock, featured) VALUES ?',
      [seedProducts],
    )
  }
}

export default ensureProducts

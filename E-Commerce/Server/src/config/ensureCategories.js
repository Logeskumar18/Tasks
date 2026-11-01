import pool from './db.js'

const ensureCategories = async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS categories (id INT PRIMARY KEY AUTO_INCREMENT, category_name VARCHAR(100) NOT NULL UNIQUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`)
  await pool.query(`INSERT IGNORE INTO categories (category_name) VALUES ('iPhone 18'), ('iPhone 18 Pro'), ('iPhone 18 Pro Max'), ('Accessories')`)
}

export default ensureCategories

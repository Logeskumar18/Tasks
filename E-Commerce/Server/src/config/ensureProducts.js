import pool from "./db.js";

const seedProducts = [
  [
    "iPhone 18",
    "iPhone",
    "256GB",
    "Silver",
    "A clean, capable everyday phone with a bright display and all-day confidence.",
    999,
    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=85",
    24,
    1,
  ],
  [
    "iPhone 18 Pro",
    "iPhone",
    "512GB",
    "Titanium",
    "Pro performance in a refined titanium finish, built for the work between the moments.",
    1299,
    "https://images.unsplash.com/photo-1592286927505-2fd0c1e1b5b3?auto=format&fit=crop&w=900&q=85",
    12,
    1,
  ],
  [
    "iPhone 18 Pro Max",
    "iPhone",
    "1TB",
    "Natural Titanium",
    "The largest display, the longest battery, and a camera system made for distance.",
    1499,
    "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=900&q=85",
    8,
    1,
  ],
  [
    "AirPods Pro",
    "Accessories",
    "USB-C",
    "White",
    "Immersive sound with a pocket-sized case and a calmer commute.",
    249,
    "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85",
    30,
    0,
  ],
  [
    "MacBook Air",
    "Mac",
    "256GB",
    "Midnight",
    "A lightweight laptop with quiet power for work, study, and everything between.",
    1099,
    "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=85",
    14,
    1,
  ],
  [
    "MacBook Pro",
    "Mac",
    "512GB",
    "Space Black",
    "Serious performance in a focused, portable workspace for demanding projects.",
    1999,
    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=900&q=85",
    7,
    1,
  ],
  [
    "iPad Air",
    "iPad",
    "128GB",
    "Blue",
    "A versatile canvas for notes, streaming, sketching, and the rest of your day.",
    599,
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=85",
    18,
    0,
  ],
  [
    "Apple Watch Series 11",
    "Apple Watch",
    "GPS",
    "Jet Black",
    "A clear view of your day, from morning movement to evening messages.",
    399,
    "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?auto=format&fit=crop&w=900&q=85",
    16,
    0,
  ],
  [
    "AirPods Max",
    "Accessories",
    "USB-C",
    "Orange",
    "Full-size, high-fidelity sound with a comfortable fit for longer listening sessions.",
    549,
    "https://images.unsplash.com/photo-1625245488600-4c7c7c5d6e71?auto=format&fit=crop&w=900&q=85",
    10,
    0,
  ],
  [
    "Magic Keyboard",
    "Accessories",
    "USB-C",
    "White",
    "A precise, comfortable keyboard that keeps your desk feeling considered.",
    99,
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85",
    22,
    0,
  ],
  [
    "Studio Display",
    "Accessories",
    "27-inch",
    "Silver",
    "A bright, spacious display that brings clarity to every creative workflow.",
    1599,
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=85",
    5,
    0,
  ],
];

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
  `);

  const [existingProducts] = await pool.query("SELECT name FROM products");
  const existingNames = new Set(existingProducts.map(({ name }) => name));
  const productsToInsert = seedProducts.filter(
    ([name]) => !existingNames.has(name),
  );

  if (productsToInsert.length > 0) {
    await pool.query(
      "INSERT INTO products (name, category, storage, color, description, price, image_url, stock, featured) VALUES ?",
      [productsToInsert],
    );
  }
};

export default ensureProducts;

CREATE DATABASE Ecom;

USE Ecom;

SELECT DATABASE();

USE Ecom;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

SHOW TABLES;

DESCRIBE users;

CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO categories (category_name)
VALUES ('iPhone 18'), ('iPhone 18 Pro'), ('iPhone 18 Pro Max'), ('Accessories');

DESCRIBE categories;

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
);

INSERT INTO products (name, category, storage, color, description, price, image_url, stock, featured)
SELECT * FROM (
    SELECT 'iPhone 18', 'iPhone', '256GB', 'Silver', 'A clean, capable everyday phone with a bright display and all-day confidence.', 999.00, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=85', 24, TRUE
    UNION ALL SELECT 'iPhone 18 Pro', 'iPhone', '512GB', 'Titanium', 'Pro performance in a refined titanium finish, built for the work between the moments.', 1299.00, 'https://images.unsplash.com/photo-1592286927505-2fd0c1e1b5b3?auto=format&fit=crop&w=900&q=85', 12, TRUE
    UNION ALL SELECT 'iPhone 18 Pro Max', 'iPhone', '1TB', 'Natural Titanium', 'The largest display, the longest battery, and a camera system made for distance.', 1499.00, 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=900&q=85', 8, TRUE
    UNION ALL SELECT 'AirPods Pro', 'Accessories', 'USB-C', 'White', 'Immersive sound with a pocket-sized case and a calmer commute.', 249.00, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85', 30, FALSE
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

DESCRIBE products;

CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_name VARCHAR(150) NOT NULL,
    shipping_address VARCHAR(255) NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(30) NOT NULL,
    items JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

DESCRIBE orders;
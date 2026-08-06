-- =========================================================
-- Smart PC Builder - Proposed New Clean Database Schema (Draft)
-- =========================================================
-- ปรับปรุงโครงสร้างให้กระชับ รวดเร็ว และไม่มีตารางสเปกย่อยที่ซ้ำซ้อน

CREATE DATABASE IF NOT EXISTS smart_pc_builder DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_pc_builder;

-- 1. หมวดหมู่อุปกรณ์ (Categories)
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(50) NOT NULL UNIQUE,         -- 'cpu', 'mobo', 'ram', 'gpu', 'storage', 'psu', 'case'
  `name_th` VARCHAR(100) NOT NULL,            -- 'ซีพียู', 'เมนบอร์ด', ฯลฯ
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ผลิตภัณฑ์และสเปกทั้งหมด (Products Master)
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `brand` VARCHAR(100) NOT NULL,              -- เช่น 'AMD', 'Intel', 'ASUS'
  `model` VARCHAR(255) NOT NULL,              -- เช่น 'Ryzen 5 7600', 'RTX 4060'
  `price` DECIMAL(10, 2) NOT NULL,
  `image_url` VARCHAR(255),
  `stock_quantity` INT DEFAULT 10,
  `specifications` JSON DEFAULT NULL,         -- รวมสเปกย่อยทั้งหมดไว้ที่นี่ (Socket, TDP, RAM Type, Capacity, Wattage ฯลฯ)
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
);

-- 3. สมาชิกและผู้ดูแลระบบ (Users)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('customer', 'admin') DEFAULT 'customer',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. คำสั่งซื้อและการจัดชุดประกอบ (Orders)
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(50) PRIMARY KEY,               -- เช่น 'ORD-1001'
  `user_id` INT DEFAULT NULL,                 -- ผูกกับตาราง users (ถ้าเป็นสมาชิก)
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_address` TEXT,
  `customer_phone` VARCHAR(20),
  `assembly_type` VARCHAR(50) DEFAULT 'none', -- 'none', 'assembled'
  `total_price` DECIMAL(10, 2) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'assembling',   -- 'assembling', 'shipped', 'completed', 'cancelled'
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- 5. รายการสินค้าในออเดอร์ (Order Items)
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(50) NOT NULL,
  `product_id` INT NOT NULL,
  `category_slug` VARCHAR(50) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
);

-- 6. บทความจัดสเปก (Articles)
CREATE TABLE IF NOT EXISTS `articles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) DEFAULT NULL,
  `content` TEXT NOT NULL,
  `author` VARCHAR(100) DEFAULT 'SpecAI',
  `image_url` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

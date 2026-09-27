-- Database & Table Creation Script for Aparna Foods Purchase Module
CREATE DATABASE IF NOT EXISTS inventory_db;
USE inventory_db;

-- 1. Main Purchase Order Table (Header Details)
CREATE TABLE IF NOT EXISTS purchase_orders (
    po_id INT AUTO_INCREMENT PRIMARY KEY,
    po_number VARCHAR(50) NOT NULL UNIQUE,       -- e.g., 'PO/26-27/0070'
    po_date DATE NOT NULL,                        -- e.g., '2026-09-27'
    party_name VARCHAR(150),
    purchased_by VARCHAR(100),
    broker VARCHAR(100),
    brokerage DECIMAL(10, 2) DEFAULT 0.00,
    payment_terms VARCHAR(255),
    dana_cut VARCHAR(100),
    cd VARCHAR(100),                              -- Cash Discount
    freight_party_or_self VARCHAR(50),
    remarks TEXT,
    bardana VARCHAR(100),
    village VARCHAR(100),
    farmer_name VARCHAR(150),
    mobile_number VARCHAR(20),
    company VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Line Items Table (Item Section)
CREATE TABLE IF NOT EXISTS purchase_order_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    po_id INT NOT NULL,
    variant_name VARCHAR(150) NOT NULL,           -- e.g., 'CREAMY SELLA 2ND WAND 50KG'
    item_type VARCHAR(100),
    no_of_bags INT DEFAULT 0,
    weight_in_qtl DECIMAL(10, 2) DEFAULT 0.00,    -- Weight in Quintals
    rate_per_qtl DECIMAL(10, 2) DEFAULT 0.00,     -- Rate per Quintal
    amount DECIMAL(12, 2) GENERATED ALWAYS AS (weight_in_qtl * rate_per_qtl) STORED,
    CONSTRAINT fk_po_items_po_id 
        FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id) 
        ON DELETE CASCADE
);

-- Indexing for frequent searches
CREATE INDEX idx_po_number ON purchase_orders(po_number);
CREATE INDEX idx_po_date ON purchase_orders(po_date);
CREATE INDEX idx_farmer_mobile ON purchase_orders(mobile_number);
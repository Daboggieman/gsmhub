-- GSMHUB Database Schema
-- Device Specifications Website

-- Create database (run this manually if needed)
-- CREATE DATABASE gsmhub;

-- Use the database
-- \c gsmhub;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Devices table
CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(200) NOT NULL UNIQUE,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(200) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    image_url TEXT,
    specs JSONB,
    views INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Price history table
CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    country VARCHAR(2) NOT NULL, -- ISO 3166-1 alpha-2 country code
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD', -- ISO 4217 currency code
    retailer VARCHAR(100),
    affiliate_url TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(device_id, country, retailer, date)
);

-- Search index table for fast searching
CREATE TABLE IF NOT EXISTS search_index (
    id SERIAL PRIMARY KEY,
    device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Full searchable name (brand + model + variants)
    slug VARCHAR(200) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    search_vector TSVECTOR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(device_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_devices_slug ON devices(slug);
CREATE INDEX IF NOT EXISTS idx_devices_brand ON devices(brand);
CREATE INDEX IF NOT EXISTS idx_devices_category_id ON devices(category_id);
CREATE INDEX IF NOT EXISTS idx_devices_is_active ON devices(is_active);
CREATE INDEX IF NOT EXISTS idx_devices_created_at ON devices(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_price_history_device_id ON price_history(device_id);
CREATE INDEX IF NOT EXISTS idx_price_history_country ON price_history(country);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(date DESC);

CREATE INDEX IF NOT EXISTS idx_search_index_brand ON search_index(brand);
CREATE INDEX IF NOT EXISTS idx_search_index_category ON search_index(category);
CREATE INDEX IF NOT EXISTS idx_search_index_search_vector ON search_index USING gin(search_vector);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_search_index_updated_at BEFORE UPDATE ON search_index
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to maintain search vector
CREATE OR REPLACE FUNCTION maintain_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.brand, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for search vector maintenance
CREATE TRIGGER maintain_search_index_search_vector
    BEFORE INSERT OR UPDATE ON search_index
    FOR EACH ROW EXECUTE FUNCTION maintain_search_vector();

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
('Smartphones', 'smartphones', 'Mobile phones with advanced computing capabilities'),
('Tablets', 'tablets', 'Portable touchscreen computers'),
('Laptops', 'laptops', 'Portable personal computers'),
('Smartwatches', 'smartwatches', 'Wearable smart devices'),
('Gaming Laptops', 'gaming-laptops', 'High-performance laptops for gaming'),
('Budget Phones', 'budget-phones', 'Affordable mobile phones')
ON CONFLICT (name) DO NOTHING;

-- Create view for latest prices
CREATE OR REPLACE VIEW latest_prices AS
SELECT DISTINCT ON (ph.device_id, ph.country)
    ph.device_id,
    ph.country,
    ph.price,
    ph.currency,
    ph.retailer,
    ph.affiliate_url,
    ph.date
FROM price_history ph
ORDER BY ph.device_id, ph.country, ph.date DESC;

-- Comments for documentation
COMMENT ON TABLE devices IS 'Main devices table containing all device specifications';
COMMENT ON TABLE price_history IS 'Historical price data for devices across different countries and retailers';
COMMENT ON TABLE search_index IS 'Search index for fast device searching with full-text search capabilities';
COMMENT ON TABLE categories IS 'Device categories for organization and filtering';
COMMENT ON VIEW latest_prices IS 'View showing the most recent price for each device per country';

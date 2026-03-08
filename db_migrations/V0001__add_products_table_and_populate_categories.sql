-- Create products table  
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    
    -- Basic product info
    name VARCHAR(200) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    sku VARCHAR(100),
    
    -- Pricing
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    currency VARCHAR(3) DEFAULT 'RUB',
    discount_percentage DECIMAL(5,2) DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    
    -- Inventory
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    min_order_quantity INTEGER DEFAULT 1 CHECK (min_order_quantity > 0),
    max_order_quantity INTEGER,
    
    -- Product specifications
    weight_kg DECIMAL(8,3) CHECK (weight_kg >= 0),
    dimensions_json JSONB, -- {length, width, height in cm}
    
    -- Images and media
    main_image_url TEXT,
    gallery_images_json JSONB, -- array of image URLs
    
    -- SEO and marketing
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    tags_json JSONB, -- array of tags
    
    -- Status and visibility
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'archived')),
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE
);

-- Create product attributes table for custom specifications
CREATE TABLE product_attributes (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    attribute_name VARCHAR(100) NOT NULL,
    attribute_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_products_supplier_id ON products(supplier_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_product_attributes_product_id ON product_attributes(product_id);

-- Populate categories table with default categories
INSERT INTO categories (name, description, slug) VALUES 
('Электроника', 'Электронные товары и устройства', 'electronics'),
('Одежда и обувь', 'Текстильные изделия и обувь', 'clothing-shoes'),
('Дом и сад', 'Товары для дома и садоводства', 'home-garden'),
('Автотовары', 'Автомобильные аксессуары и запчасти', 'auto'),
('Спорт и отдых', 'Спортивные товары и товары для отдыха', 'sports-leisure'),
('Красота и здоровье', 'Косметика и товары для здоровья', 'beauty-health'),
('Детские товары', 'Товары для детей', 'kids'),
('Продукты питания', 'Пищевые продукты', 'food'),
('Книги и канцелярия', 'Книги и канцелярские товары', 'books-stationery'),
('Строительство и ремонт', 'Строительные материалы и инструменты', 'construction');
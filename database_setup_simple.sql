-- =============================================================================
-- MAESTRANZA SA - SETUP SIMPLIFICADO PARA SUPABASE (PostgreSQL)
-- =============================================================================
-- Version simplificada sin ON CONFLICT para evitar errores
-- =============================================================================

-- Configurar timezone
SET timezone = 'UTC';

-- =============================================================================
-- 1. TABLA DE USUARIOS
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'User' CHECK (role IN ('Admin', 'User', 'Supervisor', 'Viewer')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. TABLA DE CATEGORÍAS
-- =============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 3. TABLA DE PROVEEDORES
-- =============================================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    tax_id VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 4. TABLA DE PRODUCTOS
-- =============================================================================
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    sku VARCHAR(50) UNIQUE,
    serial_number VARCHAR(100) UNIQUE,
    category_id BIGINT REFERENCES categories(id),
    supplier_id BIGINT REFERENCES suppliers(id),
    brand VARCHAR(100),
    location VARCHAR(100),
    quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER,
    unit_of_measure VARCHAR(20) DEFAULT 'unidades',
    unit_cost DECIMAL(10,2),
    sale_price DECIMAL(10,2),
    image_url TEXT,
    barcode VARCHAR(100),
    requires_expiry_control BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5. TABLA DE LOTES/BATCHES
-- =============================================================================
CREATE TABLE IF NOT EXISTS batches (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    lot_number VARCHAR(100) NOT NULL,
    quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
    manufacturing_date DATE,
    expiry_date DATE,
    cost_per_unit DECIMAL(10,2),
    supplier_id BIGINT REFERENCES suppliers(id),
    is_expired BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, lot_number)
);

-- =============================================================================
-- 6. TABLA DE PROYECTOS
-- =============================================================================
CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'on_hold')),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 7. TABLA DE MOVIMIENTOS DE INVENTARIO
-- =============================================================================
CREATE TABLE IF NOT EXISTS movements (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id),
    batch_id BIGINT REFERENCES batches(id),
    type VARCHAR(10) NOT NULL CHECK (type IN ('IN', 'OUT', 'ADJUST')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    previous_quantity INTEGER DEFAULT 0,
    new_quantity INTEGER DEFAULT 0,
    reason TEXT,
    reference_number VARCHAR(100),
    project_id BIGINT REFERENCES projects(id),
    user_id BIGINT REFERENCES users(id),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- =============================================================================
-- 8. TABLA DE ALERTAS
-- =============================================================================
CREATE TABLE IF NOT EXISTS alerts (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('LOW_STOCK', 'EXPIRY', 'EXPIRED', 'SYSTEM')),
    product_id BIGINT REFERENCES products(id),
    message TEXT NOT NULL,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- =============================================================================
-- CREAR ÍNDICES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_quantity ON products(quantity);
CREATE INDEX IF NOT EXISTS idx_movements_product ON movements(product_id);
CREATE INDEX IF NOT EXISTS idx_movements_type ON movements(type);
CREATE INDEX IF NOT EXISTS idx_movements_timestamp ON movements(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_read ON alerts(is_read);

-- =============================================================================
-- INSERTAR DATOS BÁSICOS
-- =============================================================================

-- Insertar usuario administrador
INSERT INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@maestranza.com', '$2b$12$KIX8.8oOQr6YHKxHJrEZT.HCEJpGVQJKhGIlgEhqPYAhVNOKXiKgG', 'Admin');

-- Insertar categorías
INSERT INTO categories (name, description) VALUES 
('Sujetadores', 'Tornillos, tuercas, pernos, arandelas, etc.'),
('Herramientas', 'Herramientas manuales y eléctricas'),
('Materiales', 'Materias primas y materiales de construcción'),
('Equipos', 'Equipos y maquinaria'),
('Consumibles', 'Materiales de consumo regular'),
('Seguridad', 'Elementos de protección personal'),
('Eléctricos', 'Componentes y materiales eléctricos'),
('Hidráulicos', 'Componentes hidráulicos y neumáticos');

-- Insertar proveedores
INSERT INTO suppliers (name, contact_name, email, phone, address) VALUES 
('ACME Industrial', 'Juan Pérez', 'contacto@acme.cl', '+56912345678', 'Av. Industrial 123, Santiago'),
('Stanley Tools', 'María González', 'ventas@stanley.cl', '+56987654321', 'Calle Comercial 456, Valparaíso'),
('Bosch Chile', 'Carlos Silva', 'info@bosch.cl', '+56955566677', 'Av. Providencia 789, Santiago'),
('Makita Distributors', 'Ana López', 'ventas@makita.cl', '+56933344455', 'Los Industriales 321, San Bernardo');

-- Insertar productos de ejemplo
INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, image_url, requires_expiry_control) VALUES 
('Tuerca M8', 'TM8-001', 1, 1, 'ACME', 'Estante A1', 150, 50, 500, 25.50, 'https://via.placeholder.com/80x80?text=🔩', false),
('Tornillo M6x20', 'TM6-020', 1, 2, 'Stanley', 'Estante A2', 200, 75, 800, 18.75, 'https://via.placeholder.com/80x80?text=🔧', false),
('Arandela 8mm', 'AR8-001', 1, 3, 'Bosch', 'Estante B1', 75, 25, 300, 12.30, NULL, false),
('Perno M10x30', 'PM10-030', 1, 4, 'Makita', 'Estante B2', 90, 30, 400, 45.80, 'https://via.placeholder.com/80x80?text=⚙️', false),
('Taladro Eléctrico 13mm', 'TD13-001', 2, 3, 'Bosch', 'Almacén Herramientas', 5, 2, 10, 89900.00, NULL, false),
('Martillo 500g', 'MAR500-001', 2, 2, 'Stanley', 'Estante Herramientas A', 12, 5, 25, 15600.00, NULL, false),
('Cable Eléctrico 2.5mm', 'CE25-001', 7, 1, 'ACME', 'Bodega Eléctricos', 500, 100, 2000, 890.00, NULL, false),
('Casco de Seguridad', 'CS-001', 6, 1, 'ACME', 'Almacén Seguridad', 25, 10, 50, 8500.00, NULL, false);

-- =============================================================================
-- CREAR VISTAS ÚTILES
-- =============================================================================

-- Vista de productos con información completa
CREATE OR REPLACE VIEW v_products_full AS
SELECT 
    p.*,
    c.name as category_name,
    s.name as supplier_name,
    CASE 
        WHEN p.quantity <= p.min_stock THEN 'low'
        WHEN p.quantity <= (p.min_stock * 1.5) THEN 'medium'
        ELSE 'high'
    END as stock_status
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN suppliers s ON p.supplier_id = s.id;

-- Vista de movimientos con información de productos y usuarios
CREATE OR REPLACE VIEW v_movements_full AS
SELECT 
    m.*,
    p.name as product_name,
    p.serial_number,
    u.username,
    pr.name as project_name
FROM movements m
LEFT JOIN products p ON m.product_id = p.id
LEFT JOIN users u ON m.user_id = u.id
LEFT JOIN projects pr ON m.project_id = pr.id
ORDER BY m.timestamp DESC;

-- =============================================================================
-- FUNCIÓN PARA ALERTAS DE STOCK BAJO
-- =============================================================================
CREATE OR REPLACE FUNCTION check_low_stock_alerts() 
RETURNS void AS $$
BEGIN
    INSERT INTO alerts (type, product_id, message, priority)
    SELECT 
        'LOW_STOCK',
        p.id,
        'Stock bajo para ' || p.name || '. Actual: ' || p.quantity || ', Mínimo: ' || p.min_stock,
        CASE 
            WHEN p.quantity = 0 THEN 'critical'
            WHEN p.quantity <= (p.min_stock * 0.5) THEN 'high'
            ELSE 'medium'
        END
    FROM products p
    WHERE p.quantity <= p.min_stock 
      AND p.is_active = true
      AND NOT EXISTS (
          SELECT 1 FROM alerts a 
          WHERE a.product_id = p.id 
            AND a.type = 'LOW_STOCK' 
            AND a.is_read = false
      );
END;
$$ LANGUAGE plpgsql;

-- Ejecutar función de alertas
SELECT check_low_stock_alerts();

-- =============================================================================
-- MENSAJE DE CONFIRMACIÓN
-- =============================================================================
SELECT 
    'Base de datos configurada correctamente' as mensaje,
    (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') as tablas_creadas,
    (SELECT count(*) FROM products) as productos,
    (SELECT count(*) FROM categories) as categorias,
    (SELECT count(*) FROM suppliers) as proveedores;

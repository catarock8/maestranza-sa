-- =============================================================================
-- MAESTRANZA SA - DATOS ADICIONALES COMPATIBLES CON SCRIPT SIMPLIFICADO
-- =============================================================================
-- Script complementario para insertar más datos de prueba
-- Compatible con database_setup_simple.sql
-- Usa inserción condicional para evitar duplicados
-- =============================================================================

-- Más proveedores
INSERT INTO suppliers (name, contact_name, email, phone, address, tax_id) 
SELECT 'Ferreterías Unidas', 'Roberto Mendoza', 'compras@ferreteriasunidas.cl', '+56922334455', 'Av. Las Condes 1234, Santiago', '76.123.456-7'
WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE name = 'Ferreterías Unidas');

INSERT INTO suppliers (name, contact_name, email, phone, address, tax_id) 
SELECT 'Importadora Técnica', 'Laura Hernández', 'ventas@imptecnica.cl', '+56944556677', 'Calle Industrial 567, Quilicura', '96.789.012-3'
WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE name = 'Importadora Técnica');

INSERT INTO suppliers (name, contact_name, email, phone, address, tax_id) 
SELECT 'Distribuidora Nacional', 'Pedro Morales', 'contacto@distnacional.cl', '+56966778899', 'Los Aromos 890, Maipú', '77.234.567-8'
WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE name = 'Distribuidora Nacional');

INSERT INTO suppliers (name, contact_name, email, phone, address, tax_id) 
SELECT 'Suministros Industriales', 'Carmen Reyes', 'info@sumindustriales.cl', '+56988990011', 'Av. Portales 345, San Miguel', '98.345.678-9'
WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE name = 'Suministros Industriales');

-- Más categorías específicas
INSERT INTO categories (name, description) 
SELECT 'Rodamientos', 'Rodamientos de bolas, rodillos y agujas'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Rodamientos');

INSERT INTO categories (name, description) 
SELECT 'Lubricantes', 'Aceites, grasas y lubricantes industriales'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Lubricantes');

INSERT INTO categories (name, description) 
SELECT 'Soldadura', 'Electrodos, alambre y materiales de soldadura'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Soldadura');

INSERT INTO categories (name, description) 
SELECT 'Pinturas', 'Pinturas, barnices y recubrimientos'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Pinturas');

INSERT INTO categories (name, description) 
SELECT 'Abrasivos', 'Discos, lijas y materiales abrasivos'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Abrasivos');

INSERT INTO categories (name, description) 
SELECT 'Medición', 'Instrumentos de medición y calibración'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Medición');

INSERT INTO categories (name, description) 
SELECT 'Químicos', 'Productos químicos industriales'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Químicos');

INSERT INTO categories (name, description) 
SELECT 'Empaquetaduras', 'Sellos, juntas y empaquetaduras'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Empaquetaduras');

-- Más productos específicos de maestranza
-- Rodamientos
INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, unit_of_measure, requires_expiry_control) 
SELECT 'Rodamiento 6203-2RS', 'ROD6203-001', 
    (SELECT id FROM categories WHERE name = 'Rodamientos'), 
    (SELECT id FROM suppliers WHERE name = 'Ferreterías Unidas'), 
    'SKF', 'Estante C1', 24, 8, 50, 12500.00, 'unidades', false
WHERE NOT EXISTS (SELECT 1 FROM products WHERE serial_number = 'ROD6203-001');

INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, unit_of_measure, requires_expiry_control) 
SELECT 'Rodamiento 6204-ZZ', 'ROD6204-001', 
    (SELECT id FROM categories WHERE name = 'Rodamientos'), 
    (SELECT id FROM suppliers WHERE name = 'Ferreterías Unidas'), 
    'FAG', 'Estante C1', 18, 6, 40, 15800.00, 'unidades', false
WHERE NOT EXISTS (SELECT 1 FROM products WHERE serial_number = 'ROD6204-001');

INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, unit_of_measure, requires_expiry_control) 
SELECT 'Rodamiento Cónico 32005', 'ROD32005-001', 
    (SELECT id FROM categories WHERE name = 'Rodamientos'), 
    (SELECT id FROM suppliers WHERE name = 'Distribuidora Nacional'), 
    'Timken', 'Estante C2', 12, 4, 25, 45600.00, 'unidades', false
WHERE NOT EXISTS (SELECT 1 FROM products WHERE serial_number = 'ROD32005-001');

-- Lubricantes
INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, unit_of_measure, requires_expiry_control) 
SELECT 'Aceite Hidráulico ISO 46', 'AH46-001', 
    (SELECT id FROM categories WHERE name = 'Lubricantes'), 
    (SELECT id FROM suppliers WHERE name = 'Suministros Industriales'), 
    'Shell', 'Bodega Químicos', 50, 15, 100, 8900.00, 'litros', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE serial_number = 'AH46-001');

INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, unit_of_measure, requires_expiry_control) 
SELECT 'Grasa Multiuso EP2', 'GR-EP2-001', 
    (SELECT id FROM categories WHERE name = 'Lubricantes'), 
    (SELECT id FROM suppliers WHERE name = 'Suministros Industriales'), 
    'Mobil', 'Bodega Químicos', 30, 10, 60, 4500.00, 'kg', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE serial_number = 'GR-EP2-001');

INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, unit_of_measure, requires_expiry_control) 
SELECT 'Aceite Motor SAE 15W40', 'AM15W40-001', 
    (SELECT id FROM categories WHERE name = 'Lubricantes'), 
    (SELECT id FROM suppliers WHERE name = 'Ferreterías Unidas'), 
    'Castrol', 'Bodega Químicos', 80, 20, 150, 6700.00, 'litros', true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE serial_number = 'AM15W40-001');

-- Soldadura
INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, unit_of_measure, requires_expiry_control) 
SELECT 'Electrodo E6013 2.5mm', 'EL6013-25', 
    (SELECT id FROM categories WHERE name = 'Soldadura'), 
    (SELECT id FROM suppliers WHERE name = 'Distribuidora Nacional'), 
    'ESAB', 'Almacén Soldadura', 200, 50, 500, 850.00, 'unidades', false
WHERE NOT EXISTS (SELECT 1 FROM products WHERE serial_number = 'EL6013-25');

INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, unit_of_measure, requires_expiry_control) 
SELECT 'Electrodo E7018 3.2mm', 'EL7018-32', 
    (SELECT id FROM categories WHERE name = 'Soldadura'), 
    (SELECT id FROM suppliers WHERE name = 'Distribuidora Nacional'), 
    'Lincoln', 'Almacén Soldadura', 150, 40, 400, 1200.00, 'unidades', false
WHERE NOT EXISTS (SELECT 1 FROM products WHERE serial_number = 'EL7018-32');

INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, unit_of_measure, requires_expiry_control) 
SELECT 'Alambre MIG ER70S-6 0.8mm', 'AL-MIG-08', 
    (SELECT id FROM categories WHERE name = 'Soldadura'), 
    (SELECT id FROM suppliers WHERE name = 'Ferreterías Unidas'), 
    'Bohler', 'Almacén Soldadura', 25, 8, 50, 18900.00, 'kg', false
WHERE NOT EXISTS (SELECT 1 FROM products WHERE serial_number = 'AL-MIG-08');

-- Herramientas específicas
INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, unit_of_measure, requires_expiry_control) 
SELECT 'Lima Bastarda 10"', 'LIM-BAST-10', 
    (SELECT id FROM categories WHERE name = 'Herramientas'), 
    (SELECT id FROM suppliers WHERE name = 'Aceros Chile'), 
    'Stanley', 'Estante Herramientas B', 15, 5, 30, 3400.00, 'unidades', false
WHERE NOT EXISTS (SELECT 1 FROM products WHERE serial_number = 'LIM-BAST-10');

INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, unit_of_measure, requires_expiry_control) 
SELECT 'Broca HSS 6.5mm', 'BRC-HSS-65', 
    (SELECT id FROM categories WHERE name = 'Herramientas'), 
    (SELECT id FROM suppliers WHERE name = 'TecnoPartes'), 
    'Bosch', 'Estante Herramientas A', 25, 10, 50, 1850.00, 'unidades', false
WHERE NOT EXISTS (SELECT 1 FROM products WHERE serial_number = 'BRC-HSS-65');

INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, unit_of_measure, requires_expiry_control) 
SELECT 'Disco Corte Metal 115mm', 'DCM-115', 
    (SELECT id FROM categories WHERE name = 'Abrasivos'), 
    (SELECT id FROM suppliers WHERE name = 'Industrial Supply'), 
    'Norton', 'Estante Abrasivos', 50, 20, 100, 2300.00, 'unidades', false
WHERE NOT EXISTS (SELECT 1 FROM products WHERE serial_number = 'DCM-115');

-- Elementos de medición
INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, unit_of_measure, requires_expiry_control) 
SELECT 'Vernier Digital 150mm', 'VD-150', 
    (SELECT id FROM categories WHERE name = 'Medición'), 
    (SELECT id FROM suppliers WHERE name = 'TecnoPartes'), 
    'Mitutoyo', 'Almacén Medición', 8, 3, 15, 89000.00, 'unidades', false
WHERE NOT EXISTS (SELECT 1 FROM products WHERE serial_number = 'VD-150');

INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, unit_of_measure, requires_expiry_control) 
SELECT 'Micrómetro 0-25mm', 'MIC-025', 
    (SELECT id FROM categories WHERE name = 'Medición'), 
    (SELECT id FROM suppliers WHERE name = 'TecnoPartes'), 
    'Starrett', 'Almacén Medición', 5, 2, 10, 125000.00, 'unidades', false
WHERE NOT EXISTS (SELECT 1 FROM products WHERE serial_number = 'MIC-025');

INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, unit_of_measure, requires_expiry_control) 
SELECT 'Regla Metálica 500mm', 'REG-500', 
    (SELECT id FROM categories WHERE name = 'Medición'), 
    (SELECT id FROM suppliers WHERE name = 'Aceros Chile'), 
    'Stanley', 'Almacén Medición', 12, 4, 25, 4500.00, 'unidades', false
WHERE NOT EXISTS (SELECT 1 FROM products WHERE serial_number = 'REG-500');

-- Elementos de seguridad adicionales
INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, unit_of_measure, requires_expiry_control) 
SELECT 'Guantes Nitrilo Talla M', 'GN-M', 
    (SELECT id FROM categories WHERE name = 'Seguridad'), 
    (SELECT id FROM suppliers WHERE name = 'ProSafe'), 
    'Ansell', 'Almacén Seguridad', 100, 25, 200, 850.00, 'pares', false
WHERE NOT EXISTS (SELECT 1 FROM products WHERE serial_number = 'GN-M');

INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, unit_of_measure, requires_expiry_control) 
SELECT 'Lentes Seguridad Clara', 'LS-CLARA', 
    (SELECT id FROM categories WHERE name = 'Seguridad'), 
    (SELECT id FROM suppliers WHERE name = 'ProSafe'), 
    '3M', 'Almacén Seguridad', 35, 10, 70, 3200.00, 'unidades', false
WHERE NOT EXISTS (SELECT 1 FROM products WHERE serial_number = 'LS-CLARA');

INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, unit_of_measure, requires_expiry_control) 
SELECT 'Protector Auditivo', 'PA-FOAM', 
    (SELECT id FROM categories WHERE name = 'Seguridad'), 
    (SELECT id FROM suppliers WHERE name = 'ProSafe'), 
    '3M', 'Almacén Seguridad', 80, 20, 150, 450.00, 'pares', false
WHERE NOT EXISTS (SELECT 1 FROM products WHERE serial_number = 'PA-FOAM');

-- Materiales eléctricos
INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, unit_of_measure, requires_expiry_control) 
SELECT 'Interruptor Termo 16A', 'IT-16A', 
    (SELECT id FROM categories WHERE name = 'Eléctricos'), 
    (SELECT id FROM suppliers WHERE name = 'Ferreterías Unidas'), 
    'Schneider', 'Bodega Eléctricos', 15, 5, 30, 8900.00, 'unidades', false
WHERE NOT EXISTS (SELECT 1 FROM products WHERE serial_number = 'IT-16A');

INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, unit_of_measure, requires_expiry_control) 
SELECT 'Contactor 25A 220V', 'CT-25A-220', 
    (SELECT id FROM categories WHERE name = 'Eléctricos'), 
    (SELECT id FROM suppliers WHERE name = 'Ferreterías Unidas'), 
    'ABB', 'Bodega Eléctricos', 8, 3, 15, 45600.00, 'unidades', false
WHERE NOT EXISTS (SELECT 1 FROM products WHERE serial_number = 'CT-25A-220');

INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, unit_of_measure, requires_expiry_control) 
SELECT 'Cable Control 3x1.5mm', 'CC-3X15', 
    (SELECT id FROM categories WHERE name = 'Eléctricos'), 
    (SELECT id FROM suppliers WHERE name = 'Distribuidora Nacional'), 
    'Procobre', 'Bodega Eléctricos', 300, 50, 800, 1200.00, 'metros', false
WHERE NOT EXISTS (SELECT 1 FROM products WHERE serial_number = 'CC-3X15');

-- Hidráulicos y neumáticos
INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, unit_of_measure, requires_expiry_control) 
SELECT 'Manguera Hidráulica 1/2"', 'MH-12', 
    (SELECT id FROM categories WHERE name = 'Hidráulicos'), 
    (SELECT id FROM suppliers WHERE name = 'Suministros Industriales'), 
    'Parker', 'Bodega Hidráulicos', 100, 25, 200, 2800.00, 'metros', false
WHERE NOT EXISTS (SELECT 1 FROM products WHERE serial_number = 'MH-12');

INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, unit_of_measure, requires_expiry_control) 
SELECT 'Válvula Bola 1" NPT', 'VB-1NPT', 
    (SELECT id FROM categories WHERE name = 'Hidráulicos'), 
    (SELECT id FROM suppliers WHERE name = 'Suministros Industriales'), 
    'Swagelok', 'Bodega Hidráulicos', 12, 4, 25, 23400.00, 'unidades', false
WHERE NOT EXISTS (SELECT 1 FROM products WHERE serial_number = 'VB-1NPT');

INSERT INTO products (name, serial_number, category_id, supplier_id, brand, location, quantity, min_stock, max_stock, unit_cost, unit_of_measure, requires_expiry_control) 
SELECT 'Filtro Hidráulico Return', 'FH-RET-001', 
    (SELECT id FROM categories WHERE name = 'Hidráulicos'), 
    (SELECT id FROM suppliers WHERE name = 'Suministros Industriales'), 
    'Hydac', 'Bodega Hidráulicos', 6, 2, 15, 67800.00, 'unidades', false
WHERE NOT EXISTS (SELECT 1 FROM products WHERE serial_number = 'FH-RET-001');

-- Insertar más proyectos
INSERT INTO projects (name, description, status, start_date, budget) 
SELECT 'Mantenimiento Compresor A1', 'Mantenimiento preventivo del compresor principal de la línea A', 'active', '2025-07-01', 450000.00
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Mantenimiento Compresor A1');

INSERT INTO projects (name, description, status, start_date, budget) 
SELECT 'Reparación Bomba Hidráulica B2', 'Reparación mayor de la bomba hidráulica de la estación B2', 'active', '2025-07-15', 890000.00
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Reparación Bomba Hidráulica B2');

INSERT INTO projects (name, description, status, start_date, budget) 
SELECT 'Instalación Nueva Línea C', 'Instalación y puesta en marcha de nueva línea de producción C', 'active', '2025-08-01', 2500000.00
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Instalación Nueva Línea C');

INSERT INTO projects (name, description, status, start_date, budget) 
SELECT 'Actualización Sistema Eléctrico', 'Modernización del tablero eléctrico principal', 'active', '2025-07-20', 1200000.00
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Actualización Sistema Eléctrico');

INSERT INTO projects (name, description, status, start_date, budget) 
SELECT 'Mantenimiento Anual Grúas', 'Mantenimiento programado de grúas puente', 'active', '2025-09-01', 780000.00
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Mantenimiento Anual Grúas');

-- Insertar más lotes con fechas variadas
INSERT INTO batches (product_id, lot_number, quantity, manufacturing_date, expiry_date, cost_per_unit, supplier_id) 
SELECT p.id, 'LOT-LUB-2025-001', 50, '2025-01-15', '2027-01-15', 8900.00, s.id
FROM products p, suppliers s
WHERE p.serial_number = 'AH46-001' 
AND s.name = 'Suministros Industriales'
AND NOT EXISTS (SELECT 1 FROM batches WHERE lot_number = 'LOT-LUB-2025-001');

INSERT INTO batches (product_id, lot_number, quantity, manufacturing_date, expiry_date, cost_per_unit, supplier_id) 
SELECT p.id, 'LOT-GR-2025-001', 30, '2025-02-01', '2026-08-01', 4500.00, s.id
FROM products p, suppliers s
WHERE p.serial_number = 'GR-EP2-001' 
AND s.name = 'Suministros Industriales'
AND NOT EXISTS (SELECT 1 FROM batches WHERE lot_number = 'LOT-GR-2025-001');

INSERT INTO batches (product_id, lot_number, quantity, manufacturing_date, expiry_date, cost_per_unit, supplier_id) 
SELECT p.id, 'LOT-MOT-2025-001', 80, '2025-03-01', '2027-03-01', 6700.00, s.id
FROM products p, suppliers s
WHERE p.serial_number = 'AM15W40-001' 
AND s.name = 'Ferreterías Unidas'
AND NOT EXISTS (SELECT 1 FROM batches WHERE lot_number = 'LOT-MOT-2025-001');

INSERT INTO batches (product_id, lot_number, quantity, manufacturing_date, expiry_date, cost_per_unit, supplier_id) 
SELECT p.id, 'LOT-SOLD-2025-001', 200, '2025-01-10', '2028-01-10', 850.00, s.id
FROM products p, suppliers s
WHERE p.serial_number = 'EL6013-25' 
AND s.name = 'Distribuidora Nacional'
AND NOT EXISTS (SELECT 1 FROM batches WHERE lot_number = 'LOT-SOLD-2025-001');

INSERT INTO batches (product_id, lot_number, quantity, manufacturing_date, expiry_date, cost_per_unit, supplier_id) 
SELECT p.id, 'LOT-ABRAS-2025-001', 50, '2025-02-15', '2026-02-15', 2300.00, s.id
FROM products p, suppliers s
WHERE p.serial_number = 'DCM-115' 
AND s.name = 'Industrial Supply'
AND NOT EXISTS (SELECT 1 FROM batches WHERE lot_number = 'LOT-ABRAS-2025-001');

-- Insertar más movimientos de inventario
INSERT INTO movements (product_id, type, quantity, previous_quantity, new_quantity, reason, project_id, user_id, timestamp) 
SELECT p.id, 'IN', 24, 0, 24, 'Compra inicial de rodamientos', NULL, 1, '2025-06-15 09:30:00'
FROM products p
WHERE p.serial_number = 'ROD6203-001'
AND NOT EXISTS (SELECT 1 FROM movements WHERE product_id = p.id AND reason = 'Compra inicial de rodamientos');

INSERT INTO movements (product_id, type, quantity, previous_quantity, new_quantity, reason, project_id, user_id, timestamp) 
SELECT p.id, 'IN', 50, 0, 50, 'Recepción aceite hidráulico', NULL, 1, '2025-06-16 14:20:00'
FROM products p
WHERE p.serial_number = 'AH46-001'
AND NOT EXISTS (SELECT 1 FROM movements WHERE product_id = p.id AND reason = 'Recepción aceite hidráulico');

INSERT INTO movements (product_id, type, quantity, previous_quantity, new_quantity, reason, project_id, user_id, timestamp) 
SELECT p.id, 'IN', 200, 0, 200, 'Compra electrodos soldadura', NULL, 1, '2025-06-17 10:15:00'
FROM products p
WHERE p.serial_number = 'EL6013-25'
AND NOT EXISTS (SELECT 1 FROM movements WHERE product_id = p.id AND reason = 'Compra electrodos soldadura');

-- Salidas por proyectos
INSERT INTO movements (product_id, type, quantity, previous_quantity, new_quantity, reason, project_id, user_id, timestamp) 
SELECT p.id, 'OUT', 2, 24, 22, 'Mantenimiento compresor A1', pr.id, 1, '2025-06-20 08:45:00'
FROM products p, projects pr
WHERE p.serial_number = 'ROD6203-001' 
AND pr.name = 'Mantenimiento Compresor A1'
AND NOT EXISTS (SELECT 1 FROM movements WHERE product_id = p.id AND reason = 'Mantenimiento compresor A1');

INSERT INTO movements (product_id, type, quantity, previous_quantity, new_quantity, reason, project_id, user_id, timestamp) 
SELECT p.id, 'OUT', 10, 50, 40, 'Cambio aceite bomba B2', pr.id, 1, '2025-06-21 11:30:00'
FROM products p, projects pr
WHERE p.serial_number = 'AH46-001' 
AND pr.name = 'Reparación Bomba Hidráulica B2'
AND NOT EXISTS (SELECT 1 FROM movements WHERE product_id = p.id AND reason = 'Cambio aceite bomba B2');

INSERT INTO movements (product_id, type, quantity, previous_quantity, new_quantity, reason, project_id, user_id, timestamp) 
SELECT p.id, 'OUT', 50, 200, 150, 'Soldaduras línea C', pr.id, 1, '2025-06-22 13:15:00'
FROM products p, projects pr
WHERE p.serial_number = 'EL6013-25' 
AND pr.name = 'Instalación Nueva Línea C'
AND NOT EXISTS (SELECT 1 FROM movements WHERE product_id = p.id AND reason = 'Soldaduras línea C');

-- Ajustes de inventario
INSERT INTO movements (product_id, type, quantity, previous_quantity, new_quantity, reason, project_id, user_id, timestamp) 
SELECT p.id, 'ADJUST', 100, 0, 100, 'Ajuste inventario inicial', NULL, 1, '2025-06-18 16:00:00'
FROM products p
WHERE p.serial_number = 'GN-M'
AND NOT EXISTS (SELECT 1 FROM movements WHERE product_id = p.id AND reason = 'Ajuste inventario inicial');

INSERT INTO movements (product_id, type, quantity, previous_quantity, new_quantity, reason, project_id, user_id, timestamp) 
SELECT p.id, 'ADJUST', 35, 0, 35, 'Ajuste inventario inicial', NULL, 1, '2025-06-18 16:05:00'
FROM products p
WHERE p.serial_number = 'LS-CLARA'
AND NOT EXISTS (SELECT 1 FROM movements WHERE product_id = p.id AND reason = 'Ajuste inventario inicial');

-- Generar algunas alertas automáticas (solo si la función existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_low_stock_alerts') THEN
        PERFORM check_low_stock_alerts();
    END IF;
END $$;

-- Mensaje de finalización
DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'DATOS ADICIONALES INSERTADOS EXITOSAMENTE (VERSION SIMPLIFICADA)';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Productos totales: %', (SELECT count(*) FROM products);
    RAISE NOTICE 'Proveedores totales: %', (SELECT count(*) FROM suppliers);
    RAISE NOTICE 'Categorías totales: %', (SELECT count(*) FROM categories);
    RAISE NOTICE 'Movimientos totales: %', (SELECT count(*) FROM movements);
    RAISE NOTICE 'Proyectos activos: %', (SELECT count(*) FROM projects WHERE status = 'active');
    RAISE NOTICE '=============================================================================';
END $$;

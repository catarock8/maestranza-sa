-- =============================================================================
-- MAESTRANZA SA - TABLA DE FECHAS DE VENCIMIENTO DE PRODUCTOS (SUPABASE)
-- =============================================================================
-- Esta tabla almacena la fecha de vencimiento para productos que requieren control de vencimiento
-- Relaciona 1 producto con 0 o 1 fecha de vencimiento principal (puedes extender a varios si lo deseas)
-- =============================================================================

CREATE TABLE IF NOT EXISTS expiries (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    expiry_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id)
);

-- Índice para búsquedas rápidas por producto
CREATE INDEX IF NOT EXISTS idx_expiries_product_id ON expiries(product_id);

-- Ejemplo de inserción:
-- INSERT INTO expiries (product_id, expiry_date) VALUES (1, '2026-12-31');

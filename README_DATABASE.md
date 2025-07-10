# Maestranza SA - Scripts de Base de Datos

Este directorio contiene los scripts SQL necesarios para configurar la base de datos del sistema de inventarios Maestranza SA en Supabase (PostgreSQL).

## Archivos

### 1. `database_setup.sql`
Script principal que contiene:
- ✅ Creación de todas las tablas del sistema
- ✅ Configuración de índices y triggers
- ✅ Datos iniciales básicos
- ✅ Vistas útiles
- ✅ Funciones automáticas
- ✅ Usuario administrador por defecto

### 2. `additional_data.sql`
Script complementario con:
- ✅ Más productos de ejemplo
- ✅ Más proveedores y categorías
- ✅ Movimientos de inventario
- ✅ Órdenes de compra de ejemplo
- ✅ Proyectos y asignaciones

## Cómo ejecutar en Supabase

### Opción 1: Dashboard de Supabase
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a `SQL Editor`
3. Copia y pega el contenido de `database_setup.sql`
4. Haz clic en `Run` para ejecutar
5. Luego ejecuta `additional_data.sql` de la misma manera

### Opción 2: CLI de Supabase
```bash
# Instalar Supabase CLI si no lo tienes
npm install -g supabase

# Iniciar sesión
supabase login

# Ejecutar los scripts
supabase db push --db-url "tu-database-url"
```

### Opción 3: Desde tu aplicación Python
```python
from supabase import create_client
import os

# Configurar cliente
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
supabase = create_client(url, key)

# Leer y ejecutar script
with open('database_setup.sql', 'r') as file:
    sql_script = file.read()
    
# Ejecutar en bloques (PostgreSQL no permite múltiples statements en una sola query)
# Necesitarás dividir el script o usar psycopg2 directamente
```

## Estructura de Base de Datos

### Tablas Principales
- `users` - Usuarios del sistema
- `categories` - Categorías de productos
- `suppliers` - Proveedores
- `products` - Productos principales
- `batches` - Lotes con control de vencimiento
- `movements` - Movimientos de inventario
- `projects` - Proyectos de trabajo
- `purchase_orders` - Órdenes de compra
- `alerts` - Sistema de alertas
- `inventory_audits` - Auditorías de inventario

### Vistas Disponibles
- `v_products_full` - Productos con información completa
- `v_movements_full` - Movimientos con detalles
- `v_alerts_full` - Alertas con información de productos

### Funciones Automáticas
- `check_low_stock_alerts()` - Genera alertas de stock bajo
- `mark_expired_batches()` - Marca lotes expirados

## Datos de Prueba

### Usuario Administrador
- **Username:** `admin`
- **Password:** `admin123`
- **Email:** `admin@maestranza.com`
- **Rol:** `Admin`

### Productos de Ejemplo
- Sujetadores (tuercas, tornillos, arandelas)
- Herramientas (taladros, martillos)
- Elementos de seguridad
- Componentes eléctricos e hidráulicos

### Proveedores de Ejemplo
- ACME Industrial
- Stanley Tools
- Bosch Chile
- Makita Distributors

## Configuración de Seguridad

### Variables de Entorno Requeridas
```bash
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### Row Level Security (RLS)
Las políticas RLS están comentadas en el script. Puedes habilitarlas según tus necesidades de seguridad.

## Verificación Post-Instalación

Después de ejecutar los scripts, verifica que todo esté funcionando:

```sql
-- Verificar tablas creadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar datos iniciales
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_categories FROM categories;

-- Verificar vistas
SELECT * FROM v_products_full LIMIT 5;

-- Probar funciones
SELECT check_low_stock_alerts();
```

## Mantenimiento

### Limpieza de Alertas Leídas
```sql
DELETE FROM alerts 
WHERE is_read = true 
AND created_at < NOW() - INTERVAL '30 days';
```

### Backup de Datos
```sql
-- Exportar productos
COPY products TO '/path/to/products_backup.csv' DELIMITER ',' CSV HEADER;

-- Exportar movimientos
COPY movements TO '/path/to/movements_backup.csv' DELIMITER ',' CSV HEADER;
```

## Notas Importantes

1. **Cambiar Password:** Cambiar la contraseña del usuario admin en producción
2. **Índices:** Los índices se crean de forma concurrente para evitar locks
3. **Timezone:** Configurado en UTC, ajustar según necesidades
4. **Moneda:** Configurado en CLP (Pesos Chilenos)

## Soporte

Si encuentras algún problema durante la instalación:

1. Verifica que tienes permisos de Service Role en Supabase
2. Revisa los logs de error en el Dashboard de Supabase
3. Asegúrate de que todas las extensiones requeridas estén habilitadas
4. Verifica la conectividad con la base de datos

---

**Última actualización:** Julio 2025  
**Versión:** 1.0  
**Compatibilidad:** PostgreSQL 13+, Supabase

import os
from datetime import datetime, date
from dotenv import load_dotenv
from supabase import create_client, Client

# Cargar variables de entorno
load_dotenv()

# IMPORTANTE: Usar SUPABASE_KEY (anon key) para el cliente
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')  # Esta es la anon key, NO la service role

print(f"🔑 SUPABASE_URL: {SUPABASE_URL}")
print(f"🔑 SUPABASE_KEY (first 20): {SUPABASE_KEY[:20] if SUPABASE_KEY else 'NOT SET'}...")

# Crear cliente de Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Verificar conexión al cargar el módulo
try:
    test_response = supabase.table('products').select('count', count='exact').execute()
    print(f"✅ Conexión a Supabase exitosa - Total productos: {test_response.count}")
except Exception as e:
    print(f"❌ Error conectando a Supabase: {e}")

# =============================================================================
# FUNCIONES DE PRODUCTOS
# =============================================================================

def get_products(order_by='name', order_dir='asc', limit=None):
    """Obtiene la lista de productos con información relacionada"""
    try:
        print(f"🔍 Obteniendo productos...")
        
        # Usar la tabla products directamente con joins
        query = supabase.table('products').select(
            '*',
            'categories(name)',
            'suppliers(name)'
        )
        
        # Aplicar orden
        if order_dir.lower() == 'desc':
            query = query.order(order_by, desc=True)
        else:
            query = query.order(order_by)
            
        # Aplicar límite si existe
        if limit:
            query = query.limit(limit)
            
        response = query.execute()
        
        # Transformar la respuesta para incluir los nombres de categoría y proveedor
        products = []
        for product in response.data:
            # Copiar todos los campos del producto
            p = dict(product)
            
            # Agregar nombres de categoría y proveedor
            p['category_name'] = product.get('categories', {}).get('name') if product.get('categories') else None
            p['supplier_name'] = product.get('suppliers', {}).get('name') if product.get('suppliers') else None
            
            # Remover los objetos anidados
            p.pop('categories', None)
            p.pop('suppliers', None)
            
            products.append(p)
        
        print(f"✅ Productos obtenidos: {len(products)}")
        return products
        
    except Exception as e:
        print(f"❌ Error obteniendo productos: {e}")
        return []

def get_categories():
    """Obtiene todas las categorías"""
    try:
        response = supabase.table('categories').select('*').order('name').execute()
        return response.data
    except Exception as e:
        print(f"❌ Error obteniendo categorías: {e}")
        return []

def get_suppliers():
    """Obtiene todos los proveedores"""
    try:
        response = supabase.table('suppliers').select('*').order('name').execute()
        return response.data
    except Exception as e:
        print(f"❌ Error obteniendo proveedores: {e}")
        return []

def get_brands():
    """Obtiene todas las marcas únicas de productos"""
    try:
        response = supabase.table('products').select('brand').execute()
        
        # Extraer marcas únicas y filtrar None/null
        brands = list(set([item['brand'] for item in response.data if item.get('brand')]))
        brands.sort()
        
        # Convertir a formato esperado por el frontend
        brand_objects = [{'id': i+1, 'name': brand} for i, brand in enumerate(brands)]
        
        return brand_objects
    except Exception as e:
        print(f"❌ Error obteniendo marcas: {e}")
        return []

def get_projects():
    """Obtiene todos los proyectos"""
    try:
        response = supabase.table('projects').select('*').order('name').execute()
        return response.data
    except Exception as e:
        print(f"❌ Error obteniendo proyectos: {e}")
        return []

def get_movements(limit=100):
    """Obtiene los movimientos de inventario más recientes"""
    try:
        response = supabase.table('movements').select(
            '*',
            'products(name, serial_number)',
            'users(username)',
            'projects(name)'
        ).order('timestamp', desc=True).limit(limit).execute()
        
        return response.data
    except Exception as e:
        print(f"❌ Error obteniendo movimientos: {e}")
        return []

def get_dashboard_stats():
    """Obtiene estadísticas para el dashboard"""
    try:
        # Contar productos
        products_count = supabase.table('products').select('*', count='exact').execute()
        
        # Contar categorías
        categories_count = supabase.table('categories').select('*', count='exact').execute()
        
        # Contar proveedores
        suppliers_count = supabase.table('suppliers').select('*', count='exact').execute()
        
        # Contar proyectos activos
        projects_count = supabase.table('projects').select('*', count='exact').eq('status', 'active').execute()
        
        stats = {
            'total_products': products_count.count,
            'total_categories': categories_count.count,
            'total_suppliers': suppliers_count.count,
            'active_projects': projects_count.count
        }
        
        return stats
        
    except Exception as e:
        print(f"❌ Error obteniendo estadísticas: {e}")
        return {
            'total_products': 0,
            'total_categories': 0,
            'total_suppliers': 0,
            'active_projects': 0
        }

def create_sample_data():
    """Crea datos de ejemplo si no existen"""
    try:
        # Verificar si ya hay datos
        existing = supabase.table('products').select('*', count='exact').execute()
        if existing.count > 0:
            print(f"ℹ️ Ya existen {existing.count} productos. No se crearán datos de ejemplo.")
            return True
            
        print("📦 Base de datos vacía. Creando datos de ejemplo...")
        
        # Los datos ya deberían estar creados por el SQL script
        # Esta función es solo para verificación
        
        return True
        
    except Exception as e:
        print(f"❌ Error creando datos de ejemplo: {e}")
        return False
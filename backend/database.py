import os
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client
import urllib3

# Deshabilitar warnings SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Cargar variables de entorno
load_dotenv()

# Configuración de Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

# Crear cliente Supabase - versión compatible con múltiples versiones
try:
    # Intento 1: Versión nueva con ClientOptions
    from supabase.client import ClientOptions
    import httpx
    
    http_client = httpx.Client(verify=False)
    supabase: Client = create_client(
        SUPABASE_URL,
        SUPABASE_KEY,
        options=ClientOptions(
            httpx_client=http_client
        )
    )
    print("✅ Cliente Supabase creado con ClientOptions (SSL deshabilitado)")
    
except:
    try:
        # Intento 2: Versión simple sin SSL
        import os
        os.environ['CURL_CA_BUNDLE'] = ""
        os.environ['REQUESTS_CA_BUNDLE'] = ""
        
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Cliente Supabase creado (método alternativo)")
        
    except Exception as e:
        print(f"❌ Error creando cliente: {e}")
        # Intento 3: Cliente básico
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Cliente Supabase creado (básico)")

# =============================================================================
# FUNCIONES DE PRODUCTOS
# =============================================================================

def get_products(order_by='name', order_dir='asc', limit=None):
    """Obtiene la lista de productos con información relacionada"""
    try:
        # Query simple
        query = supabase.table('products').select('*')
        
        # Aplicar orden
        if order_dir.lower() == 'desc':
            query = query.order(order_by, desc=True)
        else:
            query = query.order(order_by)
            
        # Aplicar límite si existe
        if limit:
            query = query.limit(limit)
            
        response = query.execute()
        return response.data
        
    except Exception as e:
        print(f"Error obteniendo productos: {e}")
        return []

def get_categories():
    """Obtiene todas las categorías"""
    try:
        response = supabase.table('categories').select('*').order('name').execute()
        return response.data
    except Exception as e:
        print(f"Error obteniendo categorías: {e}")
        return []

def get_suppliers():
    """Obtiene todos los proveedores"""
    try:
        response = supabase.table('suppliers').select('*').order('name').execute()
        return response.data
    except Exception as e:
        print(f"Error obteniendo proveedores: {e}")
        return []

def get_brands():
    """Obtiene todas las marcas únicas de productos"""
    try:
        response = supabase.table('products').select('brand').execute()
        
        # Extraer marcas únicas
        brands = list(set([item['brand'] for item in response.data if item.get('brand')]))
        brands.sort()
        
        # Convertir a formato esperado por el frontend
        brand_objects = [{'id': i+1, 'name': brand} for i, brand in enumerate(brands)]
        
        return brand_objects
    except Exception as e:
        print(f"Error obteniendo marcas: {e}")
        return []

def get_projects():
    """Obtiene todos los proyectos"""
    try:
        response = supabase.table('projects').select('*').order('name').execute()
        return response.data
    except Exception as e:
        print(f"Error obteniendo proyectos: {e}")
        return []

def get_movements(limit=100):
    """Obtiene los movimientos de inventario más recientes"""
    try:
        response = supabase.table('movements').select('*').order('timestamp', desc=True).limit(limit).execute()
        return response.data
    except Exception as e:
        print(f"Error obteniendo movimientos: {e}")
        return []

def get_dashboard_stats():
    """Obtiene estadísticas para el dashboard"""
    try:
        # Contar productos
        products_response = supabase.table('products').select('id').execute()
        
        # Contar categorías
        categories_response = supabase.table('categories').select('id').execute()
        
        # Contar proveedores
        suppliers_response = supabase.table('suppliers').select('id').execute()
        
        # Contar proyectos activos
        projects_response = supabase.table('projects').select('id').eq('status', 'active').execute()
        
        stats = {
            'total_products': len(products_response.data),
            'total_categories': len(categories_response.data),
            'total_suppliers': len(suppliers_response.data),
            'active_projects': len(projects_response.data)
        }
        
        return stats
        
    except Exception as e:
        print(f"Error obteniendo estadísticas: {e}")
        return {
            'total_products': 0,
            'total_categories': 0,
            'total_suppliers': 0,
            'active_projects': 0
        }

def create_sample_data():
    """Verifica si hay datos"""
    try:
        existing = supabase.table('products').select('id').execute()
        if len(existing.data) > 0:
            print(f"Ya existen {len(existing.data)} productos.")
            return True
        else:
            print("Base de datos vacía. Ejecuta el script SQL en Supabase.")
            return True
    except Exception as e:
        print(f"Error: {e}")
        return False
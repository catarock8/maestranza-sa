





# ==== CONEXIÓN SIMPLE A SUPABASE (SIN MANEJO DE SSL MANUAL) ====
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Cargar variables de entorno
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')  # Usa la clave pública

print(f"🔑 SUPABASE_URL: {SUPABASE_URL}")
print(f"� SUPABASE_KEY (first 8): {SUPABASE_KEY[:8] if SUPABASE_KEY else None}")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

from dotenv import load_dotenv
from supabase import create_client, Client

# Cargar variables de entorno
load_dotenv()

# Configuración para Supabase Client (solo lo necesario)
from datetime import datetime, date

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

print(f"🔑 SUPABASE_URL: {SUPABASE_URL}")
print(f"🔑 SUPABASE_SERVICE_ROLE_KEY (first 8): {SUPABASE_SERVICE_ROLE_KEY[:8] if SUPABASE_SERVICE_ROLE_KEY else None}")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Diagnóstico: consulta directa a products al cargar el módulo
try:
    diag_response = supabase.table('products').select('*').limit(1).execute()
    print(f"🧪 Diagnóstico: productos encontrados: {len(diag_response.data)} (debería ser >0 si hay datos y permisos)")
    if diag_response.data:
        print(f"🧪 Primer producto: {diag_response.data[0]}")
except Exception as e:
    print(f"❌ Diagnóstico: error consultando products: {e}")


def create_sample_data():
    """Crea datos de ejemplo"""
    try:
        print("📦 Creando datos de ejemplo...")
        return True
    except Exception as e:
        print(f"❌ Error creando datos de ejemplo: {e}")
        return False

# =============================================================================
# FUNCIONES DE PRODUCTOS
# =============================================================================

def get_products(order_by='name', order_dir='asc', limit=None):
    """
    Obtiene la lista de productos con información relacionada
    """
    try:
        print(f"🔍 Obteniendo productos (order_by={order_by}, order_dir={order_dir}, limit={limit})")
        # Usar la vista v_products_full para obtener también el nombre de la categoría y proveedor
        query = supabase.table('v_products_full').select('*')
        if order_dir.lower() == 'desc':
            query = query.order(order_by, desc=True)
        else:
            query = query.order(order_by, desc=False)
        if limit:
            query = query.limit(limit)
        response = query.execute()
        print(f"✅ Productos obtenidos: {len(response.data)}")
        return response.data
    except Exception as e:
        print(f"❌ Error obteniendo productos: {e}")
        return []

def get_categories():
    """Obtiene todas las categorías"""
    try:
        print("🔍 Obteniendo categorías...")
        response = supabase.table('categories').select('*').order('name').execute()
        print(f"✅ Categorías obtenidas: {len(response.data)}")
        return response.data
    except Exception as e:
        print(f"❌ Error obteniendo categorías: {e}")
        return []

def get_suppliers():
    """Obtiene todos los proveedores"""
    try:
        print("🔍 Obteniendo proveedores...")
        response = supabase.table('suppliers').select('*').order('name').execute()
        print(f"✅ Proveedores obtenidos: {len(response.data)}")
        return response.data
    except Exception as e:
        print(f"❌ Error obteniendo proveedores: {e}")
        return []

def get_brands():
    """Obtiene todas las marcas únicas de productos"""
    try:
        print("🔍 Obteniendo marcas...")
        response = supabase.table('products').select('brand').execute()
        
        # Extraer marcas únicas
        brands = list(set([item['brand'] for item in response.data if item.get('brand')]))
        brands.sort()
        
        # Convertir a formato esperado por el frontend
        brand_objects = [{'id': i+1, 'name': brand} for i, brand in enumerate(brands)]
        
        print(f"✅ Marcas obtenidas: {len(brand_objects)}")
        return brand_objects
    except Exception as e:
        print(f"❌ Error obteniendo marcas: {e}")
        return []

def get_projects():
    """Obtiene todos los proyectos"""
    try:
        print("🔍 Obteniendo proyectos...")
        response = supabase.table('projects').select('*').order('name').execute()
        print(f"✅ Proyectos obtenidos: {len(response.data)}")
        return response.data
    except Exception as e:
        print(f"❌ Error obteniendo proyectos: {e}")
        return []

def get_movements(limit=100):
    """Obtiene los movimientos de inventario más recientes"""
    try:
        print(f"🔍 Obteniendo movimientos (limit={limit})...")
        response = supabase.table('movements').select('''
            *,
            products!inner(name, serial_number),
            users!inner(username),
            projects(name)
        ''').order('timestamp', desc=True).limit(limit).execute()
        
        print(f"✅ Movimientos obtenidos: {len(response.data)}")
        return response.data
    except Exception as e:
        print(f"❌ Error obteniendo movimientos: {e}")
        return []

# =============================================================================
# FUNCIONES DE USUARIOS Y AUTENTICACIÓN
# =============================================================================

def create_user(username: str, email: str, password: str, role: str = 'user'):
    """Crea un nuevo usuario"""
    try:
        from werkzeug.security import generate_password_hash
        
        if not supabase:
            print("❌ Error: Cliente de Supabase no disponible")
            return None
            
        user_data = {
            'username': username,
            'email': email,
            'password': generate_password_hash(password),
            'role': role,
            'is_active': True,
            'created_at': datetime.now().isoformat()
        }
        
        response = supabase.table('users').insert(user_data).execute()
        print(f"✅ Usuario {username} creado exitosamente")
        return response.data[0] if response.data else None
        
    except Exception as e:
        print(f"❌ Error creando usuario: {e}")
        return None

def get_user_by_username(username: str):
    """Obtiene un usuario por nombre de usuario"""
    try:
        if not supabase:
            return None
        response = supabase.table('users').select('*').eq('username', username).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"❌ Error obteniendo usuario: {e}")
        return None

def get_user_by_email(email: str):
    """Obtiene un usuario por email"""
    try:
        if not supabase:
            return None
        response = supabase.table('users').select('*').eq('email', email).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"❌ Error obteniendo usuario por email: {e}")
        return None

def create_admin_user():
    """Crea el usuario administrador por defecto"""
    try:
        if not supabase:
            print("❌ Error: Cliente de Supabase no disponible")
            return False
        
        # Verificar si ya existe el admin
        existing_admin = supabase.table('users').select('*').eq('username', 'admin').execute()
        
        if existing_admin.data:
            print("ℹ️  Usuario admin ya existe")
            return True
        
        # Crear usuario admin
        from werkzeug.security import generate_password_hash
        
        admin_data = {
            'username': 'admin',
            'email': 'admin@maestranza.com',
            'password': generate_password_hash('admin123'),
            'role': 'admin',
            'is_active': True,
            'created_at': datetime.now().isoformat()
        }
        
        response = supabase.table('users').insert(admin_data).execute()
        print("✅ Usuario admin creado: admin/admin123")
        return True
        
    except Exception as e:
        print(f"❌ Error creando usuario admin: {e}")
        return False

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def serialize_datetime(obj):
    """Convierte objetos datetime a string para JSON"""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    return obj

def get_dashboard_stats():
    """Obtiene estadísticas para el dashboard"""
    try:
        print("📊 Obteniendo estadísticas del dashboard...")
        
        # Contar productos
        products_response = supabase.table('products').select('id').execute()
        total_products = len(products_response.data)
        
        # Contar categorías
        categories_response = supabase.table('categories').select('id').execute()
        total_categories = len(categories_response.data)
        
        # Contar proveedores
        suppliers_response = supabase.table('suppliers').select('id').execute()
        total_suppliers = len(suppliers_response.data)
        
        # Contar proyectos activos
        projects_response = supabase.table('projects').select('id').eq('status', 'active').execute()
        active_projects = len(projects_response.data)
        
        stats = {
            'total_products': total_products,
            'total_categories': total_categories,
            'total_suppliers': total_suppliers,
            'active_projects': active_projects
        }
        
        print(f"✅ Estadísticas obtenidas: {stats}")
        return stats
        
    except Exception as e:
        print(f"❌ Error obteniendo estadísticas: {e}")
        return {
            'total_products': 0,
            'total_categories': 0,
            'total_suppliers': 0,
            'active_projects': 0
        }

# Inicializar base de datos al importar

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from database import (
    get_products, get_categories, get_brands,
    get_suppliers, get_projects, get_movements,
    get_dashboard_stats, create_sample_data
)

# App setup
app = FastAPI(title="Inventarios Maestranza S.A.")

# CORS más permisivo para desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especifica los orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/')
def root():
    return {
        'message': 'API Maestranza S.A. funcionando con Supabase', 
        'status': 'OK',
        'timestamp': datetime.now().isoformat(),
        'endpoints': {
            'products': '/products',
            'categories': '/categories', 
            'brands': '/brands',
            'suppliers': '/suppliers',
            'projects': '/projects',
            'movements': '/movements',
            'dashboard': '/dashboard/stats',
            'create_sample': '/create-sample-data'
        }
    }

@app.get('/products')
def list_products():
    """Lista todos los productos"""
    try:
        products = get_products()
        return products
    except Exception as e:
        print(f"[ERROR] /products: {e}")
        raise HTTPException(500, f'Error obteniendo productos: {str(e)}')

@app.get('/categories')
def list_categories():
    """Lista todas las categorías"""
    try:
        return get_categories()
    except Exception as e:
        raise HTTPException(500, f'Error obteniendo categorías: {str(e)}')

@app.get('/brands')
def list_brands():
    """Lista todas las marcas únicas"""
    try:
        return get_brands()
    except Exception as e:
        raise HTTPException(500, f'Error obteniendo marcas: {str(e)}')

@app.get('/suppliers')
def list_suppliers():
    """Lista todos los proveedores"""
    try:
        return get_suppliers()
    except Exception as e:
        raise HTTPException(500, f'Error obteniendo proveedores: {str(e)}')

@app.get('/projects')
def list_projects():
    """Lista todos los proyectos"""
    try:
        return get_projects()
    except Exception as e:
        raise HTTPException(500, f'Error obteniendo proyectos: {str(e)}')

@app.get('/movements')
def list_movements(limit: int = 100):
    """Lista los movimientos de inventario"""
    try:
        return get_movements(limit=limit)
    except Exception as e:
        raise HTTPException(500, f'Error obteniendo movimientos: {str(e)}')

@app.get('/dashboard/stats')
def dashboard_stats():
    """Obtiene estadísticas para el dashboard"""
    try:
        return get_dashboard_stats()
    except Exception as e:
        raise HTTPException(500, f'Error obteniendo estadísticas: {str(e)}')

@app.post('/create-sample-data')
def create_sample():
    """Crea datos de ejemplo (solo si la BD está vacía)"""
    try:
        success = create_sample_data()
        if success:
            products = get_products()
            return {
                'message': 'Verificación completada',
                'total_products': len(products),
                'status': 'success'
            }
        else:
            raise HTTPException(500, 'Error verificando datos')
    except Exception as e:
        raise HTTPException(500, f'Error: {str(e)}')

# Endpoint de salud
@app.get('/health')
def health_check():
    """Verifica el estado del servicio"""
    try:
        # Intentar una consulta simple
        stats = get_dashboard_stats()
        return {
            'status': 'healthy',
            'database': 'connected',
            'timestamp': datetime.now().isoformat(),
            'stats': stats
        }
    except:
        return {
            'status': 'unhealthy',
            'database': 'disconnected',
            'timestamp': datetime.now().isoformat()
        }
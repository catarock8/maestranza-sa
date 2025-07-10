from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime
import os

from database import (
    create_sample_data, get_products, 
    get_categories, get_brands, create_admin_user,
    get_suppliers, get_projects, get_movements,
    get_dashboard_stats
)
from auth import authenticate_user, create_access_token, get_current_active_user

# App setup
app = FastAPI(title="Inventarios Maestranza S.A.")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://localhost:5173", 
        "http://127.0.0.1:3000", 
        "http://127.0.0.1:3001", 
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get('/')
def root():
    return {
        'message': 'API Maestranza S.A. funcionando localmente con Supabase Client', 
        'status': 'OK',
        'database': '✅ Connected to Supabase',
        'environment': 'Local Development',
        'endpoints': ['/products', '/categories', '/brands', '/create-sample-data', '/token', '/users/me', '/protected', '/alerts', '/reports/inventory', '/admin/create-user']
    }

# Nuevo endpoint para crear datos de ejemplo
@app.post('/create-sample-data')
def create_sample():
    try:
        success = create_sample_data()
        if success:
            products = get_products()
            return {
                'msg': 'Datos de ejemplo creados exitosamente',
                'total_products': len(products)
            }
        else:
            raise HTTPException(500, 'Error creando datos de ejemplo')
    except Exception as e:
        raise HTTPException(500, f'Error: {str(e)}')

# Products endpoint
@app.get('/products')
def list_products():
    try:
        products = get_products()
        print(f"[DEBUG] Productos retornados: {products}")
        return products
    except Exception as e:
        print(f"[ERROR] /products: {e}")
        raise HTTPException(500, f'Error: {str(e)}')

# Categories endpoint
@app.get('/categories')
def list_categories():
    try:
        categories = get_categories()
        return categories
    except Exception as e:
        raise HTTPException(500, f'Error: {str(e)}')

# Brands endpoint
@app.get('/brands')
def list_brands():
    try:
        brands = get_brands()
        return brands
    except Exception as e:
        raise HTTPException(500, f'Error: {str(e)}')

# Authentication endpoints
@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me")
async def read_users_me(current_user: dict = Depends(get_current_active_user)):
    return {"username": current_user["username"], "role": current_user["role"]}

# Protected endpoint example
@app.get("/protected")
async def protected_route(current_user: dict = Depends(get_current_active_user)):
    return {"message": f"Hello {current_user['username']}, you have access to protected content"}

# Simple alerts endpoint (productos con stock bajo)
@app.get('/alerts')
def list_alerts(threshold: int = 10):
    try:
        products = get_products()
        low_stock_products = [p for p in products if p.get('quantity', 0) <= threshold]
        return {'threshold': threshold, 'products': low_stock_products}
    except Exception as e:
        raise HTTPException(500, f'Error: {str(e)}')

# Simple reports endpoint
@app.get('/reports/inventory')
def report_inventory():
    try:
        products = get_products()
        total_quantity = sum(p.get('quantity', 0) for p in products)
        return {'total_products': len(products), 'total_quantity': total_quantity}
    except Exception as e:
        raise HTTPException(500, f'Error: {str(e)}')

# Admin endpoint para crear usuario administrador
@app.post('/admin/create-user')
def create_admin_endpoint():
    """Endpoint para crear usuario administrador por defecto"""
    try:
        admin_user = create_admin_user()
        if admin_user:
            return {
                'msg': 'Usuario administrador creado exitosamente',
                'username': 'admin',
                'note': 'Password: admin123 (cambiar en producción)'
            }
        else:
            return {
                'msg': 'Usuario administrador ya existe o hubo un error',
                'username': 'admin'
            }
    except Exception as e:
        raise HTTPException(500, f'Error: {str(e)}')



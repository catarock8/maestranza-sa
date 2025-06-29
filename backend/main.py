from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from peewee import DoesNotExist, OperationalError
from datetime import datetime
import os

from database import init_db, Product, Batch, Movement, Category

# App setup
app = FastAPI(title="Inventarios Maestranzas S.A.")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",           # Frontend local
        "http://127.0.0.1:3000",          # Frontend local alternativo
        "http://54.233.95.170:3000",      # Frontend en EC2
        "http://54.233.95.170",           # EC2 sin puerto
        "*"                               # Permitir todo (solo para desarrollo)
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    print("🚀 Starting Maestranza SA Backend...")
    try:
        print("📊 Initializing database...")
        success = init_db()
        if success:
            print("✅ Database connected successfully")
        else:
            print("❌ Database initialization failed")
    except Exception as e:
        print(f"❌ Startup error: {e}")

# Endpoint de prueba mejorado
@app.get('/')
def root():
    try:
        # Probar conexión a la base de datos
        from database import DB
        DB.connect(reuse_if_open=True)
        db_status = "✅ Connected"
        DB.close()
    except Exception as e:
        db_status = f"❌ Error: {str(e)}"
    
    return {
        'message': 'API Maestranza S.A. funcionando correctamente', 
        'status': 'OK',
        'database': db_status,
        'endpoints': ['/products', '/movements', '/batches', '/categories']
    }

# Products CRUD (sin autenticación por ahora)
@app.get('/products')
def list_products(category_id: int = None):
    query = Product.select(Product, Category).join(Category, join_type='LEFT')
    
    # Filtrar por categoría si se especifica
    if category_id:
        query = query.where(Product.category == category_id)
    
    products = []
    for product in query:
        product_dict = product.__data__.copy()
        # Agregar información de categoría
        if product.category:
            product_dict['category_name'] = product.category.name
            product_dict['category_id'] = product.category.id
        else:
            product_dict['category_name'] = None
            product_dict['category_id'] = None
        products.append(product_dict)
    
    return products

@app.post('/products')
def add_product(name: str, serial_number: str, location: str, brand: str = None, category_id: int = None, quantity: int = 0):
    prod = Product.create(
        name=name, 
        serial_number=serial_number, 
        location=location, 
        brand=brand,
        category=category_id if category_id else None,
        quantity=quantity
    )
    return prod.__data__

@app.put('/products/{product_id}')
def update_product(product_id: int, name: str = None, location: str = None):
    try:
        prod = Product.get_by_id(product_id)
    except DoesNotExist:
        raise HTTPException(404, 'Product not found')
    if name: prod.name = name
    if location: prod.location = location
    prod.save()
    return prod.__data__

@app.delete('/products/{product_id}')
def delete_product(product_id: int):
    try:
        prod = Product.get_by_id(product_id)
    except DoesNotExist:
        raise HTTPException(404, 'Product not found')
    prod.delete_instance()
    return {'msg': 'Deleted'}

# Movements (sin autenticación)
@app.post('/movements')
def add_movement(product_id: int, quantity: int, type: str):
    try:
        prod = Product.get_by_id(product_id)
    except DoesNotExist:
        raise HTTPException(404, 'Product not found')
    # update stock
    if type == 'out' and prod.quantity < quantity:
        raise HTTPException(400, 'Insufficient stock')
    prod.quantity += quantity if type == 'in' else -quantity
    prod.save()
    move = Movement.create(product=prod, quantity=quantity, type=type, timestamp=datetime.utcnow())
    return move.__data__

@app.get('/movements')
def list_movements():
    return list(Movement.select().dicts())

# Batches (sin autenticación)
@app.post('/batches')
def add_batch(product_id: int, lot_number: str, expiry_date: datetime, quantity: int):
    try:
        prod = Product.get_by_id(product_id)
    except DoesNotExist:
        raise HTTPException(404, 'Product not found')
    batch = Batch.create(product=prod, lot_number=lot_number, expiry_date=expiry_date, quantity=quantity)
    return batch.__data__

@app.get('/batches')
def list_batches():
    return list(Batch.select().dicts())

# Alerts - productos con stock bajo (sin autenticación)
@app.get('/alerts')
def list_alerts(threshold: int = 10):
    low_stock = Product.select().where(Product.quantity <= threshold)
    return {'threshold': threshold, 'products': list(low_stock.dicts())}

# Reports - inventario general (sin autenticación)
@app.get('/reports/inventory')
def report_inventory():
    products = list(Product.select())
    return {'total_products': len(products), 'total_quantity': sum(p.quantity for p in products)}

# Reports - lotes próximos a vencerse (sin autenticación)
@app.get('/reports/expiry')
def report_expiry(days: int = 30):
    from datetime import timedelta
    cutoff = datetime.utcnow() + timedelta(days=days)
    batches = Batch.select().where(Batch.expiry_date <= cutoff)
    return {'expires_within_days': days, 'batches': list(batches.dicts())}

# Categories CRUD (sin autenticación por ahora)
@app.get('/categories')
def list_categories():
    return list(Category.select().dicts())

@app.post('/categories')
def add_category(name: str, description: str = None):
    try:
        category = Category.create(name=name, description=description)
        return category.__data__
    except Exception as e:
        raise HTTPException(status_code=400, detail=f'Error creando categoría: {str(e)}')

@app.put('/categories/{category_id}')
def update_category(category_id: int, name: str = None, description: str = None):
    try:
        category = Category.get_by_id(category_id)
    except DoesNotExist:
        raise HTTPException(404, 'Category not found')
    if name: category.name = name
    if description: category.description = description
    category.save()
    return category.__data__

@app.delete('/categories/{category_id}')
def delete_category(category_id: int):
    try:
        category = Category.get_by_id(category_id)
    except DoesNotExist:
        raise HTTPException(404, 'Category not found')
    category.delete_instance()
    return {'msg': 'Category deleted'}



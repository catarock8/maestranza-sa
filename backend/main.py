from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from peewee import DoesNotExist, OperationalError
from datetime import datetime
import os

from database import init_db, Product, Batch, Movement

# App setup
app = FastAPI(title="Inventarios Maestranzas S.A.")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
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
        'endpoints': ['/products', '/movements', '/batches', '/create-sample-products']
    }

# Products CRUD (sin autenticación por ahora)
@app.get('/products')
def list_products():
    return list(Product.select().dicts())

@app.post('/products')
def add_product(name: str, serial_number: str, location: str, brand: str = None, quantity: int = 0):
    prod = Product.create(
        name=name, 
        serial_number=serial_number, 
        location=location, 
        brand=brand,
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

# Endpoint temporal para agregar productos de prueba (QUITAR EN PRODUCCIÓN)
@app.post('/create-sample-products')
def create_sample_products():
    try:
        sample_products = [
            {'name': 'Tuerca M8', 'serial_number': 'TM8-001', 'location': 'Estante A1', 'brand': 'ACME', 'quantity': 150},
            {'name': 'Tornillo M6x20', 'serial_number': 'TM6-020', 'location': 'Estante A2', 'brand': 'Stanley', 'quantity': 200},
            {'name': 'Arandela 8mm', 'serial_number': 'AR8-001', 'location': 'Estante B1', 'brand': 'Bosch', 'quantity': 75},
            {'name': 'Perno M10x30', 'serial_number': 'PM10-030', 'location': 'Estante B2', 'brand': 'Makita', 'quantity': 90},
            {'name': 'Remache 4mm', 'serial_number': 'RM4-001', 'location': 'Estante C1', 'brand': 'DeWalt', 'quantity': 300},
        ]
        
        created_count = 0
        for prod_data in sample_products:
            # Verificar si ya existe
            existing = Product.select().where(Product.serial_number == prod_data['serial_number']).first()
            if not existing:
                Product.create(**prod_data)
                created_count += 1
        
        total_products = Product.select().count()
        return {
            'msg': f'Productos de muestra creados: {created_count}',
            'total_products': total_products,
            'created': created_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error creando productos: {str(e)}')

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from peewee import DoesNotExist, OperationalError
from datetime import timedelta, datetime
import os

from database import init_db, Product, Batch, Movement, User
from auth import (
    authenticate_user, create_access_token,
    get_current_active_user, get_current_active_admin, get_password_hash
)

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
    try:
        init_db()
    except OperationalError as e:
        print(f"Warning: could not initialize database at startup: {e}")

# Auth
@app.post('/token')
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail='Invalid credentials')
    access_token = create_access_token(
        data={'sub': user.username, 'role': user.role},
        expires_delta=timedelta(minutes=int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', 30)))
    )
    return {'access_token': access_token, 'token_type': 'bearer'}

# Endpoint temporal para crear usuario inicial (QUITAR EN PRODUCCIÓN)
@app.post('/create-initial-user')
def create_initial_user():
    try:
        # Verificar si ya existe un usuario admin
        existing = User.select().where(User.username == 'admin').first()
        if existing:
            return {'msg': 'Usuario admin ya existe'}
        
        # Crear usuario admin
        hashed = get_password_hash('admin123')
        User.create(
            username='admin', 
            password_hash=hashed, 
            role='admin',
            email='admin@maestranza.com',
            full_name='Administrador Sistema',
            is_active=True
        )
        return {'msg': 'Usuario admin creado exitosamente', 'username': 'admin', 'password': 'admin123'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error creando usuario: {str(e)}')

# Users
@app.post('/users', dependencies=[Depends(get_current_active_admin)])
def create_user(username: str, password: str, role: str):
    hashed = get_password_hash(password)
    User.create(username=username, password_hash=hashed, role=role)
    return {'msg': 'User created'}

# Products CRUD
@app.get('/products', dependencies=[Depends(get_current_active_user)])
def list_products():
    return list(Product.select().dicts())

@app.post('/products', dependencies=[Depends(get_current_active_admin)])
def add_product(name: str, serial_number: str, location: str, quantity: int = 0):
    prod = Product.create(name=name, serial_number=serial_number, location=location, quantity=quantity)
    return prod.__data__

@app.put('/products/{product_id}', dependencies=[Depends(get_current_active_admin)])
def update_product(product_id: int, name: str = None, location: str = None):
    try:
        prod = Product.get_by_id(product_id)
    except DoesNotExist:
        raise HTTPException(404, 'Product not found')
    if name: prod.name = name
    if location: prod.location = location
    prod.save()
    return prod.__data__

@app.delete('/products/{product_id}', dependencies=[Depends(get_current_active_admin)])
def delete_product(product_id: int):
    try:
        prod = Product.get_by_id(product_id)
    except DoesNotExist:
        raise HTTPException(404, 'Product not found')
    prod.delete_instance()
    return {'msg': 'Deleted'}

# Movements
@app.post('/movements', dependencies=[Depends(get_current_active_user)])
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

@app.get('/movements', dependencies=[Depends(get_current_active_user)])
def list_movements():
    return list(Movement.select().dicts())

# Batches
@app.post('/batches', dependencies=[Depends(get_current_active_user)])
def add_batch(product_id: int, lot_number: str, expiry_date: datetime, quantity: int):
    try:
        prod = Product.get_by_id(product_id)
    except DoesNotExist:
        raise HTTPException(404, 'Product not found')
    batch = Batch.create(product=prod, lot_number=lot_number, expiry_date=expiry_date, quantity=quantity)
    return batch.__data__

@app.get('/batches', dependencies=[Depends(get_current_active_user)])
def list_batches():
    return list(Batch.select().dicts())

# Alerts - productos con stock bajo
@app.get('/alerts', dependencies=[Depends(get_current_active_user)])
def list_alerts(threshold: int = 10):
    low_stock = Product.select().where(Product.quantity <= threshold)
    return {'threshold': threshold, 'products': list(low_stock.dicts())}

# Reports - inventario general
def report_inventory():
    products = list(Product.select())
    return {'total_products': len(products), 'total_quantity': sum(p.quantity for p in products)}
app.get('/reports/inventory', dependencies=[Depends(get_current_active_user)])(report_inventory)

# Reports - lotes próximos a vencerse
@app.get('/reports/expiry', dependencies=[Depends(get_current_active_user)])
def report_expiry(days: int = 30):
    cutoff = datetime.utcnow() + timedelta(days=days)
    batches = Batch.select().where(Batch.expiry_date <= cutoff)
    return {'expires_within_days': days, 'batches': list(batches.dicts())}

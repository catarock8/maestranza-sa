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
    allow_origins=["*"],  # Permitir todo temporalmente
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
        'endpoints': ['/products', '/movements', '/batches', '/categories']
    }

# Products CRUD (sin autenticación por ahora)
@app.get('/products')
def list_products(
    category_id: int = None, 
    brand: str = None, 
    min_stock: int = None,
    max_stock: int = None,
    search: str = None,
    order_by: str = 'name',
    order_dir: str = 'asc'
):
    try:
        # Construir query base - incluyendo todos los campos
        query = Product.select(
            Product.id,
            Product.name,
            Product.description,
            Product.serial_number,
            Product.sku,
            Product.brand,
            Product.location,
            Product.quantity,
            Product.min_stock,
            Product.max_stock,
            Product.unit_of_measure,
            Product.image_url,
            Product.category,
            Product.is_active,
            Product.requires_expiry_control,
            Product.created_at,
            Product.updated_at
        )
        
        # Aplicar filtros
        if category_id:
            query = query.where(Product.category == category_id)
        
        if brand:
            query = query.where(Product.brand.ilike(f'%{brand}%'))
        
        if min_stock is not None:
            query = query.where(Product.quantity >= min_stock)
            
        if max_stock is not None:
            query = query.where(Product.quantity <= max_stock)
        
        if search:
            query = query.where(
                (Product.name.ilike(f'%{search}%')) |
                (Product.serial_number.ilike(f'%{search}%'))
            )
        
        # Aplicar ordenamiento
        order_field = getattr(Product, order_by, Product.name)
        if order_dir.lower() == 'desc':
            order_field = order_field.desc()
        query = query.order_by(order_field)
        
        products = list(query.dicts())
        
        # Agregar información de categoría manualmente
        for product in products:
            category_id_field = product.get('category')
            if category_id_field:
                try:
                    category = Category.get_by_id(category_id_field)
                    product['category_name'] = category.name
                    product['category_id'] = category.id
                except DoesNotExist:
                    product['category_name'] = 'Categoría no encontrada'
                    product['category_id'] = None
                except Exception as e:
                    print(f"Error getting category {category_id_field}: {e}")
                    product['category_name'] = 'Error cargando categoría'
                    product['category_id'] = None
            else:
                product['category_name'] = None
                product['category_id'] = None
        
        return products
    except Exception as e:
        print(f"Error in list_products: {e}")
        return []  # Devolver array vacío en lugar de objeto

@app.post('/products')
def add_product(name: str, serial_number: str, location: str, brand: str = None, category_id: int = None, quantity: int = 0, image_url: str = None):
    prod = Product.create(
        name=name, 
        serial_number=serial_number, 
        location=location, 
        brand=brand,
        category=category_id if category_id else None,
        quantity=quantity,
        image_url=image_url
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

# Endpoint para obtener marcas únicas
@app.get('/brands')
def list_brands():
    try:
        brands = (Product
                 .select(Product.brand)
                 .where(Product.brand.is_null(False) & (Product.brand != ''))
                 .distinct()
                 .order_by(Product.brand))
        return [{'name': brand.brand} for brand in brands]
    except Exception as e:
        print(f"Error fetching brands: {e}")
        return []

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



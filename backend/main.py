from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from peewee import DoesNotExist, OperationalError
from datetime import datetime
import os

from database import init_db, Product, Batch, Movement, Category, list_existing_tables, describe_table, drop_all_tables

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

# Endpoint temporal para crear categorías de ejemplo
@app.post('/create-sample-categories')
def create_sample_categories():
    try:
        sample_categories = [
            {'name': 'Sujetadores', 'description': 'Tornillos, tuercas, arandelas y elementos de sujeción'},
            {'name': 'Herramientas', 'description': 'Herramientas manuales y eléctricas'},
            {'name': 'Soldadura', 'description': 'Electrodos, varillas y consumibles de soldadura'},
            {'name': 'Lubricantes', 'description': 'Aceites, grasas y lubricantes industriales'},
            {'name': 'Materiales', 'description': 'Chapas, perfiles y materiales en bruto'},
        ]
        
        created_count = 0
        for cat_data in sample_categories:
            # Verificar si ya existe
            existing = Category.select().where(Category.name == cat_data['name']).first()
            if not existing:
                Category.create(**cat_data)
                created_count += 1
        
        total_categories = Category.select().count()
        return {
            'msg': f'Categorías de muestra creadas: {created_count}',
            'total_categories': total_categories,
            'created': created_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error creando categorías: {str(e)}')

# GET version para probar desde navegador
@app.get('/create-sample-categories')
def create_sample_categories_get():
    return create_sample_categories()

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

# Endpoint temporal para crear productos de ejemplo con categorías
@app.post('/create-sample-products-with-categories')
def create_sample_products_with_categories():
    try:
        # Primero asegurar que las categorías existen
        create_sample_categories()
        
        # Obtener categorías creadas
        sujetadores = Category.select().where(Category.name == 'Sujetadores').first()
        herramientas = Category.select().where(Category.name == 'Herramientas').first()
        soldadura = Category.select().where(Category.name == 'Soldadura').first()
        
        sample_products = [
            {'name': 'Tuerca M8', 'serial_number': 'TM8-001', 'location': 'Estante A1', 'brand': 'ACME', 'quantity': 150, 'category': sujetadores.id if sujetadores else None},
            {'name': 'Tornillo M6x20', 'serial_number': 'TM6-020', 'location': 'Estante A2', 'brand': 'Stanley', 'quantity': 200, 'category': sujetadores.id if sujetadores else None},
            {'name': 'Arandela 8mm', 'serial_number': 'AR8-001', 'location': 'Estante B1', 'brand': 'Bosch', 'quantity': 75, 'category': sujetadores.id if sujetadores else None},
            {'name': 'Perno M10x30', 'serial_number': 'PM10-030', 'location': 'Estante B2', 'brand': 'Makita', 'quantity': 90, 'category': sujetadores.id if sujetadores else None},
            {'name': 'Electrodo 6013', 'serial_number': 'EL6013-001', 'location': 'Estante C1', 'brand': 'Lincoln', 'quantity': 500, 'category': soldadura.id if soldadura else None},
            {'name': 'Taladro 12V', 'serial_number': 'TAL12V-001', 'location': 'Herramientas', 'brand': 'DeWalt', 'quantity': 3, 'category': herramientas.id if herramientas else None},
        ]
        
        created_count = 0
        updated_count = 0
        for prod_data in sample_products:
            # Verificar si ya existe
            existing = Product.select().where(Product.serial_number == prod_data['serial_number']).first()
            if not existing:
                Product.create(**prod_data)
                created_count += 1
            else:
                # Actualizar categoría si no la tiene
                if not existing.category and prod_data.get('category'):
                    existing.category = prod_data['category']
                    existing.save()
                    updated_count += 1
        
        total_products = Product.select().count()
        return {
            'msg': f'Productos procesados - Creados: {created_count}, Actualizados: {updated_count}',
            'total_products': total_products,
            'created': created_count,
            'updated': updated_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error procesando productos: {str(e)}')

# GET version para probar desde navegador
@app.get('/create-sample-products-with-categories')
def create_sample_products_with_categories_get():
    return create_sample_products_with_categories()

# Endpoint temporal para investigar la base de datos
@app.get('/debug/database-info')
def get_database_info():
    try:
        from database import list_existing_tables, describe_table
        
        tables = list_existing_tables()
        
        # Obtener información detallada de las tablas principales
        table_info = {}
        important_tables = ['product', 'category', 'movement', 'batch']
        
        for table in tables:
            if table.lower() in important_tables:
                table_info[table] = describe_table(table)
        
        return {
            'total_tables': len(tables),
            'all_tables': tables,
            'important_tables_structure': table_info
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error getting database info: {str(e)}')

# 🚨 PELIGRO: Endpoint para limpiar TODA la base de datos
@app.post('/debug/clean-database')
def clean_database():
    try:
        from database import drop_all_tables, init_db
        
        # Eliminar todas las tablas
        success = drop_all_tables()
        if not success:
            raise HTTPException(status_code=500, detail="Error eliminando tablas")
        
        # Recrear las tablas limpias
        init_success = init_db()
        if not init_success:
            raise HTTPException(status_code=500, detail="Error recreando tablas")
        
        return {
            'msg': '🧹 Base de datos limpiada y recreada exitosamente',
            'status': 'success',
            'tables_created': ['category', 'product', 'batch', 'movement']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error limpiando base de datos: {str(e)}')

# GET version para usar desde navegador
@app.get('/debug/clean-database')
def clean_database_get():
    return clean_database()



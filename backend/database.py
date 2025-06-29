import os
from datetime import datetime, date
from dotenv import load_dotenv
from peewee import (
    MySQLDatabase, Model, CharField, IntegerField, 
    DateTimeField, DateField, ForeignKeyField, TextField, FloatField, BooleanField,
    DecimalField
)

# Cargar variables de entorno y conectar directamente a MySQL
load_dotenv()
DB = MySQLDatabase(
    os.getenv('DB_NAME'),
    host=os.getenv('DB_HOST'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD'),
    port=int(os.getenv('DB_PORT', 3306)),
)

class BaseModel(Model):
    created_at = DateTimeField(default=datetime.now)
    updated_at = DateTimeField(default=datetime.now)
    class Meta:
        database = DB

# Modelo de categorías
class Category(BaseModel):
    name = CharField(max_length=100, unique=True)
    description = TextField(null=True)
    is_active = BooleanField(default=True)

# Clases básicas que necesitamos por ahora
class Product(BaseModel):
    name = CharField(max_length=100)
    description = TextField(null=True)
    serial_number = CharField(unique=True, max_length=100, null=True)
    sku = CharField(unique=True, max_length=50, null=True)
    brand = CharField(max_length=100, null=True)  # Nueva columna para marca
    category = ForeignKeyField(Category, null=True, backref='products')  # Relación con categoría
    location = CharField(max_length=100, null=True)
    quantity = IntegerField(default=0)
    min_stock = IntegerField(default=0)
    max_stock = IntegerField(null=True)
    unit_of_measure = CharField(max_length=20, default='units')
    is_active = BooleanField(default=True)
    requires_expiry_control = BooleanField(default=False)

class Batch(BaseModel):
    product = ForeignKeyField(Product, backref='batches')
    lot_number = CharField(max_length=50)
    expiry_date = DateField(null=True)
    quantity = IntegerField(default=0)
    purchase_price = DecimalField(max_digits=12, decimal_places=2, null=True)
    is_expired = BooleanField(default=False)

class Movement(BaseModel):
    product = ForeignKeyField(Product, backref='movements')
    batch = ForeignKeyField(Batch, null=True, backref='movements')
    type = CharField(max_length=20)  # 'in' o 'out'
    quantity = IntegerField()
    reason = CharField(max_length=100, null=True)
    timestamp = DateTimeField(default=datetime.now)
    notes = TextField(null=True)

def init_db():
    """Inicializa el esquema de la base de datos"""
    try:
        # Conectar y crear tablas en MySQL
        DB.connect(reuse_if_open=True)
        tables = [Category, Product, Batch, Movement]
        DB.create_tables(tables, safe=True)
        print("✅ Database initialized successfully")
        return True
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False

def list_existing_tables():
    """Lista todas las tablas existentes en la base de datos"""
    try:
        DB.connect(reuse_if_open=True)
        cursor = DB.cursor()
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        DB.close()
        return tables
    except Exception as e:
        print(f"❌ Error listing tables: {e}")
        return []

def describe_table(table_name):
    """Describe la estructura de una tabla específica"""
    try:
        DB.connect(reuse_if_open=True)
        cursor = DB.cursor()
        cursor.execute(f"DESCRIBE {table_name}")
        columns = cursor.fetchall()
        DB.close()
        return columns
    except Exception as e:
        print(f"❌ Error describing table {table_name}: {e}")
        return []

def drop_all_tables():
    """PELIGRO: Elimina TODAS las tablas de la base de datos"""
    try:
        DB.connect(reuse_if_open=True)
        cursor = DB.cursor()
        
        # Desactivar foreign key checks temporalmente
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
        
        # Obtener todas las tablas
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        
        # Eliminar todas las tablas
        for table in tables:
            cursor.execute(f"DROP TABLE IF EXISTS {table}")
            print(f"🗑️ Tabla eliminada: {table}")
        
        # Reactivar foreign key checks
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
        
        DB.close()
        print("✅ Todas las tablas han sido eliminadas")
        return True
    except Exception as e:
        print(f"❌ Error eliminando tablas: {e}")
        return False

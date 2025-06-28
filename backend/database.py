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

class User(BaseModel):
    username = CharField(unique=True, max_length=50)
    password_hash = CharField(max_length=128)
    role = CharField(max_length=30)
    email = CharField(max_length=100, null=True)
    full_name = CharField(max_length=100, null=True)
    is_active = BooleanField(default=True)

class Supplier(BaseModel):
    name = CharField(max_length=100)
    contact_person = CharField(max_length=100, null=True)
    email = CharField(max_length=100, null=True)
    phone = CharField(max_length=20, null=True)
    address = TextField(null=True)
    payment_terms = CharField(max_length=50, null=True)
    is_active = BooleanField(default=True)

class Category(BaseModel):
    name = CharField(max_length=50, unique=True)
    description = TextField(null=True)
    parent_category = ForeignKeyField('self', null=True, backref='subcategories')

class Tag(BaseModel):
    name = CharField(max_length=50, unique=True)
    color = CharField(max_length=7, null=True)

class Product(BaseModel):
    name = CharField(max_length=100)
    description = TextField(null=True)
    serial_number = CharField(unique=True, max_length=100, null=True)
    sku = CharField(unique=True, max_length=50, null=True)
    brand = CharField(max_length=100, null=True)  # Nueva columna para marca
    category = ForeignKeyField(Category, null=True, backref='products')
    location = CharField(max_length=100, null=True)
    quantity = IntegerField(default=0)
    min_stock = IntegerField(default=0)
    max_stock = IntegerField(null=True)
    unit_of_measure = CharField(max_length=20, default='units')
    is_active = BooleanField(default=True)
    requires_expiry_control = BooleanField(default=False)

class ProductTag(BaseModel):
    product = ForeignKeyField(Product, backref='product_tags')
    tag = ForeignKeyField(Tag, backref='tag_products')

class Batch(BaseModel):
    product = ForeignKeyField(Product, backref='batches')
    lot_number = CharField(max_length=50)
    expiry_date = DateField(null=True)
    quantity = IntegerField(default=0)
    purchase_price = DecimalField(max_digits=12, decimal_places=2, null=True)
    supplier = ForeignKeyField(Supplier, null=True, backref='batches')
    is_expired = BooleanField(default=False)

class PurchasePrice(BaseModel):
    product = ForeignKeyField(Product, backref='price_history')
    supplier = ForeignKeyField(Supplier, backref='product_prices')
    price = DecimalField(max_digits=12, decimal_places=2)
    currency = CharField(max_length=3, default='CLP')
    purchase_date = DateField()
    quantity_purchased = IntegerField()

class Kit(BaseModel):
    name = CharField(max_length=100)
    description = TextField(null=True)
    sku = CharField(unique=True, max_length=50)
    is_active = BooleanField(default=True)

class KitComponent(BaseModel):
    kit = ForeignKeyField(Kit, backref='components')
    product = ForeignKeyField(Product, backref='kit_memberships')
    quantity_required = IntegerField()

class Project(BaseModel):
    name = CharField(max_length=100)
    description = TextField(null=True)
    start_date = DateField(null=True)
    end_date = DateField(null=True)
    status = CharField(max_length=20, default='active')
    project_manager = ForeignKeyField(User, null=True, backref='managed_projects')

class Movement(BaseModel):
    product = ForeignKeyField(Product, backref='movements')
    batch = ForeignKeyField(Batch, null=True, backref='movements')
    type = CharField(max_length=20)
    quantity = IntegerField()
    previous_quantity = IntegerField()
    new_quantity = IntegerField()
    reason = CharField(max_length=100, null=True)
    reference_number = CharField(max_length=50, null=True)
    project = ForeignKeyField(Project, null=True, backref='movements')
    user = ForeignKeyField(User, backref='movements_made')
    timestamp = DateTimeField(default=datetime.now)
    notes = TextField(null=True)

class PurchaseOrder(BaseModel):
    order_number = CharField(unique=True, max_length=50)
    supplier = ForeignKeyField(Supplier, backref='purchase_orders')
    status = CharField(max_length=20, default='pending')
    order_date = DateField()
    expected_delivery = DateField(null=True)
    total_amount = DecimalField(max_digits=12, decimal_places=2, null=True)
    created_by = ForeignKeyField(User, backref='created_orders')
    notes = TextField(null=True)

class PurchaseOrderItem(BaseModel):
    purchase_order = ForeignKeyField(PurchaseOrder, backref='items')
    product = ForeignKeyField(Product, backref='purchase_order_items')
    quantity_ordered = IntegerField()
    quantity_received = IntegerField(default=0)
    unit_price = DecimalField(max_digits=12, decimal_places=2)
    total_price = DecimalField(max_digits=12, decimal_places=2)

class Alert(BaseModel):
    type = CharField(max_length=20)
    product = ForeignKeyField(Product, null=True, backref='alerts')
    batch = ForeignKeyField(Batch, null=True, backref='alerts')
    message = TextField()
    is_read = BooleanField(default=False)
    priority = CharField(max_length=10, default='medium')
    assigned_to = ForeignKeyField(User, null=True, backref='assigned_alerts')

class SystemConfig(BaseModel):
    key = CharField(unique=True, max_length=50)
    value = TextField()
    description = TextField(null=True)

class InventoryAudit(BaseModel):
    audit_date = DateField()
    auditor = ForeignKeyField(User, backref='audits_performed')
    status = CharField(max_length=20, default='in_progress')
    notes = TextField(null=True)

class InventoryAuditItem(BaseModel):
    audit = ForeignKeyField(InventoryAudit, backref='audit_items')
    product = ForeignKeyField(Product, backref='audit_records')
    system_quantity = IntegerField()
    physical_quantity = IntegerField()
    difference = IntegerField()
    notes = TextField(null=True)

    
def init_db():
    """Inicializa el esquema de la base de datos"""
    # Conectar y crear tablas en MySQL
    DB.connect(reuse_if_open=True)
    tables = [
        User, Supplier, Category, Tag, Product, ProductTag, Batch,
        PurchasePrice, Kit, KitComponent, Project, Movement,
        PurchaseOrder, PurchaseOrderItem, Alert, SystemConfig,
        InventoryAudit, InventoryAuditItem
    ]
    DB.create_tables(tables, safe=True)
    # create_initial_data()  # Opcional: inicializar datos predeterminados

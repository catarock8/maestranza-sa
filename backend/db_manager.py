from datetime import datetime, date, timedelta
from typing import List, Dict
from peewee import fn
from database import (
    DB,
    User,
    Product,
    Batch,
    Movement,
    Supplier,
    Category,
    Tag,
    Kit,
    KitComponent,
    Project,
    PurchaseOrder,
    PurchaseOrderItem,
    Alert,
    SystemConfig,
    InventoryAudit,
    InventoryAuditItem,
    ProductTag,
    PurchasePrice
)

class DatabaseManager:
    """Clase para manejar operaciones complejas de base de datos"""
    
    @staticmethod
    def get_low_stock_products(threshold_days: int = 7) -> List[Product]:
        """Obtiene productos con stock bajo basado en consumo promedio"""
        thirty_days_ago = datetime.now() - timedelta(days=30)
        products_with_low_stock = []
        for product in Product.select().where(Product.is_active == True):
            outbound = Movement.select().where(
                Movement.product == product,
                Movement.type == 'OUT',
                Movement.timestamp >= thirty_days_ago
            )
            total_consumed = sum([m.quantity for m in outbound])
            daily_avg = total_consumed / 30 if total_consumed > 0 else 0
            if product.quantity < (daily_avg * threshold_days):
                products_with_low_stock.append(product)
        return products_with_low_stock
    
    @staticmethod
    def get_expiring_batches(days_ahead: int = 30) -> List[Batch]:
        future = date.today() + timedelta(days=days_ahead)
        return list(Batch.select().where(
            Batch.expiry_date <= future,
            Batch.expiry_date >= date.today(),
            Batch.quantity > 0,
            Batch.is_expired == False
        ))

    @staticmethod
    def get_expired_batches() -> List[Batch]:
        return list(Batch.select().where(
            Batch.expiry_date < date.today(),
            Batch.is_expired == False,
            Batch.quantity > 0
        ))

    @staticmethod
    def check_kit_availability(kit_id: int) -> Dict:
        kit = Kit.get_by_id(kit_id)
        components_status = []
        kit_available = True
        max_kits = float('inf')
        for comp in kit.components:
            prod = comp.product
            avail = prod.quantity
            req = comp.quantity_required
            possible = avail // req if req > 0 else 0
            max_kits = min(max_kits, possible)
            if possible <= 0:
                kit_available = False
            components_status.append({
                'product': prod,
                'required': req,
                'available': avail,
                'sufficient': possible > 0,
                'possible_kits': possible
            })
        return {
            'kit': kit,
            'available': kit_available,
            'max_kits_possible': int(max_kits) if max_kits != float('inf') else 0,
            'components': components_status
        }

    @staticmethod
    def create_movement(product_id: int, quantity: int, movement_type: str,
                        user_id: int, reason: str = None, project_id: int = None,
                        batch_id: int = None, reference_number: str = None) -> Movement:
        with DB.atomic():
            product = Product.get_by_id(product_id)
            prev_qty = product.quantity
            if movement_type == 'OUT' and prev_qty < quantity:
                raise ValueError("Stock insuficiente")
            if movement_type == 'IN':
                new_qty = prev_qty + quantity
            elif movement_type == 'OUT':
                new_qty = prev_qty - quantity
            else:
                new_qty = quantity
                quantity = new_qty - prev_qty
            product.quantity = new_qty
            product.updated_at = datetime.now()
            product.save()
            move = Movement.create(
                product=product,
                batch_id=batch_id,
                type=movement_type,
                quantity=abs(quantity),
                previous_quantity=prev_qty,
                new_quantity=new_qty,
                reason=reason,
                reference_number=reference_number,
                project_id=project_id,
                user_id=user_id,
                timestamp=datetime.now()
            )
            DatabaseManager.check_and_create_alerts(product)
            return move

    @staticmethod
    def check_and_create_alerts(product: Product):
        if product.quantity <= product.min_stock:
            exist = Alert.select().where(
                Alert.product == product,
                Alert.type == 'LOW_STOCK',
                Alert.is_read == False
            ).first()
            if not exist:
                Alert.create(
                    type='LOW_STOCK',
                    product=product,
                    message=f"Stock bajo para {product.name}. Actual: {product.quantity}, Min: {product.min_stock}",
                    priority='high'
                )

    @staticmethod
    def get_inventory_report(start_date: date = None, end_date: date = None) -> Dict:
        if not start_date:
            start_date = date.today() - timedelta(days=30)
        if not end_date:
            end_date = date.today()
        total_products = Product.select().where(Product.is_active == True).count()
        low_stock_count = len(DatabaseManager.get_low_stock_products())
        expired_batches_count = len(DatabaseManager.get_expired_batches())
        movements = Movement.select().where(
            Movement.timestamp.between(start_date, end_date)
        )
        inbound = movements.where(Movement.type == 'IN').count()
        outbound = movements.where(Movement.type == 'OUT').count()
        return {
            'period': {'start': start_date, 'end': end_date},
            'total_products': total_products,
            'low_stock_products': low_stock_count,
            'expired_batches': expired_batches_count,
            'movements': {'inbound': inbound, 'outbound': outbound, 'total': inbound+outbound}
        }

    @staticmethod
    def get_product_consumption_trend(product_id: int, days: int = 30) -> Dict:
        product = Product.get_by_id(product_id)
        start = datetime.now() - timedelta(days=days)
        moves = Movement.select().where(
            Movement.product == product,
            Movement.type == 'OUT',
            Movement.timestamp >= start
        ).order_by(Movement.timestamp)
        daily = {}
        total = 0
        for mv in moves:
            day = mv.timestamp.date()
            daily.setdefault(day, 0)
            daily[day] += mv.quantity
            total += mv.quantity
        avg = total/days if days>0 else 0
        return {
            'product': product,
            'period_days': days,
            'total_consumed': total,
            'average_daily': avg,
            'daily_breakdown': daily,
            'estimated_stock_days': product.quantity/avg if avg>0 else float('inf')
        }

    @staticmethod
    def backup_database(backup_path: str = None) -> str:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        return backup_path or f"backup_inventory_{timestamp}.sql"

    @staticmethod
    def get_supplier_performance(supplier_id: int) -> Dict:
        supplier = Supplier.get_by_id(supplier_id)
        orders = PurchaseOrder.select().where(PurchaseOrder.supplier == supplier)
        total = orders.count()
        completed = orders.where(PurchaseOrder.status == 'received').count()
        completed_with_dates = orders.where(
            PurchaseOrder.status == 'received',
            PurchaseOrder.expected_delivery.is_null(False)
        )
        avg_time = 0
        if completed_with_dates.count()>0:
            days = sum([(o.expected_delivery-o.order_date).days for o in completed_with_dates])
            avg_time = days/completed_with_dates.count()
        return {'supplier': supplier,'total_orders': total,'completed_orders': completed,'completion_rate':(completed/total*100 if total>0 else 0),'average_delivery_time_days':avg_time}

from datetime import datetime, date, timedelta
from typing import List, Dict, Optional
from database import (
    Alert, Product, Batch, User, SystemConfig
)
from db_manager import DatabaseManager
from peewee import DoesNotExist

class AlertManager:
    """Gestor de alertas automáticas del sistema"""

    @staticmethod
    def generate_all_alerts():
        """Genera todas las alertas automáticas del sistema"""
        AlertManager.generate_low_stock_alerts()
        AlertManager.generate_expiry_alerts()
        AlertManager.mark_expired_batches()

    @staticmethod
    def generate_low_stock_alerts():
        """Genera alertas de stock bajo"""
        config = SystemConfig.get_or_none(SystemConfig.key == 'low_stock_threshold_days')
        threshold_days = int(config.value) if config else 7
        low_stock_products = DatabaseManager.get_low_stock_products(threshold_days)
        for product in low_stock_products:
            existing = Alert.get_or_none(
                (Alert.product == product) &
                (Alert.type == 'LOW_STOCK') &
                (Alert.is_read == False)
            )
            if not existing:
                # prioridad según nivel
                if product.quantity == 0:
                    priority = 'critical'
                elif product.quantity <= product.min_stock * 0.5:
                    priority = 'high'
                else:
                    priority = 'medium'
                Alert.create(
                    type='LOW_STOCK',
                    product=product,
                    message=f"Stock bajo: {product.name} = {product.quantity} (min {product.min_stock})",
                    priority=priority
                )

    @staticmethod
    def generate_expiry_alerts():
        """Genera alertas de productos próximos a vencer"""
        config = SystemConfig.get_or_none(SystemConfig.key == 'expiry_warning_days')
        warning_days = int(config.value) if config else 30
        expiring = DatabaseManager.get_expiring_batches(warning_days)
        for batch in expiring:
            existing = Alert.get_or_none(
                (Alert.batch == batch) &
                (Alert.type == 'EXPIRING_SOON') &
                (Alert.is_read == False)
            )
            if not existing:
                days_to_expiry = (batch.expiry_date - date.today()).days
                if days_to_expiry <= 7:
                    priority = 'critical'
                elif days_to_expiry <= 15:
                    priority = 'high'
                else:
                    priority = 'medium'
                Alert.create(
                    type='EXPIRING_SOON',
                    product=batch.product,
                    batch=batch,
                    message=(f"Lote {batch.lot_number} de {batch.product.name} vence en "
                             f"{days_to_expiry} días ({batch.expiry_date})"),
                    priority=priority
                )

    @staticmethod
    def mark_expired_batches():
        """Marca lotes como vencidos y genera alertas"""
        expired = DatabaseManager.get_expired_batches()
        for batch in expired:
            batch.is_expired = True
            batch.save()
            existing = Alert.get_or_none(
                (Alert.batch == batch) &
                (Alert.type == 'EXPIRED') &
                (Alert.is_read == False)
            )
            if not existing:
                Alert.create(
                    type='EXPIRED',
                    product=batch.product,
                    batch=batch,
                    message=(f"VENCIDO: Lote {batch.lot_number} de {batch.product.name} "
                             f"venció el {batch.expiry_date}") ,
                    priority='critical'
                )

    @staticmethod
    def get_alerts_by_user(user_id: int, include_read: bool = False) -> List[Alert]:
        query = Alert.select().where(Alert.assigned_to == user_id)
        if not include_read:
            query = query.where(Alert.is_read == False)
        return list(query.order_by(Alert.created_at.desc()))

    @staticmethod
    def get_alerts_by_priority(priority: str, include_read: bool = False) -> List[Alert]:
        query = Alert.select().where(Alert.priority == priority)
        if not include_read:
            query = query.where(Alert.is_read == False)
        return list(query.order_by(Alert.created_at.desc()))

    @staticmethod
    def get_dashboard_alerts(limit: int = 10) -> Dict[str, List[Alert]]:
        critical = (Alert.select()
                    .where((Alert.priority == 'critical') & (Alert.is_read == False))
                    .order_by(Alert.created_at.desc())
                    .limit(limit))
        high = (Alert.select()
                .where((Alert.priority == 'high') & (Alert.is_read == False))
                .order_by(Alert.created_at.desc())
                .limit(limit))
        recent = (Alert.select()
                  .where(Alert.is_read == False)
                  .order_by(Alert.created_at.desc())
                  .limit(limit))
        total_unread = Alert.select().where(Alert.is_read == False).count()
        return {
            'critical': list(critical),
            'high': list(high),
            'recent': list(recent),
            'total_unread': total_unread
        }

    @staticmethod
    def mark_alert_as_read(alert_id: int, user_id: Optional[int] = None):
        try:
            alert = Alert.get_by_id(alert_id)
        except DoesNotExist:
            return
        alert.is_read = True
        alert.updated_at = datetime.now()
        if user_id:
            alert.assigned_to = User.get_by_id(user_id)
        alert.save()

    @staticmethod
    def assign_alert(alert_id: int, user_id: int):
        try:
            alert = Alert.get_by_id(alert_id)
        except DoesNotExist:
            return
        alert.assigned_to = User.get_by_id(user_id)
        alert.updated_at = datetime.now()
        alert.save()

    @staticmethod
    def create_custom_alert(message: str,
                            alert_type: str = 'CUSTOM',
                            priority: str = 'medium',
                            product_id: Optional[int] = None,
                            assigned_to: Optional[int] = None) -> Alert:
        return Alert.create(
            type=alert_type,
            product=Product.get_by_id(product_id) if product_id else None,
            message=message,
            priority=priority,
            assigned_to=User.get_by_id(assigned_to) if assigned_to else None
        )

    @staticmethod
    def get_alert_statistics() -> Dict[str, int]:
        total = Alert.select().count()
        unread = Alert.select().where(Alert.is_read == False).count()
        counts = {'LOW_STOCK': 0, 'EXPIRING_SOON': 0, 'EXPIRED': 0, 'CUSTOM': 0}
        for t in counts.keys():
            counts[t] = Alert.select().where(Alert.type == t).count()
        return {'total': total, 'unread': unread, **counts}

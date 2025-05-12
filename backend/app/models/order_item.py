"""
OrderItem model representing individual items in an order.
"""
from typing import Dict, Any, Optional, List
from app.models.base import BaseModel

class OrderItem(BaseModel):
    """Model for items within an order"""
    
    table_name = "OrderItems"
    
    # Status constants
    STATUS_PENDING = 'pendiente'
    STATUS_IN_PREPARATION = 'en_preparación'
    STATUS_READY = 'listo'
    STATUS_SERVED = 'servido'
    STATUS_CANCELED = 'cancelado'
    
    @classmethod
    def add_to_order(cls, 
                     order_id: int, 
                     product_id: int, 
                     quantity: int, 
                     unit_price: float, 
                     notes: str = None) -> Optional[int]:
        """
        Add an item to an order.
        
        Args:
            order_id: The order ID
            product_id: The product ID
            quantity: The quantity
            unit_price: The unit price
            notes: Optional notes for the item
            
        Returns:
            int: Item ID if successful, None otherwise
        """
        total_price = quantity * unit_price
        
        item_data = {
            "order_id": order_id,
            "product_id": product_id,
            "quantity": quantity,
            "unit_price": unit_price,
            "total_price": total_price,
            "notes": notes,
            "status": cls.STATUS_PENDING
        }
        
        item_id = cls.create(item_data)
        
        # If item was created, update the order total
        if item_id:
            cls.execute_custom_query(
                """
                CALL update_order_total(%s)
                """,
                (order_id,)
            )
            
        return item_id
    
    @classmethod
    def update_quantity(cls, item_id: int, new_quantity: int) -> bool:
        """
        Update the quantity of an order item.
        
        Args:
            item_id: The item ID
            new_quantity: The new quantity
            
        Returns:
            bool: True if successful, False otherwise
        """
        # First get the current item details
        item = cls.find_by_id(item_id)
        if not item:
            return False
            
        unit_price = item['unit_price']
        total_price = unit_price * new_quantity
        
        # Update the item
        updated = cls.update(item_id, {
            "quantity": new_quantity,
            "total_price": total_price
        })
        
        # If updated, update the order total
        if updated:
            cls.execute_custom_query(
                """
                CALL update_order_total(%s)
                """,
                (item['order_id'],)
            )
            
        return updated
    
    @classmethod
    def update_status(cls, item_id: int, new_status: str) -> bool:
        """
        Update the status of an order item.
        
        Args:
            item_id: The item ID
            new_status: The new status
            
        Returns:
            bool: True if successful, False otherwise
        """
        return cls.update(item_id, {"status": new_status})
    
    @classmethod
    def get_by_order(cls, order_id: int) -> List[Dict[str, Any]]:
        """
        Get all items for a specific order.
        
        Args:
            order_id: The order ID
            
        Returns:
            list: List of order items
        """
        return cls.execute_custom_query(
            """
            SELECT oi.*, p.name as product_name, p.description as product_description,
                  pc.name as category_name
            FROM OrderItems oi
            JOIN Products p ON oi.product_id = p.id
            JOIN ProductCategories pc ON p.category_id = pc.id
            WHERE oi.order_id = %s
            ORDER BY oi.created_at ASC
            """,
            (order_id,)
        )
    
    @classmethod
    def get_pending_items(cls, sales_area_id: int = None) -> List[Dict[str, Any]]:
        """
        Get all pending items for preparation.
        
        Args:
            sales_area_id: Optional filter by sales area
            
        Returns:
            list: List of pending items
        """
        query = """
            SELECT oi.*, p.name as product_name, o.id as order_id,
                  ss.name as service_spot_name, sa.name as sales_area_name
            FROM OrderItems oi
            JOIN Orders o ON oi.order_id = o.id
            JOIN Products p ON oi.product_id = p.id
            JOIN ServiceSpots ss ON o.service_spot_id = ss.id
            JOIN SalesAreas sa ON o.sales_area_id = sa.id
            WHERE oi.status = %s
            AND o.status IN (%s, %s)
        """
        
        params = [cls.STATUS_PENDING, 'abierta', 'en_preparación']
        
        if sales_area_id:
            query += " AND o.sales_area_id = %s"
            params.append(sales_area_id)
            
        query += " ORDER BY oi.created_at ASC"
        
        return cls.execute_custom_query(query, tuple(params))

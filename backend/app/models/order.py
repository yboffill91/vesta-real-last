"""
Order model representing customer orders/commands.
"""
from typing import Dict, Any, Optional, List
from datetime import datetime
from app.models.base import BaseModel
from app.models.service_spot import ServiceSpot

class Order(BaseModel):
    """Model for customer orders (comandas)"""
    
    table_name = "Orders"
    
    # Status constants
    STATUS_OPEN = 'abierta'
    STATUS_IN_PREPARATION = 'en_preparación'
    STATUS_SERVED = 'servida'
    STATUS_PAID = 'cobrada'
    STATUS_CANCELED = 'cancelada'
    
    @classmethod
    def create_order(cls, 
                     service_spot_id: int, 
                     sales_area_id: int, 
                     menu_id: int, 
                     created_by: int) -> Optional[int]:
        """
        Create a new order and update the service spot status.
        
        Args:
            service_spot_id: The service spot ID
            sales_area_id: The sales area ID
            menu_id: The menu ID
            created_by: The user ID who created the order
            
        Returns:
            int: Order ID if successful, None otherwise
        """
        # Create the order
        order_data = {
            "service_spot_id": service_spot_id,
            "sales_area_id": sales_area_id,
            "menu_id": menu_id,
            "status": cls.STATUS_OPEN,
            "created_by": created_by
        }
        
        order_id = cls.create(order_data)
        
        if order_id:
            # Update service spot status
            ServiceSpot.update_status(
                service_spot_id, 
                ServiceSpot.STATUS_ORDER_OPEN
            )
            
        return order_id
    
    @classmethod
    def get_active_by_spot(cls, service_spot_id: int) -> Optional[Dict[str, Any]]:
        """
        Get the active order for a service spot.
        
        Args:
            service_spot_id: The service spot ID
            
        Returns:
            dict: Order data or None if not found
        """
        orders = cls.find_all(
            where={
                "service_spot_id": service_spot_id,
                "status": [cls.STATUS_OPEN, cls.STATUS_IN_PREPARATION, cls.STATUS_SERVED]
            }, 
            order_by="created_at DESC",
            limit=1
        )
        
        return orders[0] if orders else None
    
    @classmethod
    def get_with_items(cls, order_id: int) -> Optional[Dict[str, Any]]:
        """
        Get an order with its items.
        
        Args:
            order_id: The order ID
            
        Returns:
            dict: Order with items data or None if not found
        """
        results = cls.execute_custom_query(
            """
            SELECT 
                o.id,
                o.service_spot_id,
                o.sales_area_id,
                o.menu_id,
                o.status,
                o.total_amount,
                o.tax_amount,
                o.created_by,
                o.closed_by,
                o.created_at,
                o.updated_at,
                o.closed_at,
                u_created.username as created_by_username,
                u_closed.username as closed_by_username,
                ss.name as service_spot_name,
                sa.name as sales_area_name,
                m.name as menu_name,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', oi.id,
                        'product_id', oi.product_id,
                        'product_name', p.name,
                        'quantity', oi.quantity,
                        'unit_price', oi.unit_price,
                        'total_price', oi.total_price,
                        'notes', oi.notes,
                        'status', oi.status
                    )
                ) as items
            FROM Orders o
            LEFT JOIN Users u_created ON o.created_by = u_created.id
            LEFT JOIN Users u_closed ON o.closed_by = u_closed.id
            LEFT JOIN ServiceSpots ss ON o.service_spot_id = ss.id
            LEFT JOIN SalesAreas sa ON o.sales_area_id = sa.id
            LEFT JOIN Menus m ON o.menu_id = m.id
            LEFT JOIN OrderItems oi ON o.id = oi.order_id
            LEFT JOIN Products p ON oi.product_id = p.id
            WHERE o.id = %s
            GROUP BY o.id
            """,
            (order_id,)
        )
        print(f"DEBUG get_with_items result: {results}")
        
        return results[0] if results else None
    
    @classmethod
    def get_active_orders(cls, 
                          sales_area_id: int = None, 
                          status: str = None,
                          from_date: datetime = None,
                          to_date: datetime = None) -> List[Dict[str, Any]]:
        """
        Get active orders with optional filters.
        
        Args:
            sales_area_id: Optional filter by sales area
            status: Optional filter by status
            from_date: Optional start date
            to_date: Optional end date
            
        Returns:
            list: List of orders
        """
        query = """
            SELECT 
                o.*,
                u_created.username as created_by_username,
                ss.name as service_spot_name,
                sa.name as sales_area_name
            FROM Orders o
            JOIN Users u_created ON o.created_by = u_created.id
            JOIN ServiceSpots ss ON o.service_spot_id = ss.id
            JOIN SalesAreas sa ON o.sales_area_id = sa.id
            WHERE 1=1
        """
        
        params = []
        
        if sales_area_id:
            query += " AND o.sales_area_id = %s"
            params.append(sales_area_id)
            
        if status:
            query += " AND o.status = %s"
            params.append(status)
        else:
            # Default to only active orders (not paid or canceled)
            query += f" AND o.status NOT IN (%s, %s)"
            params.extend([cls.STATUS_PAID, cls.STATUS_CANCELED])
            
        if from_date:
            query += " AND o.created_at >= %s"
            params.append(from_date)
            
        if to_date:
            query += " AND o.created_at <= %s"
            params.append(to_date)
            
        query += " ORDER BY o.created_at DESC"
        
        return cls.execute_custom_query(query, tuple(params))
    
    @classmethod
    def update_status(cls, order_id: int, new_status: str, closed_by: int = None) -> bool:
        """
        Update the status of an order.
        
        Args:
            order_id: The order ID
            new_status: The new status
            closed_by: The user ID who closed the order (if applicable)
            
        Returns:
            bool: True if successful, False otherwise
        """
        update_data = {"status": new_status}
        
        if new_status in [cls.STATUS_PAID, cls.STATUS_CANCELED]:
            update_data["closed_at"] = datetime.now()
            
            if closed_by:
                update_data["closed_by"] = closed_by
                
            # Also update service spot status
            order = cls.find_by_id(order_id)
            if order:
                if new_status == cls.STATUS_PAID:
                    ServiceSpot.update_status(
                        order['service_spot_id'], 
                        ServiceSpot.STATUS_PAID
                    )
                else:  # CANCELED
                    ServiceSpot.update_status(
                        order['service_spot_id'], 
                        ServiceSpot.STATUS_FREE
                    )
                
        return cls.update(order_id, update_data)
    
    @classmethod
    def calculate_total(cls, order_id: int) -> bool:
        """
        Calculate and update the total amount for an order.
        
        Args:
            order_id: The order ID
            
        Returns:
            bool: True if successful, False otherwise
        """
        # First get the establishment tax rate
        tax_query = """
            SELECT tax_rate 
            FROM Establishment 
            LIMIT 1
        """
        
        tax_result = cls.execute_custom_query(tax_query)
        tax_rate = tax_result[0]['tax_rate'] if tax_result else 0
        
        # Calculate total from order items
        total_query = """
            SELECT SUM(total_price) as subtotal
            FROM OrderItems
            WHERE order_id = %s
        """
        
        total_result = cls.execute_custom_query(total_query, (order_id,))
        subtotal = total_result[0]['subtotal'] if total_result and total_result[0]['subtotal'] else 0
        
        # Calculate tax
        tax_amount = subtotal * (tax_rate / 100)
        total_amount = subtotal + tax_amount
        
        # Update order
        return cls.update(order_id, {
            "total_amount": total_amount,
            "tax_amount": tax_amount
        })

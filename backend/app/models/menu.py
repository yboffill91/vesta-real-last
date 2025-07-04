"""
Menu model representing menu cards for specific dates.
"""
from typing import Dict, Any, Optional, List
from datetime import date
from app.models.base import BaseModel

class Menu(BaseModel):
    """Model for menus/cards with products for specific dates"""
    
    table_name = "Menus"
    
    # Status constants
    STATUS_DRAFT = 'borrador'
    STATUS_PUBLISHED = 'publicada'
    STATUS_ARCHIVED = 'archivada'
    
    @classmethod
    def get_basic_info(cls, menu_id: int) -> Optional[Dict[str, Any]]:
        """
        Get basic menu information without items or areas.
        
        Args:
            menu_id: The menu ID
            
        Returns:
            dict: Menu data or None if not found
        """
        results = cls.execute_custom_query(
            "SELECT * FROM Menus WHERE id = %s",
            (menu_id,)
        )
        
        return results[0] if results else None
    
    @classmethod
    def create(cls, data: Dict[str, Any]) -> Optional[int]:
        """Sobreescribe el método create para manejar campo description que no existe en la tabla"""
        # Eliminar el campo description si existe en los datos
        if 'description' in data:
            del data['description']
            
        # Llamar al método create de la clase base
        return super().create(data)
    
    @classmethod
    def get_active_for_date(cls, target_date: date = None) -> List[Dict[str, Any]]:
        """
        Get all published menus for a specific date.
        
        Args:
            target_date: The date to filter by (defaults to today)
            
        Returns:
            list: List of active menus for the date
        """
        date_str = target_date.strftime('%Y-%m-%d') if target_date else 'CURRENT_DATE()'
        
        return cls.execute_custom_query(
            f"""
            SELECT *
            FROM Menus
            WHERE status = %s
            AND valid_date = {date_str}
            ORDER BY name ASC
            """,
            (cls.STATUS_PUBLISHED,)
        )
    
    @classmethod
    def get_with_items(cls, menu_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a menu with its items (products).
        
        Args:
            menu_id: The menu ID
            
        Returns:
            dict: Menu with items data or None if not found
        """
        results = cls.execute_custom_query(
            """
            SELECT 
                m.*,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', mi.id,
                        'product_id', mi.product_id,
                        'product_name', p.name,
                        'price', mi.price,
                        'is_available', mi.is_available,
                        'category_id', p.category_id,
                        'category_name', pc.name
                    )
                ) as items
            FROM Menus m
            LEFT JOIN MenuItems mi ON m.id = mi.menu_id
            LEFT JOIN Products p ON mi.product_id = p.id
            LEFT JOIN ProductCategories pc ON p.category_id = pc.id
            WHERE m.id = %s
            GROUP BY m.id
            """,
            (menu_id,)
        )
        
        return results[0] if results else None
    
    @classmethod
    def get_with_areas(cls, menu_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a menu with its associated sales areas.
        
        Args:
            menu_id: The menu ID
            
        Returns:
            dict: Menu with areas data or None if not found
        """
        results = cls.execute_custom_query(
            """
            SELECT 
                m.*,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', sa.id,
                        'name', sa.name
                    )
                ) as areas
            FROM Menus m
            LEFT JOIN MenuSalesAreas msa ON m.id = msa.menu_id
            LEFT JOIN SalesAreas sa ON msa.sales_area_id = sa.id
            WHERE m.id = %s
            GROUP BY m.id
            """,
            (menu_id,)
        )
        
        return results[0] if results else None
    
    @classmethod
    def add_item(cls, menu_id: int, product_id: int, price: float, is_available: bool = True) -> bool:
        """
        Add a product to a menu.
        
        Args:
            menu_id: The menu ID
            product_id: The product ID
            price: The price for this product in this menu
            is_available: Whether the product is available in this menu
            
        Returns:
            bool: True if successful, False otherwise
        """
        return cls.execute_custom_query(
            """
            INSERT INTO MenuItems (menu_id, product_id, price, is_available)
            VALUES (%s, %s, %s, %s)
            """,
            (menu_id, product_id, price, is_available)
        ) is not None
    
    @classmethod
    def assign_to_area(cls, menu_id: int, sales_area_id: int) -> bool:
        """
        Assign a menu to a sales area.
        
        Args:
            menu_id: The menu ID
            sales_area_id: The sales area ID
            
        Returns:
            bool: True if successful, False otherwise
        """
        return cls.execute_custom_query(
            """
            INSERT IGNORE INTO MenuSalesAreas (menu_id, sales_area_id)
            VALUES (%s, %s)
            """,
            (menu_id, sales_area_id)
        ) is not None
    
    @classmethod
    def publish(cls, menu_id: int) -> bool:
        """
        Publish a menu (change status to published).
        
        Args:
            menu_id: The menu ID
            
        Returns:
            bool: True if successful, False otherwise
        """
        return cls.update(menu_id, {"status": cls.STATUS_PUBLISHED})
    
    @classmethod
    def archive(cls, menu_id: int) -> bool:
        """
        Archive a menu (change status to archived).
        
        Args:
            menu_id: The menu ID
            
        Returns:
            bool: True if successful, False otherwise
        """
        return cls.update(menu_id, {"status": cls.STATUS_ARCHIVED})
        
    @classmethod
    def get_assigned_sales_areas(cls, menu_id: int) -> List[Dict[str, Any]]:
        """
        Get sales areas assigned to a menu.
        
        Args:
            menu_id: The menu ID
            
        Returns:
            list: List of sales areas assigned to the menu
        """
        return cls.execute_custom_query(
            """
            SELECT sa.id, sa.name
            FROM SalesAreas sa
            JOIN MenuSalesAreas msa ON sa.id = msa.sales_area_id
            WHERE msa.menu_id = %s
            ORDER BY sa.name ASC
            """,
            (menu_id,)
        )
    
    @classmethod
    def assign_to_sales_areas(cls, menu_id: int, sales_area_ids: List[int]) -> bool:
        """
        Assign a menu to multiple sales areas.
        
        Returns:
            bool: True if successful, False otherwise
        """
        # First, remove all existing assignments for this menu
        cls.execute_custom_query(
            """
            DELETE FROM MenuSalesAreas
            WHERE menu_id = %s
            """,
            (menu_id,)
        )
        
        # Then add new assignments
        for area_id in sales_area_ids:
            success = cls.assign_to_area(menu_id, area_id)
            if not success:
                return False
                    
        return True

@classmethod
def cleanup_old_menus(cls) -> int:
    """
    Delete menus that are older than 2 days based on validity date.
    
    Returns:
        int: Number of deleted menus
    """
    result = cls.execute_custom_query(
        """
        DELETE FROM Menus 
        WHERE DATEDIFF(CURRENT_DATE(), valid_date) > 2
        """,
        ()
    )
    
    # Return number of affected rows if available
    return result.get('affected_rows', 0) if result else 0

@classmethod
def archive_expired_menus(cls) -> int:
    """
    Change status to archived for published menus that are older than 1 day.
    
    Returns:
        int: Number of menus archived
    """
    result = cls.execute_custom_query(
        """
        UPDATE Menus
        SET status = %s
        WHERE status = %s
        AND DATEDIFF(CURRENT_DATE(), valid_date) > 0
        """,
        (cls.STATUS_ARCHIVED, cls.STATUS_PUBLISHED)
    )
    
    # Return number of affected rows if available
    return result.get('affected_rows', 0) if result else 0

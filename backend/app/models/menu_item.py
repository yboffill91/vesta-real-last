"""
Menu Item model for database operations
"""
from typing import Dict, Any, Optional, List
from app.models.base import BaseModel

class MenuItem(BaseModel):
    """
    Model for menu items (products assigned to menus)
    """
    table_name = "MenuItems"
    
    @classmethod
    def get_by_menu_id(cls, menu_id: int) -> List[Dict[str, Any]]:
        """
        Get all items for a specific menu.
        
        Args:
            menu_id: The menu ID to get items for
            
        Returns:
            list: List of menu items for the menu
        """
        return cls.execute_custom_query(
            """
            SELECT mi.*, p.name as product_name, p.description as product_description, p.image as product_image 
            FROM MenuItems mi
            JOIN Products p ON mi.product_id = p.id
            WHERE mi.menu_id = %s
            ORDER BY p.name ASC
            """,
            (menu_id,)
        )
    
    @classmethod
    def add_to_menu(cls, menu_id: int, product_id: int, price: float, is_available: bool = True) -> Optional[int]:
        """
        Add a product to a menu.
        
        Args:
            menu_id: The menu ID
            product_id: The product ID
            price: The price for this product in this menu
            is_available: Whether this item is available
            
        Returns:
            int: The inserted ID or None on failure
        """
        return cls.insert({
            'menu_id': menu_id,
            'product_id': product_id,
            'price': price,
            'is_available': is_available
        })

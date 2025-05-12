"""
Product model representing individual products offered by the establishment.
"""
from typing import Dict, Any, Optional, List
from app.models.base import BaseModel

class Product(BaseModel):
    """Model for products like food items, drinks, etc."""
    
    table_name = "Products"
    
    @classmethod
    def get_by_category(cls, category_id: int, only_available: bool = True) -> List[Dict[str, Any]]:
        """
        Get all products for a specific category.
        
        Args:
            category_id: The category ID
            only_available: Whether to include only available products
            
        Returns:
            list: List of products
        """
        where = {"category_id": category_id}
        
        if only_available:
            where["is_available"] = True
            
        return cls.find_all(where=where, order_by="name ASC")
    
    @classmethod
    def search(cls, query: str, only_available: bool = True) -> List[Dict[str, Any]]:
        """
        Search products by name or description.
        
        Args:
            query: The search term
            only_available: Whether to include only available products
            
        Returns:
            list: List of matching products
        """
        search_query = f"%{query}%"
        
        availability_clause = "AND is_available = TRUE" if only_available else ""
        
        return cls.execute_custom_query(
            f"""
            SELECT p.*, pc.name as category_name
            FROM Products p
            JOIN ProductCategories pc ON p.category_id = pc.id
            WHERE (p.name LIKE %s OR p.description LIKE %s)
            {availability_clause}
            ORDER BY p.name ASC
            """,
            (search_query, search_query)
        )
    
    @classmethod
    def get_with_category(cls, product_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a product with its category information.
        
        Args:
            product_id: The product ID
            
        Returns:
            dict: Product with category data or None if not found
        """
        results = cls.execute_custom_query(
            """
            SELECT p.*, pc.name as category_name
            FROM Products p
            JOIN ProductCategories pc ON p.category_id = pc.id
            WHERE p.id = %s
            """,
            (product_id,)
        )
        
        return results[0] if results else None
    
    @classmethod
    def update_availability(cls, product_id: int, is_available: bool) -> bool:
        """
        Update the availability of a product.
        
        Args:
            product_id: The product ID
            is_available: Whether the product is available
            
        Returns:
            bool: True if successful, False otherwise
        """
        return cls.update(product_id, {"is_available": is_available})

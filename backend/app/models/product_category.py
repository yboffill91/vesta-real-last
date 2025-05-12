"""
ProductCategory model representing categories of products.
"""
from typing import Dict, Any, Optional, List
from app.models.base import BaseModel

class ProductCategory(BaseModel):
    """Model for product categories like Drinks, Food, etc."""
    
    table_name = "ProductCategories"
    
    @classmethod
    def get_active(cls) -> List[Dict[str, Any]]:
        """
        Get all active product categories.
        
        Returns:
            list: List of active categories
        """
        return cls.find_all(where={"is_active": True}, order_by="name ASC")
    
    @classmethod
    def get_with_products(cls, category_id: int = None) -> List[Dict[str, Any]]:
        """
        Get categories with their associated products.
        
        Args:
            category_id: Optional filter by category ID
            
        Returns:
            list: Categories with their products
        """
        query = """
            SELECT 
                pc.*,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', p.id,
                        'name', p.name,
                        'description', p.description,
                        'price', p.price,
                        'image', p.image,
                        'is_available', p.is_available
                    )
                ) as products
            FROM ProductCategories pc
            LEFT JOIN Products p ON pc.id = p.category_id AND p.is_available = TRUE
            WHERE pc.is_active = TRUE
        """
        
        params = ()
        
        if category_id:
            query += " AND pc.id = %s"
            params = (category_id,)
            
        query += " GROUP BY pc.id ORDER BY pc.name ASC"
        
        return cls.execute_custom_query(query, params)

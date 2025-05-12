"""
SalesArea model representing the different sales areas in the establishment.
"""
from typing import Dict, Any, Optional, List
from app.models.base import BaseModel

class SalesArea(BaseModel):
    """Model for sales areas like Salon, Bar, etc."""
    
    table_name = "SalesAreas"
    
    @classmethod
    def get_active_areas(cls, establishment_id: int = None) -> List[Dict[str, Any]]:
        """
        Get all active sales areas.
        
        Args:
            establishment_id: Optional filter by establishment
            
        Returns:
            list: List of active sales areas
        """
        where = {"is_active": True}
        
        if establishment_id:
            where["establishment_id"] = establishment_id
            
        return cls.find_all(where=where, order_by="name ASC")
    
    @classmethod
    def get_with_service_spots(cls, area_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a sales area with its service spots.
        
        Args:
            area_id: The sales area ID
            
        Returns:
            dict: Sales area with service spots data or None if not found
        """
        conn = cls.execute_custom_query(
            """
            SELECT 
                sa.*, 
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', ss.id,
                        'name', ss.name,
                        'capacity', ss.capacity,
                        'status', ss.status,
                        'is_active', ss.is_active
                    )
                ) as service_spots
            FROM SalesAreas sa
            LEFT JOIN ServiceSpots ss ON sa.id = ss.sales_area_id
            WHERE sa.id = %s
            GROUP BY sa.id
            """,
            (area_id,)
        )
        
        return conn[0] if conn else None
    
    @classmethod
    def get_for_menu(cls, menu_id: int) -> List[Dict[str, Any]]:
        """
        Get all sales areas associated with a menu.
        
        Args:
            menu_id: The menu ID
            
        Returns:
            list: List of sales areas
        """
        return cls.execute_custom_query(
            """
            SELECT sa.*
            FROM SalesAreas sa
            JOIN MenuSalesAreas msa ON sa.id = msa.sales_area_id
            WHERE msa.menu_id = %s AND sa.is_active = TRUE
            ORDER BY sa.name ASC
            """,
            (menu_id,)
        )

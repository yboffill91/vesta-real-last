"""
ServiceSpot model representing the individual service spots (tables, seats, etc.)
"""
from typing import Dict, Any, Optional, List
from app.models.base import BaseModel

class ServiceSpot(BaseModel):
    """Model for service spots like tables, bar seats, etc."""
    
    table_name = "ServiceSpots"
    
    # Status constants
    STATUS_FREE = 'libre'
    STATUS_OCCUPIED = 'ocupado'
    STATUS_RESERVED = 'reservado'
    STATUS_ORDER_OPEN = 'pedido_abierto'
    STATUS_PAID = 'cobrado'
    
    @classmethod
    def get_by_area(cls, sales_area_id: int, include_inactive: bool = False) -> List[Dict[str, Any]]:
        """
        Get all service spots for a specific sales area.
        
        Args:
            sales_area_id: The sales area ID
            include_inactive: Whether to include inactive spots
            
        Returns:
            list: List of service spots
        """
        where = {"sales_area_id": sales_area_id}
        
        if not include_inactive:
            where["is_active"] = True
            
        return cls.find_all(where=where, order_by="name ASC")
    
    @classmethod
    def get_by_status(cls, status: str, sales_area_id: int = None) -> List[Dict[str, Any]]:
        """
        Get all service spots with a specific status.
        
        Args:
            status: The status to filter by
            sales_area_id: Optional filter by sales area
            
        Returns:
            list: List of service spots
        """
        where = {"status": status, "is_active": True}
        
        if sales_area_id:
            where["sales_area_id"] = sales_area_id
            
        return cls.find_all(where=where, order_by="name ASC")
    
    @classmethod
    def update_status(cls, spot_id: int, new_status: str) -> bool:
        """
        Update the status of a service spot.
        
        Args:
            spot_id: The service spot ID
            new_status: The new status
            
        Returns:
            bool: True if successful, False otherwise
        """
        return cls.update(spot_id, {"status": new_status})
    
    @classmethod
    def reset_all_statuses(cls) -> bool:
        """
        Reset all service spots to 'libre' status.
        Useful when starting a new day.
        
        Returns:
            bool: True if successful, False otherwise
        """
        return cls.execute_custom_query(
            """
            UPDATE ServiceSpots
            SET status = %s
            WHERE is_active = TRUE
            """,
            (cls.STATUS_FREE,)
        )

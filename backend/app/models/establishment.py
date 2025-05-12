"""
Establishment model representing the restaurant configuration.
"""
from typing import Dict, Any, Optional, List
from app.models.base import BaseModel

class Establishment(BaseModel):
    """Model for restaurant/establishment configuration"""
    
    table_name = "Establishment"
    
    @classmethod
    def get_current(cls) -> Optional[Dict[str, Any]]:
        """
        Get the current establishment configuration.
        Typically there will be only one record in this table.
        
        Returns:
            dict: Establishment data or None if not configured
        """
        # Find all establishments (should be only one in most cases)
        establishments = cls.find_all(limit=1)
        
        # Return the first one or None
        return establishments[0] if establishments else None
    
    @classmethod
    def is_configured(cls) -> bool:
        """
        Check if the establishment is configured.
        This is used to determine if initial setup is required.
        
        Returns:
            bool: True if configured, False otherwise
        """
        establishment = cls.get_current()
        
        # Check if establishment exists and is configured
        return establishment is not None and establishment.get('is_configured', False)
    
    @classmethod
    def update_or_create(cls, data: Dict[str, Any]) -> bool:
        """
        Update the current establishment or create a new one if none exists.
        
        Args:
            data: Dictionary of establishment data
            
        Returns:
            bool: True if successful, False otherwise
        """
        current = cls.get_current()
        
        if current:
            # Update existing
            return cls.update(current['id'], data)
        else:
            # Create new
            return cls.create(data) is not None

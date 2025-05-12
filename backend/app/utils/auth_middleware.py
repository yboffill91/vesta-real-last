"""
Authentication and authorization middleware utilities.
This module provides dependencies and utilities for protecting routes based on user roles.
"""
import logging
from typing import List, Optional
from fastapi import Depends, HTTPException, status
from app.utils.security import get_current_user

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_user_with_roles(allowed_roles: List[str] = None):
    """
    Dependency for route protection based on user roles.
    Verifies that the authenticated user has one of the allowed roles.
    
    Args:
        allowed_roles: List of roles allowed to access the endpoint. If None, any authenticated user can access.
    
    Returns:
        A dependency function that checks user roles.
    """
    async def require_roles(current_user: dict = Depends(get_current_user)):
        """
        Verifies that the current user has one of the allowed roles.
        
        Args:
            current_user: The authenticated user information from JWT token
        
        Returns:
            dict: The current user if role check passes
            
        Raises:
            HTTPException: If the user does not have one of the allowed roles
        """
        # If no roles specified, any authenticated user can access
        if not allowed_roles:
            return current_user
            
        user_role = current_user.get("role")
        
        # Check if user role is in allowed roles
        if user_role not in allowed_roles:
            logger.warning(
                f"Access denied: User {current_user.get('username')} with role {user_role} "
                f"attempted to access resource restricted to {allowed_roles}"
            )
            
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this resource"
            )
        
        logger.info(
            f"Access granted: User {current_user.get('username')} with role {user_role} "
            f"accessed resource restricted to {allowed_roles}"
        )
        
        return current_user
    
    return require_roles

# Role-specific dependencies for common use cases
require_soporte = get_user_with_roles(["Soporte"])
require_admin = get_user_with_roles(["Soporte", "Administrador"])
require_dependiente = get_user_with_roles(["Soporte", "Administrador", "Dependiente"])

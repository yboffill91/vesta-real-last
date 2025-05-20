"""
Configuration router.
Provides endpoints for system configuration management.
Only accessible to users with Soporte or Administrador roles.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException
from app.utils.auth_middleware import require_admin

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/config",
    tags=["Configuration"],
    responses={
        403: {"description": "Forbidden - Not enough permissions"},
        401: {"description": "Unauthorized - Not authenticated"}
    },
)

@router.get("/")
async def get_config(current_user: dict = Depends(require_admin)):
    """
    Get system configuration.
    Only accessible to Soporte and Administrador roles.
    
    Returns:
        dict: A simplified configuration object
    """
    logger.info(f"User {current_user['username']} accessed configuration")
    
    # In a real implementation, this would fetch from database
    return {
        "status": "success",
        "message": "Configuración obtenida exitosamente",
        "data": {
            "app_name": "Vesta Restaurant System",
            "version": "1.0.0",
            "currency": "CUP",
            "tax_rate": 0.10,
            "business_hours": {
                "open": "9:00",
                "close": "23:00"
            },
            "allowed_payment_methods": ["cash", "card", "transfer"]
        }
    }

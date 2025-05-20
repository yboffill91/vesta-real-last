"""
Database health check router.
This module provides an endpoint to check the status of the database connection.
"""
from fastapi import APIRouter
from app.db.db_connect import check_connection

router = APIRouter(
    prefix="/db-health",
    tags=["Database Health"],
    responses={503: {"description": "Database connection failed"}},
)

@router.get("/")
async def db_health_check():
    """
    Check the health of the database connection.
    Returns a status indicating whether the connection is successful.
    """
    is_connected = check_connection()
    
    return {
        "estado": "conectado" if is_connected else "desconectado"
    }

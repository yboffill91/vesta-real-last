"""
User service.
This module provides services for user-related operations like authentication and user management.
"""
import logging
from typing import Optional, Dict, Any
from app.db.db_connect import get_connection
from app.utils.security import verify_password

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def authenticate_user(username: str, password: str) -> Optional[Dict[str, Any]]:
    """
    Authenticate a user by username and password.
    
    Args:
        username: The username provided in the login request
        password: The password provided in the login request
        
    Returns:
        dict: User data if authentication succeeds, None otherwise
    """
    try:
        conn = get_connection()
        if not conn:
            logger.error("Failed to connect to database during authentication")
            return None
            
        try:
            with conn.cursor() as cursor:
                # Fetch user by username
                cursor.execute(
                    "SELECT id, username, name, surname, password, role FROM Users WHERE username = %s",
                    (username,)
                )
                user = cursor.fetchone()
                
                # Check if user exists and password is correct
                if user and verify_password(password, user["password"]):
                    # Return user data (excluding password)
                    return {
                        "id": user["id"],
                        "username": user["username"],
                        "name": user["name"],
                        "surname": user["surname"],
                        "role": user["role"]
                    }
                    
                return None  # Authentication failed
                
        finally:
            conn.close()
            
    except Exception as e:
        logger.error(f"Error during user authentication: {e}")
        return None


async def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    """
    Get a user by their ID.
    
    Args:
        user_id: The unique ID of the user to fetch
        
    Returns:
        dict: User data if found, None otherwise
    """
    try:
        conn = get_connection()
        if not conn:
            logger.error(f"Failed to connect to database while fetching user id={user_id}")
            return None
            
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT id, username, name, surname, role FROM Users WHERE id = %s",
                    (user_id,)
                )
                user = cursor.fetchone()
                
                if user:
                    return {
                        "id": user["id"],
                        "username": user["username"],
                        "name": user["name"],
                        "surname": user["surname"],
                        "role": user["role"]
                    }
                    
                return None  # User not found
                
        finally:
            conn.close()
            
    except Exception as e:
        logger.error(f"Error fetching user by ID: {e}")
        return None

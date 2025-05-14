"""
User model representing system users.
"""
from typing import Dict, Any, Optional, List
from app.models.base import BaseModel
from app.utils.security import verify_password
from app.db.db_connect import get_connection
class User(BaseModel):
    """Model for system users"""
    
    table_name = "Users"
    
    # Role constants
    ROLE_SOPORTE = 'Soporte'
    ROLE_ADMINISTRADOR = 'Administrador'
    ROLE_DEPENDIENTE = 'Dependiente'
    
    @classmethod
    def find_by_username(cls, username: str) -> Optional[Dict[str, Any]]:
        """
        Find a user by username.
        
        Args:
            username: The username to search for
            
        Returns:
            dict: User data or None if not found
        """
        conn = get_connection()
        if not conn:
            return None
            
        try:
            with conn.cursor() as cursor:
                query = f"SELECT * FROM {cls.table_name} WHERE username = %s"
                cursor.execute(query, (username,))
                return cursor.fetchone()
        except Exception as e:
            cls.logger.error(f"Error in {cls.__name__}.find_by_username: {e}")
            return None
        finally:
            conn.close()
    
    @classmethod
    def search(cls, query: str, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Search users by name or username.
        
        Args:
            query: The search term
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            list: Matching users
        """
        search_term = f"%{query}%"
        
        return cls.execute_custom_query(
            f"""
            SELECT *
            FROM {cls.table_name}
            WHERE name LIKE %s
            OR surname LIKE %s
            OR username LIKE %s
            ORDER BY username ASC
            LIMIT %s OFFSET %s
            """,
            (search_term, search_term, search_term, limit, skip)
        )
    
    @classmethod
    def authenticate(cls, username: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Authenticate a user by username and password.
        
        Args:
            username: The username
            password: The password (plain text)
            
        Returns:
            dict: User data if authentication succeeds, None otherwise
        """
        user = cls.find_by_username(username)
        
        if not user:
            return None
            
        if not verify_password(password, user['password']):
            return None
            
        return user
    
    @classmethod
    def get_by_role(cls, role: str) -> List[Dict[str, Any]]:
        """
        Get users by role.
        
        Args:
            role: The role to filter by
            
        Returns:
            list: Users with the specified role
        """
        return cls.find_all(where={"role": role}, order_by="username ASC")
    
    @classmethod
    def is_admin(cls, user_id: int) -> bool:
        """
        Check if a user has an admin role.
        
        Args:
            user_id: The user ID
            
        Returns:
            bool: True if user is an admin, False otherwise
        """
        user = cls.find_by_id(user_id)
        
        if not user:
            return False
            
        return user['role'] in [cls.ROLE_SOPORTE, cls.ROLE_ADMINISTRADOR]

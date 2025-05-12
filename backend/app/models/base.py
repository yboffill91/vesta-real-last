"""
Base model class and shared utilities for database models.
"""
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from app.db.db_connect import get_connection

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BaseModel:
    """Base class for all database models"""
    
    table_name = None  # Override in subclasses
    
    @classmethod
    def create_table(cls):
        """
        Execute table creation SQL.
        This is primarily for testing purposes, as migrations are the preferred
        method for schema management.
        """
        raise NotImplementedError(
            "Create table not implemented for this model. Use migrations instead."
        )
    
    @classmethod
    def find_by_id(cls, id: int) -> Optional[Dict[str, Any]]:
        """
        Find a record by its ID.
        
        Args:
            id: The primary key value
            
        Returns:
            dict: The record as a dictionary, or None if not found
        """
        if not cls.table_name:
            raise ValueError(f"table_name not defined for {cls.__name__}")
            
        conn = get_connection()
        if not conn:
            logger.error(f"Failed to connect to database in {cls.__name__}.find_by_id")
            return None
            
        try:
            with conn.cursor() as cursor:
                query = f"SELECT * FROM {cls.table_name} WHERE id = %s"
                cursor.execute(query, (id,))
                result = cursor.fetchone()
                return result
        except Exception as e:
            logger.error(f"Error in {cls.__name__}.find_by_id: {e}")
            return None
        finally:
            conn.close()
    
    @classmethod
    def find_all(cls, 
                 where: Dict[str, Any] = None, 
                 order_by: str = None, 
                 limit: int = None,
                 offset: int = None) -> List[Dict[str, Any]]:
        """
        Find all records matching the given criteria.
        
        Args:
            where: Dictionary of column-value pairs for filtering
            order_by: Column to order by, e.g. "name ASC" or "created_at DESC"
            limit: Maximum number of records to return
            offset: Number of records to skip
            
        Returns:
            list: List of records as dictionaries
        """
        if not cls.table_name:
            raise ValueError(f"table_name not defined for {cls.__name__}")
            
        conn = get_connection()
        if not conn:
            logger.error(f"Failed to connect to database in {cls.__name__}.find_all")
            return []
            
        try:
            with conn.cursor() as cursor:
                query = f"SELECT * FROM {cls.table_name}"
                params = []
                
                # Add WHERE clause if needed
                if where:
                    where_parts = []
                    for key, value in where.items():
                        where_parts.append(f"{key} = %s")
                        params.append(value)
                    
                    if where_parts:
                        query += " WHERE " + " AND ".join(where_parts)
                
                # Add ORDER BY if specified
                if order_by:
                    query += f" ORDER BY {order_by}"
                
                # Add LIMIT if specified
                if limit:
                    query += " LIMIT %s"
                    params.append(limit)
                
                # Add OFFSET if specified
                if offset:
                    query += " OFFSET %s"
                    params.append(offset)
                
                cursor.execute(query, tuple(params))
                results = cursor.fetchall()
                return results
        except Exception as e:
            logger.error(f"Error in {cls.__name__}.find_all: {e}")
            return []
        finally:
            conn.close()
    
    @classmethod
    def create(cls, data: Dict[str, Any]) -> Optional[int]:
        """
        Create a new record.
        
        Args:
            data: Dictionary of column-value pairs
            
        Returns:
            int: ID of the created record, or None if failed
        """
        if not cls.table_name:
            raise ValueError(f"table_name not defined for {cls.__name__}")
            
        # Remove id if present (auto-increment)
        if 'id' in data:
            del data['id']
            
        conn = get_connection()
        if not conn:
            logger.error(f"Failed to connect to database in {cls.__name__}.create")
            return None
            
        try:
            with conn.cursor() as cursor:
                # Prepare column names and placeholders
                columns = ", ".join(data.keys())
                placeholders = ", ".join(["%s"] * len(data))
                
                query = f"INSERT INTO {cls.table_name} ({columns}) VALUES ({placeholders})"
                cursor.execute(query, tuple(data.values()))
                
                # Get the ID of the inserted record
                cursor.execute("SELECT LAST_INSERT_ID()")
                last_id = cursor.fetchone()['LAST_INSERT_ID()']
                
                conn.commit()
                return last_id
        except Exception as e:
            logger.error(f"Error in {cls.__name__}.create: {e}")
            conn.rollback()
            return None
        finally:
            conn.close()
    
    @classmethod
    def update(cls, id: int, data: Dict[str, Any]) -> bool:
        """
        Update an existing record.
        
        Args:
            id: The primary key value
            data: Dictionary of column-value pairs to update
            
        Returns:
            bool: True if successful, False otherwise
        """
        if not cls.table_name:
            raise ValueError(f"table_name not defined for {cls.__name__}")
            
        # Remove id if present (can't update primary key)
        if 'id' in data:
            del data['id']
            
        # Don't update timestamps that are managed by MySQL
        if 'created_at' in data:
            del data['created_at']
            
        conn = get_connection()
        if not conn:
            logger.error(f"Failed to connect to database in {cls.__name__}.update")
            return False
            
        try:
            with conn.cursor() as cursor:
                # Prepare SET clause
                set_parts = [f"{key} = %s" for key in data.keys()]
                set_clause = ", ".join(set_parts)
                
                query = f"UPDATE {cls.table_name} SET {set_clause} WHERE id = %s"
                params = list(data.values()) + [id]
                
                cursor.execute(query, tuple(params))
                conn.commit()
                
                # Check if any rows were affected
                return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"Error in {cls.__name__}.update: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()
    
    @classmethod
    def delete(cls, id: int) -> bool:
        """
        Delete a record.
        
        Args:
            id: The primary key value
            
        Returns:
            bool: True if successful, False otherwise
        """
        if not cls.table_name:
            raise ValueError(f"table_name not defined for {cls.__name__}")
            
        conn = get_connection()
        if not conn:
            logger.error(f"Failed to connect to database in {cls.__name__}.delete")
            return False
            
        try:
            with conn.cursor() as cursor:
                query = f"DELETE FROM {cls.table_name} WHERE id = %s"
                cursor.execute(query, (id,))
                conn.commit()
                
                # Check if any rows were affected
                return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"Error in {cls.__name__}.delete: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()
            
    @classmethod
    def execute_custom_query(cls, query: str, params: Tuple = None) -> List[Dict[str, Any]]:
        """
        Execute a custom SQL query.
        
        Args:
            query: The SQL query to execute
            params: Query parameters
            
        Returns:
            list: Query results as dictionaries
        """
        conn = get_connection()
        if not conn:
            logger.error(f"Failed to connect to database in {cls.__name__}.execute_custom_query")
            return []
            
        try:
            with conn.cursor() as cursor:
                cursor.execute(query, params or ())
                if query.strip().upper().startswith(('SELECT', 'SHOW')):
                    return cursor.fetchall()
                else:
                    conn.commit()
                    return [{'affected_rows': cursor.rowcount}]
        except Exception as e:
            logger.error(f"Error in {cls.__name__}.execute_custom_query: {e}")
            if not query.strip().upper().startswith(('SELECT', 'SHOW')):
                conn.rollback()
            return []
        finally:
            conn.close()

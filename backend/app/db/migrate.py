"""
Database migration script.
Executes SQL migrations to set up or update the database schema.
"""
import os
import logging
from app.db.db_connect import get_connection

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def execute_migration_script(file_path):
    """
    Execute SQL statements from a migration file.
    
    Args:
        file_path: Path to the SQL migration file
        
    Returns:
        bool: True if migration was successful, False otherwise
    """
    try:
        # Read the SQL script
        with open(file_path, 'r') as f:
            sql_script = f.read()

        # Determine the type of SQL script
        is_table_creation = '01_create_tables' in file_path
        is_procedure_creation = '02_create_procedures' in file_path
            
        # Get a database connection
        conn = get_connection()
        if not conn:
            logger.error(f"Failed to connect to database for migration: {file_path}")
            return False
            
        try:
            with conn.cursor() as cursor:
                if is_procedure_creation:
                    # For procedures, we need to execute as a whole or statement by statement with DELIMITER handling
                    logger.info(f"Processing procedures in: {file_path}")
                    
                    # Split by procedure to handle them individually
                    procedures = sql_script.split('CREATE PROCEDURE')
                    
                    # Execute the first part (usually just comments and drops)
                    if procedures[0].strip():
                        cursor.execute(procedures[0])
                    
                    # Execute each procedure creation
                    for i in range(1, len(procedures)):
                        if procedures[i].strip():
                            proc_sql = 'CREATE PROCEDURE' + procedures[i]
                            try:
                                cursor.execute(proc_sql)
                                logger.info(f"Procedure created successfully")
                            except Exception as e:
                                logger.error(f"Error creating procedure: {e}")
                                raise
                else:
                    # For regular SQL, split by semicolon
                    statements = sql_script.split(';')
                    
                    # Execute each statement
                    for statement in statements:
                        # Skip empty statements
                        if statement.strip():
                            logger.info(f"Executing: {statement[:100]}...")  # Log first 100 chars
                            cursor.execute(statement)
                        
            # Commit the transaction
            conn.commit()
            logger.info(f"Migration successful: {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error executing migration {file_path}: {e}")
            conn.rollback()
            return False
            
        finally:
            conn.close()
            
    except Exception as e:
        logger.error(f"Error reading migration file {file_path}: {e}")
        return False

def run_migrations(migrations_dir=None):
    """
    Run all pending migrations from the migrations directory.
    
    Args:
        migrations_dir: Path to migrations directory. If None, use default.
        
    Returns:
        bool: True if all migrations were successful, False otherwise
    """
    # Default migrations directory
    if migrations_dir is None:
        migrations_dir = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            'migrations'
        )
    
    logger.info(f"Looking for migrations in: {migrations_dir}")
    
    # Check if directory exists
    if not os.path.exists(migrations_dir):
        logger.error(f"Migrations directory not found: {migrations_dir}")
        return False
    
    # Get all SQL files
    migration_files = [
        os.path.join(migrations_dir, f) 
        for f in os.listdir(migrations_dir) 
        if f.endswith('.sql')
    ]
    
    # Sort files to ensure consistent order
    migration_files.sort()
    
    if not migration_files:
        logger.warning("No migration files found")
        return True
    
    # Execute each migration
    success = True
    for migration_file in migration_files:
        logger.info(f"Applying migration: {os.path.basename(migration_file)}")
        if not execute_migration_script(migration_file):
            logger.error(f"Migration failed: {migration_file}")
            success = False
            break
    
    if success:
        logger.info("All migrations completed successfully")
    else:
        logger.error("Migration process failed")
    
    return success

if __name__ == "__main__":
    run_migrations()

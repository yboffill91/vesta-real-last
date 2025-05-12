"""
Database initialization module.
Handles the creation of required database tables and initial data.
"""
import logging
from passlib.hash import bcrypt
from app.db.db_connect import get_connection, check_connection

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_users_table():
    """
    Creates the Users table if it doesn't exist.
    """
    if not check_connection():
        logger.error("Cannot create tables: Database connection failed")
        return False
    
    conn = get_connection()
    if not conn:
        return False
    
    try:
        with conn.cursor() as cursor:
            # Check if table exists
            cursor.execute("""
                SELECT COUNT(*)
                FROM information_schema.tables
                WHERE table_schema = %s
                AND table_name = %s
            """, (conn.db.decode('utf-8'), 'Users'))
            
            if cursor.fetchone()['COUNT(*)'] == 0:
                logger.info("Creating Users table...")
                # Create the Users table
                cursor.execute("""
                    CREATE TABLE Users (
                        id INT PRIMARY KEY AUTO_INCREMENT,
                        name VARCHAR(32) NOT NULL,
                        surname VARCHAR(32) NOT NULL,
                        username VARCHAR(32) NOT NULL UNIQUE,
                        password VARCHAR(255) NOT NULL,
                        role ENUM('Soporte', 'Administrador', 'Dependiente') NOT NULL
                    )
                """)
                logger.info("Users table created successfully")
                
                # Create the first admin user
                create_admin_user(conn)
            else:
                logger.info("Users table already exists")
        
        conn.commit()
        return True
    
    except Exception as e:
        logger.error(f"Error creating Users table: {e}")
        return False
    
    finally:
        conn.close()

def create_admin_user(conn=None):
    """
    Creates the first admin user in the Users table.
    
    Args:
        conn: An existing database connection. If None, a new connection will be created.
    """
    should_close = False
    
    if not conn:
        conn = get_connection()
        should_close = True
    
    if not conn:
        logger.error("Cannot create admin user: Database connection failed")
        return False
    
    try:
        # Hash the password
        hashed_password = bcrypt.hash("Adminl0cal.")
        
        with conn.cursor() as cursor:
            # Check if admin user already exists
            cursor.execute("SELECT COUNT(*) FROM Users WHERE username = %s", ("vesta.admin",))
            if cursor.fetchone()['COUNT(*)'] == 0:
                # Insert the admin user
                cursor.execute("""
                    INSERT INTO Users (name, surname, username, password, role)
                    VALUES (%s, %s, %s, %s, %s)
                """, ("Tecnotics", "Soporte", "vesta.admin", hashed_password, "Soporte"))
                
                logger.info("Admin user created successfully")
            else:
                logger.info("Admin user already exists")
        
        conn.commit()
        return True
    
    except Exception as e:
        logger.error(f"Error creating admin user: {e}")
        conn.rollback()
        return False
    
    finally:
        if should_close and conn:
            conn.close()

def init_database():
    """
    Initialize the database by creating all required tables and initial data.
    Uses the migration system to create all tables and seed data.
    """
    logger.info("Initializing database...")
    
    # First, ensure the Users table exists (legacy approach)
    users_table_created = create_users_table()
    
    if not users_table_created:
        logger.error("Failed to create Users table")
        return False
    
    # Run migrations to create all other tables
    try:
        from app.db.migrate import run_migrations
        
        if run_migrations():
            logger.info("Database migrations completed successfully")
            return True
        else:
            logger.error("Database migrations failed")
            return False
            
    except Exception as e:
        logger.error(f"Error running migrations: {e}")
        return False

if __name__ == "__main__":
    init_database()

import os
import pymysql
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
is_docker = os.path.exists("/app/.db.env")

# Path for Docker environment
if is_docker:
    logger.info("Running in Docker environment")
    load_dotenv("/app/.db.env")
else:
    # Try to load from the project root when running locally
    logger.info("Running in local environment")
    local_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".db.env")
    logger.info(f"Loading environment from: {local_env_path}")
    load_dotenv(local_env_path)

# Define host based on environment
default_host = "db" if is_docker else "localhost"

DB_CONFIG = {
    "host": os.getenv("DB_HOST", default_host),
    "user": os.getenv("MYSQL_USER", "vestasysuser"),
    "password": os.getenv("MYSQL_PASSWORD", "VestaSys2025"),
    "database": os.getenv("MYSQL_DATABASE", "vestasys"),
    "port": int(os.getenv("DB_PORT", 3306)),
}

logger.info(f"Database configuration: host={DB_CONFIG['host']}, database={DB_CONFIG['database']}, port={DB_CONFIG['port']}")


def get_connection():
    """
    Get a connection to the MySQL database.
    
    Returns:
        pymysql.connections.Connection: A connection to the database, or None if connection fails.
    """
    try:
        logger.info(f"Attempting to connect to database at {DB_CONFIG['host']}:{DB_CONFIG['port']}")
        connection = pymysql.connect(
            host=DB_CONFIG["host"],
            user=DB_CONFIG["user"],
            password=DB_CONFIG["password"],
            database=DB_CONFIG["database"],
            port=DB_CONFIG["port"],
            cursorclass=pymysql.cursors.DictCursor,
            connect_timeout=5  # Add timeout to avoid long waits
        )
        logger.info("Database connection established successfully")
        return connection
    except Exception as e:
        logger.error(f"Error connecting to database: {e}")
        # Log more details about the configuration
        logger.error(f"Connection details: host={DB_CONFIG['host']}, user={DB_CONFIG['user']}, db={DB_CONFIG['database']}, port={DB_CONFIG['port']}")
        return None

def check_connection():
   
    try:
        connection = get_connection()
        if connection:
            connection.close()
            return True
        return False
    except Exception as e:
        logger.error(f"Error checking database connection: {e}")
        return False

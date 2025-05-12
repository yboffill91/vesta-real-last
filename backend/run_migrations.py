#!/usr/bin/env python3
"""
Script to run database migrations.
"""
import sys
import logging
from app.db.migrate import run_migrations

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logger.info("Starting database migrations")
    
    # Run migrations
    success = run_migrations()
    
    # Exit with appropriate code
    if success:
        logger.info("Migrations completed successfully")
        sys.exit(0)
    else:
        logger.error("Migrations failed")
        sys.exit(1)

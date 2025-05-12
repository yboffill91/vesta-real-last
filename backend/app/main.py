"""
Main application file for the FastAPI backend.
This file contains the main FastAPI app instance, configures routers,
middleware, and other core components.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.db.init_db import init_database

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the FastAPI app instance
app = FastAPI(
    title="Vesta API",
    description="Backend API para la plataforma de manejo de negocios gastronómicos Vesta",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # NextJS default port
        "http://localhost",
        "http://frontend",  # Docker service name for frontend
        "http://frontend:3000",
        "http://127.0.0.1",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint to verify the API is running.
    """
    return {"status": "healthy", "message": "API is running"}

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint that returns basic API information.
    """
    return {
        "message": "Welcome to Vesta API",
        "docs": "/docs",
        "redoc": "/redoc",
    }

# Import and include routers
from app.api.db_health import router as db_health_router
from app.api.auth import router as auth_router
from app.api.config import router as config_router
from app.api.products import router as products_router
from app.api.users import router as users_router
from app.api.orders import router as orders_router
from app.api.categories import router as categories_router
from app.api.establishment import router as establishment_router
from app.api.sales_areas import router as sales_areas_router
from app.api.service_spots import router as service_spots_router
from app.api.menus import router as menus_router

# Include routers
app.include_router(db_health_router)
app.include_router(auth_router)
app.include_router(config_router)
app.include_router(products_router)
app.include_router(users_router)
app.include_router(orders_router)
app.include_router(categories_router)
app.include_router(establishment_router)
app.include_router(sales_areas_router)
app.include_router(service_spots_router)
app.include_router(menus_router)

# Database initialization event
@app.on_event("startup")
async def startup_db_client():
    """
    Initialize the database when the application starts.
    Creates necessary tables and the initial admin user if they don't exist.
    """
    logger.info("Starting database initialization...")
    init_database()
    logger.info("Database initialization completed.")

@app.on_event("shutdown")
async def shutdown_db_client():
    """
    Clean up any database resources when the application shuts down.
    """
    logger.info("Shutting down database connections...")
    # No active connections pool to close at this point
    # In the future, we might add connection pooling and close it here

"""
Establishment router.
Provides endpoints for establishment configuration management.
Only accessible to users with Soporte or Administrador roles.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, Path, status
from app.utils.auth_middleware import require_admin
from app.schemas.establishment import (
    EstablishmentCreate, EstablishmentUpdate, EstablishmentResponse, EstablishmentDetailResponse
)
from app.models.establishment import Establishment

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/establishment",
    tags=["Establishment"],
    responses={
        403: {"description": "Forbidden - Not enough permissions"},
        401: {"description": "Unauthorized - Not authenticated"}
    },
)

@router.get("/", response_model=EstablishmentDetailResponse)
async def get_establishment(
    current_user: dict = Depends(require_admin)
):
    """
    Get the establishment configuration.
    Only accessible to Soporte and Administrador roles.
    
    Returns:
        EstablishmentDetailResponse: The establishment configuration data
    """
    logger.info(f"User {current_user['username']} accessed establishment configuration")
    
    # Get establishment from database (there should be only one)
    db_establishment = Establishment.get_current()
    
    if not db_establishment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Establishment configuration not found"
        )
    
    # Convert to response model
    establishment_response = EstablishmentResponse(
        id=db_establishment['id'],
        name=db_establishment['name'],
        address=db_establishment['address'],
        phone=db_establishment['phone'],
        tax_rate=db_establishment['tax_rate'],
        currency=db_establishment['currency'],
        logo_url=db_establishment['logo'],
        created_at=db_establishment.get('created_at'),
        updated_at=db_establishment.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Establishment configuration retrieved successfully",
        "data": establishment_response
    }

@router.post("/", response_model=EstablishmentDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_establishment(
    establishment: EstablishmentCreate,
    current_user: dict = Depends(require_admin)
):
    """
    Create the establishment configuration.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        establishment: Establishment data for creation
        
    Returns:
        EstablishmentDetailResponse: The created establishment data
    """
    logger.info(f"User {current_user['username']} is creating establishment configuration")
    
    # Check if establishment already exists
    existing = Establishment.get_current()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Establishment already exists. Please use PUT to update."
        )
    
    # Create establishment in database
    establishment_data = establishment.dict()
    new_establishment_id = Establishment.create(establishment_data)
    
    if not new_establishment_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create establishment configuration"
        )
    
    # Get the created establishment
    created_establishment = Establishment.find_by_id(new_establishment_id)
    
    # Convert to response model
    establishment_response = EstablishmentResponse(
        id=created_establishment['id'],
        name=created_establishment['name'],
        address=created_establishment['address'],
        phone=created_establishment['phone'],
        tax_rate=created_establishment['tax_rate'],
        currency=created_establishment['currency'],
        logo=created_establishment['logo'],
        created_at=created_establishment.get('created_at'),
        updated_at=created_establishment.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Establishment configuration created successfully",
        "data": establishment_response
    }

@router.put("/", response_model=EstablishmentDetailResponse)
async def update_establishment(
    establishment: EstablishmentUpdate,
    current_user: dict = Depends(require_admin)
):
    """
    Update the establishment configuration.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        establishment: Establishment data to update
        
    Returns:
        EstablishmentDetailResponse: The updated establishment data
    """
    logger.info(f"User {current_user['username']} is updating establishment configuration")
    
    # Get current establishment
    db_establishment = Establishment.get_current()
    if not db_establishment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Establishment configuration not found. Please create one first."
        )
    
    # Update establishment data
    establishment_data = {k: v for k, v in establishment.dict().items() if v is not None}
    
    # Update in database
    success = Establishment.update(db_establishment['id'], establishment_data)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update establishment configuration"
        )
    
    # Get the updated establishment
    updated_establishment = Establishment.find_by_id(db_establishment['id'])
    
    # Convert to response model
    establishment_response = EstablishmentResponse(
        id=updated_establishment['id'],
        name=updated_establishment['name'],
        address=updated_establishment['address'],
        phone=updated_establishment['phone'],
        tax_rate=updated_establishment['tax_rate'],
        currency=updated_establishment['currency'],
        logo_url=updated_establishment['logo_url'],
        created_at=updated_establishment.get('created_at'),
        updated_at=updated_establishment.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Establishment configuration updated successfully",
        "data": establishment_response
    }

"""
Service Spots router.
Provides endpoints for service spots management (tables, seats, etc.).
"""
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from app.utils.auth_middleware import require_admin, require_dependiente
from app.schemas.service_spot import (
    ServiceSpotCreate, ServiceSpotUpdate, ServiceSpotResponse, ServiceSpotsResponse,
    ServiceSpotDetailResponse, ServiceSpotStatusUpdate, ServiceSpotWithAreaResponse,
    ServiceSpotWithAreaDetailResponse
)
from app.models.service_spot import ServiceSpot

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/service-spots",
    tags=["Service Spots"],
    responses={
        403: {"description": "Forbidden - Not enough permissions"},
        401: {"description": "Unauthorized - Not authenticated"}
    },
)

@router.get("/", response_model=ServiceSpotsResponse)
async def get_service_spots(
    current_user: dict = Depends(require_dependiente),
    sales_area_id: Optional[int] = None,
    status: Optional[str] = None,
    active_only: bool = True
):
    """
    Get all service spots with optional filtering.
    Accessible to all authenticated users.
    
    Args:
        sales_area_id: Optional filter by sales area
        status: Optional filter by status
        active_only: Whether to show only active spots
        
    Returns:
        ServiceSpotsResponse: A list of service spots
    """
    logger.info(f"User {current_user['username']} accessed service spots list")
    
    # Set up filters
    where = {}
    if sales_area_id:
        where["sales_area_id"] = sales_area_id
    if status:
        where["status"] = status
    if active_only:
        where["is_active"] = True
    
    # Get service spots from database
    db_spots = ServiceSpot.find_all(
        where=where,
        order_by="name ASC"
    )
    
    # Convert to response model
    spots = [
        ServiceSpotResponse(
            id=spot['id'],
            name=spot['name'],
            capacity=spot['capacity'],
            status=spot['status'],
            is_active=spot['is_active'],
            sales_area_id=spot['sales_area_id'],
            created_at=spot.get('created_at'),
            updated_at=spot.get('updated_at')
        ) for spot in db_spots
    ]
    
    return {
        "status": "success",
        "message": "Service spots retrieved successfully",
        "data": spots
    }

@router.post("/", response_model=ServiceSpotDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_service_spot(
    service_spot: ServiceSpotCreate,
    current_user: dict = Depends(require_admin)
):
    """
    Create a new service spot.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        service_spot: Service spot data for creation
        
    Returns:
        ServiceSpotDetailResponse: The created service spot data
    """
    logger.info(f"User {current_user['username']} is creating a new service spot")
    
    # Create service spot in database
    spot_data = service_spot.dict()
    new_spot_id = ServiceSpot.create(spot_data)
    
    if not new_spot_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create service spot"
        )
    
    # Get the created service spot
    created_spot = ServiceSpot.find_by_id(new_spot_id)
    
    # Convert to response model
    spot_response = ServiceSpotResponse(
        id=created_spot['id'],
        name=created_spot['name'],
        capacity=created_spot['capacity'],
        status=created_spot['status'],
        is_active=created_spot['is_active'],
        sales_area_id=created_spot['sales_area_id'],
        created_at=created_spot.get('created_at'),
        updated_at=created_spot.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Service spot created successfully",
        "data": spot_response
    }

@router.get("/{spot_id}", response_model=ServiceSpotWithAreaDetailResponse)
async def get_service_spot(
    spot_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_dependiente)
):
    """
    Get a specific service spot by ID with sales area info.
    Accessible to all authenticated users.
    
    Args:
        spot_id: The ID of the service spot to retrieve
        
    Returns:
        ServiceSpotWithAreaDetailResponse: The service spot data with area info
    """
    logger.info(f"User {current_user['username']} is retrieving service spot {spot_id}")
    
    # Execute a custom query to get spot with area name
    db_spot = ServiceSpot.execute_custom_query(
        """
        SELECT ss.*, sa.name as sales_area_name
        FROM ServiceSpots ss
        JOIN SalesAreas sa ON ss.sales_area_id = sa.id
        WHERE ss.id = %s
        """,
        (spot_id,)
    )
    
    if not db_spot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service spot not found"
        )
    
    # Convert to response model
    spot_response = ServiceSpotWithAreaResponse(
        id=db_spot[0]['id'],
        name=db_spot[0]['name'],
        capacity=db_spot[0]['capacity'],
        status=db_spot[0]['status'],
        is_active=db_spot[0]['is_active'],
        sales_area_id=db_spot[0]['sales_area_id'],
        sales_area_name=db_spot[0]['sales_area_name'],
        created_at=db_spot[0].get('created_at'),
        updated_at=db_spot[0].get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Service spot retrieved successfully",
        "data": spot_response
    }

@router.put("/{spot_id}", response_model=ServiceSpotDetailResponse)
async def update_service_spot(
    service_spot: ServiceSpotUpdate,
    spot_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_admin)
):
    """
    Update a specific service spot.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        spot_id: The ID of the service spot to update
        service_spot: The service spot data to update
        
    Returns:
        ServiceSpotDetailResponse: The updated service spot data
    """
    logger.info(f"User {current_user['username']} is updating service spot {spot_id}")
    
    # Check if service spot exists
    db_spot = ServiceSpot.find_by_id(spot_id)
    if not db_spot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service spot not found"
        )
    
    # Update service spot data
    spot_data = {k: v for k, v in service_spot.dict().items() if v is not None}
    
    # Update in database
    success = ServiceSpot.update(spot_id, spot_data)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update service spot"
        )
    
    # Get the updated service spot
    updated_spot = ServiceSpot.find_by_id(spot_id)
    
    # Convert to response model
    spot_response = ServiceSpotResponse(
        id=updated_spot['id'],
        name=updated_spot['name'],
        capacity=updated_spot['capacity'],
        status=updated_spot['status'],
        is_active=updated_spot['is_active'],
        sales_area_id=updated_spot['sales_area_id'],
        created_at=updated_spot.get('created_at'),
        updated_at=updated_spot.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Service spot updated successfully",
        "data": spot_response
    }

@router.patch("/{spot_id}/status", response_model=ServiceSpotDetailResponse)
async def update_spot_status(
    status_update: ServiceSpotStatusUpdate,
    spot_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_dependiente)
):
    """
    Update a service spot's status.
    Accessible to all authenticated users.
    
    Args:
        spot_id: The ID of the service spot to update
        status_update: The status data to update
        
    Returns:
        ServiceSpotDetailResponse: The updated service spot data
    """
    logger.info(f"User {current_user['username']} is updating service spot {spot_id} status")
    
    # Check if service spot exists
    db_spot = ServiceSpot.find_by_id(spot_id)
    if not db_spot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service spot not found"
        )
    
    # Validate status value
    valid_statuses = ['libre', 'ocupado', 'reservado', 'pedido_abierto', 'cobrado']
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    # Update status
    success = ServiceSpot.update_status(spot_id, status_update.status)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update service spot status"
        )
    
    # Get the updated service spot
    updated_spot = ServiceSpot.find_by_id(spot_id)
    
    # Convert to response model
    spot_response = ServiceSpotResponse(
        id=updated_spot['id'],
        name=updated_spot['name'],
        capacity=updated_spot['capacity'],
        status=updated_spot['status'],
        is_active=updated_spot['is_active'],
        sales_area_id=updated_spot['sales_area_id'],
        created_at=updated_spot.get('created_at'),
        updated_at=updated_spot.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Service spot status updated successfully",
        "data": spot_response
    }

@router.delete("/{spot_id}", response_model=ServiceSpotDetailResponse)
async def delete_service_spot(
    spot_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_admin)
):
    """
    Delete a specific service spot.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        spot_id: The ID of the service spot to delete
        
    Returns:
        ServiceSpotDetailResponse: The deleted service spot data
    """
    logger.info(f"User {current_user['username']} is deleting service spot {spot_id}")
    
    # Get service spot before deletion
    db_spot = ServiceSpot.find_by_id(spot_id)
    if not db_spot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service spot not found"
        )
    
    # Delete the service spot
    success = ServiceSpot.delete(spot_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete service spot"
        )
    
    # Convert to response model
    spot_response = ServiceSpotResponse(
        id=db_spot['id'],
        name=db_spot['name'],
        capacity=db_spot['capacity'],
        status=db_spot['status'],
        is_active=db_spot['is_active'],
        sales_area_id=db_spot['sales_area_id'],
        created_at=db_spot.get('created_at'),
        updated_at=db_spot.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Service spot deleted successfully",
        "data": spot_response
    }

@router.post("/reset-all", response_model=dict)
async def reset_all_spots(
    current_user: dict = Depends(require_admin)
):
    """
    Reset all service spots to 'libre' status.
    Only accessible to Soporte and Administrador roles.
    Useful for starting a new day or after system maintenance.
    
    Returns:
        dict: Success message
    """
    logger.info(f"User {current_user['username']} is resetting all service spots")
    
    # Reset all service spots
    success = ServiceSpot.reset_all_statuses()
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset service spots"
        )
    
    return {
        "status": "success",
        "message": "All service spots reset to 'libre' status successfully"
    }

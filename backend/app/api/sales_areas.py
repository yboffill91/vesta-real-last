"""
Sales Areas router.
Provides endpoints for sales area management.
Only accessible to users with Soporte or Administrador roles.
"""
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from app.utils.auth_middleware import require_admin, require_dependiente
from app.schemas.sales_area import (
    SalesAreaCreate, SalesAreaUpdate, SalesAreaResponse, SalesAreasResponse,
    SalesAreaDetailResponse, SalesAreaWithSpotsResponse, SalesAreaWithSpotsDetailResponse
)
from app.models.sales_area import SalesArea

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/sales-areas",
    tags=["Sales Areas"],
    responses={
        403: {"description": "Forbidden - Not enough permissions"},
        401: {"description": "Unauthorized - Not authenticated"}
    },
)

from app.schemas.sales_area import SalesAreaWithSpotsResponse

@router.get("/", response_model=dict)
async def get_sales_areas(
    current_user: dict = Depends(require_dependiente),
    active_only: bool = True,
    establishment_id: Optional[int] = None
):
    """
    Get all sales areas.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        active_only: Whether to show only active sales areas
        establishment_id: Optional filter by establishment
        
    Returns:
        SalesAreasResponse: A list of sales areas
    """
    logger.info(f"User {current_user['username']} accessed sales areas list")
    
    # Get sales areas from database
    if active_only:
        db_areas = SalesArea.get_active_areas(establishment_id)
    else:
        where = {}
        if establishment_id:
            where["establishment_id"] = establishment_id
        db_areas = SalesArea.find_all(where=where, order_by="name ASC")
    
    # Obtener los service spots para cada área
    from app.models.service_spot import ServiceSpot
    area_ids = [area['id'] for area in db_areas]
    spots_by_area = {}
    for area in db_areas:
        spots = ServiceSpot.find_all(where={"sales_area_id": area["id"]}, order_by="name ASC")
        spots_by_area[area["id"]] = spots

    # Convert to response model, agregando service_spots
    # Serializa service_spots y datetimes a tipos nativos de Python
    def serialize_spot(spot):
        return {
            "id": spot["id"],
            "name": spot["name"],
            "capacity": spot.get("capacity"),
            "status": spot.get("status"),
            "is_active": bool(spot.get("is_active", True)),
            "created_at": spot.get("created_at").isoformat() if spot.get("created_at") else None,
            "updated_at": spot.get("updated_at").isoformat() if spot.get("updated_at") else None,
            "sales_area_id": spot.get("sales_area_id")
        }

    areas = [
        {
            "id": area['id'],
            "name": area['name'],
            "description": area['description'],
            "is_active": bool(area['is_active']),
            "establishment_id": area['establishment_id'],
            "created_at": area.get('created_at').isoformat() if area.get('created_at') else None,
            "updated_at": area.get('updated_at').isoformat() if area.get('updated_at') else None,
            "service_spots": [serialize_spot(spot) for spot in spots_by_area.get(area['id'], [])]
        }
        for area in db_areas
    ]

    import logging
    logging.warning(f"RESPONSE AREAS DEBUG: {areas}")
    return {
        "status": "success",
        "message": "Áreas de venta recuperadas correctamente",
        "data": areas
    }

@router.post("/", response_model=SalesAreaDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_sales_area(
    sales_area: SalesAreaCreate,
    current_user: dict = Depends(require_admin)
):
    """
    Create a new sales area.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        sales_area: Sales area data for creation
        
    Returns:
        SalesAreaDetailResponse: The created sales area data
    """
    logger.info(f"User {current_user['username']} is creating a new sales area")
    
    # Create sales area in database
    sales_area_data = sales_area.dict()
    new_area_id = SalesArea.create(sales_area_data)
    
    if not new_area_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo crear el área de venta"
        )
    
    # Get the created sales area
    created_area = SalesArea.find_by_id(new_area_id)
    
    # Convert to response model
    area_response = SalesAreaResponse(
        id=created_area['id'],
        name=created_area['name'],
        description=created_area['description'],
        is_active=created_area['is_active'],
        establishment_id=created_area['establishment_id'],
        created_at=created_area.get('created_at'),
        updated_at=created_area.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Área de venta creada correctamente",
        "data": area_response
    }

@router.get("/{area_id}", response_model=SalesAreaDetailResponse)
async def get_sales_area(
    area_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_admin)
):
    """
    Get a specific sales area by ID.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        area_id: The ID of the sales area to retrieve
        
    Returns:
        SalesAreaDetailResponse: The sales area data
    """
    logger.info(f"User {current_user['username']} is retrieving sales area {area_id}")
    
    # Get sales area from database
    db_area = SalesArea.find_by_id(area_id)
    
    if not db_area:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Área de venta no encontrada"
        )
    
    # Convert to response model
    area_response = SalesAreaResponse(
        id=db_area['id'],
        name=db_area['name'],
        description=db_area['description'],
        is_active=db_area['is_active'],
        establishment_id=db_area['establishment_id'],
        created_at=db_area.get('created_at'),
        updated_at=db_area.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Área de venta recuperada correctamente",
        "data": area_response
    }

@router.get("/{area_id}/spots", response_model=SalesAreaWithSpotsDetailResponse)
async def get_sales_area_with_spots(
    area_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_admin)
):
    """
    Get a specific sales area with its service spots.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        area_id: The ID of the sales area to retrieve
        
    Returns:
        SalesAreaWithSpotsDetailResponse: The sales area data with spots
    """
    logger.info(f"User {current_user['username']} is retrieving sales area {area_id} with spots")
    
    # Get sales area with spots from database
    db_area = SalesArea.get_with_service_spots(area_id)
    
    if not db_area:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Área de venta no encontrada"
        )
    
    # Convert to response model
    area_response = SalesAreaWithSpotsResponse(
        id=db_area['id'],
        name=db_area['name'],
        description=db_area['description'],
        is_active=db_area['is_active'],
        establishment_id=db_area['establishment_id'],
        service_spots=db_area.get('service_spots', []),
        created_at=db_area.get('created_at'),
        updated_at=db_area.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Área de venta con puntos de servicio recuperada correctamente",
        "data": area_response
    }

@router.put("/{area_id}", response_model=SalesAreaDetailResponse)
async def update_sales_area(
    sales_area: SalesAreaUpdate,
    area_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_admin)
):
    """
    Update a specific sales area.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        area_id: The ID of the sales area to update
        sales_area: The sales area data to update
        
    Returns:
        SalesAreaDetailResponse: The updated sales area data
    """
    logger.info(f"User {current_user['username']} is updating sales area {area_id}")
    
    # Check if sales area exists
    db_area = SalesArea.find_by_id(area_id)
    if not db_area:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Área de venta no encontrada"
        )
    
    # Update sales area data
    area_data = {k: v for k, v in sales_area.dict().items() if v is not None}
    
    # Update in database
    success = SalesArea.update(area_id, area_data)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo actualizar el área de venta"
        )
    
    # Get the updated sales area
    updated_area = SalesArea.find_by_id(area_id)
    
    # Convert to response model
    area_response = SalesAreaResponse(
        id=updated_area['id'],
        name=updated_area['name'],
        description=updated_area['description'],
        is_active=updated_area['is_active'],
        establishment_id=updated_area['establishment_id'],
        created_at=updated_area.get('created_at'),
        updated_at=updated_area.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Área de venta actualizada correctamente",
        "data": area_response
    }

@router.delete("/{area_id}", response_model=SalesAreaDetailResponse)
async def delete_sales_area(
    area_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_admin)
):
    """
    Delete a specific sales area.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        area_id: The ID of the sales area to delete
        
    Returns:
        SalesAreaDetailResponse: The deleted sales area data
    """
    logger.info(f"User {current_user['username']} is deleting sales area {area_id}")
    
    # Get sales area before deletion
    db_area = SalesArea.find_by_id(area_id)
    if not db_area:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Área de venta no encontrada"
        )
    
    # Delete the sales area
    success = SalesArea.delete(area_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo eliminar el área de venta"
        )
    
    # Convert to response model
    area_response = SalesAreaResponse(
        id=db_area['id'],
        name=db_area['name'],
        description=db_area['description'],
        is_active=db_area['is_active'],
        establishment_id=db_area['establishment_id'],
        created_at=db_area.get('created_at'),
        updated_at=db_area.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Área de venta eliminada correctamente",
        "data": area_response
    }

"""
Menus router.
Provides endpoints for menu management.
"""
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from app.utils.auth_middleware import require_admin, require_dependiente
from app.schemas.menu import (
    MenuCreate, MenuUpdate, MenuResponse, MenusResponse,
    MenuDetailResponse, MenuWithItemsResponse, MenuWithItemsDetailResponse
)
from app.models.menu import Menu
from app.models.menu_item import MenuItem

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/menus",
    tags=["Menus"],
    responses={
        403: {"description": "Forbidden - Not enough permissions"},
        401: {"description": "Unauthorized - Not authenticated"}
    },
)

@router.get("/", response_model=MenusResponse)
async def get_menus(
    current_user: dict = Depends(require_dependiente),
    active_only: bool = True,
    sales_area_id: Optional[int] = None
):
    """
    Get all menus with optional filtering.
    Accessible to all authenticated users.
    
    Args:
        active_only: Whether to show only active menus
        sales_area_id: Optional filter by sales area
        
    Returns:
        MenusResponse: A list of menus
    """
    logger.info(f"User {current_user['username']} accessed menus list")
    
    # Set up filters for query
    where = {}
    if active_only:
        where["is_active"] = True
        
    # Get menus from database
    if sales_area_id:
        # If sales_area_id is provided, get menus assigned to that area
        db_menus = Menu.get_by_sales_area(sales_area_id)
    else:
        # Otherwise, get all menus
        db_menus = Menu.find_all(where=where, order_by="name ASC")
    
    # Convert to response model
    menus = [
        MenuResponse(
            id=menu['id'],
            name=menu['name'],
            description=menu['description'],
            is_active=menu['is_active'],
            created_at=menu.get('created_at'),
            updated_at=menu.get('updated_at')
        ) for menu in db_menus
    ]
    
    return {
        "status": "success",
        "message": "Menus retrieved successfully",
        "data": menus
    }

@router.post("/", response_model=MenuDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_menu(
    menu: MenuCreate,
    current_user: dict = Depends(require_admin)
):
    """
    Create a new menu.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        menu: Menu data for creation
        
    Returns:
        MenuDetailResponse: The created menu data
    """
    logger.info(f"User {current_user['username']} is creating a new menu")
    
    # Create menu in database
    menu_data = menu.dict()
    
    # Extract sales_area_ids for the many-to-many relationship
    sales_area_ids = None
    if 'sales_area_ids' in menu_data:
        sales_area_ids = menu_data.pop('sales_area_ids')
    
    new_menu_id = Menu.create(menu_data)
    
    if not new_menu_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create menu"
        )
    
    # Add sales areas if provided
    if sales_area_ids:
        Menu.assign_to_sales_areas(new_menu_id, sales_area_ids)
    
    # Get the created menu
    created_menu = Menu.find_by_id(new_menu_id)
    
    # Convert to response model
    menu_response = MenuResponse(
        id=created_menu['id'],
        name=created_menu['name'],
        description=created_menu['description'],
        is_active=created_menu['is_active'],
        created_at=created_menu.get('created_at'),
        updated_at=created_menu.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Menu created successfully",
        "data": menu_response
    }

@router.get("/{menu_id}", response_model=MenuWithItemsDetailResponse)
async def get_menu(
    menu_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_dependiente)
):
    """
    Get a specific menu by ID with its items.
    Accessible to all authenticated users.
    
    Args:
        menu_id: The ID of the menu to retrieve
        
    Returns:
        MenuWithItemsDetailResponse: The menu data with items
    """
    logger.info(f"User {current_user['username']} is retrieving menu {menu_id}")
    
    # Get menu from database
    db_menu = Menu.find_by_id(menu_id)
    
    if not db_menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu not found"
        )
    
    # Get menu items
    menu_items = MenuItem.get_by_menu_id(menu_id)
    
    # Get sales areas
    sales_areas = Menu.get_assigned_sales_areas(menu_id)
    
    # Convert to response model
    menu_response = MenuWithItemsResponse(
        id=db_menu['id'],
        name=db_menu['name'],
        description=db_menu['description'],
        is_active=db_menu['is_active'],
        items=menu_items,
        sales_areas=sales_areas,
        created_at=db_menu.get('created_at'),
        updated_at=db_menu.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Menu retrieved successfully",
        "data": menu_response
    }

@router.put("/{menu_id}", response_model=MenuDetailResponse)
async def update_menu(
    menu: MenuUpdate,
    menu_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_admin)
):
    """
    Update a specific menu.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        menu_id: The ID of the menu to update
        menu: The menu data to update
        
    Returns:
        MenuDetailResponse: The updated menu data
    """
    logger.info(f"User {current_user['username']} is updating menu {menu_id}")
    
    # Check if menu exists
    db_menu = Menu.find_by_id(menu_id)
    if not db_menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu not found"
        )
    
    # Update menu data
    menu_data = {k: v for k, v in menu.dict().items() if v is not None and k != 'sales_area_ids'}
    
    # Update in database
    success = Menu.update(menu_id, menu_data)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update menu"
        )
    
    # Update sales areas if provided
    if menu.sales_area_ids is not None:
        Menu.update_sales_areas(menu_id, menu.sales_area_ids)
    
    # Get the updated menu
    updated_menu = Menu.find_by_id(menu_id)
    
    # Convert to response model
    menu_response = MenuResponse(
        id=updated_menu['id'],
        name=updated_menu['name'],
        description=updated_menu['description'],
        is_active=updated_menu['is_active'],
        created_at=updated_menu.get('created_at'),
        updated_at=updated_menu.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Menu updated successfully",
        "data": menu_response
    }

@router.delete("/{menu_id}", response_model=MenuDetailResponse)
async def delete_menu(
    menu_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_admin)
):
    """
    Delete a specific menu.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        menu_id: The ID of the menu to delete
        
    Returns:
        MenuDetailResponse: The deleted menu data
    """
    logger.info(f"User {current_user['username']} is deleting menu {menu_id}")
    
    # Get menu before deletion
    db_menu = Menu.find_by_id(menu_id)
    if not db_menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu not found"
        )
    
    # Delete the menu
    success = Menu.delete(menu_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete menu"
        )
    
    # Convert to response model
    menu_response = MenuResponse(
        id=db_menu['id'],
        name=db_menu['name'],
        description=db_menu['description'],
        is_active=db_menu['is_active'],
        created_at=db_menu.get('created_at'),
        updated_at=db_menu.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Menu deleted successfully",
        "data": menu_response
    }

@router.post("/{menu_id}/assign", response_model=dict)
async def assign_menu_to_sales_areas(
    menu_id: int = Path(..., gt=0),
    sales_area_ids: List[int] = Query(..., description="IDs of sales areas to assign this menu to"),
    current_user: dict = Depends(require_admin)
):
    """
    Assign a menu to one or more sales areas.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        menu_id: The ID of the menu to assign
        sales_area_ids: List of sales area IDs to assign the menu to
        
    Returns:
        dict: Success message
    """
    logger.info(f"User {current_user['username']} is assigning menu {menu_id} to sales areas")
    
    # Check if menu exists
    db_menu = Menu.find_by_id(menu_id)
    if not db_menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu not found"
        )
    
    # Assign menu to sales areas
    success = Menu.assign_to_sales_areas(menu_id, sales_area_ids)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to assign menu to sales areas"
        )
    
    return {
        "status": "success",
        "message": "Menu assigned to sales areas successfully"
    }

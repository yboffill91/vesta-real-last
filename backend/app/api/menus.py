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
    MenuDetailResponse, MenuWithItemsResponse, MenuWithItemsDetailResponse,
    MenuItemCreate, MenuItemResponse
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
        403: {"description": "Prohibido - Permisos insuficientes"},
        401: {"description": "No autorizado - No autenticado"}
    },
)

@router.get("/", response_model=MenusResponse)
async def get_menus(
    current_user: dict = Depends(require_dependiente),
    active_only: bool = False,
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
        where["status"] = Menu.STATUS_PUBLISHED
        
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
            status=menu.get('status', 'borrador'),
            valid_date=menu['valid_date'],
            created_at=menu.get('created_at'),
            updated_at=menu.get('updated_at')
        ) for menu in db_menus
    ]
    
    return {
        "status": "success",
        "message": "Menús obtenidos exitosamente",
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
            detail="No se pudo crear el menú"
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
        status=created_menu.get('status', 'borrador'),
        valid_date=created_menu['valid_date'],
        created_at=created_menu.get('created_at'),
        updated_at=created_menu.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Menú creado exitosamente",
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
    
    # Get basic menu information from database
    db_menu = Menu.get_basic_info(menu_id)
    
    if not db_menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu not found"
        )
    
    # Get menu items
    menu_items = MenuItem.get_by_menu_id(menu_id)
    
    # Debug log
    logger.info(f"Menu items retrieved for menu {menu_id}: {menu_items}")
    
    # Format menu items for response
    formatted_items = []
    for item in menu_items:
        formatted_items.append({
            "id": item["id"],
            "product_id": item["product_id"],
            "product_name": item["product_name"],
            "price": item["price"],
            "is_available": item["is_available"],
            "category_id": item.get("category_id", 0),  # Default value if not present
            "category_name": item.get("category_name", "")  # Default value if not present
        })
    
    # Get sales areas
    sales_areas = Menu.get_assigned_sales_areas(menu_id)
    
    # Convert to response model
    menu_response = MenuWithItemsResponse(
        id=db_menu['id'],
        name=db_menu['name'],
        status=db_menu.get('status', 'borrador'),
        valid_date=db_menu['valid_date'],
        items=formatted_items,
        areas=sales_areas,
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
    menu_data = {k: v for k, v in menu.dict().items() if v is not None}
    
    # Update in database
    success = Menu.update(menu_id, menu_data)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo actualizar el menú"
        )
    
    # Get the updated menu
    updated_menu = Menu.find_by_id(menu_id)
    
    # Convert to response model
    menu_response = MenuResponse(
        id=updated_menu['id'],
        name=updated_menu['name'],
        status=updated_menu.get('status', 'borrador'),
        valid_date=updated_menu['valid_date'],
        created_at=updated_menu.get('created_at'),
        updated_at=updated_menu.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Menú actualizado exitosamente",
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
            detail="No se pudo eliminar el menú"
        )
    
    # Convert to response model
    menu_response = MenuResponse(
        id=db_menu['id'],
        name=db_menu['name'],
        status=db_menu.get('status', 'borrador'),
        valid_date=db_menu['valid_date'],
        created_at=db_menu.get('created_at'),
        updated_at=db_menu.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Menú eliminado exitosamente",
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
            detail="No se pudo asignar el menú a las áreas de venta"
        )
    
    return {
        "status": "success",
        "message": "Menú asignado a las áreas de venta exitosamente"
    }

@router.patch("/{menu_id}/publish", response_model=MenuDetailResponse)
async def publish_menu(
    menu_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_admin)
):
    """
    Publish a menu (change its status to published).
    Only accessible to Soporte and Administrador roles.
    
    Args:
        menu_id: The ID of the menu to publish
        
    Returns:
        MenuDetailResponse: The published menu data
    """
    logger.info(f"User {current_user['username']} is publishing menu {menu_id}")
    
    # Check if menu exists
    db_menu = Menu.find_by_id(menu_id)
    if not db_menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu not found"
        )
    
    # Update status to published
    success = Menu.update(menu_id, {"status": Menu.STATUS_PUBLISHED})
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo publicar el menú"
        )
    
    # Get the updated menu
    updated_menu = Menu.find_by_id(menu_id)
    
    # Convert to response model
    menu_response = MenuResponse(
        id=updated_menu['id'],
        name=updated_menu['name'],
        status=updated_menu.get('status', Menu.STATUS_DRAFT),
        valid_date=updated_menu['valid_date'],
        created_at=updated_menu.get('created_at'),
        updated_at=updated_menu.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Menú publicado exitosamente",
        "data": menu_response
    }

@router.patch("/{menu_id}/archive", response_model=MenuDetailResponse)
async def archive_menu(
    menu_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_admin)
):
    """
    Archive a menu (change its status to archived).
    Only accessible to Soporte and Administrador roles.
    
    Args:
        menu_id: The ID of the menu to archive
        
    Returns:
        MenuDetailResponse: The archived menu data
    """
    logger.info(f"User {current_user['username']} is archiving menu {menu_id}")
    
    # Check if menu exists
    db_menu = Menu.find_by_id(menu_id)
    if not db_menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu not found"
        )
    
    # Update status to archived
    success = Menu.update(menu_id, {"status": Menu.STATUS_ARCHIVED})
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo archivar el menú"
        )
    
    # Get the updated menu
    updated_menu = Menu.find_by_id(menu_id)
    
    # Convert to response model
    menu_response = MenuResponse(
        id=updated_menu['id'],
        name=updated_menu['name'],
        status=updated_menu.get('status', Menu.STATUS_DRAFT),
        valid_date=updated_menu['valid_date'],
        created_at=updated_menu.get('created_at'),
        updated_at=updated_menu.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Menú archivado exitosamente",
        "data": menu_response
    }

@router.post("/{menu_id}/items", response_model=dict, status_code=status.HTTP_201_CREATED)
async def add_menu_item(
    menu_item: MenuItemCreate,
    menu_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_admin)
):
    """
    Add a product to a menu.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        menu_id: The ID of the menu to add the product to
        menu_item: Product data to add to the menu
        
    Returns:
        dict: Success message with the created menu item
    """
    logger.info(f"User {current_user['username']} is adding a product to menu {menu_id}")
    
    # Check if menu exists
    db_menu = Menu.find_by_id(menu_id)
    if not db_menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menú no encontrado"
        )
    
    # Extract data from request
    product_id = menu_item.product_id
    price = menu_item.price
    is_available = menu_item.is_available
    
    # Add the item to the menu
    success = Menu.add_item(menu_id, product_id, price, is_available)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo añadir el producto al menú"
        )
    
    # Get the created menu item with its database ID
    # We need to get the last inserted item for this menu and product
    created_item = MenuItem.find_all(
        where={"menu_id": menu_id, "product_id": product_id},
        order_by="id DESC",
        limit=1
    )
    
    if not created_item:
        # If we can't find the item (which shouldn't happen), return a structured response with basic information
        return {
            "status": "success",
            "message": "Producto añadido al menú exitosamente, pero no se pudo recuperar el detalle",
            "data": {
                "menu_id": menu_id,
                "product_id": product_id,
                "price": price,
                "is_available": is_available
            }
        }
    
    item_data = created_item[0]
    
    return {
        "status": "success",
        "message": "Producto añadido al menú exitosamente",
        "data": {
            "id": item_data['id'],
            "menu_id": item_data['menu_id'],
            "product_id": item_data['product_id'],
            "price": item_data['price'],
            "is_available": item_data['is_available'],
            "created_at": item_data.get('created_at'),
            "updated_at": item_data.get('updated_at')
        }
    }

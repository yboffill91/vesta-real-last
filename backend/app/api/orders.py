"""
Orders router.
Provides endpoints for managing orders (comandas).
Accessible to all authenticated users (Dependiente, Administrador, Soporte).
"""
import logging
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from app.utils.auth_middleware import require_dependiente, require_admin
from app.schemas.order import (
    OrderCreate, OrderUpdate, OrderResponse, OrdersResponse,
    OrderDetailResponse, OrderStatusUpdate
)
from app.schemas.order_item import (
    OrderItemCreate, OrderItemUpdate, OrderItemResponse
)
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.service_spot import ServiceSpot

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/orders",
    tags=["Orders"],
    responses={
        403: {"description": "Prohibido - Permisos insuficientes"},
        401: {"description": "No autorizado - No autenticado"}
    },
)

@router.get("/", response_model=OrdersResponse)
async def get_orders(
    current_user: dict = Depends(require_dependiente),
    status: Optional[str] = None,
    service_spot_id: Optional[int] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    page: int = Query(1, gt=0),
    limit: int = Query(20, gt=0)
):
    """
    Get all orders with optional filtering.
    Accessible to all authenticated users.
    
    Args:
        status: Optional filter by order status
        service_spot_id: Optional filter by service spot (table/seat)
        date_from: Optional start date filter (format: YYYY-MM-DD)
        date_to: Optional end date filter (format: YYYY-MM-DD)
        page: Page number for pagination
        limit: Number of items per page
        
    Returns:
        OrdersResponse: A list of orders with pagination info
    """
    logger.info(f"User {current_user['username']} accessed orders list")
    
    # Calculate offset for pagination
    offset = (page - 1) * limit
    
    # Set up filters
    where = {}
    if status:
        where["status"] = status
    if service_spot_id:
        where["service_spot_id"] = service_spot_id
    
    # Date filtering
    date_filter = {}
    if date_from:
        date_filter["from"] = date_from
    if date_to:
        date_filter["to"] = date_to
    
    # Get orders from database with pagination
    db_orders = Order.find_all(
        where=where, 
        date_filter=date_filter,
        order_by="created_at DESC",
        limit=limit,
        offset=offset
    )
    
    # Get total count for pagination
    total_count = Order.count(where=where, date_filter=date_filter)
    
    # Convert to response model
    orders = []
    for order in db_orders:
        # Get order items
        order_items = OrderItem.find_all(where={"order_id": order["id"]})
        
        orders.append(
            OrderResponse(
                id=order["id"],
                service_spot_id=order["service_spot_id"],
                status=order["status"],
                total_amount=order["total_amount"],
                tax_amount=order["tax_amount"],
                created_by=order["created_by"],
                items=order_items,
                created_at=order.get("created_at"),
                updated_at=order.get("updated_at"),
                closed_at=order.get("closed_at")
            )
        )
    
    # Calculate pagination info
    total_pages = (total_count + limit - 1) // limit  # Ceiling division
    
    return {
        "status": "success",
        "message": "Órdenes obtenidas exitosamente",
        "data": orders,
        "pagination": {
            "page": page,
            "limit": limit,
            "total_items": total_count,
            "total_pages": total_pages
        }
    }

@router.post("/", response_model=OrderDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order: OrderCreate,
    current_user: dict = Depends(require_dependiente)
):
    """
    Create a new order.
    Accessible to all authenticated users.
    
    Args:
        order: Order data for creation
        
    Returns:
        OrderDetailResponse: The created order data
    """
    logger.info(f"User {current_user['username']} is creating a new order")
    logger.info(f"current_user dict: {current_user}")
    
    # Check if service spot exists and is available
    spot = ServiceSpot.find_by_id(order.service_spot_id)
    if not spot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service spot not found"
        )
    
    # Prepare order data
    order_data = order.dict(exclude={"items"})
    
    # Add creator info
    order_data["created_by"] = current_user["user_id"]
    
    # Create order in database
    new_order_id = Order.create(order_data)
    
    if not new_order_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo crear la orden"
        )
    
    # Update service spot status
    ServiceSpot.update_status(order.service_spot_id, "pedido_abierto")
    
    # Get the created order with items
    created_order = Order.get_with_items(new_order_id)
    
    if not created_order:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Order created but failed to retrieve details"
        )
    
    import json
    from decimal import Decimal

    # Decodifica items si es string
    if created_order.get("items") and isinstance(created_order["items"], str):
        created_order["items"] = json.loads(created_order["items"])
    else:
        created_order["items"] = []

    # Convierte Decimal a float
    for k in ["total_amount", "tax_amount"]:
        if isinstance(created_order.get(k), Decimal):
            created_order[k] = float(created_order[k])

    # Convert to response model
    order_response = OrderResponse(
        id=created_order["id"],
        service_spot_id=created_order["service_spot_id"],
        sales_area_id=created_order["sales_area_id"],
        menu_id=created_order["menu_id"],
        status=created_order["status"],
        total_amount=created_order["total_amount"],
        tax_amount=created_order["tax_amount"],
        created_by=created_order["created_by"],
        items=created_order.get("items", []),
        created_at=created_order.get("created_at"),
        updated_at=created_order.get("updated_at"),
        closed_at=created_order.get("closed_at")
    )
    
    return {
        "status": "success",
        "message": "Orden creada exitosamente",
        "data": order_response
    }

@router.get("/{order_id}", response_model=OrderDetailResponse)
async def get_order(
    order_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_dependiente)
):
    """
    Get a specific order by ID.
    Accessible to all authenticated users.
    
    Args:
        order_id: The ID of the order to retrieve
        
    Returns:
        OrderDetailResponse: The order data with items
    """
    logger.info(f"User {current_user['username']} is retrieving order {order_id}")
    
    # Get order with items from database
    db_order = Order.get_with_items(order_id)
    
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Convert to response model
    order_response = OrderResponse(
        id=db_order["id"],
        service_spot_id=db_order["service_spot_id"],
        status=db_order["status"],
        total_amount=db_order["total_amount"],
        tax_amount=db_order["tax_amount"],
        created_by=db_order["created_by"],
        items=db_order.get("items", []),
        created_at=db_order.get("created_at"),
        updated_at=db_order.get("updated_at"),
        closed_at=db_order.get("closed_at")
    )
    
    return {
        "status": "success",
        "message": "Order retrieved successfully",
        "data": order_response
    }

@router.put("/{order_id}", response_model=OrderDetailResponse)
async def update_order(
    order: OrderUpdate,
    order_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_dependiente)
):
    """
    Update an existing order.
    Accessible to all authenticated users.
    
    Args:
        order_id: The ID of the order to update
        order: The order data to update
        
    Returns:
        OrderDetailResponse: The updated order data
    """
    logger.info(f"User {current_user['username']} is updating order {order_id}")
    
    # Check if order exists
    db_order = Order.find_by_id(order_id)
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Only allow updates to non-closed orders
    if db_order["status"] == "cobrada":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update a closed order"
        )
    
    # Update order data
    order_data = {k: v for k, v in order.dict(exclude={"items"}).items() if v is not None}
    
    # Update in database
    success = Order.update(order_id, order_data)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo actualizar la orden"
        )
    
    # Handle items updates if provided
    if order.items is not None:
        # Remove existing items
        OrderItem.delete_by_order_id(order_id)
        
        # Add new items
        for item in order.items:
            item_data = item.dict()
            item_data["order_id"] = order_id
            OrderItem.create(item_data)
    
    # Update order total
    Order.update_total(order_id)
    
    # Get the updated order with items
    updated_order = Order.get_with_items(order_id)
    
    # Convert to response model
    order_response = OrderResponse(
        id=updated_order["id"],
        service_spot_id=updated_order["service_spot_id"],
        status=updated_order["status"],
        total_amount=updated_order["total_amount"],
        tax_amount=updated_order["tax_amount"],
        created_by=updated_order["created_by"],
        items=updated_order.get("items", []),
        created_at=updated_order.get("created_at"),
        updated_at=updated_order.get("updated_at"),
        closed_at=updated_order.get("closed_at")
    )
    
    return {
        "status": "success",
        "message": "Orden actualizada exitosamente",
        "data": order_response
    }

@router.patch("/{order_id}/status", response_model=OrderDetailResponse)
async def update_order_status(
    status_update: OrderStatusUpdate,
    order_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_dependiente)
):
    """
    Update an order's status.
    Accessible to all authenticated users.
    
    Args:
        order_id: The ID of the order to update
        status_update: The status data to update
        
    Returns:
        OrderDetailResponse: The updated order data
    """
    logger.info(f"User {current_user['username']} is updating order {order_id} status to {status_update.status}")
    
    # Check if order exists
    db_order = Order.find_by_id(order_id)
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Validate status value
    valid_statuses = ['abierta', 'en_preparación', 'servida', 'cobrada', 'cancelada']
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    # Update status
    update_data = {"status": status_update.status}
    
    # If closing the order, set closed_at timestamp
    if status_update.status == "cobrada":
        update_data["closed_at"] = datetime.now()
    
    success = Order.update(order_id, update_data)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update order status"
        )
    
    # Update service spot status based on order status
    if status_update.status == "cobrada":
        # Run the stored procedure to update the spot status
        try:
            Order.execute_custom_query(
                "CALL update_spot_status(%s)",
                (db_order["service_spot_id"],)
            )
        except Exception as e:
            logger.error(f"Error updating spot status: {e}")
    
    # Get the updated order with items
    updated_order = Order.get_with_items(order_id)
    
    # Convert to response model
    order_response = OrderResponse(
        id=updated_order["id"],
        service_spot_id=updated_order["service_spot_id"],
        status=updated_order["status"],
        total_amount=updated_order["total_amount"],
        tax_amount=updated_order["tax_amount"],
        created_by=updated_order["created_by"],
        items=updated_order.get("items", []),
        created_at=updated_order.get("created_at"),
        updated_at=updated_order.get("updated_at"),
        closed_at=updated_order.get("closed_at")
    )
    
    return {
        "status": "success",
        "message": f"Order status updated to {status_update.status} successfully",
        "data": order_response
    }

@router.delete("/{order_id}", response_model=OrderDetailResponse)
async def delete_order(
    order_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_admin)
):
    """
    Delete a specific order.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        order_id: The ID of the order to delete
        
    Returns:
        OrderDetailResponse: The deleted order data
    """
    logger.info(f"User {current_user['username']} is deleting order {order_id}")
    
    # Get order before deletion
    db_order = Order.get_with_items(order_id)
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Delete the order items first
    OrderItem.delete_by_order_id(order_id)
    
    # Delete the order
    success = Order.delete(order_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo eliminar la orden"
        )
    
    # Update service spot status
    try:
        Order.execute_custom_query(
            "CALL update_spot_status(%s)",
            (db_order["service_spot_id"],)
        )
    except Exception as e:
        logger.error(f"Error updating spot status: {e}")
    
    # Convert to response model
    order_response = OrderResponse(
        id=db_order["id"],
        service_spot_id=db_order["service_spot_id"],
        status=db_order["status"],
        total_amount=db_order["total_amount"],
        tax_amount=db_order["tax_amount"],
        created_by=db_order["created_by"],
        items=db_order.get("items", []),
        created_at=db_order.get("created_at"),
        updated_at=db_order.get("updated_at"),
        closed_at=db_order.get("closed_at")
    )
    
    return {
        "status": "success",
        "message": "Orden eliminada exitosamente",
        "data": order_response
    }

@router.post("/{order_id}/items", response_model=OrderDetailResponse)
async def add_order_item(
    item: OrderItemCreate,
    order_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_dependiente)
):
    """
    Add a new item to an existing order.
    Accessible to all authenticated users.
    
    Args:
        order_id: The ID of the order to add an item to
        item: The order item data to add
        
    Returns:
        OrderDetailResponse: The updated order data with the new item
    """
    logger.info(f"User {current_user['username']} is adding an item to order {order_id}")
    
    # Check if order exists
    db_order = Order.find_by_id(order_id)
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Only allow updates to non-closed orders
    if db_order["status"] == "cobrada":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify a closed order"
        )
    
    # Log the payload recibido
    logger.info(f"Payload recibido en add_order_item: {item}")
    # Create the order item
    item_data = item.dict()
    item_data["order_id"] = order_id
    new_item_id = OrderItem.create(item_data)
    
    if not new_item_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo añadir el ítem a la orden"
        )
    
    # Update order total
    Order.update_total(order_id)
    
    # Get the updated order with all items
    updated_order = Order.get_with_items(order_id)
    
    # Convert to response model
    order_response = OrderResponse(
        id=updated_order["id"],
        service_spot_id=updated_order["service_spot_id"],
        status=updated_order["status"],
        total_amount=updated_order["total_amount"],
        tax_amount=updated_order["tax_amount"],
        created_by=updated_order["created_by"],
        items=updated_order.get("items", []),
        created_at=updated_order.get("created_at"),
        updated_at=updated_order.get("updated_at"),
        closed_at=updated_order.get("closed_at")
    )
    
    return {
        "status": "success",
        "message": "Ítem añadido exitosamente a la orden",
        "data": order_response
    }

@router.delete("/{order_id}/items/{item_id}", response_model=OrderDetailResponse)
async def delete_order_item(
    order_id: int = Path(..., gt=0),
    item_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_dependiente)
):
    """
    Delete an item from an order.
    Accessible to all authenticated users.
    
    Args:
        order_id: The ID of the order
        item_id: The ID of the item to delete
        
    Returns:
        OrderDetailResponse: The updated order data
    """
    logger.info(f"User {current_user['username']} is deleting item {item_id} from order {order_id}")
    
    # Check if order exists
    db_order = Order.find_by_id(order_id)
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Only allow updates to non-closed orders
    if db_order["status"] == "cobrada":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify a closed order"
        )
    
    # Check if item exists for this order
    db_item = OrderItem.find_one({"id": item_id, "order_id": order_id})
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ítem de la orden no encontrado"
        )
    
    # Delete the item
    success = OrderItem.delete(item_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo eliminar el ítem de la orden"
        )
    
    # Update order total
    Order.update_total(order_id)
    
    # Get the updated order with remaining items
    updated_order = Order.get_with_items(order_id)
    
    # Convert to response model
    order_response = OrderResponse(
        id=updated_order["id"],
        service_spot_id=updated_order["service_spot_id"],
        status=updated_order["status"],
        total_amount=updated_order["total_amount"],
        tax_amount=updated_order["tax_amount"],
        created_by=updated_order["created_by"],
        items=updated_order.get("items", []),
        created_at=updated_order.get("created_at"),
        updated_at=updated_order.get("updated_at"),
        closed_at=updated_order.get("closed_at")
    )
    
    return {
        "status": "success",
        "message": "Ítem eliminado exitosamente de la orden",
        "data": order_response
    }

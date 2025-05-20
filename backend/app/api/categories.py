"""
Categories router.
Provides endpoints for product category management.
Only accessible to users with Soporte or Administrador roles.
"""
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from app.utils.auth_middleware import require_admin
from app.schemas.product_category import (
    ProductCategoryCreate, ProductCategoryUpdate, ProductCategoryResponse,
    ProductCategoriesResponse, ProductCategoryDetailResponse,
    ProductCategoryWithProductsResponse, ProductCategoryWithProductsDetailResponse
)
from app.models.product_category import ProductCategory

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/categories",
    tags=["Categories"],
    responses={
        403: {"description": "Prohibido - Permisos insuficientes"},
        401: {"description": "No autorizado - No autenticado"}
    },
)

@router.get("/", response_model=ProductCategoriesResponse)
async def get_categories(
    current_user: dict = Depends(require_admin),
    active_only: bool = True
):
    """
    Get all product categories.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        active_only: Whether to show only active categories
        
    Returns:
        ProductCategoriesResponse: A list of product categories
    """
    logger.info(f"User {current_user['username']} accessed product categories")
    
    # Get categories from database
    if active_only:
        db_categories = ProductCategory.get_active()
    else:
        db_categories = ProductCategory.find_all(order_by="name ASC")
    
    # Convert to response model
    categories = [
        ProductCategoryResponse(
            id=category['id'],
            name=category['name'],
            description=category['description'],
            is_active=category['is_active'],
            created_at=category.get('created_at'),
            updated_at=category.get('updated_at')
        ) for category in db_categories
    ]
    
    return {
        "status": "success",
        "message": "Categorías obtenidas exitosamente",
        "data": categories
    }

@router.post("/", response_model=ProductCategoryDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category: ProductCategoryCreate,
    current_user: dict = Depends(require_admin)
):
    """
    Create a new product category.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        category: Category data for creation
        
    Returns:
        ProductCategoryDetailResponse: The created category data
    """
    logger.info(f"User {current_user['username']} is creating a new category")
    
    # Create category in database
    category_data = category.dict()
    new_category_id = ProductCategory.create(category_data)
    
    if not new_category_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo crear la categoría"
        )
    
    # Get the created category
    created_category = ProductCategory.find_by_id(new_category_id)
    
    # Convert to response model
    category_response = ProductCategoryResponse(
        id=created_category['id'],
        name=created_category['name'],
        description=created_category['description'],
        is_active=created_category['is_active'],
        created_at=created_category.get('created_at'),
        updated_at=created_category.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Categoría creada exitosamente",
        "data": category_response
    }

@router.get("/{category_id}", response_model=ProductCategoryDetailResponse)
async def get_category(
    category_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_admin)
):
    """
    Get a specific product category by ID.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        category_id: The ID of the category to retrieve
        
    Returns:
        ProductCategoryDetailResponse: The category data
    """
    logger.info(f"User {current_user['username']} is retrieving category {category_id}")
    
    # Get category from database
    db_category = ProductCategory.find_by_id(category_id)
    
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Convert to response model
    category_response = ProductCategoryResponse(
        id=db_category['id'],
        name=db_category['name'],
        description=db_category['description'],
        is_active=db_category['is_active'],
        created_at=db_category.get('created_at'),
        updated_at=db_category.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Category retrieved successfully",
        "data": category_response
    }

@router.get("/{category_id}/products", response_model=ProductCategoryWithProductsDetailResponse)
async def get_category_with_products(
    category_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_admin)
):
    """
    Get a specific product category with its products.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        category_id: The ID of the category to retrieve
        
    Returns:
        ProductCategoryWithProductsDetailResponse: The category data with products
    """
    logger.info(f"User {current_user['username']} is retrieving category {category_id} with products")
    
    # Get category with products from database
    db_category = ProductCategory.get_with_products(category_id)
    
    if not db_category or not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Convert to response model
    category_response = ProductCategoryWithProductsResponse(
        id=db_category[0]['id'],
        name=db_category[0]['name'],
        description=db_category[0]['description'],
        is_active=db_category[0]['is_active'],
        products=db_category[0].get('products', []),
        created_at=db_category[0].get('created_at'),
        updated_at=db_category[0].get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Categoría con productos obtenida exitosamente",
        "data": category_response
    }

@router.put("/{category_id}", response_model=ProductCategoryDetailResponse)
async def update_category(
    category: ProductCategoryUpdate,
    category_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_admin)
):
    """
    Update a specific product category.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        category_id: The ID of the category to update
        category: The category data to update
        
    Returns:
        ProductCategoryDetailResponse: The updated category data
    """
    logger.info(f"User {current_user['username']} is updating category {category_id}")
    
    # Check if category exists
    db_category = ProductCategory.find_by_id(category_id)
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Update category data
    category_data = {k: v for k, v in category.dict().items() if v is not None}
    
    # Update in database
    success = ProductCategory.update(category_id, category_data)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo actualizar la categoría"
        )
    
    # Get the updated category
    updated_category = ProductCategory.find_by_id(category_id)
    
    # Convert to response model
    category_response = ProductCategoryResponse(
        id=updated_category['id'],
        name=updated_category['name'],
        description=updated_category['description'],
        is_active=updated_category['is_active'],
        created_at=updated_category.get('created_at'),
        updated_at=updated_category.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Categoría actualizada exitosamente",
        "data": category_response
    }

@router.delete("/{category_id}", response_model=ProductCategoryDetailResponse)
async def delete_category(
    category_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_admin)
):
    """
    Delete a specific product category.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        category_id: The ID of the category to delete
        
    Returns:
        ProductCategoryDetailResponse: The deleted category data
    """
    logger.info(f"User {current_user['username']} is deleting category {category_id}")
    
    # Get category before deletion
    db_category = ProductCategory.find_by_id(category_id)
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Delete the category
    success = ProductCategory.delete(category_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo eliminar la categoría"
        )
    
    # Convert to response model
    category_response = ProductCategoryResponse(
        id=db_category['id'],
        name=db_category['name'],
        description=db_category['description'],
        is_active=db_category['is_active'],
        created_at=db_category.get('created_at'),
        updated_at=db_category.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Categoría eliminada exitosamente",
        "data": category_response
    }

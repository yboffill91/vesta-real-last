"""
Products router.
Provides endpoints for product management.
Only accessible to users with Soporte or Administrador roles.
"""
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status, File, UploadFile, Form
from app.utils.auth_middleware import require_admin, get_current_user
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductResponse, ProductsResponse,
    ProductDetailResponse, ProductWithCategoryResponse, ProductWithCategoryDetailResponse,
    ProductAvailabilityUpdate, ProductSearchResponse
)
from app.models.product import Product
from app.models.product_category import ProductCategory

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/products",
    tags=["Products"],
    responses={
        403: {"description": "Forbidden - Not enough permissions"},
        401: {"description": "Unauthorized - Not authenticated"}
    },
)

@router.get("/", response_model=ProductsResponse)
async def get_products(
    current_user: dict = Depends(require_admin),
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    available_only: bool = False
):
    """
    Get all products with optional filtering.
    Only accessible to Soporte and Administrador roles.

    Args:
        skip: Number of records to skip for pagination
        limit: Maximum number of records to return
        category_id: Optional filter by category
        available_only: Whether to show only available products

    Returns:
        ProductsResponse: A list of products
    """
    logger.info(f"User {current_user['username']} accessed products list")

    # Set up filters
    where = {}
    if category_id:
        where["category_id"] = category_id
    if available_only:
        where["is_available"] = True

    # Get products from database
    db_products = Product.find_all(
        where=where,
        order_by="name ASC",
        limit=limit,
        offset=skip
    )

    # Convert to response model
    products = [
        ProductResponse(
            id=product['id'],
            name=product['name'],
            description=product['description'],
            price=product['price'],
            image=product['image'],
            is_available=product['is_available'],
            category_id=product['category_id'],
            created_by=product.get('created_by'),
            created_at=product.get('created_at'),
            updated_at=product.get('updated_at')
        ) for product in db_products
    ]

    return {
        "status": "success",
        "message": "Products retrieved successfully",
        "data": products
    }

@router.post("/", response_model=ProductDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product: ProductCreate,
    current_user: dict = Depends(require_admin)
):
    """
    Create a new product.
    Only accessible to Soporte and Administrador roles.

    Args:
        product: Product data for creation

    Returns:
        ProductDetailResponse: The created product data
    """
    logger.info(f"User {current_user['username']} is creating a new product")

    # Check if category exists
    category = ProductCategory.find_by_id(product.category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category not found"
        )

    # Add current user as creator
    product_data = product.dict()
    product_data['created_by'] = current_user.get('id')

    # Create product in database
    new_product_id = Product.create(product_data)

    if not new_product_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create product"
        )

    # Get the created product
    created_product = Product.find_by_id(new_product_id)

    # Convert to response model
    product_response = ProductResponse(
        id=created_product['id'],
        name=created_product['name'],
        description=created_product['description'],
        price=created_product['price'],
        image=created_product['image'],
        is_available=created_product['is_available'],
        category_id=created_product['category_id'],
        created_by=created_product.get('created_by'),
        created_at=created_product.get('created_at'),
        updated_at=created_product.get('updated_at')
    )

    return {
        "status": "success",
        "message": "Product created successfully",
        "data": product_response
    }

@router.get("/{product_id}", response_model=ProductWithCategoryDetailResponse)
async def get_product(
    product_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_admin)
):
    """
    Get a specific product by ID with category information.
    Only accessible to Soporte and Administrador roles.

    Args:
        product_id: The ID of the product to retrieve

    Returns:
        ProductWithCategoryDetailResponse: The product data with category info
    """
    logger.info(f"User {current_user['username']} is retrieving product {product_id}")

    # Get product from database with category info
    db_product = Product.get_with_category(product_id)

    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Convert to response model
    product_response = ProductWithCategoryResponse(
        id=db_product['id'],
        name=db_product['name'],
        description=db_product['description'],
        price=db_product['price'],
        image=db_product['image'],
        is_available=db_product['is_available'],
        category_id=db_product['category_id'],
        category_name=db_product['category_name'],
        created_by=db_product.get('created_by'),
        created_at=db_product.get('created_at'),
        updated_at=db_product.get('updated_at')
    )

    return {
        "status": "success",
        "message": "Product retrieved successfully",
        "data": product_response
    }

@router.put("/{product_id}", response_model=ProductDetailResponse)
async def update_product(
    product: ProductUpdate,
    product_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_admin)
):
    """
    Update a specific product.
    Only accessible to Soporte and Administrador roles.

    Args:
        product_id: The ID of the product to update
        product: The product data to update

    Returns:
        ProductDetailResponse: The updated product data
    """
    logger.info(f"User {current_user['username']} is updating product {product_id}")

    # Check if product exists
    db_product = Product.find_by_id(product_id)
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Check if category exists if changing category
    if product.category_id is not None:
        category = ProductCategory.find_by_id(product.category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category not found"
            )

    # Update product data
    product_data = {k: v for k, v in product.dict().items() if v is not None}

    # Update in database
    success = Product.update(product_id, product_data)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update product"
        )

    # Get the updated product
    updated_product = Product.find_by_id(product_id)

    # Convert to response model
    product_response = ProductResponse(
        id=updated_product['id'],
        name=updated_product['name'],
        description=updated_product['description'],
        price=updated_product['price'],
        image=updated_product['image'],
        is_available=updated_product['is_available'],
        category_id=updated_product['category_id'],
        created_by=updated_product.get('created_by'),
        created_at=updated_product.get('created_at'),
        updated_at=updated_product.get('updated_at')
    )

    return {
        "status": "success",
        "message": "Product updated successfully",
        "data": product_response
    }

@router.patch("/{product_id}/availability", response_model=ProductDetailResponse)
async def update_product_availability(
    availability: ProductAvailabilityUpdate,
    product_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_admin)
):
    """
    Update a product's availability status.
    Only accessible to Soporte and Administrador roles.

    Args:
        product_id: The ID of the product to update
        availability: The availability data to update

    Returns:
        ProductDetailResponse: The updated product data
    """
    logger.info(f"User {current_user['username']} is updating product {product_id} availability")

    # Check if product exists
    db_product = Product.find_by_id(product_id)
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Update availability
    success = Product.update_availability(product_id, availability.is_available)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update product availability"
        )

    # Get the updated product
    updated_product = Product.find_by_id(product_id)

    # Convert to response model
    product_response = ProductResponse(
        id=updated_product['id'],
        name=updated_product['name'],
        description=updated_product['description'],
        price=updated_product['price'],
        image=updated_product['image'],
        is_available=updated_product['is_available'],
        category_id=updated_product['category_id'],
        created_by=updated_product.get('created_by'),
        created_at=updated_product.get('created_at'),
        updated_at=updated_product.get('updated_at')
    )

    return {
        "status": "success",
        "message": "Product availability updated successfully",
        "data": product_response
    }

@router.delete("/{product_id}", response_model=ProductDetailResponse)
async def delete_product(
    product_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_admin)
):
    """
    Delete a specific product.
    Only accessible to Soporte and Administrador roles.

    Args:
        product_id: The ID of the product to delete

    Returns:
        ProductDetailResponse: The deleted product data
    """
    logger.info(f"User {current_user['username']} is deleting product {product_id}")

    # Get product before deletion
    db_product = Product.find_by_id(product_id)
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Delete the product
    success = Product.delete(product_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete product"
        )

    # Convert to response model
    product_response = ProductResponse(
        id=db_product['id'],
        name=db_product['name'],
        description=db_product['description'],
        price=db_product['price'],
        image=db_product['image'],
        is_available=db_product['is_available'],
        category_id=db_product['category_id'],
        created_by=db_product.get('created_by'),
        created_at=db_product.get('created_at'),
        updated_at=db_product.get('updated_at')
    )

    return {
        "status": "success",
        "message": "Product deleted successfully",
        "data": product_response
    }

@router.get("/search/{query}", response_model=ProductSearchResponse)
async def search_products(
    query: str,
    current_user: dict = Depends(require_admin),
    available_only: bool = True
):
    """
    Search products by name or description.
    Only accessible to Soporte and Administrador roles.

    Args:
        query: The search term
        available_only: Whether to show only available products

    Returns:
        ProductSearchResponse: The search results
    """
    logger.info(f"User {current_user['username']} is searching products with query: {query}")

    # Search products
    db_products = Product.search(query, only_available=available_only)

    # Convert to response model
    products = [
        ProductWithCategoryResponse(
            id=product['id'],
            name=product['name'],
            description=product['description'],
            price=product['price'],
            image=product['image'],
            is_available=product['is_available'],
            category_id=product['category_id'],
            category_name=product['category_name'],
            created_by=product.get('created_by'),
            created_at=product.get('created_at'),
            updated_at=product.get('updated_at')
        ) for product in db_products
    ]

    return {
        "status": "success",
        "message": f"Found {len(products)} products matching '{query}'",
        "data": products,
        "query": query
    }

# Endpoint for product categories
@router.get("/categories/", response_model=ProductsResponse)
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
        dict: A list of product categories
    """
    logger.info(f"User {current_user['username']} accessed product categories")

    # Get categories from database
    if active_only:
        db_categories = ProductCategory.get_active()
    else:
        db_categories = ProductCategory.find_all(order_by="name ASC")

    # Return categories (reusing ProductsResponse model)
    return {
        "status": "success",
        "message": "Categories retrieved successfully",
        "data": db_categories
    }

from fastapi import APIRouter, Depends
from app.models.product_category import ProductCategory
from app.schemas.product_category import ProductCategoryWithProductsResponse
from typing import List

router = APIRouter(prefix="/api/v1/products-grouped", tags=["products-grouped"])

@router.get("/", response_model=List[ProductCategoryWithProductsResponse])
def get_categories_with_products():
    """
    Get all active product categories with their available products grouped.
    """
    categories_with_products = ProductCategory.get_with_products()
    # El resultado ya está agrupado y estructurado desde el modelo, pero puede requerir ajuste de claves para el esquema
    # Ajustamos el formato para el esquema de respuesta
    result = []
    for cat in categories_with_products:
        products = cat.get("products", [])
        if products and isinstance(products, str):
            import json
            products = json.loads(products)
            # Filtrar productos nulos (id None)
            products = [p for p in products if p.get("id") is not None]
        result.append({
            "id": cat["id"],
            "name": cat["name"],
            "description": cat.get("description"),
            "is_active": cat.get("is_active", True),
            "created_at": cat.get("created_at"),
            "updated_at": cat.get("updated_at"),
            "products": products or []
        })
    return result

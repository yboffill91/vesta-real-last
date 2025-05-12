"""
ProductCategory schemas for API request and response validation
"""
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.base import IDModel, TimeStampMixin, ResponseBase

class ProductCategoryBase(BaseModel):
    """Base schema for product category data"""
    name: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = None
    is_active: Optional[bool] = True
    
class ProductCategoryCreate(ProductCategoryBase):
    """Schema for product category creation"""
    pass
    
class ProductCategoryUpdate(BaseModel):
    """Schema for product category update"""
    name: Optional[str] = Field(None, min_length=2, max_length=50)
    description: Optional[str] = None
    is_active: Optional[bool] = None
    
class ProductCategoryResponse(ProductCategoryBase, IDModel, TimeStampMixin):
    """Schema for product category response"""
    
    class Config:
        orm_mode = True
        
class ProductCategoriesResponse(ResponseBase):
    """Schema for multiple product categories response"""
    data: List[ProductCategoryResponse]
    
class ProductCategoryDetailResponse(ResponseBase):
    """Schema for single product category response"""
    data: ProductCategoryResponse
    
# Schema with nested product information
class ProductInCategory(BaseModel):
    """Schema for product within category response"""
    id: int
    name: str
    description: Optional[str] = None
    price: float
    image: Optional[str] = None
    is_available: bool
    
class ProductCategoryWithProductsResponse(ProductCategoryResponse):
    """Schema for product category with nested products"""
    products: List[ProductInCategory]
    
class ProductCategoryWithProductsDetailResponse(ResponseBase):
    """Schema for single category with products response"""
    data: ProductCategoryWithProductsResponse

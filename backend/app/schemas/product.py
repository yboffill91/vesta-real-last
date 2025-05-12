"""
Product schemas for API request and response validation
"""
from typing import Optional, List
from pydantic import BaseModel, Field, validator
from app.schemas.base import IDModel, TimeStampMixin, ResponseBase

class ProductBase(BaseModel):
    """Base schema for product data"""
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    image: Optional[str] = None
    is_available: Optional[bool] = True
    category_id: int
    
class ProductCreate(ProductBase):
    """Schema for product creation"""
    created_by: Optional[int] = None
    
class ProductUpdate(BaseModel):
    """Schema for product update"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    image: Optional[str] = None
    is_available: Optional[bool] = None
    category_id: Optional[int] = None
    
class ProductAvailabilityUpdate(BaseModel):
    """Schema for product availability update"""
    is_available: bool
    
class ProductResponse(ProductBase, IDModel, TimeStampMixin):
    """Schema for product response"""
    created_by: Optional[int] = None
    
    class Config:
        orm_mode = True
        
class ProductsResponse(ResponseBase):
    """Schema for multiple products response"""
    data: List[ProductResponse]
    
class ProductDetailResponse(ResponseBase):
    """Schema for single product response"""
    data: ProductResponse
    
# Schema for product with category information
class ProductWithCategoryResponse(ProductResponse):
    """Schema for product with category information"""
    category_name: str
    
class ProductWithCategoryDetailResponse(ResponseBase):
    """Schema for single product with category response"""
    data: ProductWithCategoryResponse
    
# Schema for product search results
class ProductSearchResponse(ResponseBase):
    """Schema for product search response"""
    data: List[ProductWithCategoryResponse]
    query: str

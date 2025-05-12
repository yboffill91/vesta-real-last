"""
Menu schemas for API request and response validation
"""
from typing import Optional, List, Dict, Any
from datetime import date
from pydantic import BaseModel, Field
from app.schemas.base import IDModel, TimeStampMixin, ResponseBase

class MenuBase(BaseModel):
    """Base schema for menu data"""
    name: str = Field(..., min_length=2, max_length=100)
    valid_date: date
    status: Optional[str] = "borrador"
    
class MenuCreate(MenuBase):
    """Schema for menu creation"""
    created_by: Optional[int] = None
    
class MenuUpdate(BaseModel):
    """Schema for menu update"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    valid_date: Optional[date] = None
    status: Optional[str] = None
    
class MenuStatusUpdate(BaseModel):
    """Schema for menu status update"""
    status: str = Field(..., description="Menu status: borrador, publicada, archivada")
    
class MenuResponse(MenuBase, IDModel, TimeStampMixin):
    """Schema for menu response"""
    created_by: Optional[int] = None
    
    class Config:
        orm_mode = True
        
class MenusResponse(ResponseBase):
    """Schema for multiple menus response"""
    data: List[MenuResponse]
    
class MenuDetailResponse(ResponseBase):
    """Schema for single menu response"""
    data: MenuResponse
    
# Schemas for menu items
class MenuItemBase(BaseModel):
    """Base schema for menu item data"""
    menu_id: int
    product_id: int
    price: float = Field(..., gt=0)
    is_available: Optional[bool] = True
    
class MenuItemCreate(MenuItemBase):
    """Schema for menu item creation"""
    pass
    
class MenuItemUpdate(BaseModel):
    """Schema for menu item update"""
    price: Optional[float] = Field(None, gt=0)
    is_available: Optional[bool] = None
    
class MenuItemResponse(MenuItemBase, IDModel, TimeStampMixin):
    """Schema for menu item response"""
    
    class Config:
        orm_mode = True
        
# Schema for menu with items
class MenuItemDetail(BaseModel):
    """Schema for menu item within menu response"""
    id: int
    product_id: int
    product_name: str
    price: float
    is_available: bool
    category_id: int
    category_name: str
    
class MenuWithItemsResponse(MenuResponse):
    """Schema for menu with nested items"""
    items: List[MenuItemDetail]
    
class MenuWithItemsDetailResponse(ResponseBase):
    """Schema for single menu with items response"""
    data: MenuWithItemsResponse
    
# Schema for menu-sales area assignment
class MenuSalesAreaBase(BaseModel):
    """Base schema for menu-sales area assignment"""
    menu_id: int
    sales_area_id: int
    
class MenuSalesAreaCreate(MenuSalesAreaBase):
    """Schema for menu-sales area assignment creation"""
    pass
    
class SalesAreaForMenu(BaseModel):
    """Schema for sales area within menu response"""
    id: int
    name: str
    
class MenuWithAreasResponse(MenuResponse):
    """Schema for menu with assigned sales areas"""
    areas: List[SalesAreaForMenu]
    
class MenuWithAreasDetailResponse(ResponseBase):
    """Schema for single menu with areas response"""
    data: MenuWithAreasResponse

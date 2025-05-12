"""
Order schemas for API request and response validation
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.base import IDModel, TimeStampMixin, ResponseBase

class OrderBase(BaseModel):
    """Base schema for order data"""
    service_spot_id: int
    sales_area_id: int
    menu_id: int
    status: Optional[str] = "abierta"
    
class OrderCreate(OrderBase):
    """Schema for order creation"""
    created_by: int
    
class OrderUpdate(BaseModel):
    """Schema for order update"""
    status: Optional[str] = None
    
class OrderStatusUpdate(BaseModel):
    """Schema for order status update"""
    status: str = Field(..., description="Order status: abierta, en_preparación, servida, cobrada, cancelada")
    closed_by: Optional[int] = None
    
class OrderResponse(OrderBase, IDModel, TimeStampMixin):
    """Schema for order response"""
    total_amount: float = 0.0
    tax_amount: float = 0.0
    created_by: int
    closed_by: Optional[int] = None
    closed_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True
        
class OrdersResponse(ResponseBase):
    """Schema for multiple orders response"""
    data: List[OrderResponse]
    
class OrderDetailResponse(ResponseBase):
    """Schema for single order response"""
    data: OrderResponse
    
# Schema for order with additional information
class OrderWithInfoResponse(OrderResponse):
    """Schema for order with additional information"""
    created_by_username: str
    closed_by_username: Optional[str] = None
    service_spot_name: str
    sales_area_name: str
    menu_name: str
    
class OrderWithInfoDetailResponse(ResponseBase):
    """Schema for single order with info response"""
    data: OrderWithInfoResponse
    
# Schema for order with items
class OrderItemDetail(BaseModel):
    """Schema for order item within order response"""
    id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    total_price: float
    notes: Optional[str] = None
    status: str
    
class OrderWithItemsResponse(OrderWithInfoResponse):
    """Schema for order with nested items"""
    items: List[OrderItemDetail]
    
class OrderWithItemsDetailResponse(ResponseBase):
    """Schema for single order with items response"""
    data: OrderWithItemsResponse

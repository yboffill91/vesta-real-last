"""
OrderItem schemas for API request and response validation
"""
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.base import IDModel, TimeStampMixin, ResponseBase

class OrderItemBase(BaseModel):
    """Base schema for order item data"""
    order_id: int
    product_id: int
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)
    notes: Optional[str] = None
    
class OrderItemCreate(OrderItemBase):
    """Schema for order item creation"""
    status: Optional[str] = "pendiente"
    total_price: Optional[float] = None  # Calculated field, optional in request
    
    def calculate_total(self):
        """Calculate total price based on quantity and unit price"""
        return self.quantity * self.unit_price
    
class OrderItemUpdate(BaseModel):
    """Schema for order item update"""
    quantity: Optional[int] = Field(None, gt=0)
    notes: Optional[str] = None
    
class OrderItemStatusUpdate(BaseModel):
    """Schema for order item status update"""
    status: str = Field(..., description="Item status: pendiente, en_preparación, listo, servido, cancelado")
    
class OrderItemResponse(OrderItemBase, IDModel, TimeStampMixin):
    """Schema for order item response"""
    total_price: float
    status: str
    
    class Config:
        orm_mode = True
        
class OrderItemsResponse(ResponseBase):
    """Schema for multiple order items response"""
    data: List[OrderItemResponse]
    
class OrderItemDetailResponse(ResponseBase):
    """Schema for single order item response"""
    data: OrderItemResponse
    
# Schema for order item with product information
class OrderItemWithProductResponse(OrderItemResponse):
    """Schema for order item with product information"""
    product_name: str
    product_description: Optional[str] = None
    category_name: str
    
class OrderItemWithProductDetailResponse(ResponseBase):
    """Schema for single order item with product response"""
    data: OrderItemWithProductResponse
    
# Schema for pending items list (for kitchen/bar display)
class PendingOrderItemResponse(BaseModel):
    """Schema for pending order item"""
    id: int
    order_id: int
    product_id: int
    product_name: str
    quantity: int
    status: str
    service_spot_name: str
    sales_area_name: str
    notes: Optional[str] = None
    
class PendingOrderItemsResponse(ResponseBase):
    """Schema for pending order items response"""
    data: List[PendingOrderItemResponse]

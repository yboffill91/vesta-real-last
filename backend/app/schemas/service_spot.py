"""
ServiceSpot schemas for API request and response validation
"""
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.base import IDModel, TimeStampMixin, ResponseBase

class ServiceSpotBase(BaseModel):
    """Base schema for service spot data"""
    name: str = Field(..., min_length=1, max_length=50)
    capacity: Optional[int] = Field(1, ge=1)
    status: Optional[str] = "libre"
    is_active: Optional[bool] = True
    sales_area_id: int
    
class ServiceSpotCreate(ServiceSpotBase):
    """Schema for service spot creation"""
    pass
    
class ServiceSpotUpdate(BaseModel):
    """Schema for service spot update"""
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    capacity: Optional[int] = Field(None, ge=1)
    status: Optional[str] = None
    is_active: Optional[bool] = None
    sales_area_id: Optional[int] = None
    
class ServiceSpotStatusUpdate(BaseModel):
    """Schema for service spot status update"""
    status: str = Field(..., description="Service spot status: libre, ocupado, reservado, pedido_abierto, cobrado")
    
class ServiceSpotResponse(ServiceSpotBase, IDModel, TimeStampMixin):
    """Schema for service spot response"""
    
    class Config:
        orm_mode = True
        
class ServiceSpotsResponse(ResponseBase):
    """Schema for multiple service spots response"""
    data: List[ServiceSpotResponse]
    
class ServiceSpotDetailResponse(ResponseBase):
    """Schema for single service spot response"""
    data: ServiceSpotResponse
    
# Schema for service spot with parent sales area info
class ServiceSpotWithAreaResponse(ServiceSpotResponse):
    """Schema for service spot with sales area information"""
    sales_area_name: str
    
class ServiceSpotWithAreaDetailResponse(ResponseBase):
    """Schema for single service spot with area response"""
    data: ServiceSpotWithAreaResponse

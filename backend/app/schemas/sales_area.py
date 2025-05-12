"""
SalesArea schemas for API request and response validation
"""
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.base import IDModel, TimeStampMixin, ResponseBase

class SalesAreaBase(BaseModel):
    """Base schema for sales area data"""
    name: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = None
    is_active: Optional[bool] = True
    establishment_id: int
    
class SalesAreaCreate(SalesAreaBase):
    """Schema for sales area creation"""
    pass
    
class SalesAreaUpdate(BaseModel):
    """Schema for sales area update"""
    name: Optional[str] = Field(None, min_length=2, max_length=50)
    description: Optional[str] = None
    is_active: Optional[bool] = None
    establishment_id: Optional[int] = None
    
class SalesAreaResponse(SalesAreaBase, IDModel, TimeStampMixin):
    """Schema for sales area response"""
    
    class Config:
        orm_mode = True
        
class SalesAreasResponse(ResponseBase):
    """Schema for multiple sales areas response"""
    data: List[SalesAreaResponse]
    
class SalesAreaDetailResponse(ResponseBase):
    """Schema for single sales area response"""
    data: SalesAreaResponse
    
# Schema for sales area with service spots
class ServiceSpotInSalesArea(BaseModel):
    """Schema for service spot within sales area response"""
    id: int
    name: str
    capacity: int
    status: str
    is_active: bool
    
class SalesAreaWithSpotsResponse(SalesAreaResponse):
    """Schema for sales area with service spots"""
    service_spots: List[ServiceSpotInSalesArea]
    
class SalesAreaWithSpotsDetailResponse(ResponseBase):
    """Schema for single sales area with spots response"""
    data: SalesAreaWithSpotsResponse

"""
Establishment schemas for API request and response validation
"""
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.base import IDModel, TimeStampMixin, ResponseBase

class EstablishmentBase(BaseModel):
    """Base schema for establishment data"""
    name: str = Field(..., min_length=2, max_length=100)
    address: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    logo: Optional[str] = Field(None, max_length=255)
    tax_rate: Optional[float] = Field(0.0, ge=0.0, le=100.0)
    currency: Optional[str] = Field("CUP", max_length=3)
    is_configured: Optional[bool] = False
    
class EstablishmentCreate(EstablishmentBase):
    """Schema for establishment creation"""
    pass
    
class EstablishmentUpdate(BaseModel):
    """Schema for establishment update"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    address: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    logo: Optional[str] = Field(None, max_length=255)
    tax_rate: Optional[float] = Field(None, ge=0.0, le=100.0)
    currency: Optional[str] = Field(None, max_length=3)
    is_configured: Optional[bool] = None
    
class EstablishmentResponse(EstablishmentBase, IDModel, TimeStampMixin):
    """Schema for establishment response"""
    logo_url: Optional[str] = Field(None, alias="logo")

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        allow_population_by_alias = True

class EstablishmentDetailResponse(ResponseBase):
    """Schema for single establishment response"""
    data: EstablishmentResponse

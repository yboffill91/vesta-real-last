"""
Base schemas for common model attributes
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class TimeStampMixin(BaseModel):
    """Mixin for created_at and updated_at fields"""
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class IDModel(BaseModel):
    """Base model with ID field"""
    id: Optional[int] = None
    
class ResponseBase(BaseModel):
    """Base model for API responses"""
    status: str = "success"
    message: str = ""
    
class PaginatedResponse(ResponseBase):
    """Base model for paginated responses"""
    total: int
    page: int
    page_size: int
    pages: int

"""
User schemas for API request and response validation
"""
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.base import IDModel, TimeStampMixin, ResponseBase

class UserBase(BaseModel):
    """Base schema for user data"""
    name: str = Field(..., min_length=2, max_length=32)
    surname: str = Field(..., min_length=2, max_length=32)
    username: str = Field(..., min_length=4, max_length=32)
    
class UserCreate(UserBase):
    """Schema for user creation"""
    password: str = Field(..., min_length=6)
    role: str = Field(..., description="User role: Soporte, Administrador, or Dependiente")
    
class UserUpdate(BaseModel):
    """Schema for user update"""
    name: Optional[str] = Field(None, min_length=2, max_length=32)
    surname: Optional[str] = Field(None, min_length=2, max_length=32)
    username: Optional[str] = Field(None, min_length=4, max_length=32)
    password: Optional[str] = Field(None, min_length=6)
    role: Optional[str] = None
    
class UserResponse(UserBase, IDModel, TimeStampMixin):
    """Schema for user response"""
    role: str
    
    class Config:
        orm_mode = True
        
class UsersResponse(ResponseBase):
    """Schema for multiple users response"""
    data: List[UserResponse]
    
class UserDetailResponse(ResponseBase):
    """Schema for single user response"""
    data: UserResponse

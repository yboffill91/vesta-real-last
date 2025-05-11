"""
Authentication schemas.
This module contains Pydantic models for authentication requests and responses.
"""
from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    """
    Schema for user login request.
    
    Attributes:
        username: The user's unique username
        password: The user's password (plain text for request only)
    """
    username: str
    password: str


class UserResponse(BaseModel):
    """
    Schema for user information in responses.
    Excludes sensitive information like passwords.
    
    Attributes:
        id: User's unique identifier
        username: User's unique username
        name: User's first name
        surname: User's last name
        role: User's role in the system
    """
    id: int
    username: str
    name: str
    surname: str
    role: str


class LoginResponse(BaseModel):
    """
    Schema for successful login response.
    
    Attributes:
        access_token: JWT token for authentication
        token_type: Type of token (usually "bearer")
        user: User information
    """
    access_token: str
    token_type: str
    user: UserResponse


class TokenData(BaseModel):
    """
    Schema for JWT token payload data.
    
    Attributes:
        sub: Subject (usually the user ID)
        username: User's username
        role: User's role for authorization
        exp: Expiration time
    """
    sub: str
    username: str
    role: str
    exp: int = None

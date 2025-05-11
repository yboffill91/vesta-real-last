"""
Security utilities for authentication and authorization.
This module provides functions for JWT token creation, verification, and password management.
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import os
import secrets
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# Password hashing configuration
# This uses bcrypt for password hashing which is considered secure
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 configuration for token extraction from requests
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# JWT Configuration
# In production, these should be loaded from environment variables or a secure vault
SECRET_KEY = os.getenv("JWT_SECRET_KEY", secrets.token_hex(32))  # Generate random key if not provided
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # Token valid for 30 minutes

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify if the plain password matches the hashed password.
    
    Args:
        plain_password: The password in plain text provided by the user
        hashed_password: The hashed password stored in the database
        
    Returns:
        bool: True if the password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a password for storing in the database.
    
    Args:
        password: The password in plain text
        
    Returns:
        str: The hashed password
    """
    return pwd_context.hash(password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: The data to encode in the token (typically user info)
        expires_delta: Optional, time before token expires
        
    Returns:
        str: The encoded JWT token
    """
    to_encode = data.copy()
    
    # Set the expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    # Create the JWT token
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Verify and decode the JWT token to get the current user.
    
    Args:
        token: The JWT token provided in the request header
        
    Returns:
        dict: The user data encoded in the token
        
    Raises:
        HTTPException: If the token is invalid or expired
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Extract user information
        username: str = payload.get("username")
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        
        if username is None or user_id is None:
            raise credentials_exception
            
        return {
            "user_id": int(user_id),
            "username": username,
            "role": role
        }
        
    except JWTError:
        raise credentials_exception

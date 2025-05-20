"""
Authentication router.
This module provides endpoints for user authentication (login/logout).
"""
import logging
from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.schemas.auth import LoginRequest, LoginResponse, UserResponse
from app.services.user_service import authenticate_user
from app.utils.security import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
    responses={401: {"description": "Autenticación fallida"}},
)


@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """
    Authenticate a user and return a JWT token.
    
    This endpoint validates user credentials and issues a JWT token for
    authorized access to protected endpoints.
    
    Args:
        login_data: User credentials (username and password)
        
    Returns:
        dict: JWT token and user information
        
    Raises:
        HTTPException: If authentication fails
    """
    # Authenticate user with provided credentials
    user = await authenticate_user(login_data.username, login_data.password)
    
    # If authentication fails, return 401 Unauthorized
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token with user data
    token_data = {
        "sub": str(user["id"]),  # subject (user ID)
        "username": user["username"],
        "role": user["role"]
    }
    
    # Set token expiration
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Generate the JWT token
    access_token = create_access_token(
        data=token_data,
        expires_delta=access_token_expires
    )
    
    # Log successful login
    logger.info(f"User {user['username']} logged in successfully")
    
    # Return token and user data
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=user["id"],
            username=user["username"],
            name=user["name"],
            surname=user["surname"],
            role=user["role"]
        )
    }


# Alternative login endpoint that follows the OAuth2 password flow spec
@router.post("/token")
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    """
    OAuth2 compatible token login, get an access token for future requests.
    
    This endpoint follows the OAuth2 specification for password flow authentication.
    It's useful when integrating with OAuth2 compatible clients.
    
    Args:
        form_data: OAuth2 form with username and password fields
        
    Returns:
        dict: Access token information
        
    Raises:
        HTTPException: If authentication fails
    """
    # Authenticate user with form data
    user = await authenticate_user(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create JWT token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["id"]), "username": user["username"], "role": user["role"]},
        expires_delta=access_token_expires
    )
    
    # Return token information
    return {"access_token": access_token, "token_type": "bearer"}

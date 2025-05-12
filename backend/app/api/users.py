"""
Users router.
Provides endpoints for user management.
Only accessible to users with Soporte or Administrador roles.
"""
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from app.utils.auth_middleware import require_admin, get_current_user
from app.utils.security import get_password_hash
from app.schemas.user import (
    UserCreate, UserUpdate, UserResponse, UsersResponse,
    UserDetailResponse
)
from app.models.user import User

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/users",
    tags=["Users"],
    responses={
        403: {"description": "Forbidden - Not enough permissions"},
        401: {"description": "Unauthorized - Not authenticated"}
    },
)

@router.get("/", response_model=UsersResponse)
async def get_users(
    current_user: dict = Depends(require_admin),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None
):
    """
    Get all users.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        skip: Number of records to skip for pagination
        limit: Maximum number of records to return
        search: Optional search term to filter users by name or username
        
    Returns:
        UsersResponse: A list of users (without sensitive information)
    """
    logger.info(f"User {current_user['username']} accessed users list")
    
    # Get users from database
    if search:
        db_users = User.search(search, skip=skip, limit=limit)
    else:
        db_users = User.find_all(
            order_by="username ASC", 
            limit=limit, 
            offset=skip
        )
    
    # Convert to response model
    users = [
        UserResponse(
            id=user['id'],
            name=user['name'],
            surname=user['surname'],
            username=user['username'],
            role=user['role'],
            created_at=user.get('created_at'),
            updated_at=user.get('updated_at')
        ) for user in db_users
    ]
    
    return {
        "status": "success",
        "message": "Users retrieved successfully",
        "data": users
    }

@router.post("/", response_model=UserDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user: UserCreate, 
    current_user: dict = Depends(require_admin)
):
    """
    Create a new user.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        user: User data for creation
        
    Returns:
        UserDetailResponse: The created user data
    """
    logger.info(f"User {current_user['username']} is creating a new user")
    
    # Check if username already exists
    existing_user = User.find_by_username(user.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Hash the password
    hashed_password = get_password_hash(user.password)
    
    # Create user in database
    user_data = user.dict()
    user_data['password'] = hashed_password
    
    new_user_id = User.create(user_data)
    
    if not new_user_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )
    
    # Get the created user
    created_user = User.find_by_id(new_user_id)
    
    # Convert to response model
    user_response = UserResponse(
        id=created_user['id'],
        name=created_user['name'],
        surname=created_user['surname'],
        username=created_user['username'],
        role=created_user['role'],
        created_at=created_user.get('created_at'),
        updated_at=created_user.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "User created successfully",
        "data": user_response
    }

@router.get("/{user_id}", response_model=UserDetailResponse)
async def get_user(
    user_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_admin)
):
    """
    Get a specific user by ID.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        user_id: The ID of the user to retrieve
        
    Returns:
        UserDetailResponse: The user data
    """
    logger.info(f"User {current_user['username']} is retrieving user {user_id}")
    
    # Get user from database
    db_user = User.find_by_id(user_id)
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Convert to response model
    user_response = UserResponse(
        id=db_user['id'],
        name=db_user['name'],
        surname=db_user['surname'],
        username=db_user['username'],
        role=db_user['role'],
        created_at=db_user.get('created_at'),
        updated_at=db_user.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "User retrieved successfully",
        "data": user_response
    }

@router.put("/{user_id}", response_model=UserDetailResponse)
async def update_user(
    user: UserUpdate,
    user_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_admin)
):
    """
    Update a specific user.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        user_id: The ID of the user to update
        user: The user data to update
        
    Returns:
        UserDetailResponse: The updated user data
    """
    logger.info(f"User {current_user['username']} is updating user {user_id}")
    
    # Check if user exists
    db_user = User.find_by_id(user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user data
    user_data = {k: v for k, v in user.dict().items() if v is not None}
    
    # If password is being updated, hash it
    if 'password' in user_data:
        user_data['password'] = get_password_hash(user_data['password'])
    
    # If username is being updated, check if it's already taken
    if 'username' in user_data and user_data['username'] != db_user['username']:
        existing_user = User.find_by_username(user_data['username'])
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
    
    # Update in database
    success = User.update(user_id, user_data)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )
    
    # Get the updated user
    updated_user = User.find_by_id(user_id)
    
    # Convert to response model
    user_response = UserResponse(
        id=updated_user['id'],
        name=updated_user['name'],
        surname=updated_user['surname'],
        username=updated_user['username'],
        role=updated_user['role'],
        created_at=updated_user.get('created_at'),
        updated_at=updated_user.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "User updated successfully",
        "data": user_response
    }

@router.delete("/{user_id}", response_model=UserDetailResponse)
async def delete_user(
    user_id: int = Path(..., gt=0),
    current_user: dict = Depends(require_admin)
):
    """
    Delete a specific user.
    Only accessible to Soporte and Administrador roles.
    
    Args:
        user_id: The ID of the user to delete
        
    Returns:
        UserDetailResponse: The deleted user data
    """
    logger.info(f"User {current_user['username']} is deleting user {user_id}")
    
    # Prevent deletion of self
    if current_user.get('id') == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    # Get user before deletion
    db_user = User.find_by_id(user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Delete the user
    success = User.delete(user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )
    
    # Convert to response model
    user_response = UserResponse(
        id=db_user['id'],
        name=db_user['name'],
        surname=db_user['surname'],
        username=db_user['username'],
        role=db_user['role'],
        created_at=db_user.get('created_at'),
        updated_at=db_user.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "User deleted successfully",
        "data": user_response
    }

@router.get("/me", response_model=UserDetailResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    """
    Get the current authenticated user.
    Accessible to any authenticated user.
    
    Returns:
        UserDetailResponse: The current user data
    """
    # Get user from database using the ID in the token
    db_user = User.find_by_id(current_user.get('id'))
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Convert to response model
    user_response = UserResponse(
        id=db_user['id'],
        name=db_user['name'],
        surname=db_user['surname'],
        username=db_user['username'],
        role=db_user['role'],
        created_at=db_user.get('created_at'),
        updated_at=db_user.get('updated_at')
    )
    
    return {
        "status": "success",
        "message": "Current user retrieved successfully",
        "data": user_response
    }

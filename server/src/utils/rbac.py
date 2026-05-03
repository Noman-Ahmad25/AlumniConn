from fastapi import HTTPException, Depends
from src.utils.dependency import get_current_user
from src.models.user import User, UserRole


def check_role(allowed_roles: list[str]):
    """
    Dependency to check if user has one of the allowed roles.
    
    Args:
        allowed_roles: List of allowed role strings
    
    Returns:
        Dependency function that validates role
    """
    def role_verifier(current_user: User = Depends(get_current_user)):
        if current_user.role.value not in allowed_roles:
            raise HTTPException(status_code=403, detail="Role not authorized")
        return current_user
    return role_verifier


def require_super_admin(current_user: User = Depends(get_current_user)):
    """
    Dependency to require SUPER_ADMIN role.
    
    Args:
        current_user: Current authenticated user
    
    Returns:
        User object if authorized
    
    Raises:
        HTTPException: If user is not SUPER_ADMIN
    """
    if current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Only SUPER_ADMIN can access this resource")
    return current_user


def require_admin(current_user: User = Depends(get_current_user)):
    """
    Dependency to require ADMIN role.
    
    Args:
        current_user: Current authenticated user
    
    Returns:
        User object if authorized
    
    Raises:
        HTTPException: If user is not ADMIN
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only ADMIN can access this resource")
    return current_user


def require_student(current_user: User = Depends(get_current_user)):
    """
    Dependency to require STUDENT role.
    
    Args:
        current_user: Current authenticated user
    
    Returns:
        User object if authorized
    
    Raises:
        HTTPException: If user is not STUDENT
    """
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only STUDENT can access this resource")
    return current_user


def require_student_or_alumni(current_user: User = Depends(get_current_user)):
    """
    Dependency to require STUDENT or ALUMNI role.
    
    Args:
        current_user: Current authenticated user
    
    Returns:
        User object if authorized
    
    Raises:
        HTTPException: If user is not STUDENT or ALUMNI
    """
    if current_user.role not in [UserRole.STUDENT, UserRole.ALUMNI]:
        raise HTTPException(status_code=403, detail="Only STUDENT or ALUMNI can access this resource")
    return current_user


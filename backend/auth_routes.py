"""Authentication routes: register, login, logout, profile."""
import re
import logging
from datetime import datetime
from typing import Dict, Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Header, status
from pydantic import BaseModel, Field, EmailStr, validator
from sqlalchemy.orm import Session

from database import get_db
from models import User, UserRole
from auth_utils import hash_password, verify_password, create_access_token, decode_access_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ── Request/Response Models ──────────────────────────────────────────

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    register_number: str = Field(..., min_length=3, max_length=100)
    email: str = Field(..., max_length=255)
    phone: str = Field(..., min_length=10, max_length=20)
    department: str = Field(..., min_length=2, max_length=100)
    year: str = Field(..., min_length=1, max_length=20)
    hostel_status: str = Field(..., min_length=2, max_length=50)
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str = Field(..., min_length=8, max_length=128)

    @validator("email")
    def validate_email(cls, v):
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(pattern, v):
            raise ValueError("Invalid email address")
        return v.lower().strip()

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        return v

    @validator("confirm_password")
    def passwords_match(cls, v, values, **kwargs):
        if "password" in values and v != values["password"]:
            raise ValueError("Passwords do not match")
        return v

    @validator("phone")
    def validate_phone(cls, v):
        digits = re.sub(r"\D", "", v)
        if len(digits) < 10:
            raise ValueError("Phone number must have at least 10 digits")
        return v


class LoginRequest(BaseModel):
    email_or_register: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    department: Optional[str] = Field(None, min_length=2, max_length=100)
    year: Optional[str] = Field(None, min_length=1, max_length=20)
    hostel_status: Optional[str] = Field(None, min_length=2, max_length=50)


class AuthResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None
    user: Optional[Dict[str, Any]] = None


class ProfileResponse(BaseModel):
    success: bool
    user: Optional[Dict[str, Any]] = None


# ── Helper ───────────────────────────────────────────────────────────

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    """Extract and validate the current user from the JWT token."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user


def user_to_dict(user: User) -> Dict[str, Any]:
    """Convert a User model to a safe dictionary (no password hash)."""
    return {
        "id": user.id,
        "full_name": user.full_name,
        "register_number": user.register_number,
        "email": user.email,
        "phone": user.phone,
        "department": user.department,
        "year": user.year,
        "hostel_status": user.hostel_status,
        "role": user.role,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


# ── Routes ───────────────────────────────────────────────────────────

@router.post("/register", response_model=AuthResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check for existing email
    existing_email = db.query(User).filter(User.email == req.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check for existing register number
    existing_reg = db.query(User).filter(User.register_number == req.register_number).first()
    if existing_reg:
        raise HTTPException(status_code=400, detail="Register number already exists")
    
    # Create user
    user = User(
        full_name=req.full_name.strip(),
        register_number=req.register_number.strip(),
        email=req.email.strip(),
        phone=req.phone.strip(),
        department=req.department.strip(),
        year=req.year.strip(),
        hostel_status=req.hostel_status.strip(),
        role=UserRole.STUDENT.value,
        password_hash=hash_password(req.password),
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    logger.info(f"New user registered: {user.email} ({user.register_number})")
    
    return AuthResponse(
        success=True,
        message="Registration successful! Please log in.",
    )


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate a user and return a JWT token."""
    # Find user by email or register number
    user = db.query(User).filter(
        (User.email == req.email_or_register) | 
        (User.register_number == req.email_or_register)
    ).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create JWT token
    token = create_access_token({
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
    })
    
    logger.info(f"User logged in: {user.email}")
    
    return AuthResponse(
        success=True,
        message="Login successful!",
        token=token,
        user=user_to_dict(user),
    )


@router.post("/logout", response_model=AuthResponse)
def logout(current_user: User = Depends(get_current_user)):
    """Logout the current user. (Client-side token removal.)"""
    logger.info(f"User logged out: {current_user.email}")
    return AuthResponse(
        success=True,
        message="Logged out successfully.",
    )


@router.get("/profile", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Get the current user's profile."""
    return ProfileResponse(
        success=True,
        user=user_to_dict(current_user),
    )


@router.put("/profile", response_model=ProfileResponse)
def update_profile(
    req: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the current user's profile."""
    if req.full_name is not None:
        current_user.full_name = req.full_name.strip()
    if req.phone is not None:
        current_user.phone = req.phone.strip()
    if req.department is not None:
        current_user.department = req.department.strip()
    if req.year is not None:
        current_user.year = req.year.strip()
    if req.hostel_status is not None:
        current_user.hostel_status = req.hostel_status.strip()
    
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    
    logger.info(f"Profile updated for user: {current_user.email}")
    
    return ProfileResponse(
        success=True,
        user=user_to_dict(current_user),
    )
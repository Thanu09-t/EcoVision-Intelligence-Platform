from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.config import settings
from app.models.user import UserRole
from app.schemas import UserRegister, UserLogin, TokenResponse, UserOut
from app.supabase_client import supabase_get, supabase_post, supabase_patch

import bcrypt

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False


def create_token(data: dict, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + expires_delta
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def _user_dict_to_out(u: dict) -> UserOut:
    """Convert a Supabase user row dict to UserOut schema."""
    return UserOut(
        id=u["id"],
        email=u["email"],
        full_name=u["full_name"],
        role=u["role"],
        eco_points=u.get("eco_points", 0),
        ward=u.get("ward"),
        avatar_url=u.get("avatar_url"),
        created_at=u["created_at"],
    )


async def get_current_user_dict(
    token: str = Depends(oauth2_scheme),
) -> dict:
    """Decode JWT and fetch user from Supabase. Returns raw dict."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    try:
        user = await supabase_get("users", {"id": f"eq.{int(user_id)}", "select": "*"}, single=True)
    except Exception:
        raise credentials_exception

    if user is None or not user.get("is_active", False):
        raise credentials_exception
    return user


# Alias for backward compatibility — routers use get_current_user
async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    return await get_current_user_dict(token)


def require_role(*roles):
    """Dependency that checks user role."""
    async def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role", "")
        allowed = [r.value if hasattr(r, 'value') else r for r in roles]
        if user_role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {allowed}",
            )
        return current_user
    return role_checker


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(data: UserRegister):
    # Check if email exists
    existing = await supabase_get("users", {"email": f"eq.{data.email}", "select": "id"})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = await supabase_post("users", {
        "email": data.email,
        "full_name": data.full_name,
        "password_hash": hash_password(data.password),
        "role": data.role.value if hasattr(data.role, 'value') else data.role,
        "phone": data.phone,
        "ward": data.ward,
        "eco_points": 10,  # Welcome bonus
    })

    # Award welcome eco-points
    await supabase_post("eco_points_log", {
        "user_id": user["id"],
        "points": 10,
        "reason": "Welcome bonus for joining EcoVision AI",
    }, return_data=False)

    access_token = create_token(
        {"sub": str(user["id"]), "role": user["role"]},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    refresh_token = create_token(
        {"sub": str(user["id"]), "type": "refresh"},
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=_user_dict_to_out(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    users = await supabase_get("users", {"email": f"eq.{data.email}", "select": "*"})
    if not users:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user = users[0] if isinstance(users, list) else users

    if not verify_password(data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.get("is_active", False):
        raise HTTPException(status_code=403, detail="Account deactivated")

    access_token = create_token(
        {"sub": str(user["id"]), "role": user["role"]},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    refresh_token = create_token(
        {"sub": str(user["id"]), "type": "refresh"},
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=_user_dict_to_out(user),
    )


@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    return _user_dict_to_out(current_user)

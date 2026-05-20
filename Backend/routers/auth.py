from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User, UserProfile
from auth_utils import hash_password, verify_password, create_access_token, get_current_user
from pydantic import BaseModel

router = APIRouter()


class RegisterRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    if len(request.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    existing = db.query(User).filter(User.email == request.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=request.email.lower(),
        password_hash=hash_password(request.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = UserProfile(user_id=user.id)
    db.add(profile)
    db.commit()

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "profile_complete": False}


@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email.lower()).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    profile_complete = bool(user.profile and user.profile.profile_complete)
    return {"access_token": token, "token_type": "bearer", "profile_complete": profile_complete}


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "profile_complete": bool(current_user.profile and current_user.profile.profile_complete),
    }

import os
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User, UserProfile
from auth_utils import hash_password, verify_password, create_access_token, get_current_user
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()


class RegisterRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class GoogleAuthRequest(BaseModel):
    access_token: str
    email: str


def _find_or_create_user(email: str, db: Session):
    user = db.query(User).filter(User.email == email.lower()).first()
    is_new = False
    if not user:
        user = User(email=email.lower(), password_hash="")
        db.add(user)
        db.commit()
        db.refresh(user)
        profile = UserProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        is_new = True
    return user, is_new


@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    if len(request.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    existing = db.query(User).filter(User.email == request.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(email=request.email.lower(), password_hash=hash_password(request.password))
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
    if not user or not user.password_hash or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    profile_complete = bool(user.profile and user.profile.profile_complete)
    return {"access_token": token, "token_type": "bearer", "profile_complete": profile_complete}


@router.post("/google")
async def google_auth(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    # Verify the access token by calling Google's userinfo endpoint
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {request.access_token}"}
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google access token")

    google_data = resp.json()
    verified_email = google_data.get("email")
    if not verified_email:
        raise HTTPException(status_code=400, detail="Could not retrieve email from Google")

    # Double-check email matches what the client sent
    if verified_email.lower() != request.email.lower():
        raise HTTPException(status_code=401, detail="Email mismatch")

    user, _ = _find_or_create_user(verified_email, db)
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

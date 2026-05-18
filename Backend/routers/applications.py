from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.application import Application
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()

class ApplicationCreate(BaseModel):
    company: str
    role: str
    status: str = "Applied"
    notes: Optional[str] = None

class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

@router.get("/")
def get_applications(db: Session = Depends(get_db)):
    return db.query(Application).all()

@router.post("/")
def create_application(app: ApplicationCreate, db: Session = Depends(get_db)):
    new_app = Application(**app.model_dump())
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app

@router.put("/{app_id}")
def update_application(app_id: int, app: ApplicationUpdate, db: Session = Depends(get_db)):
    existing = db.query(Application).filter(Application.id == app_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Application not found")
    for key, value in app.model_dump(exclude_unset=True).items():
        setattr(existing, key, value)
    db.commit()
    db.refresh(existing)
    return existing

@router.delete("/{app_id}")
def delete_application(app_id: int, db: Session = Depends(get_db)):
    existing = db.query(Application).filter(Application.id == app_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(existing)
    db.commit()
    return {"message": "Application deleted"}
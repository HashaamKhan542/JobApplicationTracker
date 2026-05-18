from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.application import Application

router = APIRouter()

@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    total = db.query(Application).count()
    applied = db.query(Application).filter(Application.status == "Applied").count()
    interviewing = db.query(Application).filter(Application.status == "Interviewing").count()
    offer = db.query(Application).filter(Application.status == "Offer").count()
    rejected = db.query(Application).filter(Application.status == "Rejected").count()

    return {
        "total": total,
        "applied": applied,
        "interviewing": interviewing,
        "offer": offer,
        "rejected": rejected,
        "interview_rate": round((interviewing / total * 100), 1) if total > 0 else 0,
        "offer_rate": round((offer / total * 100), 1) if total > 0 else 0,
    }
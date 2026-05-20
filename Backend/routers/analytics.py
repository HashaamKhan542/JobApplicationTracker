from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.application import Application
from models.user import User
from auth_utils import get_current_user

router = APIRouter()


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Application).filter(Application.user_id == current_user.id)
    total = q.count()
    applied = q.filter(Application.status == "Applied").count()
    interviewing = q.filter(Application.status == "Interviewing").count()
    offer = q.filter(Application.status == "Offer").count()
    rejected = q.filter(Application.status == "Rejected").count()

    return {
        "total": total,
        "applied": applied,
        "interviewing": interviewing,
        "offer": offer,
        "rejected": rejected,
        "interview_rate": round((interviewing / total * 100), 1) if total > 0 else 0,
        "offer_rate": round((offer / total * 100), 1) if total > 0 else 0,
    }

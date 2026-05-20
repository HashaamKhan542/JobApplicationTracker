import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.user import User, UserProfile
from auth_utils import get_current_user
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()


class ProfileSetup(BaseModel):
    full_name: str
    current_title: Optional[str] = None
    location: Optional[str] = None
    years_experience: Optional[int] = None
    skills: Optional[List[str]] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    institution: Optional[str] = None
    target_roles: Optional[List[str]] = None
    work_type: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    linkedin_url: Optional[str] = None


@router.get("/me")
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        return {"email": current_user.email, "profile_complete": False}

    return {
        "email": current_user.email,
        "full_name": profile.full_name,
        "current_title": profile.current_title,
        "location": profile.location,
        "years_experience": profile.years_experience,
        "skills": json.loads(profile.skills) if profile.skills else [],
        "degree": profile.degree,
        "field_of_study": profile.field_of_study,
        "institution": profile.institution,
        "target_roles": json.loads(profile.target_roles) if profile.target_roles else [],
        "work_type": profile.work_type,
        "salary_min": profile.salary_min,
        "salary_max": profile.salary_max,
        "linkedin_url": profile.linkedin_url,
        "profile_complete": bool(profile.profile_complete),
    }


@router.post("/setup")
def setup_profile(
    data: ProfileSetup,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    profile.full_name = data.full_name
    profile.current_title = data.current_title
    profile.location = data.location
    profile.years_experience = data.years_experience
    profile.skills = json.dumps(data.skills or [])
    profile.degree = data.degree
    profile.field_of_study = data.field_of_study
    profile.institution = data.institution
    profile.target_roles = json.dumps(data.target_roles or [])
    profile.work_type = data.work_type
    profile.salary_min = data.salary_min
    profile.salary_max = data.salary_max
    profile.linkedin_url = data.linkedin_url
    profile.profile_complete = 1

    db.commit()
    db.refresh(profile)
    return {"message": "Profile saved successfully", "profile_complete": True}

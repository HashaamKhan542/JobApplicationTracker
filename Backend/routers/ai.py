import json
import os
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
import anthropic
from dotenv import load_dotenv
from database import get_db
from models.user import User, UserProfile
from auth_utils import get_current_user

load_dotenv()

router = APIRouter()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


class JDRequest(BaseModel):
    job_description: str


def _build_profile_text(current_user: User, db: Session) -> str:
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile or not profile.profile_complete:
        return f"Name: {current_user.email.split('@')[0]}\n(Profile not set up yet)"

    skills = json.loads(profile.skills) if profile.skills else []
    target_roles = json.loads(profile.target_roles) if profile.target_roles else []

    lines = [f"Name: {profile.full_name or current_user.email}"]
    if profile.current_title:
        lines.append(f"Current Title: {profile.current_title}")
    if profile.location:
        lines.append(f"Location: {profile.location}")
    if profile.years_experience is not None:
        lines.append(f"Years of Experience: {profile.years_experience}")
    if profile.degree or profile.field_of_study or profile.institution:
        edu = " - ".join(filter(None, [profile.degree, profile.field_of_study, profile.institution]))
        lines.append(f"Education: {edu}")
    if skills:
        lines.append(f"Skills: {', '.join(skills)}")
    if target_roles:
        lines.append(f"Target Roles: {', '.join(target_roles)}")
    if profile.work_type:
        lines.append(f"Preferred Work Type: {profile.work_type}")
    if profile.salary_min and profile.salary_max:
        lines.append(f"Salary Expectation: ${profile.salary_min:,} - ${profile.salary_max:,}")

    return "\n".join(lines)


@router.post("/interview-prep")
def interview_prep(
    request: JDRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    message = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1024,
        system="""You are an expert interview coach. Given a job description,
        generate 5 to 8 tailored interview questions. Categorise each question
        as Technical, Behavioural, or Situational. Format your response clearly
        with the category label before each question.""",
        messages=[
            {
                "role": "user",
                "content": f"Generate interview questions for this job description:\n\n{request.job_description}"
            }
        ]
    )
    return {"questions": message.content[0].text}


@router.post("/fit-score")
def fit_score(
    request: JDRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    candidate_profile = _build_profile_text(current_user, db)

    message = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1024,
        system=f"""You are a career advisor. You have access to the following candidate profile:

{candidate_profile}

Given a job description, analyse how well this candidate fits the role.
Return your response in this exact format:
- Fit Score: (a number from 0 to 100)
- Matched Skills: (list the matching skills)
- Skill Gaps: (list what the candidate is missing)
- Recommendation: (2 to 3 sentences summarising the fit)""",
        messages=[
            {
                "role": "user",
                "content": f"Analyse my fit for this job:\n\n{request.job_description}"
            }
        ]
    )
    return {"result": message.content[0].text}

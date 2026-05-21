import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, get_db
from models import user, application  # ensure models are registered
from models.user import User
from routers import applications, ai, analytics, auth, profile
from sqlalchemy.orm import Session

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Job Application Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "https://job-application-tracker-nine-drab.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(profile.router, prefix="/profile", tags=["Profile"])
app.include_router(applications.router, prefix="/applications", tags=["Applications"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])


@app.get("/")
def root():
    return {"message": "Job Tracker API is running"}


@app.get("/admin/users")
def admin_users(key: str, db: Session = Depends(get_db)):
    admin_key = os.getenv("ADMIN_KEY")
    if not admin_key or key != admin_key:
        raise HTTPException(status_code=403, detail="Forbidden")
    users = db.query(User).all()
    return {
        "total_users": len(users),
        "users": [{"id": u.id, "email": u.email, "created_at": str(u.created_at)} for u in users]
    }

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from models import user, application  # ensure models are registered
from routers import applications, ai, analytics, auth, profile

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

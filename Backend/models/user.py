from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now())

    profile = relationship("UserProfile", back_populates="user", uselist=False)
    applications = relationship("Application", back_populates="user")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String, nullable=True)
    current_title = Column(String, nullable=True)
    location = Column(String, nullable=True)
    years_experience = Column(Integer, nullable=True)
    skills = Column(Text, nullable=True)       # JSON array string
    degree = Column(String, nullable=True)
    field_of_study = Column(String, nullable=True)
    institution = Column(String, nullable=True)
    target_roles = Column(Text, nullable=True)  # JSON array string
    work_type = Column(String, nullable=True)   # remote / hybrid / onsite
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    linkedin_url = Column(String, nullable=True)
    profile_complete = Column(Integer, default=0)

    user = relationship("User", back_populates="profile")

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    status = Column(String, default="Applied")
    date_applied = Column(DateTime, default=func.now())
    notes = Column(String, nullable=True)

    user = relationship("User", back_populates="applications")

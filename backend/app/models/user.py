import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Boolean,
    ForeignKey, Text, JSON, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from app.database import Base


class UserRole(str, enum.Enum):
    citizen = "citizen"
    municipal = "municipal"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.citizen, nullable=False)
    phone = Column(String(20), nullable=True)
    ward = Column(String(50), nullable=True)
    eco_points = Column(Integer, default=0)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    reports = relationship("GarbageReport", back_populates="reporter", foreign_keys="GarbageReport.reporter_id")
    notifications = relationship("Notification", back_populates="user")
    eco_points_log = relationship("EcoPointsLog", back_populates="user")

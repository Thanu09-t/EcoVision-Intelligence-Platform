import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, DateTime,
    ForeignKey, Text, JSON, Enum as SAEnum, Boolean
)
from sqlalchemy.orm import relationship
from app.database import Base


class VehicleStatus(str, enum.Enum):
    available = "available"
    on_route = "on_route"
    maintenance = "maintenance"
    offline = "offline"


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    license_plate = Column(String(20), unique=True, nullable=False)
    vehicle_type = Column(String(50), default="garbage_truck")  # truck | compactor | mini
    capacity_tons = Column(Float, default=5.0)
    current_latitude = Column(Float, nullable=True)
    current_longitude = Column(Float, nullable=True)
    status = Column(SAEnum(VehicleStatus), default=VehicleStatus.available)
    fuel_level = Column(Float, default=100.0)  # percentage
    driver_name = Column(String(255), nullable=True)
    driver_phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    supervisor_name = Column(String(255), nullable=True)
    supervisor_phone = Column(String(20), nullable=True)
    member_count = Column(Integer, default=4)
    ward = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(50), nullable=False)  # info | warning | critical | success
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    report_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class EcoPointsLog(Base):
    __tablename__ = "eco_points_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    points = Column(Integer, nullable=False)  # can be negative for penalties
    reason = Column(String(255), nullable=False)
    report_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="eco_points_log")

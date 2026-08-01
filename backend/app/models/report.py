import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, DateTime,
    ForeignKey, Text, JSON, Enum as SAEnum, Boolean
)
from sqlalchemy.orm import relationship
from app.database import Base


class ReportStatus(str, enum.Enum):
    pending = "pending"
    under_review = "under_review"
    assigned = "assigned"
    cleaning_started = "cleaning_started"
    completed = "completed"
    rejected = "rejected"


class SeverityLevel(str, enum.Enum):
    very_low = "very_low"
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class WasteType(str, enum.Enum):
    plastic = "plastic"
    organic = "organic"
    glass = "glass"
    metal = "metal"
    electronic = "electronic"
    biomedical = "biomedical"
    construction = "construction"
    mixed = "mixed"


class IllegalDumpType(str, enum.Enum):
    authorized_yard = "authorized_yard"
    illegal_dump = "illegal_dump"
    temporary_collection = "temporary_collection"
    overflowing_bin = "overflowing_bin"
    unknown = "unknown"


class GarbageReport(Base):
    __tablename__ = "garbage_reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    image_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500), nullable=True)

    # Location
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(500), nullable=True)
    ward = Column(String(50), nullable=True)

    # Details
    description = Column(Text, nullable=True)
    status = Column(SAEnum(ReportStatus), default=ReportStatus.pending)

    # AI Prediction link
    prediction_id = Column(Integer, ForeignKey("ai_predictions.id"), nullable=True)

    # Assignment
    assignment_id = Column(Integer, ForeignKey("cleanup_assignments.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    reporter = relationship("User", back_populates="reports", foreign_keys=[reporter_id])
    prediction = relationship("AIPrediction", foreign_keys=[prediction_id], uselist=False)
    assignment = relationship("CleanupAssignment", foreign_keys=[assignment_id], uselist=False)


class AIPrediction(Base):
    __tablename__ = "ai_predictions"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, nullable=True)  # Linked after creation

    # Detection
    detected_objects = Column(JSON, nullable=True)  # List of {label, confidence, bbox}
    waste_types = Column(JSON, nullable=True)         # List of {type, percentage}
    primary_waste_type = Column(SAEnum(WasteType), nullable=True)

    # Segmentation
    garbage_area_m2 = Column(Float, nullable=True)
    coverage_percentage = Column(Float, nullable=True)  # % of image covered

    # Severity
    severity = Column(SAEnum(SeverityLevel), nullable=True)
    pollution_score = Column(Float, nullable=True)  # 0–100

    # Illegal dump
    illegal_dump_type = Column(SAEnum(IllegalDumpType), default=IllegalDumpType.unknown)
    is_illegal = Column(Boolean, default=False)

    # Meta
    model_version = Column(String(50), default="mock-v1.0")
    processing_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class CleanupAssignment(Base):
    __tablename__ = "cleanup_assignments"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("garbage_reports.id"), nullable=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    assigned_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    notes = Column(Text, nullable=True)
    estimated_duration_hours = Column(Float, nullable=True)

    assigned_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    vehicle = relationship("Vehicle", foreign_keys=[vehicle_id])
    team = relationship("Team", foreign_keys=[team_id])

from app.models.user import User, UserRole
from app.models.report import GarbageReport, AIPrediction, CleanupAssignment, ReportStatus, SeverityLevel, WasteType
from app.models.vehicle import Vehicle, Team, Notification, EcoPointsLog, VehicleStatus

__all__ = [
    "User", "UserRole",
    "GarbageReport", "AIPrediction", "CleanupAssignment",
    "ReportStatus", "SeverityLevel", "WasteType",
    "Vehicle", "Team", "Notification", "EcoPointsLog", "VehicleStatus",
]

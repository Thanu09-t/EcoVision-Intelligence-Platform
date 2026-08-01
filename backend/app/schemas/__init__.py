from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole
from app.models.report import ReportStatus, SeverityLevel, WasteType, IllegalDumpType
from app.models.vehicle import VehicleStatus


# ─── Auth ────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None
    ward: Optional[str] = None
    role: UserRole = UserRole.citizen


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    eco_points: int
    ward: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Reports ─────────────────────────────────────────────────────────────────

class ReportCreate(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    description: Optional[str] = None
    ward: Optional[str] = None


class DetectedObject(BaseModel):
    label: str
    confidence: float
    bbox: List[float]  # [x1, y1, x2, y2] normalized


class WasteTypeBreakdown(BaseModel):
    type: WasteType
    percentage: float


class AIPredictionOut(BaseModel):
    id: int
    detected_objects: Optional[List[DetectedObject]]
    waste_types: Optional[List[WasteTypeBreakdown]]
    primary_waste_type: Optional[WasteType]
    garbage_area_m2: Optional[float]
    coverage_percentage: Optional[float]
    severity: Optional[SeverityLevel]
    pollution_score: Optional[float]
    illegal_dump_type: IllegalDumpType
    is_illegal: bool
    model_version: str
    processing_time_ms: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class ReportOut(BaseModel):
    id: int
    reporter_id: int
    image_url: str
    thumbnail_url: Optional[str]
    latitude: float
    longitude: float
    address: Optional[str]
    ward: Optional[str]
    description: Optional[str]
    status: ReportStatus
    prediction: Optional[AIPredictionOut]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReportStatusUpdate(BaseModel):
    status: ReportStatus
    notes: Optional[str] = None


# ─── Map / GIS ────────────────────────────────────────────────────────────────

class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: dict
    properties: dict


class GeoJSONCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]


# ─── Vehicles ────────────────────────────────────────────────────────────────

class VehicleOut(BaseModel):
    id: int
    name: str
    license_plate: str
    vehicle_type: str
    capacity_tons: float
    current_latitude: Optional[float]
    current_longitude: Optional[float]
    status: VehicleStatus
    fuel_level: float
    driver_name: Optional[str]

    class Config:
        from_attributes = True


# ─── Analytics ───────────────────────────────────────────────────────────────

class OverviewStats(BaseModel):
    total_sites: int
    critical_sites: int
    vehicles_available: int
    todays_cleanups: int
    pending_reports: int
    completed_today: int
    total_eco_points_awarded: int
    active_citizens: int


class ChartDataset(BaseModel):
    label: str
    data: List[float]
    color: Optional[str] = None


class ChartData(BaseModel):
    labels: List[str]
    datasets: List[ChartDataset]


# ─── Route Optimization ──────────────────────────────────────────────────────

class RouteOptimizationRequest(BaseModel):
    vehicle_ids: List[int]
    report_ids: List[int]
    depot_lat: float = 12.9716
    depot_lng: float = 77.5946


class RouteStop(BaseModel):
    report_id: int
    latitude: float
    longitude: float
    address: Optional[str]
    severity: Optional[SeverityLevel]
    order: int


class OptimizedRoute(BaseModel):
    vehicle_id: int
    vehicle_name: str
    stops: List[RouteStop]
    total_distance_km: float
    estimated_duration_hours: float


class RouteOptimizationResult(BaseModel):
    routes: List[OptimizedRoute]
    unassigned_report_ids: List[int]
    optimization_time_ms: int


# ─── AI Reports ──────────────────────────────────────────────────────────────

class AIReportRequest(BaseModel):
    report_type: str = "daily"  # daily | weekly | monthly | ward
    ward: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None


class AIReportOut(BaseModel):
    title: str
    generated_at: datetime
    report_type: str
    summary: str
    key_findings: List[str]
    priority_areas: List[str]
    recommendations: List[str]
    statistics: dict


# ─── Notifications ───────────────────────────────────────────────────────────

class NotificationOut(BaseModel):
    id: int
    type: str
    title: str
    message: str
    is_read: bool
    report_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Ward / GIS ──────────────────────────────────────────────────────────────

class WardRanking(BaseModel):
    ward: str
    avg_score: float
    total_reports: int
    critical_count: int
    color: str


class HeatmapPoint(BaseModel):
    lat: float
    lng: float
    score: float
    severity: str


class MapDataPoint(BaseModel):
    id: int
    latitude: float
    longitude: float
    ward: Optional[str]
    address: Optional[str]
    severity: Optional[str]
    pollution_score: Optional[float]
    primary_waste_type: Optional[str]
    is_illegal: bool
    status: str
    garbage_area_m2: Optional[float]
    created_at: datetime


# ─── Leaderboard ─────────────────────────────────────────────────────────────

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    full_name: str
    ward: Optional[str]
    eco_points: int
    total_reports: int
    badge: str


# ─── AI Insights ─────────────────────────────────────────────────────────────

class AIInsight(BaseModel):
    type: str   # warning | info | success | critical
    icon: str
    title: str
    detail: str


# ─── Vehicles CRUD ───────────────────────────────────────────────────────────

class VehicleCreate(BaseModel):
    name: str
    license_plate: str
    vehicle_type: str = "garbage_truck"
    capacity_tons: float = 5.0
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    fuel_level: float = 100.0


class VehicleUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[VehicleStatus] = None
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    fuel_level: Optional[float] = None


# ─── Teams ───────────────────────────────────────────────────────────────────

class TeamOut(BaseModel):
    id: int
    name: str
    supervisor_name: Optional[str]
    supervisor_phone: Optional[str]
    member_count: int
    ward: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


# ─── Dashboard ───────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_sites: int
    critical_sites: int
    vehicles_available: int
    vehicles_total: int
    todays_cleanups: int
    pending_reports: int
    total_eco_points_awarded: int
    active_citizens: int
    illegal_dumps: int
    avg_pollution_score: float

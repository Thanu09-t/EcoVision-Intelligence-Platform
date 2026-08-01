from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.config import settings
from app.routers import auth, reports, map, analytics, routing, ai_reports, notifications, vehicles


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    print(f"[OK] EcoVision AI backend started | AI Mode: {settings.AI_MODE} | DB: Supabase ({settings.SUPABASE_URL})")
    yield
    print("[--] EcoVision AI backend shutting down")


app = FastAPI(
    title="EcoVision AI API",
    description=(
        "Intelligent Garbage Pollution Mapping & Municipal Waste Management Platform.\n\n"
        "**Roles:**\n"
        "- `citizen` – Submit reports, track status, earn eco-points\n"
        "- `municipal` – View dashboard, assign teams, generate reports\n"
        "- `admin` – Full system management\n\n"
        "**Default Demo Credentials:**\n"
        "- Citizen: citizen@demo.com / demo1234\n"
        "- Municipal: officer@demo.com / demo1234\n"
        "- Admin: admin@ecovision.ai / admin1234"
    ),
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files (uploaded images)
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Routers
app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(map.router)
app.include_router(analytics.router)
app.include_router(routing.router)
app.include_router(ai_reports.router)
app.include_router(notifications.router)
app.include_router(vehicles.router)


@app.get("/", tags=["Health"])
async def root():
    return {
        "name": "EcoVision AI API",
        "version": settings.APP_VERSION,
        "status": "operational",
        "docs": "/docs",
        "ai_mode": settings.AI_MODE,
        "database": "supabase",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy", "ai_mode": settings.AI_MODE, "database": "supabase"}


@app.get("/api/wards", tags=["GIS"])
async def get_wards():
    """Returns the list of Bengaluru wards served by this system."""
    return {
        "wards": [
            "Ward 3",  "Ward 5",  "Ward 11", "Ward 24", "Ward 27",
            "Ward 67", "Ward 68", "Ward 76", "Ward 81", "Ward 82",
            "Ward 84", "Ward 116","Ward 130","Ward 150","Ward 196",
        ]
    }

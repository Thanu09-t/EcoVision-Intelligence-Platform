from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
import traceback

from app.config import settings
from app.routers import auth, reports, map, analytics, routing, ai_reports, notifications, vehicles


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Safe lifespan that never crashes in serverless environments."""
    try:
        if settings.UPLOAD_DIR:
            os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    except Exception:
        pass
    yield


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


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all to return JSON diagnostic error instead of plain 500."""
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Internal Server Error",
            "detail": str(exc),
            "traceback": traceback.format_exc(),
        },
    )


# Safe CORS configuration
cors_origins = settings.CORS_ORIGINS
allow_creds = True
if cors_origins == ["*"] or cors_origins == "*" or (isinstance(cors_origins, list) and "*" in cors_origins):
    cors_origins = ["*"]
    allow_creds = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if isinstance(cors_origins, list) else ["*"],
    allow_credentials=allow_creds,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files (uploaded images) - safe mount
try:
    if settings.UPLOAD_DIR and os.path.exists(settings.UPLOAD_DIR):
        app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
except Exception as e:
    pass

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
@app.get("/api", include_in_schema=False)
@app.get("/api/index", include_in_schema=False)
@app.get("/api/index.py", include_in_schema=False)
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
@app.get("/api/health", tags=["Health"])
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

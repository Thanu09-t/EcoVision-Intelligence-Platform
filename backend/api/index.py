import sys
import os
import traceback
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# Add root backend directory to sys.path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

_load_error = None
try:
    from app.main import app
except BaseException as e:
    _load_error = traceback.format_exc()
    app = FastAPI(title="EcoVision AI Diagnostic Fallback")

    @app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
    async def fallback_route(full_path: str = ""):
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "Backend failed to import on Vercel",
                "error_detail": str(e),
                "traceback": _load_error,
                "python_version": sys.version,
                "sys_path": sys.path,
            },
        )

__all__ = ["app"]

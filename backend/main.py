import sys
import os

# Ensure backend root directory is in sys.path
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app.main import app

# Export for Vercel FastAPI Serverless & Uvicorn
__all__ = ["app"]

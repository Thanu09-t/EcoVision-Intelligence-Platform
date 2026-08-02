import sys
import os

# Add parent directory to sys.path so 'app' package is found on Vercel
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

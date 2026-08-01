from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # App
    APP_NAME: str = "EcoVision AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Supabase
    SUPABASE_URL: str = "https://sxeoetmpqhgkqwzakaon.supabase.co"
    SUPABASE_KEY: str = ""

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    SECRET_KEY: str = "ecovision-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # File Storage
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 10

    # AI
    AI_MODE: str = "mock"  # mock | real
    YOLO_WEIGHTS_PATH: str = "./ai/yolo/weights/best.pt"
    SAM_WEIGHTS_PATH: str = "./ai/segmentation/weights/sam2.pt"
    CLASSIFIER_WEIGHTS_PATH: str = "./ai/classifier/weights/efficientnet.pth"
    DEVICE: str = "cpu"

    # LLM
    LLM_PROVIDER: str = "template"  # template | openai | gemini
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o-mini"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
    ]

    # Frontend URLs
    LANDING_PAGE_URL: str = "http://localhost:3000"
    CITIZEN_APP_URL: str = "http://localhost:3001"
    MUNICIPAL_DASHBOARD_URL: str = "http://localhost:3002"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

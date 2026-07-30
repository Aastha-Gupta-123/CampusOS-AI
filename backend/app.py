"""CampusMate AI Backend - Production-ready FastAPI application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
import logging
import sys
import os

# Add backend directory to path for imports
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)

# Production logging configuration
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

from database import get_db, init_db
from campus_agent import CampusNavigationAgent
from hostel_agent import HostelComplaintAgent
from routes import router as api_router
from auth_routes import router as auth_router

app = FastAPI(
    title="CampusMate AI API",
    description="Multi-agent AI platform for campus navigation, hostel complaints, attendance, timetable, and more.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS - Allow all origins in production (configurable via env)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
_default_cors = f"{FRONTEND_URL},http://localhost:3000,http://127.0.0.1:3000"
CORS_ORIGINS = list(set(os.getenv("CORS_ORIGINS", _default_cors).split(",")))

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info(f"CORS configured for origins: {CORS_ORIGINS}")


class ChatResponse(BaseModel):
    answer: str


@app.on_event("startup")
def startup_event() -> None:
    """Initialize DB on startup."""
    logger.info("Initializing database...")
    try:
        init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok", "version": "1.0.0"}


# Include additional REST routes (navigate, complaints, etc.)
app.include_router(api_router)

# Include authentication routes
app.include_router(auth_router)

logger.info("CampusMate AI Backend started successfully")
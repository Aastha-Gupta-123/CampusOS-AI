from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
import logging
import sys
import os

# Add backend directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Basic logging configuration
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

from database import get_db, init_db
from campus_agent import CampusNavigationAgent
from hostel_agent import HostelComplaintAgent
from routes import router as api_router

app = FastAPI(title="CampusMate AI API")

# Allow frontend at localhost:3000
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatResponse(BaseModel):
    answer: str


@app.on_event("startup")
def startup_event() -> None:
    """Initialize DB on startup."""
    logger.info("Initializing database...")
    init_db()
    logger.info("Database initialized.")


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


# Include additional REST routes (navigate, complaints, etc.)
app.include_router(api_router)
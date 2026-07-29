"""Database utilities for the backend package.

Provides SQLAlchemy engine, `SessionLocal`, `init_db()` and `get_db()` dependency.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models import Base


DB_DIR = os.path.join(os.path.dirname(__file__), "database")
os.makedirs(DB_DIR, exist_ok=True)

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(DB_DIR, 'campus_agent.db')}")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    """Create all database tables for the backend models."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency that yields a DB session and ensures DB is initialized."""
    init_db()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
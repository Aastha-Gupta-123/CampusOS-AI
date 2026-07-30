"""SQLAlchemy models for the backend package."""
from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Text, Enum as SAEnum
from sqlalchemy.orm import declarative_base
import enum

Base = declarative_base()


class UserRole(str, enum.Enum):
    STUDENT = "student"
    FACULTY = "faculty"
    ADMIN = "admin"


class User(Base):
    """Represents a registered user of CampusMate AI."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    register_number = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=False)
    department = Column(String(100), nullable=False)
    year = Column(String(20), nullable=False)
    hostel_status = Column(String(50), nullable=False)  # "Hostel" or "Day Scholar"
    role = Column(String(20), nullable=False, default="student")
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Location(Base):
    """Represents a campus location that can be navigated to."""

    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    block = Column(String(50), nullable=False)
    floor = Column(String(50), nullable=False)
    room = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    latitude = Column(String(50), nullable=True)
    longitude = Column(String(50), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Complaint(Base):
    """Represents a hostel complaint submitted by a student."""

    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(String(50), unique=True, nullable=False, index=True)
    student_name = Column(String(255), nullable=False)
    room_number = Column(String(50), nullable=False)
    category = Column(String(50), nullable=False)
    priority = Column(String(20), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
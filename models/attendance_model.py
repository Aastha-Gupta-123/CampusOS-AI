"""
attendance_model.py
-------------------
Responsibility: Define the AttendanceRecord data class.
Converts raw dict data into a typed, structured Python object.
No business logic lives here — only data and its direct properties.
"""

from dataclasses import dataclass
from utils.attendance_calculator import calculate_percentage


@dataclass
class AttendanceRecord:
    """
    Represents a single subject's attendance record.

    Using @dataclass gives us __init__, __repr__, and __eq__ for free,
    keeping the class clean and focused on data, not boilerplate.
    """

    subject: str
    attended_classes: int
    total_classes: int
    faculty: str
    credits: int

    def attendance_percentage(self) -> float:
        """Delegate percentage calculation to the calculator utility."""
        return calculate_percentage(self.attended_classes, self.total_classes)

    @classmethod
    def from_dict(cls, data: dict) -> "AttendanceRecord":
        """
        Factory method to build an AttendanceRecord from a raw dict.
        Centralizes dict-to-object conversion in one place.
        """
        return cls(
            subject=data["subject"],
            attended_classes=data["attended_classes"],
            total_classes=data["total_classes"],
            faculty=data["faculty"],
            credits=data["credits"],
        )


@dataclass
class StudentProfile:
    """Represents the student's profile metadata."""

    name: str
    roll_number: str
    semester: int
    department: str

    @classmethod
    def from_dict(cls, data: dict) -> "StudentProfile":
        return cls(
            name=data["name"],
            roll_number=data["roll_number"],
            semester=data["semester"],
            department=data["department"],
        )

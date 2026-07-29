"""
json_reader.py
--------------
Responsibility: Open, read, validate, and return attendance.json as a Python dict.
This is the ONLY layer that touches the filesystem.
"""

import json
import os
from typing import Any


REQUIRED_STUDENT_KEYS = {"name", "roll_number", "semester", "department"}
REQUIRED_ATTENDANCE_KEYS = {"subject", "attended_classes", "total_classes", "faculty", "credits"}


def load_json(filepath: str) -> dict[str, Any]:
    """
    Load and validate the attendance JSON file.

    Args:
        filepath: Absolute or relative path to attendance.json

    Returns:
        Parsed and validated Python dict.

    Raises:
        FileNotFoundError: If the file does not exist.
        ValueError: If JSON is malformed or required keys are missing.
    """
    _ensure_file_exists(filepath)
    raw = _read_file(filepath)
    data = _parse_json(raw, filepath)
    _validate_structure(data)
    return data


def _ensure_file_exists(filepath: str) -> None:
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Attendance file not found: '{filepath}'")


def _read_file(filepath: str) -> str:
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read()


def _parse_json(raw: str, filepath: str) -> dict[str, Any]:
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in '{filepath}': {e}")


def _validate_structure(data: dict[str, Any]) -> None:
    """Ensure top-level keys and each attendance record have required fields."""
    if "student" not in data:
        raise ValueError("Missing 'student' key in attendance data.")
    if "attendance" not in data or not isinstance(data["attendance"], list):
        raise ValueError("Missing or invalid 'attendance' list in data.")

    missing_student = REQUIRED_STUDENT_KEYS - data["student"].keys()
    if missing_student:
        raise ValueError(f"Student record missing keys: {missing_student}")

    for i, record in enumerate(data["attendance"]):
        missing = REQUIRED_ATTENDANCE_KEYS - record.keys()
        if missing:
            raise ValueError(f"Attendance record [{i}] missing keys: {missing}")

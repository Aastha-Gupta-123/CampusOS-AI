"""
attendance_calculator.py
------------------------
Responsibility: Pure calculation functions.
No I/O, no state, no side effects — only math.
All functions accept AttendanceRecord objects.
"""

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.attendance_model import AttendanceRecord

MINIMUM_ATTENDANCE = 75.0
EXCELLENT_THRESHOLD = 90.0


def calculate_percentage(attended: int, total: int) -> float:
    """Return attendance percentage rounded to 2 decimal places."""
    if total == 0:
        return 0.0
    return round((attended / total) * 100, 2)


def calculate_overall(records: list["AttendanceRecord"]) -> float:
    """
    Calculate overall attendance as a weighted average using credits.
    Formula: sum(percentage * credits) / sum(credits)
    """
    total_weight = sum(r.credits for r in records)
    if total_weight == 0:
        return 0.0
    weighted_sum = sum(r.attendance_percentage() * r.credits for r in records)
    return round(weighted_sum / total_weight, 2)


def get_highest(records: list["AttendanceRecord"]) -> "AttendanceRecord":
    """Return the record with the highest attendance percentage."""
    return max(records, key=lambda r: r.attendance_percentage())


def get_lowest(records: list["AttendanceRecord"]) -> "AttendanceRecord":
    """Return the record with the lowest attendance percentage."""
    return min(records, key=lambda r: r.attendance_percentage())


def get_below_threshold(
    records: list["AttendanceRecord"], threshold: float = MINIMUM_ATTENDANCE
) -> list["AttendanceRecord"]:
    """Return records where attendance percentage is below the given threshold."""
    return [r for r in records if r.attendance_percentage() < threshold]


def get_above_threshold(
    records: list["AttendanceRecord"], threshold: float = EXCELLENT_THRESHOLD
) -> list["AttendanceRecord"]:
    """Return records where attendance percentage is at or above the given threshold."""
    return [r for r in records if r.attendance_percentage() >= threshold]


def is_eligible_for_exams(records: list["AttendanceRecord"]) -> tuple[bool, list["AttendanceRecord"]]:
    """
    Check exam eligibility.
    A student is eligible only if ALL subjects are >= MINIMUM_ATTENDANCE.

    Returns:
        (is_eligible, list_of_defaulting_subjects)
    """
    defaulters = get_below_threshold(records)
    return (len(defaulters) == 0, defaulters)

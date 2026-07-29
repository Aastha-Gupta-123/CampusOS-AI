"""
attendance_service.py
---------------------
Business logic layer. Loads data from MongoDB and exposes clean methods.
"""

from models.attendance_model import AttendanceRecord, StudentProfile
from utils.db import get_db
from utils import attendance_calculator as calc


class AttendanceService:
    def __init__(self) -> None:
        db = get_db()
        data = db.students.find_one({}, {"_id": 0})
        if not data:
            raise RuntimeError("No student data found in MongoDB. Run mongo_seeder.seed() first.")
        self.student = StudentProfile.from_dict(data)
        self.records: list[AttendanceRecord] = [
            AttendanceRecord.from_dict(r) for r in data["attendance"]
        ]

    def get_all_records(self) -> list[AttendanceRecord]:
        return self.records

    def get_overall_attendance(self) -> float:
        return calc.calculate_overall(self.records)

    def get_subject(self, keyword: str) -> AttendanceRecord | None:
        keyword = keyword.lower()
        for record in self.records:
            if keyword in record.subject.lower():
                return record
        return None

    def get_below_75(self) -> list[AttendanceRecord]:
        return calc.get_below_threshold(self.records)

    def get_above_90(self) -> list[AttendanceRecord]:
        return calc.get_above_threshold(self.records)

    def get_highest(self) -> AttendanceRecord:
        return calc.get_highest(self.records)

    def get_lowest(self) -> AttendanceRecord:
        return calc.get_lowest(self.records)

    def check_eligibility(self) -> tuple[bool, list[AttendanceRecord]]:
        return calc.is_eligible_for_exams(self.records)

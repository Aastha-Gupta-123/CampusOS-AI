"""
Attendance Agent - Smart Campus Attendance Tracking & Analysis.

Provides AI-powered attendance tracking, analysis, and querying.
Uses Groq LLM for natural language understanding of attendance queries.
"""
from __future__ import annotations

import json
import os
import logging
from typing import Any, Dict, List, Optional
from dataclasses import dataclass

from config import model

logger = logging.getLogger(__name__)

# Path to attendance data
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
ATTENDANCE_FILE = os.path.join(DATA_DIR, "attendance.json")


@dataclass
class AttendanceRecord:
    subject: str
    attended_classes: int
    total_classes: int
    faculty: str
    credits: int

    def attendance_percentage(self) -> float:
        if self.total_classes == 0:
            return 0.0
        return round((self.attended_classes / self.total_classes) * 100, 2)


@dataclass
class StudentProfile:
    name: str
    roll_number: str
    semester: int
    department: str


class AttendanceAgent:
    """AI-powered attendance assistant for students."""

    def __init__(self):
        self.student, self.records = self._load_data()
        logger.info(f"Attendance Agent initialized for {self.student.name}")

    def _load_data(self) -> tuple[StudentProfile, list[AttendanceRecord]]:
        """Load attendance data from JSON file."""
        if not os.path.exists(ATTENDANCE_FILE):
            # Try alternate path
            alt_path = os.path.join(os.path.dirname(__file__), "..", "data", "attendance.json")
            if os.path.exists(alt_path):
                filepath = alt_path
            else:
                logger.warning("Attendance data file not found")
                return StudentProfile("Unknown", "N/A", 0, "N/A"), []
        else:
            filepath = ATTENDANCE_FILE

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)

            student_data = data.get("student", {})
            student = StudentProfile(
                name=student_data.get("name", "Unknown"),
                roll_number=student_data.get("roll_number", "N/A"),
                semester=student_data.get("semester", 0),
                department=student_data.get("department", "N/A"),
            )

            records = []
            for r in data.get("attendance", []):
                records.append(AttendanceRecord(
                    subject=r.get("subject", ""),
                    attended_classes=r.get("attended_classes", 0),
                    total_classes=r.get("total_classes", 0),
                    faculty=r.get("faculty", ""),
                    credits=r.get("credits", 0),
                ))

            return student, records
        except (FileNotFoundError, json.JSONDecodeError) as e:
            logger.error(f"Failed to load attendance data: {e}")
            return StudentProfile("Unknown", "N/A", 0, "N/A"), []

    def get_overall_attendance(self) -> float:
        """Calculate overall attendance as weighted average using credits."""
        if not self.records:
            return 0.0
        total_weight = sum(r.credits for r in self.records)
        if total_weight == 0:
            return 0.0
        weighted_sum = sum(r.attendance_percentage() * r.credits for r in self.records)
        return round(weighted_sum / total_weight, 2)

    def get_below_threshold(self, threshold: float = 75.0) -> list[AttendanceRecord]:
        """Return records where attendance is below the threshold."""
        return [r for r in self.records if r.attendance_percentage() < threshold]

    def get_above_threshold(self, threshold: float = 90.0) -> list[AttendanceRecord]:
        """Return records where attendance is at or above the threshold."""
        return [r for r in self.records if r.attendance_percentage() >= threshold]

    def check_eligibility(self) -> tuple[bool, list[AttendanceRecord]]:
        """Check exam eligibility. Eligible only if ALL subjects >= 75%."""
        defaulters = self.get_below_threshold()
        return (len(defaulters) == 0, defaulters)

    def get_subject(self, keyword: str) -> Optional[AttendanceRecord]:
        """Find a subject by keyword."""
        keyword = keyword.lower()
        for record in self.records:
            if keyword in record.subject.lower():
                return record
        return None

    def ask(self, question: str) -> str:
        """Process a natural language attendance query."""
        if not question or not question.strip():
            return "Please ask me a question about your attendance!"

        if not self.records:
            return "Attendance data is not available. Please check the data file."

        # Build context for the LLM
        subject_lines = []
        for r in self.records:
            pct = r.attendance_percentage()
            status = "SHORTAGE" if pct < 75 else ("EXCELLENT" if pct >= 90 else "OK")
            subject_lines.append(
                f"  - {r.subject}: {r.attended_classes}/{r.total_classes} classes "
                f"= {pct:.1f}% [{status}] | Faculty: {r.faculty} | Credits: {r.credits}"
            )

        overall = self.get_overall_attendance()
        eligible, defaulters = self.check_eligibility()
        defaulter_names = ", ".join(r.subject for r in defaulters) if defaulters else "None"

        context = (
            f"STUDENT PROFILE:\n"
            f"  Name       : {self.student.name}\n"
            f"  Roll No    : {self.student.roll_number}\n"
            f"  Department : {self.student.department}\n"
            f"  Semester   : {self.student.semester}\n\n"
            f"ATTENDANCE DATA:\n"
            f"{chr(10).join(subject_lines)}\n\n"
            f"SUMMARY:\n"
            f"  Overall Attendance (weighted by credits) : {overall:.1f}%\n"
            f"  Exam Eligibility                         : {'ELIGIBLE' if eligible else 'NOT FULLY ELIGIBLE'}\n"
            f"  Subjects with shortage (<75%)            : {defaulter_names}\n"
        )

        # Try AI response first
        if model is not None:
            try:
                prompt = (
                    f"You are SmartCampus, an AI Attendance Assistant for a college student.\n\n"
                    f"{context}\n"
                    f"RULES:\n"
                    f"1. Answer ONLY attendance-related questions using the data above.\n"
                    f"2. If asked about a subject, always show: attended/total, percentage, faculty, status.\n"
                    f"3. If asked about eligibility, list all shortage subjects and classes needed to reach 75%.\n"
                    f"4. For 'classes needed to reach 75%', calculate: needed = smallest N where (attended + N) / (total + N) >= 0.75\n"
                    f"5. Keep responses concise, structured, and professional.\n"
                    f"6. Use bullet points or tables where appropriate.\n"
                    f"7. If the question is not attendance-related, politely say you can only help with attendance.\n"
                    f"8. Never make up data — use only the numbers provided above.\n\n"
                    f"Student Question: {question}"
                )
                messages = [{"role": "user", "content": prompt}]
                resp = model.invoke(messages)
                return resp.content if hasattr(resp, "content") else str(resp)
            except Exception as e:
                logger.warning(f"AI response failed: {e}")

        # Fallback response
        return self._fallback_response(question, overall, eligible, defaulter_names)

    def _fallback_response(self, question: str, overall: float, eligible: bool, defaulter_names: str) -> str:
        """Generate a fallback response without AI."""
        q = question.lower()
        if "overall" in q or "percentage" in q:
            return f"Your overall attendance is {overall:.1f}%."
        elif "eligible" in q or "exam" in q:
            if eligible:
                return "You are eligible for exams! All subjects meet the 75% threshold."
            else:
                return f"You are NOT fully eligible. Subjects with shortage: {defaulter_names}"
        elif "subject" in q or "class" in q:
            for r in self.records:
                if r.subject.lower().split()[-1] in q:
                    return f"{r.subject}: {r.attended_classes}/{r.total_classes} = {r.attendance_percentage():.1f}% | Faculty: {r.faculty}"
            return f"Please specify a subject. Available: {', '.join(r.subject for r in self.records)}"
        else:
            return (
                f"I can help you with attendance queries! Try asking:\n"
                f"- What is my overall attendance?\n"
                f"- Am I eligible for exams?\n"
                f"- How is my attendance in [subject]?\n"
                f"- Which subjects have shortage?"
            )

    def get_summary(self) -> Dict[str, Any]:
        """Get a summary of attendance data for the dashboard."""
        overall = self.get_overall_attendance()
        eligible, defaulters = self.check_eligibility()
        return {
            "student_name": self.student.name,
            "roll_number": self.student.roll_number,
            "department": self.student.department,
            "semester": self.student.semester,
            "overall_attendance": overall,
            "eligible": eligible,
            "defaulters": [r.subject for r in defaulters],
            "total_subjects": len(self.records),
            "subjects": [
                {
                    "name": r.subject,
                    "attended": r.attended_classes,
                    "total": r.total_classes,
                    "percentage": r.attendance_percentage(),
                    "faculty": r.faculty,
                    "credits": r.credits,
                    "status": "excellent" if r.attendance_percentage() >= 90 else ("good" if r.attendance_percentage() >= 75 else "danger"),
                }
                for r in self.records
            ],
        }
"""
Timetable Agent - Smart Campus Timetable Assistant.

Provides AI-powered timetable querying using Groq LLM.
Handles natural language queries about class schedules.
"""
from __future__ import annotations

import json
import os
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta

from config import model

logger = logging.getLogger(__name__)

# Path to timetable data
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
TIMETABLE_FILE = os.path.join(DATA_DIR, "timetable.json")

# Day name mappings
DAY_ALIASES = {
    "monday": "Monday", "tuesday": "Tuesday", "wednesday": "Wednesday",
    "thursday": "Thursday", "friday": "Friday", "saturday": "Saturday", "sunday": "Sunday",
    "mon": "Monday", "tue": "Tuesday", "wed": "Wednesday",
    "thu": "Thursday", "fri": "Friday", "sat": "Saturday", "sun": "Sunday",
}


class TimetableAgent:
    """AI-powered timetable assistant for students."""

    def __init__(self):
        self.raw_data = self._load_data()
        logger.info("Timetable Agent initialized")

    def _load_data(self) -> dict:
        """Load timetable data from JSON file."""
        if not os.path.exists(TIMETABLE_FILE):
            alt_path = os.path.join(os.path.dirname(__file__), "..", "data", "timetable.json")
            if os.path.exists(alt_path):
                filepath = alt_path
            else:
                logger.warning("Timetable data file not found")
                return {}
        else:
            filepath = TIMETABLE_FILE

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            logger.error(f"Failed to load timetable data: {e}")
            return {}

    def detect_day(self, query: str) -> Optional[str]:
        """Detect the target day from the user's query."""
        query_lower = query.lower()

        if "today" in query_lower:
            return datetime.now().strftime("%A")
        if "tomorrow" in query_lower:
            return (datetime.now() + timedelta(days=1)).strftime("%A")

        for keyword, day_name in DAY_ALIASES.items():
            if keyword in query_lower:
                return day_name

        return None

    def get_timetable(self, day: str) -> list:
        """Retrieve resolved class list for a given day."""
        timetable = self.raw_data.get("timetable", {})
        time_slots = self.raw_data.get("time_slots", [])
        subjects_list = self.raw_data.get("subjects", [])
        additional = self.raw_data.get("additional_hours", [])

        subject_map = {s["short_name"]: s for s in subjects_list}

        additional_map = {}
        for item in additional:
            if isinstance(item, dict):
                additional_map[item["short_name"]] = item
            else:
                additional_map[item] = {"short_name": item, "title": item, "faculty": "—"}

        periods = [slot for slot in time_slots if "period" in slot]
        day_codes = timetable.get(day, [])
        classes = []

        for i, code in enumerate(day_codes):
            if code is None:
                continue

            time = periods[i]["time"] if i < len(periods) else "N/A"

            if code in additional_map:
                a = additional_map[code]
                classes.append({
                    "time": time,
                    "subject": a.get("title", code),
                    "faculty": a.get("faculty", "—"),
                    "room": "—",
                })
            elif code in subject_map:
                s = subject_map[code]
                faculty = s.get("faculty", "TBA")
                if "options" in s and not faculty:
                    opts = ", ".join(o["title"] for o in s["options"])
                    faculty = f"Elective options: {opts}"
                classes.append({
                    "time": time,
                    "subject": s.get("course_title", code),
                    "faculty": faculty or "TBA",
                    "room": s.get("venue", "TBA"),
                })
            else:
                classes.append({
                    "time": time,
                    "subject": code,
                    "faculty": "TBA",
                    "room": "TBA",
                })

        return classes

    def handle_query(self, query: str) -> str:
        """Process a natural language timetable query."""
        if not query or not query.strip():
            return "Please ask me a question about your timetable!"

        if not self.raw_data:
            return "Timetable data is unavailable. Please check the data file."

        day = self.detect_day(query)

        if day is None:
            return (
                "I couldn't detect a specific day in your query.\n"
                "Try asking:\n"
                "  - 'What is my timetable today?'\n"
                "  - 'Show Monday timetable'\n"
                "  - 'What is my first class tomorrow?'"
            )

        classes = self.get_timetable(day)

        if not classes:
            return f"No classes scheduled for {day}. Enjoy your free day! 🎉"

        # Try AI response
        if model is not None:
            try:
                meta = self.raw_data.get("metadata", {})
                timetable_text = json.dumps({day: classes}, indent=2)
                prompt = (
                    f"You are a helpful Smart Campus Timetable Assistant.\n"
                    f"Class Info:\n"
                    f"Department : {meta.get('department', 'N/A')}\n"
                    f"Class      : {meta.get('class', 'N/A')}\n"
                    f"Semester   : {meta.get('semester', 'N/A')}\n"
                    f"Advisor    : {meta.get('class_advisor', 'N/A')}\n\n"
                    f"A student asked: '{query}'\n\n"
                    f"Here is the timetable data for {day}:\n{timetable_text}\n\n"
                    f"Instructions:\n"
                    f"- Answer the student's question directly using only the data above.\n"
                    f"- If they asked for the full timetable, list all classes clearly with time, subject, faculty, and room.\n"
                    f"- If they asked for the first class, show only the first entry.\n"
                    f"- Be friendly, concise, and well-formatted.\n"
                    f"- Do not make up any information not present in the data."
                )
                messages = [{"role": "user", "content": prompt}]
                resp = model.invoke(messages)
                return resp.content if hasattr(resp, "content") else str(resp)
            except Exception as e:
                logger.warning(f"AI response failed: {e}")

        # Fallback plain text response
        meta = self.raw_data.get("metadata", {})
        lines = [f"📚 {meta.get('class', '')} | {day} ({len(classes)} classes)"]
        lines.append("-" * 60)
        for idx, cls in enumerate(classes, start=1):
            lines.append(f"{idx}. {cls['time']} - {cls['subject']} | {cls['faculty']} | {cls['room']}")
        return "\n".join(lines)

    def get_summary(self) -> Dict[str, Any]:
        """Get a summary of timetable data for the dashboard."""
        meta = self.raw_data.get("metadata", {})
        timetable = self.raw_data.get("timetable", {})
        total_classes = sum(len(v) for v in timetable.values() if v)
        return {
            "department": meta.get("department", "N/A"),
            "class": meta.get("class", "N/A"),
            "semester": meta.get("semester", "N/A"),
            "advisor": meta.get("class_advisor", "N/A"),
            "total_days": len(timetable),
            "total_classes_per_week": total_classes,
            "days": list(timetable.keys()),
        }
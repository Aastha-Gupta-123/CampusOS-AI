"""Hostel complaint agent for the backend package.

Provides `HostelComplaintAgent` which classifies complaint category, assigns
priority, stores complaints in the database, and returns acknowledgement
messages (optionally using the ChatGroq `model`).
"""
from __future__ import annotations

import re
from datetime import datetime
from typing import Any, Dict, Optional

from sqlalchemy.orm import Session

from config import model
from models import Complaint


class HostelComplaintAgent:
    """Handles parsing, prioritization and storage of hostel complaints."""

    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def _normalize_category(text: str) -> str:
        t = (text or "").lower()
        if "water" in t or "leak" in t:
            return "Water"
        if "wifi" in t or "internet" in t:
            return "WiFi"
        if "power" in t or "electric" in t or "outage" in t:
            return "Electricity"
        if "clean" in t or "cleaning" in t or "dirty" in t:
            return "Cleaning"
        if "chair" in t or "table" in t or "furniture" in t or "bed" in t:
            return "Furniture"
        return "Other"

    @staticmethod
    def _prioritize(text: str) -> str:
        t = (text or "").lower()
        if any(k in t for k in ["no water", "no electricity", "power outage", "danger", "fire"]):
            return "High"
        if any(k in t for k in ["slow", "intermittent", "minor", "sometimes"]):
            return "Medium"
        return "Low"

    def _next_complaint_id(self) -> str:
        return f"CMP-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

    def _generate_ai_acknowledgement(self, complaint) -> Optional[str]:
        """Use LLM to generate a friendly acknowledgement."""
        if model is None:
            return None
        try:
            prompt = (
                f"Write a concise, friendly acknowledgement for a hostel complaint:\n"
                f"Complaint ID: {complaint.complaint_id}\n"
                f"Category: {complaint.category}\n"
                f"Priority: {complaint.priority}\n"
                f"Room: {complaint.room_number}\n"
                f"Description: {complaint.description}\n\n"
                f"Respond with a short confirmation and next steps for resolution. Keep it to 3-4 sentences."
            )
            messages = [{"role": "user", "content": prompt}]
            resp = model.invoke(messages)
            return resp.content if hasattr(resp, 'content') else str(resp)
        except Exception:
            return None

    def create_complaint(self, student_name: str, room_number: str, description: str) -> Dict[str, Any]:
        if not description or not description.strip():
            raise ValueError("Description is required for a complaint.")

        student_name = (student_name or "Anonymous").strip() or "Anonymous"
        room_number = (room_number or "Unknown").strip() or "Unknown"

        category = self._normalize_category(description)
        priority = self._prioritize(description)
        complaint_id = self._next_complaint_id()

        complaint = Complaint(
            complaint_id=complaint_id,
            student_name=student_name,
            room_number=room_number,
            category=category,
            priority=priority,
            description=description.strip(),
            status="Pending",
        )
        self.db.add(complaint)
        self.db.commit()
        self.db.refresh(complaint)

        ai_message = self._generate_ai_acknowledgement(complaint)
        message = ai_message or "Your complaint has been registered. We will address it shortly."

        return {
            "success": True,
            "message": message,
            "complaint": {
                "id": complaint.id,
                "complaint_id": complaint.complaint_id,
                "student_name": complaint.student_name,
                "room_number": complaint.room_number,
                "category": complaint.category,
                "priority": complaint.priority,
                "description": complaint.description,
                "status": complaint.status,
                "created_at": complaint.created_at.isoformat() if complaint.created_at else None,
            },
        }

    def create_complaint_from_text(self, text: str, student_name: Optional[str] = None) -> Dict[str, Any]:
        if not text or not text.strip():
            raise ValueError("Complaint text cannot be empty.")

        room = "Unknown"
        m = re.search(r"room\s*#?\s*(\w+)", text, re.IGNORECASE)
        if m:
            room = m.group(1)
        else:
            m = re.search(r"rm\s*#?\s*(\w+)", text, re.IGNORECASE)
            if m:
                room = m.group(1)
            else:
                m = re.search(r"\b(\d{2,4})\b", text)
                if m:
                    room = m.group(1)

        name = student_name or "Anonymous"
        return self.create_complaint(student_name=name, room_number=room, description=text)

    def get_complaint(self, complaint_id: str) -> Optional[Dict[str, Any]]:
        c = self.db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
        if not c:
            return None
        return {
            "id": c.id,
            "complaint_id": c.complaint_id,
            "student_name": c.student_name,
            "room_number": c.room_number,
            "category": c.category,
            "priority": c.priority,
            "description": c.description,
            "status": c.status,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }

    def list_complaints(self) -> list[Dict[str, Any]]:
        rows = self.db.query(Complaint).order_by(Complaint.created_at.desc()).all()
        return [
            {
                "id": r.id,
                "complaint_id": r.complaint_id,
                "student_name": r.student_name,
                "room_number": r.room_number,
                "category": r.category,
                "priority": r.priority,
                "description": r.description,
                "status": r.status,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rows
        ]

    def update_status(self, complaint_id: str, status: str) -> Dict[str, Any]:
        c = self.db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
        if not c:
            raise ValueError("Complaint not found")
        allowed = {"Pending", "In Progress", "Resolved", "Closed"}
        s = status.strip().title()
        if s not in allowed:
            raise ValueError("Invalid status")
        c.status = s
        self.db.commit()
        self.db.refresh(c)
        return {"success": True, "complaint_id": c.complaint_id, "status": c.status}
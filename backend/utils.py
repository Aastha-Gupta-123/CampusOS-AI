"""Utility helpers used across the backend package."""
from datetime import datetime
import re


def sanitize_text(text: str) -> str:
    return (text or "").strip()


def extract_room_number(text: str) -> str:
    if not text:
        return "Unknown"
    m = re.search(r"room\s*#?\s*(\w+)", text, re.IGNORECASE)
    if m:
        return m.group(1)
    m = re.search(r"rm\s*#?\s*(\w+)", text, re.IGNORECASE)
    if m:
        return m.group(1)
    m = re.search(r"\b(\d{2,4})\b", text)
    if m:
        return m.group(1)
    return "Unknown"


def now_iso() -> str:
    return datetime.utcnow().isoformat()

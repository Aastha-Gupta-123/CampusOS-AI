"""Helper services that use the configured AI model for intent detection
and classification while providing safe fallbacks.
"""
from typing import Optional, Dict

from .config import model


def detect_intent(text: str) -> str:
    """Return 'complaint' or 'navigation'. Use model if available, else keywords."""
    t = (text or "").strip()
    if not t:
        return "navigation"

    # Try model-based intent detection
    if model is not None:
        try:
            prompt = f"Classify the intent of this user message as either 'complaint' or 'navigation':\n\nMessage: {t}\n\nRespond with only the single word 'complaint' or 'navigation'."
            resp = model.generate_text(prompt)
            if resp:
                r = resp.strip().lower()
                if "complaint" in r:
                    return "complaint"
                if "navigation" in r:
                    return "navigation"
        except Exception:
            pass

    # Keyword fallback
    complaint_keywords = ["water", "wifi", "internet", "power", "electric", "toilet", "bathroom", "clean", "broken", "leak", "fan"]
    if any(k in t.lower() for k in complaint_keywords):
        return "complaint"
    return "navigation"


def classify_complaint(text: str) -> Dict[str, str]:
    """Return category and priority for a complaint text."""
    # Delegate to model if possible
    if model is not None:
        try:
            prompt = (
                "Given the complaint text, return a JSON object with keys 'category' and 'priority'.\n"
                f"Complaint: {text}\n\nRespond with strict JSON."
            )
            resp = model.generate_text(prompt)
            if resp:
                # attempt to parse naive JSON from the response
                import json

                try:
                    parsed = json.loads(resp)
                    return {"category": parsed.get("category", "Other"), "priority": parsed.get("priority", "Low")}
                except Exception:
                    pass
        except Exception:
            pass

    # Simple heuristic fallback
    t = text.lower()
    if "water" in t or "leak" in t:
        return {"category": "Water", "priority": "High"}
    if "wifi" in t or "internet" in t:
        return {"category": "WiFi", "priority": "Medium"}
    if "power" in t or "electric" in t or "outage" in t:
        return {"category": "Electricity", "priority": "High"}
    if any(k in t for k in ["chair", "table", "furni", "bed"]):
        return {"category": "Furniture", "priority": "Low"}
    if any(k in t for k in ["clean", "dirty"]):
        return {"category": "Cleaning", "priority": "Low"}
    return {"category": "Other", "priority": "Low"}


def estimate_walking_time_mins() -> int:
    # Placeholder: small constant for demo
    return 5

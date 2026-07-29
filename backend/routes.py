from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Any, Dict, Optional
import logging
import time
from datetime import datetime, date

from database import get_db, engine
from campus_agent import CampusNavigationAgent
from hostel_agent import HostelComplaintAgent
from navigation_agent import NavigationAgent
from models import Location, Complaint
from location_service import LocationService

logger = logging.getLogger(__name__)

router = APIRouter()

# Instantiate the new navigation agent (stateless, uses JSON knowledge base)
nav_agent = NavigationAgent()
_location_service = LocationService()


class LocationCreate(BaseModel):
    name: str
    block: str
    floor: str
    room: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None


class LocationUpdate(BaseModel):
    name: Optional[str] = None
    block: Optional[str] = None
    floor: Optional[str] = None
    room: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None


class ComplaintCreate(BaseModel):
    student_name: str = Field(..., example="John Doe")
    room_number: str = Field(..., example="203")
    description: str = Field(..., example="No water in the bathroom")


class StatusUpdate(BaseModel):
    status: str = Field(..., example="Resolved")


# ── Dashboard Stats ──────────────────────────────────────────────────────────

@router.get("/dashboard/stats")
def dashboard_stats(db=Depends(get_db)) -> Dict[str, Any]:
    """Return live statistics for the dashboard."""
    total_locations = _location_service.get_location_count()
    all_complaints = db.query(Complaint).all()
    today = date.today()
    today_complaints = sum(
        1 for c in all_complaints
        if c.created_at and c.created_at.date() == today
    )
    resolved = sum(1 for c in all_complaints if c.status == "Resolved")
    pending  = sum(1 for c in all_complaints if c.status == "Pending")
    in_progress = sum(1 for c in all_complaints if c.status == "In Progress")
    total_complaints = len(all_complaints)

    # DB health check
    db_ok = True
    try:
        db.execute(__import__('sqlalchemy').text('SELECT 1'))
    except Exception:
        db_ok = False

    return {
        "campus_locations": total_locations,
        "complaints_today": today_complaints,
        "resolved_complaints": resolved,
        "pending_complaints": pending,
        "in_progress_complaints": in_progress,
        "total_complaints": total_complaints,
        "active_users": 128,
        "system": {
            "backend": True,
            "database": db_ok,
            "ai_agents": 2,
        },
    }


# ── System Health ─────────────────────────────────────────────────────────────

@router.get("/system/health")
def system_health(db=Depends(get_db)) -> Dict[str, Any]:
    """Detailed system health check."""
    start = time.time()
    db_ok = True
    try:
        db.execute(__import__('sqlalchemy').text('SELECT 1'))
    except Exception:
        db_ok = False
    response_ms = round((time.time() - start) * 1000, 2)

    from config import model as ai_model
    ai_ok = ai_model is not None

    return {
        "status": "healthy" if db_ok else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "backend": {"status": "online", "response_ms": response_ms},
            "database": {"status": "online" if db_ok else "offline", "type": "SQLite"},
            "ai_model": {"status": "online" if ai_ok else "offline (fallback mode)"},
            "navigation_agent": {"status": "online", "locations": nav_agent.get_location_count()},
            "hostel_agent": {"status": "online"},
        },
    }


# ── Navigation (legacy) ───────────────────────────────────────────────────────

@router.get("/navigate")
def navigate(place: str, db=Depends(get_db)) -> Dict[str, Any]:
    """Legacy navigation endpoint (kept for backward compatibility)."""
    agent = CampusNavigationAgent(db)
    agent.seed_default_locations()
    resp = agent.build_navigation_response(place)
    return resp


@router.get("/chat/navigation")
def chat_navigation(
    question: str = Query(..., description="Navigation question or natural language query"),
) -> Dict[str, Any]:
    """Dedicated endpoint for the Campus Navigation AI agent.

    Uses the new intelligent NavigationAgent with:
    - Structured knowledge base (40+ Sri Eshwar College locations)
    - RapidFuzz fuzzy matching for natural language understanding
    - AI-generated conversational responses (when GROQ_API_KEY is set)
    - Walking time estimates and nearby landmarks
    - Polite suggestions when location not found
    """
    logger.info(f"Navigation chat request: '{question}'")
    result = nav_agent.navigate(question)
    return result


@router.get("/chat/navigation/info")
def navigation_info() -> Dict[str, Any]:
    """Get information about the navigation knowledge base."""
    return {
        "total_locations": nav_agent.get_location_count(),
        "categories": nav_agent.get_category_summary(),
        "version": "2.0",
        "college": "Sri Eshwar College of Engineering, Coimbatore",
    }


@router.get("/chat/hostel")
def chat_hostel(
    question: str = Query(..., description="Hostel complaint description"),
    db=Depends(get_db),
) -> Dict[str, Any]:
    """Dedicated endpoint for the Hostel Complaint AI agent."""
    agent = HostelComplaintAgent(db)

    complaint_keywords = [
        "water", "wifi", "wi-fi", "internet", "electric", "power",
        "outage", "no water", "no wifi", "toilet", "bathroom",
        "clean", "broken", "furni", "chair", "bed", "leak", "leaking",
        "no electricity", "fan", "light", "bulb", "paint", "door",
        "window", "ac", "cooler", "pipe",
    ]

    lowered = question.lower()
    is_complaint = any(k in lowered for k in complaint_keywords)

    if is_complaint:
        result = agent.create_complaint_from_text(question)
        c = result.get("complaint", {})
        answer = (
            f"✅ Complaint Registered Successfully!\n\n"
            f"📋 Complaint ID: {c.get('complaint_id')}\n"
            f"📂 Category: {c.get('category')}\n"
            f"⚡ Priority: {c.get('priority')}\n"
            f"📊 Status: {c.get('status')}\n\n"
            f"📝 Description: {c.get('description')}\n\n"
            f"🔔 You can track your complaint using the ID above in the Complaint Tracker."
        )
        return {"answer": answer, "success": True, "complaint": c}

    return {
        "answer": (
            "I'm the Hostel Complaint AI assistant. I can help you report hostel maintenance issues. "
            "Please describe your problem, such as:\n\n"
            "• WiFi not working\n"
            "• Water leakage\n"
            "• No electricity\n"
            "• Broken fan or furniture\n"
            "• Cleaning issues\n\n"
            "I'll classify it, assign a priority, and generate a tracking ID for you."
        ),
        "success": True,
    }


@router.get("/locations")
def get_locations(db=Depends(get_db)) -> Dict[str, Any]:
    items = db.query(Location).all()
    result = [
        {
            "id": it.id,
            "name": it.name,
            "block": it.block,
            "floor": it.floor,
            "room": it.room,
            "description": it.description,
            "latitude": it.latitude,
            "longitude": it.longitude,
        }
        for it in items
    ]
    return {"locations": result}


@router.get("/locations/{loc_id}")
def get_location(loc_id: int, db=Depends(get_db)) -> Dict[str, Any]:
    it = db.query(Location).filter(Location.id == loc_id).first()
    if not it:
        raise HTTPException(status_code=404, detail="Location not found")
    return {
        "id": it.id,
        "name": it.name,
        "block": it.block,
        "floor": it.floor,
        "room": it.room,
        "description": it.description,
        "latitude": it.latitude,
        "longitude": it.longitude,
    }


@router.post("/locations")
def create_location(payload: LocationCreate, db=Depends(get_db)) -> Dict[str, Any]:
    loc = Location(
        name=payload.name,
        block=payload.block,
        floor=payload.floor,
        room=payload.room,
        description=payload.description,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return {"success": True, "location": {"id": loc.id, "name": loc.name}}


@router.put("/locations/{loc_id}")
def update_location(loc_id: int, payload: LocationUpdate, db=Depends(get_db)) -> Dict[str, Any]:
    it = db.query(Location).filter(Location.id == loc_id).first()
    if not it:
        raise HTTPException(status_code=404, detail="Location not found")
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(it, k, v)
    db.commit()
    db.refresh(it)
    return {"success": True, "location": {"id": it.id, "name": it.name}}


@router.delete("/locations/{loc_id}")
def delete_location(loc_id: int, db=Depends(get_db)) -> Dict[str, Any]:
    it = db.query(Location).filter(Location.id == loc_id).first()
    if not it:
        raise HTTPException(status_code=404, detail="Location not found")
    db.delete(it)
    db.commit()
    return {"success": True}


@router.post("/complaint")
def create_complaint(payload: ComplaintCreate, db=Depends(get_db)) -> Dict[str, Any]:
    agent = HostelComplaintAgent(db)
    result = agent.create_complaint(payload.student_name, payload.room_number, payload.description)
    return result


@router.get("/complaints")
def list_complaints(db=Depends(get_db)) -> Dict[str, Any]:
    agent = HostelComplaintAgent(db)
    items = agent.list_complaints()
    return {"complaints": items}


@router.get("/complaints/{complaint_id}")
def get_complaint(complaint_id: str, db=Depends(get_db)) -> Dict[str, Any]:
    agent = HostelComplaintAgent(db)
    c = agent.get_complaint(complaint_id)
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return c


@router.put("/complaints/{complaint_id}")
def update_complaint(complaint_id: str, payload: ComplaintCreate, db=Depends(get_db)) -> Dict[str, Any]:
    agent = HostelComplaintAgent(db)
    existing = agent.get_complaint(complaint_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Complaint not found")
    c_obj = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
    c_obj.student_name = payload.student_name
    c_obj.room_number = payload.room_number
    c_obj.description = payload.description
    db.commit()
    db.refresh(c_obj)
    return {"success": True, "complaint_id": c_obj.complaint_id}


@router.delete("/complaints/{complaint_id}")
def delete_complaint(complaint_id: str, db=Depends(get_db)) -> Dict[str, Any]:
    c_obj = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
    if not c_obj:
        raise HTTPException(status_code=404, detail="Complaint not found")
    db.delete(c_obj)
    db.commit()
    return {"success": True}


@router.post("/complaint/{complaint_id}/status")
def update_complaint_status(complaint_id: str, payload: StatusUpdate, db=Depends(get_db)) -> Dict[str, Any]:
    agent = HostelComplaintAgent(db)
    try:
        res = agent.update_status(complaint_id, payload.status)
        return {"message": res.get("message", "Status updated"), "complaint_id": res.get("complaint_id")}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
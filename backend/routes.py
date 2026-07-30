from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Any, Dict, Optional
import logging
import time
from datetime import datetime, date

from database import get_db, engine
from learning_agent import LearningCoachAgent
from placement_agent import PlacementAgent
from campus_agent import CampusNavigationAgent
from hostel_agent import HostelComplaintAgent
from navigation_agent import NavigationAgent
from attendance_agent import AttendanceAgent
from timetable_agent import TimetableAgent
from orchestrator_agent import OrchestratorAgent
from models import Location, Complaint
from location_service import LocationService

logger = logging.getLogger(__name__)

router = APIRouter()

# Instantiate agents
nav_agent = NavigationAgent()
attendance_agent = AttendanceAgent()
timetable_agent = TimetableAgent()
placement_agent = PlacementAgent()
learning_coach_agent = LearningCoachAgent()
orchestrator = OrchestratorAgent()
_location_service = LocationService()


class CampusOSRequest(BaseModel):
    mode: str = Field(..., example="learning")
    subject: Optional[str] = ""
    current_skill_level: Optional[str] = "beginner"
    exam_date: Optional[str] = ""
    study_hours_per_day: Optional[int] = 2
    company_name: Optional[str] = ""
    job_role: Optional[str] = ""
    current_skills: Optional[str] = ""
    experience_level: Optional[str] = "fresher"


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

    # Get attendance and timetable summaries
    att_summary = attendance_agent.get_summary()
    tt_summary = timetable_agent.get_summary()

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
        "overall_attendance": att_summary.get("overall_attendance", 0),
        "total_subjects": att_summary.get("total_subjects", 0),
        "classes_per_week": tt_summary.get("total_classes_per_week", 0),
        "system": {
            "backend": True,
            "database": db_ok,
            "ai_agents": 4,
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

    agents_status = orchestrator.get_agents_status()

    return {
        "status": "healthy" if db_ok else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "backend": {"status": "online", "response_ms": response_ms},
            "database": {"status": "online" if db_ok else "offline", "type": "SQLite"},
            "ai_model": {"status": "online" if ai_ok else "offline (fallback mode)"},
            "navigation_agent": {"status": "online", "locations": nav_agent.get_location_count()},
            "hostel_agent": {"status": "online"},
            "attendance_agent": {"status": "online", "student": agents_status.get("attendance", {}).get("student", "N/A")},
            "timetable_agent": {"status": "online"},
            "orchestrator": {"status": "online", "agents": len(agents_status)},
        },
    }


# ── Master Orchestrator ──────────────────────────────────────────────────

@router.get("/chat")
def chat(
    question: str = Query(..., description="User question for any AI agent"),
    db=Depends(get_db),
) -> Dict[str, Any]:
    """Master Orchestrator endpoint - routes queries to the appropriate AI agent automatically."""
    logger.info(f"Orchestrator request: '{question}'")
    result = orchestrator.process(question, db)
    return result


@router.get("/orchestrator/status")
def orchestrator_status() -> Dict[str, Any]:
    """Get status of all AI agents managed by the orchestrator."""
    return {
        "success": True,
        "agents": orchestrator.get_agents_status(),
    }


# ── Attendance Agent ──────────────────────────────────────────────────

@router.get("/chat/attendance")
def chat_attendance(
    question: str = Query(..., description="Attendance question"),
) -> Dict[str, Any]:
    """Dedicated endpoint for the Attendance AI agent."""
    logger.info(f"Attendance chat request: '{question}'")
    result = attendance_agent.ask(question)
    summary = attendance_agent.get_summary()
    return {
        "success": True,
        "message": result,
        "agent": "attendance",
        "data": summary,
    }


@router.get("/attendance/summary")
def attendance_summary() -> Dict[str, Any]:
    """Get attendance summary for the dashboard."""
    return attendance_agent.get_summary()


# ── Timetable Agent ──────────────────────────────────────────────────

@router.get("/chat/timetable")
def chat_timetable(
    question: str = Query(..., description="Timetable question"),
) -> Dict[str, Any]:
    """Dedicated endpoint for the Timetable AI agent."""
    logger.info(f"Timetable chat request: '{question}'")
    result = timetable_agent.handle_query(question)
    summary = timetable_agent.get_summary()
    return {
        "success": True,
        "message": result,
        "agent": "timetable",
        "data": summary,
    }


@router.get("/timetable/summary")
def timetable_summary() -> Dict[str, Any]:
    """Get timetable summary for the dashboard."""
    return timetable_agent.get_summary()


# ── Navigation ───────────────────────────────────────────────────────

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
    """Dedicated endpoint for the Campus Navigation AI agent."""
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


# ── Hostel / Complaints ────────────────────────────────────────────────

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


# ── Location CRUD ────────────────────────────────────────────────────

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


# ── Complaint CRUD ──────────────────────────────────────────────────

@router.post("/complaint", status_code=201)
def create_complaint(payload: ComplaintCreate, db=Depends(get_db)) -> Dict[str, Any]:
    agent = HostelComplaintAgent(db)
    result = agent.create_complaint(payload.student_name, payload.room_number, payload.description)
    return result


@router.get("/complaints")
def list_complaints(db=Depends(get_db)) -> Dict[str, Any]:
    agent = HostelComplaintAgent(db)
    items = agent.list_complaints()
    return {"complaints": items}


@router.get("/complaint/{complaint_id}")
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


# ── Placement Agent ──────────────────────────────────────────────────

class PlacementRequest(BaseModel):
    company_name: str
    job_role: str
    current_skills: Optional[str] = ""
    experience_level: Optional[str] = "fresher"


@router.post("/chat/placement")
def chat_placement(payload: PlacementRequest) -> Dict[str, Any]:
    """Dedicated endpoint for the Placement Preparation AI agent."""
    logger.info(f"Placement request: {payload.company_name} - {payload.job_role}")
    result = placement_agent.generate_plan(
        company_name=payload.company_name,
        job_role=payload.job_role,
        current_skills=payload.current_skills,
        experience_level=payload.experience_level,
    )
    return {
        "success": True,
        "message": "Placement plan generated successfully!",
        "agent": "placement",
        "data": result,
    }


# ── Learning Coach Agent ──────────────────────────────────────────────────

class LearningRequest(BaseModel):
    subject: str
    current_skill_level: Optional[str] = "beginner"
    exam_date: Optional[str] = ""
    study_hours_per_day: Optional[int] = 2


@router.post("/chat/learning")
def chat_learning(payload: LearningRequest) -> Dict[str, Any]:
    """Dedicated endpoint for the Learning Coach AI agent."""
    logger.info(f"Learning request: {payload.subject} - {payload.current_skill_level}")
    result = learning_coach_agent.generate_plan(
        subject=payload.subject,
        current_skill_level=payload.current_skill_level,
        exam_date=payload.exam_date,
        study_hours_per_day=payload.study_hours_per_day,
    )
    return {
        "success": True,
        "message": "Study plan generated successfully!",
        "agent": "learning",
        "data": result,
    }


@router.post("/chat/campusos")
def chat_campusos(payload: CampusOSRequest) -> Dict[str, Any]:
    """CampusOS-AI integration endpoint that supports learning and placement modes."""
    mode = (payload.mode or "learning").strip().lower()
    if mode == "placement":
        result = placement_agent.generate_plan(
            company_name=payload.company_name or "",
            job_role=payload.job_role or "",
            current_skills=payload.current_skills or "",
            experience_level=payload.experience_level or "fresher",
        )
        return {
            "success": True,
            "message": "Placement plan generated successfully!",
            "agent": "campusos",
            "mode": "placement",
            "data": result,
        }

    result = learning_coach_agent.generate_plan(
        subject=payload.subject or "general",
        current_skill_level=payload.current_skill_level or "beginner",
        exam_date=payload.exam_date or "",
        study_hours_per_day=payload.study_hours_per_day or 2,
    )
    return {
        "success": True,
        "message": "Study plan generated successfully!",
        "agent": "campusos",
        "mode": "learning",
        "data": result,
    }

"""Test script for the merged CampusMate AI platform."""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

def test_imports():
    """Test that all backend modules import correctly."""
    from app import app
    from routes import router
    from attendance_agent import AttendanceAgent
    from timetable_agent import TimetableAgent
    from orchestrator_agent import OrchestratorAgent
    from navigation_agent import NavigationAgent
    from hostel_agent import HostelComplaintAgent
    from location_service import LocationService
    from search_service import SearchService
    from config import model
    from database import get_db, init_db
    from models import Location, Complaint
    print("✅ All backend modules imported successfully")

def test_agents():
    """Test all AI agents work correctly."""
    from attendance_agent import AttendanceAgent
    from timetable_agent import TimetableAgent
    from orchestrator_agent import OrchestratorAgent

    # Test Attendance Agent
    aa = AttendanceAgent()
    summary = aa.get_summary()
    assert summary.get("overall_attendance", 0) > 0, "Attendance should have data"
    assert len(summary.get("subjects", [])) > 0, "Should have subjects"
    print(f"✅ Attendance Agent: {summary.get('student_name')} - {summary.get('overall_attendance')}%")

    # Test Timetable Agent
    ta = TimetableAgent()
    tt_summary = ta.get_summary()
    assert tt_summary.get("total_classes_per_week", 0) > 0, "Timetable should have data"
    print(f"✅ Timetable Agent: {tt_summary.get('class')} - {tt_summary.get('total_classes_per_week')} classes/week")

    # Test Orchestrator
    orch = OrchestratorAgent()
    
    # Test navigation intent
    result = orch.process("Where is the library?")
    assert result.get("intent") == "navigation", f"Expected navigation, got {result.get('intent')}"
    print(f"✅ Orchestrator: Navigation intent detected correctly")
    
    # Test attendance intent
    result = orch.process("What is my overall attendance?")
    assert result.get("intent") == "attendance", f"Expected attendance, got {result.get('intent')}"
    print(f"✅ Orchestrator: Attendance intent detected correctly")
    
    # Test timetable intent
    result = orch.process("Show me my Monday timetable")
    assert result.get("intent") == "timetable", f"Expected timetable, got {result.get('intent')}"
    print(f"✅ Orchestrator: Timetable intent detected correctly")
    
    # Test hostel intent
    result = orch.process("Water leakage in my room")
    assert result.get("intent") == "hostel", f"Expected hostel, got {result.get('intent')}"
    print(f"✅ Orchestrator: Hostel intent detected correctly")

    print("✅ All agents working correctly!")

def test_data_files():
    """Test that all data files exist and are valid."""
    import json
    import os
    
    data_files = [
        ("backend/data/attendance.json", "attendance"),
        ("backend/data/timetable.json", "timetable"),
        ("backend/data/campus_locations.json", "campus locations"),
    ]
    
    for filepath, name in data_files:
        full_path = os.path.join(os.path.dirname(__file__), "..", filepath)
        assert os.path.exists(full_path), f"{name} file not found at {full_path}"
        with open(full_path, "r") as f:
            data = json.load(f)
        assert isinstance(data, dict), f"{name} data should be a dict"
        print(f"✅ {name.title()} data file: valid JSON")
    
    print("✅ All data files verified!")

def test_frontend_files():
    """Test that all frontend page files exist."""
    import os
    
    pages = [
        "frontend/src/pages/Dashboard.jsx",
        "frontend/src/pages/NavigationAgent.jsx",
        "frontend/src/pages/HostelAgent.jsx",
        "frontend/src/pages/AttendanceAgent.jsx",
        "frontend/src/pages/TimetableAgent.jsx",
        "frontend/src/pages/ComplaintTracker.jsx",
        "frontend/src/pages/About.jsx",
        "frontend/src/pages/Settings.jsx",
        "frontend/src/pages/NotFound.jsx",
        "frontend/src/App.jsx",
        "frontend/src/components/Sidebar.jsx",
        "frontend/src/components/Navbar.jsx",
        "frontend/src/services/api.js",
    ]
    
    for page in pages:
        full_path = os.path.join(os.path.dirname(__file__), "..", page)
        assert os.path.exists(full_path), f"Frontend file not found: {page}"
    
    print(f"✅ All {len(pages)} frontend files verified!")

if __name__ == "__main__":
    print("=" * 60)
    print("CampusMate AI - Integration Tests")
    print("=" * 60)
    
    test_imports()
    test_data_files()
    test_agents()
    test_frontend_files()
    
    print("=" * 60)
    print("🎉 ALL TESTS PASSED!")
    print("=" * 60)
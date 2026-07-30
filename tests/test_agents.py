import os
import sys

from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app
from database import init_db

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_navigation_endpoint():
    response = client.get("/navigate", params={"place": "Library"})
    assert response.status_code == 200
    assert response.json()["success"] is True


def test_complaint_creation_and_lookup():
    payload = {
        "student_name": "Asha",
        "room_number": "B205",
        "description": "My room has no water."
    }
    response = client.post("/complaint", json=payload)
    assert response.status_code == 201
    assert response.json()["success"] is True

    complaint_id = response.json()["complaint"]["complaint_id"]
    lookup_response = client.get(f"/complaint/{complaint_id}")
    assert lookup_response.status_code == 200


def test_campusos_learning_endpoint():
    payload = {
        "mode": "learning",
        "subject": "Computer Science",
        "current_skill_level": "beginner",
        "exam_date": "2030-01-15",
        "study_hours_per_day": 2,
    }
    response = client.post("/chat/campusos", json=payload)
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["agent"] == "campusos"

"""
app.py
------
Flask web server for SmartCampus Attendance Agent.
Serves the student dashboard and handles chat API requests.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, render_template, request, jsonify
from agents.attendance_agent import AttendanceAgent
from services.attendance_service import AttendanceService
from utils.mongo_seeder import seed

app = Flask(__name__)

seed()
service = AttendanceService()
agent = AttendanceAgent()


def build_dashboard_data():
    records = service.get_all_records()
    overall = service.get_overall_attendance()
    eligible, defaulters = service.check_eligibility()

    subjects = []
    for r in records:
        pct = r.attendance_percentage()
        if pct >= 90:
            status = "excellent"
        elif pct >= 75:
            status = "good"
        else:
            status = "danger"
        subjects.append({
            "name": r.subject,
            "attended": r.attended_classes,
            "total": r.total_classes,
            "percentage": round(pct, 1),
            "faculty": r.faculty,
            "credits": r.credits,
            "status": status,
        })

    return {
        "student": {
            "name": service.student.name,
            "roll": service.student.roll_number,
            "dept": service.student.department,
            "sem": service.student.semester,
        },
        "overall": round(overall, 1),
        "eligible": eligible,
        "defaulters": [r.subject for r in defaulters],
        "subjects": subjects,
    }


@app.route("/")
def index():
    data = build_dashboard_data()
    return render_template("index.html", data=data)


@app.route("/chat", methods=["POST"])
def chat():
    from utils.db import get_db
    body = request.get_json(silent=True) or {}
    question = (body.get("message") or "").strip()
    session_id = (body.get("session_id") or "").strip()
    session_title = (body.get("session_title") or "New Chat").strip()
    if not question:
        return jsonify({"error": "Empty message"}), 400

    response = agent.ask(question)

    # Save to MongoDB directly from backend
    if session_id:
        db = get_db()
        import time
        ts = int(time.time() * 1000)
        db.chat_sessions.update_one(
            {"id": session_id},
            {
                "$set": {"title": session_title, "ts": ts},
                "$push": {
                    "messages": {
                        "$each": [
                            {"role": "user", "text": question, "ts": ts},
                            {"role": "bot",  "text": response,  "ts": ts + 1},
                        ]
                    }
                },
                "$setOnInsert": {"id": session_id},
            },
            upsert=True,
        )

    return jsonify({"reply": response})


@app.route("/history", methods=["GET"])
def get_history():
    from utils.db import get_db
    db = get_db()
    sessions = list(db.chat_sessions.find({}, {"_id": 0}).sort("ts", -1))
    return jsonify(sessions)


@app.route("/history", methods=["POST"])
def save_history():
    from utils.db import get_db
    db = get_db()
    session = request.get_json(silent=True) or {}
    if not session.get("id"):
        return jsonify({"error": "Missing session id"}), 400
    db.chat_sessions.replace_one({"id": session["id"]}, session, upsert=True)
    return jsonify({"ok": True})


@app.route("/history/<session_id>", methods=["DELETE"])
def delete_history(session_id):
    from utils.db import get_db
    db = get_db()
    db.chat_sessions.delete_one({"id": session_id})
    return jsonify({"ok": True})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)

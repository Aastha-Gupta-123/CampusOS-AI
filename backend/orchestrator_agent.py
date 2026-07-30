"""
Master Orchestrator Agent - Routes user requests to the correct AI agent.

Analyzes user intent and dispatches to the appropriate specialized agent:
- Navigation Agent: Campus navigation, directions, locations
- Hostel Complaint Agent: Hostel maintenance issues
- Attendance Agent: Attendance tracking and analysis
- Timetable Agent: Class schedules and timetables
"""
from __future__ import annotations

import logging
import re
from typing import Any, Dict, Optional

from config import model
from navigation_agent import NavigationAgent
from hostel_agent import HostelComplaintAgent
from attendance_agent import AttendanceAgent
from timetable_agent import TimetableAgent

logger = logging.getLogger(__name__)


class OrchestratorAgent:
    """Master Orchestrator that routes queries to the appropriate AI agent."""

    # Intent patterns for routing
    NAVIGATION_KEYWORDS = [
        "where is", "navigate", "directions to", "take me to", "how to reach",
        "locate", "find", "campus", "building", "block", "lab", "library",
        "office", "department", "classroom", "canteen", "ground", "sport",
        "going to", "way to", "show me", "map",
    ]

    HOSTEL_KEYWORDS = [
        "complaint", "hostel", "water", "wifi", "wi-fi", "internet",
        "electricity", "power", "outage", "leak", "leaking", "toilet",
        "bathroom", "clean", "dirty", "broken", "furniture", "chair",
        "bed", "table", "fan", "light", "bulb", "door", "window",
        "paint", "repair", "maintenance", "room", "plumbing",
    ]

    ATTENDANCE_KEYWORDS = [
        "attendance", "percentage", "eligible", "eligibility", "exam",
        "shortage", "defaulter", "subject", "overall", "classes attended",
        "how many classes", "am i eligible",
    ]

    TIMETABLE_KEYWORDS = [
        "timetable", "schedule", "class", "period", "lecture", "today",
        "tomorrow", "monday", "tuesday", "wednesday", "thursday", "friday",
        "saturday", "sunday", "first class", "next class", "time table",
    ]

    def __init__(self):
        self.navigation_agent = NavigationAgent()
        self.attendance_agent = AttendanceAgent()
        self.timetable_agent = TimetableAgent()
        # Hostel agent needs DB session - created per request
        logger.info("Orchestrator Agent initialized with all sub-agents")

    def detect_intent(self, query: str) -> str:
        """Detect the intent of a user query and return the agent type."""
        q = query.lower().strip()

        # Count keyword matches for each category
        nav_score = sum(1 for kw in self.NAVIGATION_KEYWORDS if kw in q)
        hostel_score = sum(1 for kw in self.HOSTEL_KEYWORDS if kw in q)
        attendance_score = sum(1 for kw in self.ATTENDANCE_KEYWORDS if kw in q)
        timetable_score = sum(1 for kw in self.TIMETABLE_KEYWORDS if kw in q)

        logger.debug(f"Intent scores - Nav:{nav_score} Hostel:{hostel_score} Att:{attendance_score} TT:{timetable_score}")

        # Determine the highest scoring intent
        scores = {
            "navigation": nav_score,
            "hostel": hostel_score,
            "attendance": attendance_score,
            "timetable": timetable_score,
        }

        max_score = max(scores.values())

        if max_score == 0:
            # Try LLM-based intent detection
            return self._llm_intent_detect(query)

        # Get all intents with the max score
        top_intents = [k for k, v in scores.items() if v == max_score]

        # If there's a tie, use the one with more specific keywords
        if len(top_intents) > 1:
            # Priority: attendance > timetable > hostel > navigation
            priority = ["attendance", "timetable", "hostel", "navigation"]
            for p in priority:
                if p in top_intents:
                    return p

        return top_intents[0]

    def _llm_intent_detect(self, query: str) -> str:
        """Use LLM to detect intent when keyword matching fails."""
        if model is not None:
            try:
                prompt = (
                    f"Classify this student query into exactly ONE of these categories:\n"
                    f"- navigation: asking about campus locations, directions, buildings\n"
                    f"- hostel: asking about hostel complaints, maintenance issues\n"
                    f"- attendance: asking about attendance percentage, exam eligibility, subject attendance\n"
                    f"- timetable: asking about class schedule, timetable, today's classes\n\n"
                    f"Query: '{query}'\n\n"
                    f"Respond with ONLY the category name: navigation, hostel, attendance, or timetable"
                )
                messages = [{"role": "user", "content": prompt}]
                resp = model.invoke(messages)
                result = resp.content.strip().lower() if hasattr(resp, "content") else str(resp).strip().lower()
                if result in ("navigation", "hostel", "attendance", "timetable"):
                    return result
            except Exception:
                pass

        # Default to navigation if unsure
        return "navigation"

    def process(self, query: str, db=None) -> Dict[str, Any]:
        """Process a user query by routing to the appropriate agent."""
        if not query or not query.strip():
            return {
                "success": False,
                "message": "Please ask me something! I can help with navigation, hostel complaints, attendance, or timetables.",
                "intent": None,
                "agent": None,
            }

        intent = self.detect_intent(query)
        logger.info(f"Query: '{query}' -> Intent: {intent}")

        try:
            if intent == "navigation":
                result = self.navigation_agent.navigate(query)
                return {
                    "success": result.get("success", False),
                    "message": result.get("message", ""),
                    "intent": intent,
                    "agent": "navigation",
                    "data": result,
                }

            elif intent == "hostel":
                from hostel_agent import HostelComplaintAgent
                hostel_agent = HostelComplaintAgent(db) if db else None
                if hostel_agent:
                    result = hostel_agent.create_complaint_from_text(query)
                    return {
                        "success": result.get("success", False),
                        "message": result.get("message", ""),
                        "intent": intent,
                        "agent": "hostel",
                        "data": result,
                    }
                else:
                    return {
                        "success": False,
                        "message": "Hostel complaint system is not available. Please ensure database is connected.",
                        "intent": intent,
                        "agent": "hostel",
                    }

            elif intent == "attendance":
                result = self.attendance_agent.ask(query)
                summary = self.attendance_agent.get_summary()
                return {
                    "success": True,
                    "message": result,
                    "intent": intent,
                    "agent": "attendance",
                    "data": {"summary": summary},
                }

            elif intent == "timetable":
                result = self.timetable_agent.handle_query(query)
                summary = self.timetable_agent.get_summary()
                return {
                    "success": True,
                    "message": result,
                    "intent": intent,
                    "agent": "timetable",
                    "data": {"summary": summary},
                }

            else:
                return {
                    "success": False,
                    "message": "I'm not sure how to help with that. Try asking about navigation, hostel issues, attendance, or timetables!",
                    "intent": intent,
                    "agent": None,
                }

        except Exception as e:
            logger.error(f"Error processing query '{query}': {e}", exc_info=True)
            return {
                "success": False,
                "message": f"Sorry, I encountered an error: {str(e)}",
                "intent": intent,
                "agent": None,
            }

    def get_agents_status(self) -> Dict[str, Any]:
        """Get status of all registered agents."""
        return {
            "navigation": {
                "status": "online",
                "locations": self.navigation_agent.get_location_count(),
            },
            "hostel": {
                "status": "online",
            },
            "attendance": {
                "status": "online",
                "student": self.attendance_agent.get_summary().get("student_name", "Unknown"),
            },
            "timetable": {
                "status": "online",
                "classes_per_week": self.timetable_agent.get_summary().get("total_classes_per_week", 0),
            },
        }
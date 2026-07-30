"""
Learning Coach Agent - Generates personalized study plans.

Provides AI-powered study plans with topic recommendations,
daily schedules, and revision tips.
"""
from __future__ import annotations

import random
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime

from config import model

logger = logging.getLogger(__name__)

_TOPIC_BANK = {
    "mathematics": ["Algebra", "Calculus", "Probability & Statistics", "Coordinate Geometry", "Trigonometry", "Vectors", "Differential Equations"],
    "physics": ["Mechanics", "Electrodynamics", "Modern Physics", "Thermodynamics", "Waves & Optics", "Electricity & Magnetism"],
    "chemistry": ["Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry", "Chemical Bonding", "Thermodynamics", "Electrochemistry"],
    "computer science": ["Data Structures", "Algorithms", "Database Systems", "Operating Systems", "Computer Networks", "OOP", "Software Engineering"],
    "biology": ["Cell Biology", "Genetics", "Evolution", "Ecology", "Biochemistry", "Human Physiology"],
}

_REVISION_TIPS = [
    "Use spaced repetition - review at increasing intervals (1d, 3d, 7d, 14d).",
    "Create mind maps to connect related concepts visually.",
    "Teach a concept to someone else - it reveals gaps in your understanding.",
    "Solve past exam papers under timed conditions.",
    "Use active recall - close books and write down everything you remember.",
    "Take short breaks every 45-50 minutes (Pomodoro Technique).",
]


class LearningCoachAgent:
    """AI-powered learning coach for study plan generation."""

    def __init__(self):
        logger.info("Learning Coach Agent initialized")

    def _get_topics(self, subject: str) -> list[str]:
        key = subject.strip().lower()
        for known, topics in _TOPIC_BANK.items():
            if known in key:
                return topics
        return ["Fundamental Concepts", "Core Principles", "Problem-Solving Techniques", "Application & Practice", "Advanced Topics"]

    def _build_daily_schedule(self, study_hours: int) -> list[str]:
        if study_hours <= 1:
            return ["0-30 min: Review previous topics", "30-60 min: Focus on one key topic"]
        elif study_hours <= 2:
            return ["0-30 min: Quick review", "30-75 min: Deep dive new topic", "75-90 min: Practice problems", "90-120 min: Revision notes"]
        elif study_hours <= 4:
            return ["0-30 min: Morning review", "30-90 min: New topic study", "90-120 min: Practice", "120-150 min: Break", "150-210 min: Timed problems", "210-240 min: Error analysis"]
        else:
            return ["0-30 min: Morning review", "30-90 min: New topic", "90-150 min: Practice", "150-180 min: Break", "180-240 min: Timed problems", "240-300 min: Error analysis", "300-360 min: Mock test"]

    def generate_plan(self, subject: str, current_skill_level: str = "beginner", exam_date: str = "", study_hours_per_day: int = 2) -> Dict[str, Any]:
        """Generate a personalized study plan."""
        skill = current_skill_level.strip().lower() if current_skill_level in ("beginner", "intermediate", "advanced") else "beginner"
        hours = max(1, min(12, int(study_hours_per_day) if study_hours_per_day else 2))

        topics = self._get_topics(subject)
        if skill == "beginner":
            topics = topics[:5]
        elif skill == "intermediate":
            topics = topics[:6]

        # Calculate duration
        duration = "ongoing"
        if exam_date:
            try:
                delta = (datetime.strptime(exam_date, "%Y-%m-%d") - datetime.now()).days
                duration = f"{delta} days" if delta > 0 else "exam passed"
            except ValueError:
                pass

        # Try AI plan
        study_plan_text = None
        if model is not None:
            try:
                prompt = (
                    f"You are a Learning Coach AI. Create a personalized study plan for {subject} "
                    f"at {skill} level. Exam in {duration}, {hours}h/day. "
                    f"Provide concise, actionable advice covering key topics first."
                )
                messages = [{"role": "user", "content": prompt}]
                resp = model.invoke(messages)
                study_plan_text = resp.content if hasattr(resp, "content") else str(resp)
            except Exception as e:
                logger.warning(f"AI study plan failed: {e}")

        if not study_plan_text:
            study_plan_text = (
                f"Study plan for {subject} ({skill}). Exam in {duration}. "
                f"Study {hours}h/day. Focus on fundamentals first, then practice problems. "
                f"Use active recall and spaced repetition for best results."
            )

        random.seed(hash(subject) % 2**32)
        revision_tips = random.sample(_REVISION_TIPS, 4)

        return {
            "subject": subject,
            "current_skill_level": skill,
            "exam_date": exam_date,
            "study_hours_per_day": hours,
            "studyPlan": study_plan_text,
            "importantTopics": topics,
            "dailySchedule": self._build_daily_schedule(hours),
            "revisionTips": revision_tips,
        }
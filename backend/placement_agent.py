"""
Placement Agent - Generates personalized placement preparation plans.

Provides AI-powered placement preparation plans with company overviews,
technical topics, interview questions, and preparation roadmaps.
"""
from __future__ import annotations

import random
import logging
from typing import Any, Dict, List, Optional

from config import model

logger = logging.getLogger(__name__)

# Company overviews
_COMPANY_OVERVIEWS = {
    "google": "Google is a global technology leader specializing in internet-related services and products. Known for its innovative culture, rigorous interview process, and cutting-edge work in AI, cloud computing, and search technology.",
    "microsoft": "Microsoft is a leading software corporation that develops, licenses, and sells computer programs, consumer electronics, and enterprise solutions with a strong focus on cloud computing (Azure).",
    "amazon": "Amazon is the world's largest online retailer and a leader in cloud computing (AWS), artificial intelligence, and logistics, guided by Leadership Principles emphasizing customer obsession.",
    "meta": "Meta builds technologies to help people connect through social media and virtual reality platforms, at the forefront of the metaverse and AR/VR innovation.",
    "apple": "Apple designs innovative consumer electronics, software, and services, known for focus on design, quality, and user experience.",
    "default": "This company is a respected player in the technology industry, known for commitment to innovation, quality, and employee development.",
}

_JOB_ROLE_TOPICS = {
    "software engineer": ["Data Structures & Algorithms", "System Design", "OOP", "Database Design & SQL", "Operating Systems", "Computer Networks", "API Design", "Concurrency"],
    "data scientist": ["Statistics & Probability", "Machine Learning", "Python (pandas, numpy)", "SQL", "Data Visualization", "A/B Testing", "Feature Engineering", "Deep Learning"],
    "product manager": ["Product Discovery & Strategy", "Roadmapping", "User Research", "Agile & Scrum", "Stakeholder Management", "Market Analysis", "OKRs", "Go-to-Market Strategy"],
    "default": ["Fundamental Technical Concepts", "Problem-Solving", "Communication", "Domain Knowledge", "Tools & Technologies"],
}

_HR_QUESTIONS = [
    "Tell me about yourself.",
    "Why do you want to work here?",
    "What are your greatest strengths?",
    "What is your greatest weakness?",
    "Where do you see yourself in 5 years?",
    "Describe a challenging situation and how you handled it.",
    "Tell me about a time you worked in a team.",
    "How do you handle pressure and stress?",
]

_ROADMAP_TEMPLATES = {
    "beginner": [
        {"week": "Week 1", "focus": "Foundation Building", "tasks": ["Learn core concepts", "Practice basic problems", "Build a strong foundation"]},
        {"week": "Week 2", "focus": "Skill Development", "tasks": ["Deep dive into key topics", "Solve medium problems", "Work on projects"]},
        {"week": "Week 3", "focus": "Interview Preparation", "tasks": ["Mock interviews", "Review weak areas", "Polish resume"]},
    ],
    "intermediate": [
        {"week": "Week 1", "focus": "Advanced Topics", "tasks": ["Master advanced concepts", "Solve complex problems", "System design practice"]},
        {"week": "Week 2", "focus": "Interview Readiness", "tasks": ["Mock interviews", "Behavioral preparation", "Company research"]},
        {"week": "Week 3", "focus": "Final Preparation", "tasks": ["Full-length mocks", "Salary negotiation prep", "Final review"]},
    ],
    "advanced": [
        {"week": "Week 1", "focus": "Strategic Preparation", "tasks": ["Map experience to requirements", "Address knowledge gaps", "Prepare stories for behavioral"]},
        {"week": "Week 2", "focus": "Advanced Practice", "tasks": ["Solve challenging problems", "System design discussions", "Refine portfolio"]},
        {"week": "Week 3", "focus": "Interview Readiness", "tasks": ["Mock interviews", "Negotiation strategy", "Polished materials"]},
    ],
}


class PlacementAgent:
    """AI-powered placement preparation assistant."""

    def __init__(self):
        logger.info("Placement Agent initialized")

    def _get_company_overview(self, company_name: str) -> str:
        key = company_name.strip().lower()
        for known in _COMPANY_OVERVIEWS:
            if known in key:
                return _COMPANY_OVERVIEWS[known]
        return _COMPANY_OVERVIEWS["default"]

    def _get_technical_topics(self, job_role: str) -> list[str]:
        key = job_role.strip().lower()
        for known in _JOB_ROLE_TOPICS:
            if known in key:
                return _JOB_ROLE_TOPICS[known]
        return _JOB_ROLE_TOPICS["default"]

    def _get_roadmap(self, experience_level: str) -> list[dict]:
        level = (experience_level or "").strip().lower()
        if "fresher" in level or "0" in level or "entry" in level:
            return _ROADMAP_TEMPLATES["beginner"]
        elif "senior" in level or "5" in level or "lead" in level:
            return _ROADMAP_TEMPLATES["advanced"]
        else:
            return _ROADMAP_TEMPLATES["intermediate"]

    def generate_plan(self, company_name: str, job_role: str, current_skills: str = "", experience_level: str = "fresher") -> Dict[str, Any]:
        """Generate a personalized placement preparation plan."""
        company_overview = self._get_company_overview(company_name)
        technical_topics = self._get_technical_topics(job_role)
        hr_questions = random.sample(_HR_QUESTIONS, 5)
        roadmap = self._get_roadmap(experience_level)

        # Try AI summary
        summary = None
        if model is not None:
            try:
                prompt = (
                    f"You are a Placement Preparation AI agent. A student is preparing for a "
                    f"{job_role} position at {company_name} with {experience_level} experience. "
                    f"Their current skills are: {current_skills or 'not specified'}. "
                    f"Write a concise, encouraging summary that outlines the preparation strategy."
                )
                messages = [{"role": "user", "content": prompt}]
                resp = model.invoke(messages)
                summary = resp.content if hasattr(resp, "content") else str(resp)
            except Exception as e:
                logger.warning(f"AI summary failed: {e}")

        if not summary:
            summary = (
                f"Prepare for {job_role} at {company_name} ({experience_level}). "
                f"Focus on: {', '.join(technical_topics[:3])}. "
                f"Follow the roadmap below for success."
            )

        return {
            "companyName": company_name,
            "jobRole": job_role,
            "currentSkills": current_skills,
            "experienceLevel": experience_level,
            "summary": summary,
            "companyOverview": company_overview,
            "technicalTopics": technical_topics,
            "hrQuestions": hr_questions,
            "preparationRoadmap": roadmap,
        }
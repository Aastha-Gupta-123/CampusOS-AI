"""Navigation Agent - Sri Eshwar College Campus Navigation Assistant.

Uses the LocationService and SearchService for structured knowledge base lookups,
and optionally uses ChatGroq for generating conversational responses.
The AI NEVER guesses locations - all location data comes from the knowledge base.
"""
from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from config import model
from location_service import LocationService
from search_service import SearchService, SearchResult

logger = logging.getLogger(__name__)


class NavigationAgent:
    """AI-powered campus navigation assistant for Sri Eshwar College.

    Features:
    - Structured knowledge base with 40+ campus locations
    - Fuzzy search using RapidFuzz (handles typos, aliases, natural language)
    - AI-generated conversational responses (only for phrasing, NOT for locations)
    - Walking time estimates
    - Nearby landmarks
    - Step-by-step directions
    - Polite suggestions when location not found
    """

    def __init__(self):
        self.location_service = LocationService()
        self.search_service = SearchService(self.location_service)
        logger.info(
            f"Navigation Agent initialized with "
            f"{self.location_service.get_location_count()} locations"
        )

    def _build_directions(self, location: Dict[str, Any]) -> List[str]:
        """Build step-by-step walking directions to a location."""
        steps = []
        name = location.get("name", "")
        block = location.get("block", "")
        floor = location.get("floor", "")
        room = location.get("room", "")
        walking_time = location.get("walking_time_minutes", 5)

        steps.append(f"Enter the campus through the Main Gate.")
        if block and block not in ["All Blocks", "Front"]:
            steps.append(f"Head towards {block}.")
        if floor and floor not in ["All Floors", "Every Floor"]:
            steps.append(f"Go to the {floor}.")
        if room and room not in ["Open Area", "Entrance", "Near Staircases", "Near Reception"]:
            steps.append(f"Look for {room}.")
        steps.append(f"You should see {name} ahead.")
        steps.append(f"Estimated walking time: {walking_time} minutes.")

        return steps

    def _generate_ai_response(
        self, location: Dict[str, Any], query: str
    ) -> Optional[str]:
        """Use ChatGroq to generate a friendly conversational response.

        The AI only generates the conversational wrapper.
        Location data is ALWAYS from the knowledge base.
        """
        if model is None:
            return None

        try:
            name = location.get("name", "")
            block = location.get("block", "")
            floor = location.get("floor", "")
            room = location.get("room", "")
            description = location.get("description", "")
            landmarks = location.get("nearby_landmarks", [])
            walking_time = location.get("walking_time_minutes", 5)
            category = location.get("category", "")

            landmarks_str = ", ".join(landmarks) if landmarks else "nearby facilities"

            prompt = (
                f"You are the Official Sri Eshwar College of Engineering Campus Navigation Assistant. "
                f"You are helpful, friendly, and professional. Respond to the student's query in a warm tone.\n\n"
                f"Student Query: \"{query}\"\n\n"
                f"Location found in campus database:\n"
                f"- Name: {name}\n"
                f"- Block: {block}\n"
                f"- Floor: {floor}\n"
                f"- Room: {room}\n"
                f"- Category: {category}\n"
                f"- Description: {description}\n"
                f"- Nearby: {landmarks_str}\n"
                f"- Walking time: ~{walking_time} minutes\n\n"
                f"IMPORTANT RULES:\n"
                f"1. Start with a friendly greeting acknowledging the location they're looking for.\n"
                f"2. Describe where it is located (block, floor, room) in a natural way.\n"
                f"3. Mention what they can find there (from the description).\n"
                f"4. Keep it to 3-4 sentences maximum.\n"
                f"5. Do NOT make up any information not provided above.\n"
                f"6. End with a helpful offer for further assistance."
            )

            messages = [{"role": "user", "content": prompt}]
            resp = model.invoke(messages)
            return resp.content if hasattr(resp, "content") else str(resp)

        except Exception as e:
            logger.warning(f"AI response generation failed: {e}")
            return None

    def _generate_suggestion_response(
        self, query: str, suggestions: List[Dict[str, Any]]
    ) -> str:
        """Generate a polite response with suggestions when location not found."""
        if model is not None:
            try:
                suggestion_names = [
                    s["location"]["name"] for s in suggestions[:3]
                ]
                names_str = ", ".join(suggestion_names)

                prompt = (
                    f"You are the Official Sri Eshwar College of Engineering Campus Navigation Assistant. "
                    f"A student asked about: \"{query}\"\n\n"
                    f"This location was not found in our campus database. However, these similar locations exist:\n"
                    f"{names_str}\n\n"
                    f"Politely let them know you couldn't find an exact match, and suggest these alternatives. "
                    f"Keep it to 2-3 sentences. Be helpful and friendly."
                )

                messages = [{"role": "user", "content": prompt}]
                resp = model.invoke(messages)
                if resp and hasattr(resp, "content"):
                    return resp.content
            except Exception:
                pass

        # Fallback response
        names = [s["location"]["name"] for s in suggestions[:3]]
        suggestions_str = ", ".join(names)
        return (
            f"I couldn't find an exact match for \"{query}\" in our campus database. "
            f"Did you mean one of these? {suggestions_str}. "
            f"Please try one of these or ask in a different way!"
        )

    def navigate(self, query: str) -> Dict[str, Any]:
        """Main navigation method. Processes a natural language query and returns directions.

        Args:
            query: Natural language query like "Where is the library?" or "Take me to AI Lab"

        Returns:
            Dict with keys: success, message, location, directions, walking_time, suggestions
        """
        logger.info(f"Navigation request: '{query}'")

        if not query or not query.strip():
            return {
                "success": False,
                "message": "Please tell me where you'd like to go on campus!",
                "location": None,
                "directions": [],
                "walking_time": 0,
                "suggestions": [],
            }

        # Step 1: Search the knowledge base
        result: SearchResult = self.search_service.search(query)

        # Step 2: Handle found location
        if result.match_type != "not_found" and result.location:
            location = result.location
            directions = self._build_directions(location)

            # Try AI-generated response
            ai_message = self._generate_ai_response(location, query)

            if ai_message:
                message = ai_message
            else:
                # Fallback human-readable response
                name = location.get("name", "")
                block = location.get("block", "")
                floor = location.get("floor", "")
                room = location.get("room", "")
                description = location.get("description", "")
                landmarks = location.get("nearby_landmarks", [])
                walking_time = location.get("walking_time_minutes", 5)

                message = (
                    f"📍 {name} is located in Block {block}, {floor}. "
                    + (f"Room {room}. " if room and room not in ["Open Area", "Entrance"] else "")
                    + f"{description} "
                    + f"It's about a {walking_time}-minute walk from the Main Gate."
                )

            return {
                "success": True,
                "message": message,
                "location": {
                    "id": location.get("id"),
                    "name": location.get("name"),
                    "block": location.get("block"),
                    "floor": location.get("floor"),
                    "room": location.get("room"),
                    "description": location.get("description"),
                    "category": location.get("category"),
                    "nearby_landmarks": location.get("nearby_landmarks", []),
                    "walking_time_minutes": location.get("walking_time_minutes", 5),
                },
                "directions": directions,
                "walking_time": location.get("walking_time_minutes", 5),
                "match_type": result.match_type,
                "match_score": result.score,
                "suggestions": [],
            }

        # Step 3: Location not found - suggest alternatives
        suggestions = self.search_service.suggest_alternatives(query)
        suggestion_response = self._generate_suggestion_response(query, suggestions)

        return {
            "success": False,
            "message": suggestion_response,
            "location": None,
            "directions": [],
            "walking_time": 0,
            "match_type": "not_found",
            "match_score": 0,
            "suggestions": [
                {
                    "name": s["location"]["name"],
                    "block": s["location"].get("block"),
                    "description": s["location"].get("description"),
                    "score": s["score"],
                }
                for s in suggestions[:5]
            ],
        }

    def get_location_count(self) -> int:
        """Return the number of locations in the knowledge base."""
        return self.location_service.get_location_count()

    def get_category_summary(self) -> Dict[str, int]:
        """Return a summary of locations by category."""
        categories = self.location_service.get_categories()
        return {cat: len(items) for cat, items in categories.items()}
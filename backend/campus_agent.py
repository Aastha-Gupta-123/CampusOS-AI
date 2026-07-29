"""Campus navigation agent.

Provides `CampusNavigationAgent` which can seed locations from a JSON file,
search for a place by name, and build a friendly navigation response. Uses the
optional ChatGroq `model` for nicer phrasing when available.
"""
from __future__ import annotations

import json
import os
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from config import model
from models import Location


class CampusNavigationAgent:
    """Agent that answers navigation queries using a locations DB."""

    def __init__(self, db: Session):
        self.db = db

    def _load_locations_from_json(self) -> List[Dict[str, Any]]:
        """Load the campus locations JSON from a couple of common paths."""
        base = os.path.dirname(os.path.abspath(__file__))
        workspace = os.path.abspath(os.path.join(base, ".."))
        candidates = [
            os.path.join(base, "data", "campus_locations.json"),
            os.path.join(workspace, "data", "campus_locations.json"),
            os.path.join(workspace, "campus_locations.json"),
            os.path.join(os.path.dirname(__file__), "..", "..", "data", "campus_locations.json"),
        ]

        for path in candidates:
            try:
                path = os.path.normpath(path)
                if os.path.exists(path):
                    with open(path, "r", encoding="utf-8") as fh:
                        data = json.load(fh)
                        if isinstance(data, list):
                            return data
                        if isinstance(data, dict) and "locations" in data:
                            return data["locations"]
            except Exception:
                continue
        return []

    def seed_default_locations(self) -> int:
        """Seed the DB with locations from JSON. Returns number inserted."""
        items = self._load_locations_from_json()
        inserted = 0
        for it in items:
            name = it.get("name")
            if not name:
                continue
            exists = self.db.query(Location).filter(Location.name == name).first()
            if exists:
                continue
            loc = Location(
                name=name,
                block=it.get("block", ""),
                floor=it.get("floor", ""),
                room=it.get("room", ""),
                description=it.get("description", ""),
            )
            self.db.add(loc)
            inserted += 1
        if inserted:
            self.db.commit()
        return inserted

    def search_location(self, query: str) -> Optional[Location]:
        """Search for a location by name or alias using simple fuzzy rules."""
        if not query:
            return None
        q = query.strip().lower()

        loc = self.db.query(Location).filter(Location.name.ilike(q)).first()
        if loc:
            return loc

        loc = self.db.query(Location).filter(Location.name.ilike(f"%{q}%")).first()
        if loc:
            return loc

        loc = self.db.query(Location).filter(Location.description.ilike(f"%{q}%")).first()
        if loc:
            return loc

        return None

    def _build_instructions(self, location: Location) -> List[str]:
        """Produce simple step-by-step directions to a location."""
        steps = []
        steps.append("Enter the campus from the main gate.")
        if location.block:
            steps.append(f"Head towards Block {location.block}.")
        if location.floor:
            steps.append(f"Go to {location.floor} floor.")
        if location.room:
            steps.append(f"Find room {location.room}.")
        steps.append("If you need help ask at the reception or security desk.")
        return steps

    def _generate_ai_response(self, location: Location) -> Optional[str]:
        """Use LLM to generate a friendly navigation response."""
        if model is None:
            return None
        try:
            prompt = (
                f"You are a helpful campus navigation assistant. Provide a concise, friendly message "
                f"describing where '{location.name}' is located. Include block, floor and room when available. "
                f"Keep it to 2-3 sentences maximum.\n\n"
                f"Location details:\n"
                f"Name: {location.name}\n"
                f"Block: {location.block}\n"
                f"Floor: {location.floor}\n"
                f"Room: {location.room}\n"
                f"Description: {location.description}"
            )
            messages = [{"role": "user", "content": prompt}]
            resp = model.invoke(messages)
            return resp.content if hasattr(resp, 'content') else str(resp)
        except Exception:
            return None

    def build_navigation_response(self, question: str) -> Dict[str, Any]:
        """Top-level function to build a navigation response for a question."""
        query = (question or "").strip()
        if not query:
            return {"success": False, "message": "Empty question."}

        try:
            count = self.db.query(Location).count()
        except Exception:
            count = 0
        if count == 0:
            try:
                self.seed_default_locations()
            except Exception:
                pass

        loc = self.search_location(query)
        if not loc:
            polite = "I couldn't find that location. Please try a different name or check spelling."
            return {"success": False, "message": polite}

        instructions = self._build_instructions(loc)

        # Try AI-generated phrasing
        ai_message = self._generate_ai_response(loc)
        message = ai_message or (
            f"{loc.name} is located in Block {loc.block}, {loc.floor}. "
            + (f"Room {loc.room}. " if loc.room else "")
            + (loc.description or "")
        )

        return {
            "success": True,
            "message": message,
            "location": {
                "name": loc.name,
                "block": loc.block,
                "floor": loc.floor,
                "room": loc.room,
                "description": loc.description,
            },
            "instructions": instructions,
        }
"""Location Service - Campus Knowledge Base for Sri Eshwar College of Engineering.

Loads and manages the structured campus location data from JSON.
Provides methods to query locations by category, name, or alias.
"""
from __future__ import annotations

import json
import logging
import os
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class LocationService:
    """Service that loads and manages the campus knowledge base."""

    def __init__(self, data_path: Optional[str] = None):
        self.data_path = data_path or self._find_data_file()
        self._locations: List[Dict[str, Any]] = []
        self._categories: Dict[str, List[Dict[str, Any]]] = {}
        self._load_data()

    def _find_data_file(self) -> str:
        """Find the campus_locations.json file in common locations."""
        base = os.path.dirname(os.path.abspath(__file__))
        workspace = os.path.abspath(os.path.join(base, ".."))
        candidates = [
            os.path.join(base, "data", "campus_locations.json"),
            os.path.join(workspace, "data", "campus_locations.json"),
            os.path.join(base, "..", "data", "campus_locations.json"),
        ]
        for path in candidates:
            path = os.path.normpath(path)
            if os.path.exists(path):
                logger.info(f"Found campus data at: {path}")
                return path
        logger.warning("campus_locations.json not found in any expected location")
        return ""

    def _load_data(self) -> None:
        """Load and flatten the JSON data into a searchable list."""
        if not self.data_path or not os.path.exists(self.data_path):
            logger.error(f"Campus data file not found: {self.data_path}")
            return

        try:
            with open(self.data_path, "r", encoding="utf-8") as f:
                raw = json.load(f)

            self._categories = raw
            self._locations = []

            for category, items in raw.items():
                if isinstance(items, list):
                    for item in items:
                        if isinstance(item, dict):
                            item["category"] = category
                            self._locations.append(item)

            logger.info(
                f"Loaded {len(self._locations)} locations across "
                f"{len(self._categories)} categories"
            )
        except Exception as e:
            logger.error(f"Failed to load campus data: {e}")
            self._locations = []
            self._categories = {}

    def get_all_locations(self) -> List[Dict[str, Any]]:
        """Return all flattened locations."""
        return self._locations

    def get_categories(self) -> Dict[str, List[Dict[str, Any]]]:
        """Return locations grouped by category."""
        return self._categories

    def get_category_names(self) -> List[str]:
        """Return list of category names."""
        return list(self._categories.keys())

    def get_locations_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Get all locations in a specific category."""
        return self._categories.get(category, [])

    def get_location_by_id(self, location_id: str) -> Optional[Dict[str, Any]]:
        """Find a location by its unique ID."""
        for loc in self._locations:
            if loc.get("id") == location_id:
                return loc
        return None

    def get_location_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        """Find a location by its exact name (case-insensitive)."""
        name_lower = name.lower().strip()
        for loc in self._locations:
            if loc.get("name", "").lower() == name_lower:
                return loc
        return None

    def get_all_aliases(self) -> List[Dict[str, Any]]:
        """Return a list of all aliases mapped to their parent location."""
        alias_map = []
        for loc in self._locations:
            aliases = loc.get("aliases", [])
            for alias in aliases:
                alias_map.append({"alias": alias.lower(), "location": loc})
            # Also add the name itself as an alias
            alias_map.append({"alias": loc.get("name", "").lower(), "location": loc})
        return alias_map

    def get_all_searchable_terms(self) -> List[str]:
        """Return all searchable terms (names + aliases)."""
        terms = set()
        for loc in self._locations:
            terms.add(loc.get("name", "").lower())
            for alias in loc.get("aliases", []):
                terms.add(alias.lower())
        return list(terms)

    def get_location_count(self) -> int:
        """Return total number of locations in the knowledge base."""
        return len(self._locations)

    def reload(self) -> None:
        """Reload data from the JSON file."""
        self._load_data()
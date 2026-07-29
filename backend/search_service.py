"""Search Service - Intelligent Search Layer for Campus Locations.

Uses RapidFuzz for fuzzy matching to find the best matching campus location
from natural language queries. Supports exact match, alias match, and fuzzy match.
"""
from __future__ import annotations

import logging
import re
from typing import Any, Dict, List, Optional, Tuple

from rapidfuzz import fuzz, process

from location_service import LocationService

logger = logging.getLogger(__name__)


class SearchResult:
    """Represents a search result with match details."""

    def __init__(
        self,
        location: Dict[str, Any],
        score: float,
        match_type: str,
        matched_term: str,
    ):
        self.location = location
        self.score = score
        self.match_type = match_type  # 'exact', 'alias', 'fuzzy', 'fallback'
        self.matched_term = matched_term

    def to_dict(self) -> Dict[str, Any]:
        return {
            "location": self.location,
            "score": self.score,
            "match_type": self.match_type,
            "matched_term": self.matched_term,
        }


class SearchService:
    """Intelligent search layer using RapidFuzz for fuzzy matching."""

    def __init__(self, location_service: LocationService):
        self.location_service = location_service
        self._build_search_index()
        logger.info("Search service initialized with fuzzy matching")

    def _build_search_index(self) -> None:
        """Build the search index from all locations and aliases."""
        self._alias_map = self.location_service.get_all_aliases()
        self._search_terms = []
        self._term_to_location = {}

        for entry in self._alias_map:
            alias = entry["alias"]
            location = entry["location"]
            self._search_terms.append(alias)
            self._term_to_location[alias] = location

        # Deduplicate
        unique = {}
        for alias, loc in self._term_to_location.items():
            if alias not in unique:
                unique[alias] = loc
        self._term_to_location = unique
        self._search_terms = list(unique.keys())

        logger.debug(
            f"Search index built with {len(self._search_terms)} terms "
            f"across {self.location_service.get_location_count()} locations"
        )

    def _extract_query_intent(self, query: str) -> str:
        """Extract the actual location name from a natural language query.

        Examples:
            "Where is the library?" -> "library"
            "Take me to AI Lab" -> "AI Lab"
            "Guide me to the Placement Cell" -> "Placement Cell"
        """
        text = query.strip().lower()

        # Remove common stop words and prefixes
        stop_patterns = [
            r"^(where is|where's|where can i find|how do i reach|how to reach|"
            r"take me to|guide me to|show me|find|locate|"
            r"i want to go to|i need to find|"
            r"directions to|navigate to|lead me to|point me to)\s+",
            r"[?.!]*$",
            r"^the\s+",
        ]

        cleaned = text
        for pattern in stop_patterns:
            cleaned = re.sub(pattern, "", cleaned).strip()

        # Remove articles
        cleaned = re.sub(r"^(a|an|the)\s+", "", cleaned).strip()

        return cleaned if cleaned else text

    def _exact_match(self, query: str) -> Optional[Tuple[Dict[str, Any], str]]:
        """Try exact match against names and aliases."""
        query_lower = query.lower().strip()
        for term, location in self._term_to_location.items():
            if term == query_lower:
                logger.debug(f"Exact match found: '{query}' -> '{location.get('name')}'")
                return (location, term)
        return None

    def _fuzzy_match(
        self, query: str, score_cutoff: float = 70.0
    ) -> Optional[Tuple[Dict[str, Any], str, float]]:
        """Use RapidFuzz to find the best fuzzy match."""
        query_lower = query.lower().strip()

        # Use process.extractOne for best match
        result = process.extractOne(
            query_lower,
            self._search_terms,
            scorer=fuzz.WRatio,
            score_cutoff=score_cutoff,
        )

        if result:
            best_term, score, _ = result
            location = self._term_to_location.get(best_term)
            if location:
                logger.debug(
                    f"Fuzzy match: '{query}' -> '{best_term}' "
                    f"(score: {score:.1f}%) -> '{location.get('name')}'"
                )
                return (location, best_term, score)
        return None

    def _fallback_match(self, query: str) -> Optional[Tuple[Dict[str, Any], str, float]]:
        """Lower the threshold and try again for a broader match."""
        return self._fuzzy_match(query, score_cutoff=40.0)

    def search(self, query: str, min_score: float = 60.0) -> SearchResult:
        """Search for a campus location from natural language query.

        Uses a layered approach:
        1. Extract intent from natural language
        2. Try exact match
        3. Try alias match
        4. Try fuzzy match with high threshold
        5. Try fuzzy match with lower threshold (fallback)

        Returns a SearchResult object.
        """
        intent = self._extract_query_intent(query)
        logger.info(f"Searching for: '{query}' (extracted intent: '{intent}')")

        if not intent:
            return SearchResult(
                location={},
                score=0,
                match_type="empty",
                matched_term="",
            )

        # Layer 1: Exact match
        exact = self._exact_match(intent)
        if exact:
            location, term = exact
            return SearchResult(
                location=location,
                score=100.0,
                match_type="exact",
                matched_term=term,
            )

        # Layer 2: Exact match on the original query (not just extracted intent)
        exact_full = self._exact_match(query.lower().strip())
        if exact_full:
            location, term = exact_full
            return SearchResult(
                location=location,
                score=100.0,
                match_type="exact",
                matched_term=term,
            )

        # Layer 3: Fuzzy match on intent
        fuzzy = self._fuzzy_match(intent, score_cutoff=min_score)
        if fuzzy:
            location, term, score = fuzzy
            return SearchResult(
                location=location,
                score=score,
                match_type="fuzzy",
                matched_term=term,
            )

        # Layer 4: Fuzzy match on full query
        fuzzy_full = self._fuzzy_match(query.lower().strip(), score_cutoff=min_score)
        if fuzzy_full:
            location, term, score = fuzzy_full
            return SearchResult(
                location=location,
                score=score,
                match_type="fuzzy",
                matched_term=term,
            )

        # Layer 5: Fallback with lower threshold
        fallback = self._fallback_match(intent)
        if fallback:
            location, term, score = fallback
            return SearchResult(
                location=location,
                score=score,
                match_type="fallback",
                matched_term=term,
            )

        # No match found
        logger.info(f"No match found for: '{query}'")
        return SearchResult(
            location={},
            score=0,
            match_type="not_found",
            matched_term=intent,
        )

    def suggest_alternatives(self, query: str, top_n: int = 3) -> List[Dict[str, Any]]:
        """Suggest alternative locations when exact match fails."""
        intent = self._extract_query_intent(query)
        results = process.extract(
            intent.lower().strip(),
            self._search_terms,
            scorer=fuzz.WRatio,
            limit=top_n,
        )

        suggestions = []
        seen_ids = set()
        for term, score, _ in results:
            if score < 40:
                continue
            location = self._term_to_location.get(term)
            if location and location.get("id") not in seen_ids:
                seen_ids.add(location.get("id"))
                suggestions.append(
                    {
                        "location": location,
                        "score": score,
                        "matched_term": term,
                    }
                )

        return suggestions

    def rebuild_index(self) -> None:
        """Rebuild the search index (call this after data reload)."""
        self._build_search_index()
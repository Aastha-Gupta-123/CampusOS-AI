"""
config.py
---------
Responsibility: Load environment variables from .env and expose
them as typed constants. This is the ONLY place in the codebase
that reads environment variables — all other modules import from here.
"""

import os
from dotenv import load_dotenv

# Load .env file into environment — must run before any os.getenv calls
load_dotenv()


def _require(key: str) -> str:
    """Read a required env variable. Raise clearly if it is missing or placeholder."""
    value = os.getenv(key, "").strip()
    if not value or value == "your_groq_api_key_here":
        raise EnvironmentError(
            f"\n  [Config Error] '{key}' is not set.\n"
            f"  Open the .env file and add your Groq API key:\n"
            f"  {key}=gsk_your_actual_key_here\n"
        )
    return value


GROQ_API_KEY: str = _require("GROQ_API_KEY")
GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB: str = os.getenv("MONGO_DB", "smartcampus")

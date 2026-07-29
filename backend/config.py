"""Configuration and AI model setup.

Exports a `model` variable that is an instance of ChatGroq (or None if not configured).
"""
from __future__ import annotations

import os
from typing import Optional
from dotenv import load_dotenv

from langchain_groq import ChatGroq

# Load .env into environment
load_dotenv()

GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY")
GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
GROQ_MAX_TOKENS: int = int(os.getenv("GROQ_MAX_TOKENS", "4096"))

# Exported `model` variable: either an instance of ChatGroq or None
model: Optional[ChatGroq] = None

if GROQ_API_KEY:
    try:
        model = ChatGroq(
            api_key=GROQ_API_KEY,
            model=GROQ_MODEL,
            max_tokens=GROQ_MAX_TOKENS,
        )
    except Exception as e:
        print(f"Warning: Failed to initialize ChatGroq: {e}")
        model = None
else:
    print("Info: GROQ_API_KEY not set. AI features will use fallback logic.")

__all__ = ["GROQ_API_KEY", "GROQ_MODEL", "model", "ChatGroq"]
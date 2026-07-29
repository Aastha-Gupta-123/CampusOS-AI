"""
db.py
-----
MongoDB connection singleton.
"""

import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

_client: MongoClient | None = None


def get_db():
    global _client
    if _client is None:
        uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
        db_name = os.getenv("MONGO_DB", "smartcampus")
        _client = MongoClient(uri)
        return _client[db_name]
    return _client[os.getenv("MONGO_DB", "smartcampus")]

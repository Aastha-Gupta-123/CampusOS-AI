"""
mongo_seeder.py
---------------
Seeds attendance.json into MongoDB if the collection is empty.
"""

import os
from utils.db import get_db
from utils.json_reader import load_json

DATA_PATH = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "data", "attendance.json"))


def seed():
    db = get_db()
    data = load_json(DATA_PATH)
    roll = data["student"]["roll_number"]
    db.students.replace_one(
        {"roll_number": roll},
        {**data["student"], "attendance": data["attendance"]},
        upsert=True,
    )
    print(f"[MongoDB] Student '{roll}' upserted.")

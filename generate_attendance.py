"""
generate_attendance.py
----------------------
Uses Faker to generate a realistic student attendance JSON file.
Run:  python generate_attendance.py
Output: data/attendance.json  (overwrites existing file)
"""

import json
import random
import os
from faker import Faker

fake = Faker("en_IN")
random.seed(fake.random_int(1, 9999))

# ── Subject pools per department ──────────────────────────────────

DEPARTMENTS = [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Information Technology",
]

DEPT_SUBJECTS = {
    "Computer Science and Engineering": [
        ("Artificial Intelligence",         4),
        ("Database Management System",      4),
        ("Operating Systems",               3),
        ("Computer Networks",               3),
        ("Software Engineering",            3),
        ("Mathematics III",                 4),
        ("Web Technologies",                2),
        ("Theory of Computation",           3),
        ("Machine Learning",                4),
        ("Cloud Computing",                 3),
    ],
    "Electronics and Communication Engineering": [
        ("Digital Signal Processing",       4),
        ("VLSI Design",                     4),
        ("Microprocessors and Controllers", 3),
        ("Analog Circuits",                 3),
        ("Electromagnetic Theory",          3),
        ("Communication Systems",           4),
        ("Embedded Systems",                3),
        ("Control Systems",                 3),
    ],
    "Mechanical Engineering": [
        ("Thermodynamics",                  4),
        ("Fluid Mechanics",                 4),
        ("Manufacturing Processes",         3),
        ("Machine Design",                  3),
        ("Heat Transfer",                   3),
        ("Engineering Materials",           3),
        ("Dynamics of Machinery",           4),
        ("Industrial Engineering",          3),
    ],
    "Civil Engineering": [
        ("Structural Analysis",             4),
        ("Geotechnical Engineering",        4),
        ("Fluid Mechanics",                 3),
        ("Transportation Engineering",      3),
        ("Environmental Engineering",       3),
        ("Surveying",                       3),
        ("Concrete Technology",             4),
        ("Construction Management",         3),
    ],
    "Information Technology": [
        ("Data Structures and Algorithms",  4),
        ("Computer Organization",           3),
        ("Software Testing",                3),
        ("Information Security",            4),
        ("Mobile Application Development",  3),
        ("Big Data Analytics",              4),
        ("Internet of Things",              3),
        ("Human Computer Interaction",      2),
    ],
}

FACULTY_TITLES = ["Dr.", "Prof.", "Mr.", "Ms."]

DEPT_PREFIX = {
    "Computer Science and Engineering":             "CS",
    "Electronics and Communication Engineering":    "EC",
    "Mechanical Engineering":                       "ME",
    "Civil Engineering":                            "CE",
    "Information Technology":                       "IT",
}

# ── Helpers ───────────────────────────────────────────────────────

def make_faculty():
    title = random.choice(FACULTY_TITLES)
    # Strip any existing title from faker name
    raw = fake.name()
    for t in ["Mr. ", "Ms. ", "Mrs. ", "Dr. ", "Miss "]:
        raw = raw.replace(t, "")
    return f"{title} {raw.strip()}"


def make_roll(dept, sem):
    prefix = DEPT_PREFIX.get(dept, "XX")
    year   = random.randint(2021, 2024)
    num    = random.randint(1, 120)
    return f"{prefix}{year}{num:03d}"


def make_record(subject, credits):
    """
    Realistic distribution:
      30% shortage  (<75%)
      50% good      (75-89%)
      20% excellent (>=90%)
    """
    total = random.choice([40, 42, 44, 45, 46, 48, 50])
    roll  = random.random()
    if roll < 0.30:
        pct = random.uniform(45, 74)
    elif roll < 0.80:
        pct = random.uniform(75, 89)
    else:
        pct = random.uniform(90, 100)

    attended = min(total, round(total * pct / 100))
    return {
        "subject":          subject,
        "attended_classes": attended,
        "total_classes":    total,
        "faculty":          make_faculty(),
        "credits":          credits,
    }


# ── Generate ──────────────────────────────────────────────────────

def generate():
    dept     = random.choice(DEPARTMENTS)
    sem      = random.randint(1, 8)
    pool     = DEPT_SUBJECTS[dept]
    subjects = random.sample(pool, k=random.randint(6, 8))

    return {
        "student": {
            "name":        fake.first_name(),
            "roll_number": make_roll(dept, sem),
            "semester":    sem,
            "department":  dept,
        },
        "attendance": [make_record(s, c) for s, c in subjects],
    }


# ── Main ──────────────────────────────────────────────────────────

if __name__ == "__main__":
    out_path = os.path.join(os.path.dirname(__file__), "data", "attendance.json")
    data     = generate()

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print("=" * 55)
    print("  SmartCampus — Attendance Data Generated")
    print("=" * 55)
    print(f"  Name     : {data['student']['name']}")
    print(f"  Roll No  : {data['student']['roll_number']}")
    print(f"  Dept     : {data['student']['department']}")
    print(f"  Semester : {data['student']['semester']}")
    print(f"  Subjects : {len(data['attendance'])}")
    print("-" * 55)
    for r in data["attendance"]:
        pct  = round(r["attended_classes"] / r["total_classes"] * 100, 1)
        tag  = "LOW " if pct < 75 else ("TOP " if pct >= 90 else "OK  ")
        print(f"  [{tag}] {r['subject']:<38} {r['attended_classes']:>2}/{r['total_classes']}  {pct}%")
    print("-" * 55)
    print(f"  Saved -> {out_path}")
    print("=" * 55)

# SmartCampus — AI Attendance Agent

A modular, rule-based AI agent that answers attendance-related questions using data from a local JSON file.

## Project Structure

```
SmartCampus/
├── app.py                          # Entry point — chatbot REPL loop
├── agents/
│   └── attendance_agent.py         # Intent detection + response generation
├── data/
│   └── attendance.json             # Student attendance data
├── models/
│   └── attendance_model.py         # AttendanceRecord & StudentProfile dataclasses
├── services/
│   └── attendance_service.py       # Business logic orchestration layer
├── utils/
│   ├── json_reader.py              # File I/O, JSON parsing, validation
│   └── attendance_calculator.py    # Pure math functions
└── requirements.txt
```

## How to Run

```bash
cd SmartCampus
python app.py
```

Requires Python 3.10+. No external packages needed.

## Supported Questions

| Question | Intent |
|---|---|
| What is my overall attendance? | overall |
| Show DBMS attendance | subject |
| Which subjects are below 75%? | below_75 |
| Which subjects are above 90%? | above_90 |
| Which subject has the highest attendance? | highest |
| Which subject has the lowest attendance? | lowest |
| Am I eligible for exams? | eligibility |

## Architecture

```
Student Question
      │
      ▼
   app.py  (REPL loop)
      │
      ▼
attendance_agent.py  (detect intent → call service → format response)
      │
      ▼
attendance_service.py  (orchestrate: load + convert + calculate)
      │
      ├──► attendance_model.py  (AttendanceRecord dataclass)
      ├──► attendance_calculator.py  (pure math)
      └──► json_reader.py  (file I/O)
                │
                ▼
         attendance.json
```

## Extending the Agent

- Add a new intent: add keywords to `INTENT_KEYWORDS` and a handler in `AttendanceAgent`
- Switch data source (e.g. SQLite): only modify `json_reader.py` and `AttendanceService.__init__`
- Add a web API: keep all layers, replace `app.py` with a Flask/FastAPI app

# Smart Campus & Student Experience — Local Setup

This repository contains a FastAPI backend and a React + Vite frontend for a hackathon project: an AI-powered Campus Navigation and Hostel Complaint assistant.

Overview
- Backend: `backend/` — FastAPI, SQLAlchemy (SQLite), and an optional Google Gemini wrapper.
- Frontend: `frontend/` — React + Vite, Tailwind CSS, Axios for API calls.

Quick Start

1) Backend

 - Create a virtual environment and activate it (Windows example):
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

 - Install backend dependencies:
```powershell
pip install -r backend/requirements.txt
```

 - Copy `.env.example` to `.env` and set your `GEMINI_API_KEY` (optional):
```powershell
copy backend\.env.example backend\.env
# Edit backend\.env to add GEMINI_API_KEY
```

 - Start the FastAPI server:
```powershell
uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000
```

API endpoints (examples):
- `GET /chat?question=` — unified chat routing between navigation and complaints.
- `GET /navigate?place=` — navigation lookup.
- `POST /complaint` — submit complaint JSON `{ student_name, room_number, description }`.
- `GET /complaints` — list complaints.
- `POST /complaint/{complaint_id}/status` — update status JSON `{ status }`.

2) Frontend

 - Install dependencies:
```bash
cd frontend
npm install
```

 - Start dev server:
```bash
npm run dev
```

 - Open http://localhost:3000 in your browser.

Notes
- The backend seeds example campus locations from `backend/data/campus_locations.json` when the DB is empty.
- Gemini integration is optional; if `GEMINI_API_KEY` is not provided or `google-generativeai` is not installed, the app will still run with template responses.
- Do NOT commit real API keys. Use `.env` for local secrets.

Troubleshooting
- If you get CORS errors, ensure the frontend runs at `http://localhost:3000` or update allowed origins in `backend/app.py`.
- If tables are missing, ensure the backend has write permissions to `backend/database/`.

Next steps
- (Optional) Replace `google-generativeai` with the newer `google.genai` client if you upgrade.
- Add tests and CI for production readiness.
# Smart Campus & Student Experience

This project contains a FastAPI backend for two AI-powered agents:

- Campus Navigation Agent: helps students find campus locations and gives navigation guidance.
- Hostel Complaint Agent: classifies complaints, sets priorities, stores them in SQLite, and tracks status.

## Features

- FastAPI REST API
- SQLAlchemy + SQLite persistence
- Campus location search and navigation guidance
- Hostel complaint registration and tracking
- Clean modular structure with comments and validation

## Setup

### Backend

1. Create a virtual environment.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and add your Gemini API key.
4. Run the API:
   ```bash
   python app.py
   ```

### Frontend

1. Open the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the UI:
   ```bash
   npm run dev
   ```

## API Endpoints

- GET /health
- GET /navigate?place=Library
- POST /complaint
- GET /complaint/{complaint_id}
- GET /complaints
- POST /complaint/{complaint_id}/status
- GET /locations
- POST /locations

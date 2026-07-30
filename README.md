# CampusMate AI — Multi-Agent AI Platform

CampusMate AI is a unified, production-ready campus assistant that merges multiple AI agent projects into one professional platform. It combines campus navigation, hostel support, attendance, timetable planning, placement guidance, learning coaching, and the CampusOS-AI experience under a single dashboard.

## 🚀 Overview

| Agent | Purpose |
|-------|---------|
| 🧭 Campus Navigation AI | Find campus locations and get directions |
| 🏢 Hostel Complaint AI | Report and track hostel issues |
| 📊 Attendance AI | Review attendance and eligibility |
| 📅 Timetable AI | View schedules and weekly plans |
| 💼 Placement AI | Generate personalized placement prep plans |
| 🎓 CampusOS AI | Unified learning and placement assistant |
| 🤖 Master Orchestrator | Routes requests to the right agent automatically |

## 🏗️ Architecture

```
Frontend (React + Vite) → REST API → FastAPI Backend → SQLite/PostgreSQL
                                        ↓
                              Multi-Agent Orchestrator
                              (Navigation, Hostel, Attendance, Timetable)
```

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, React Router, Lucide Icons
- **Backend:** FastAPI, SQLAlchemy, SQLite, LangChain Groq, RapidFuzz
- **AI Models:** Groq (optional - falls back to rule-based responses)
- **Deployment:** Docker, Vercel (frontend), Render/Railway (backend)

## 🔧 Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### 1) Backend Setup

Create and activate a Python virtual environment, install dependencies from `backend/requirements.txt`, copy `.env.example` to `.env` and edit with your configuration, then start the API server with uvicorn on port 8001.

### 2) Frontend Setup

Install npm dependencies from the `frontend` directory, then start the Vite development server. Open **http://localhost:3000** in your browser.

## 🐳 Docker Deployment

### Build and Run with Docker Compose

Clone the repository, copy `.env.example` to `.env` and edit with your configuration, then build and start all services with `docker-compose up --build -d`. Use `docker-compose logs -f` to check logs and `docker-compose down` to stop.

### Individual Docker Builds

Build the backend image with the backend Dockerfile and run it with the environment file. Build the frontend image with the frontend Dockerfile, passing the `VITE_API_URL` build argument, and run it on port 3000.

## 🌐 Deployment Guides

### Option 1: Vercel (Frontend) + Render (Backend) - Recommended

#### Frontend → Vercel

Push code to GitHub, import your repository on Vercel, set the root directory to `frontend`, add the `VITE_API_URL` environment variable pointing to your Render backend URL, and deploy.

#### Backend → Render

Create a new Web Service on Render, connect your GitHub repository, set the root directory to `backend`, use `pip install -r requirements.txt` as the build command and `uvicorn app:app --host 0.0.0.0 --port $PORT --workers 2` as the start command, add environment variables from `.env.example`, and deploy.

### Option 2: Railway (Backend)

Create a new project on Railway, connect your GitHub repository, set the root directory to `backend`, add environment variables, and deploy.

### Option 3: Full Docker Deployment

On your VPS or cloud server, clone the repository, copy `.env.example` to `.env` with production values, and run `docker-compose up --build -d`.

## 📡 API Endpoints

### Orchestrator
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chat?question=` | Master orchestrator - routes to correct agent |
| GET | `/orchestrator/status` | Status of all AI agents |

### Navigation
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chat/navigation?question=` | Navigation AI chat |
| GET | `/chat/navigation/info` | Navigation knowledge base info |
| GET | `/navigate?place=` | Legacy navigation lookup |

### Hostel / Complaints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chat/hostel?question=` | Hostel complaint AI chat |
| POST | `/complaint` | Submit complaint |
| GET | `/complaints` | List all complaints |
| GET | `/complaints/{id}` | Get complaint by ID |
| POST | `/complaint/{id}/status` | Update complaint status |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chat/attendance?question=` | Attendance AI chat |
| GET | `/attendance/summary` | Attendance summary data |

### Timetable
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chat/timetable?question=` | Timetable AI chat |
| GET | `/timetable/summary` | Timetable summary data |

### Dashboard & Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Live dashboard statistics |
| GET | `/system/health` | System health check |
| GET | `/health` | Basic health check |

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | No | Groq API key for AI responses |
| `GROQ_MODEL` | No | Groq model name |
| `JWT_SECRET_KEY` | Yes | Secret key for JWT tokens |
| `DATABASE_URL` | No | Database connection string |
| `FRONTEND_URL` | Yes | Frontend URL for CORS |
| `CORS_ORIGINS` | Yes | Allowed CORS origins |
| `VITE_API_URL` | Yes | Backend API URL (frontend) |
| `LOG_LEVEL` | No | Logging level (default: INFO) |

## 📁 Project Structure

```
CampusAIAgent/
├── backend/
│   ├── app.py                    # FastAPI entry point
│   ├── routes.py                 # All API routes
│   ├── config.py                 # AI model configuration
│   ├── database.py               # SQLAlchemy database setup
│   ├── models.py                 # Database models
│   ├── auth_routes.py            # Authentication routes
│   ├── auth_utils.py             # JWT & password utilities
│   ├── orchestrator_agent.py     # Master Orchestrator
│   ├── navigation_agent.py       # Navigation AI agent
│   ├── hostel_agent.py           # Hostel complaint agent
│   ├── attendance_agent.py       # Attendance AI agent
│   ├── timetable_agent.py        # Timetable AI agent
│   ├── placement_agent.py        # Placement preparation agent
│   ├── learning_agent.py         # Learning coach agent
│   ├── location_service.py       # Location knowledge base
│   ├── search_service.py         # Fuzzy search service
│   ├── requirements.txt          # Python dependencies
│   ├── Dockerfile                # Backend Docker image
│   └── data/                     # JSON data files
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main app with routing
│   │   ├── services/api.js      # API service layer
│   │   ├── context/AuthContext.jsx  # Auth state management
│   │   ├── components/          # Reusable components
│   │   └── pages/               # Page components
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile               # Frontend Docker image
│   └── tailwind.config.js
├── docker-compose.yml           # Multi-container setup
├── vercel.json                  # Vercel deployment config
├── render.yaml                  # Render deployment config
├── .env.example                 # Environment variables template
└── README.md
```

## ✨ Features

- ✅ **Single unified dashboard** for all AI agents
- ✅ **Master Orchestrator** with intelligent intent routing
- ✅ **6 specialized AI agents** working independently
- ✅ **Modern enterprise SaaS UI** with dark mode
- ✅ **Responsive design** with sidebar navigation
- ✅ **Real-time dashboard** with live statistics
- ✅ **Fuzzy search** for campus locations
- ✅ **AI-powered responses** (optional Groq integration)
- ✅ **Graceful fallback** when AI models are unavailable
- ✅ **SQLite persistence** for complaints
- ✅ **JWT authentication** with registration and login
- ✅ **Docker support** for easy deployment
- ✅ **Production-ready** CORS and logging configuration

## 🧪 Testing

Run backend tests with pytest from the backend directory. Test the frontend build with `npm run build` from the frontend directory.

## 📝 License

MIT License - feel free to use and modify for your campus.
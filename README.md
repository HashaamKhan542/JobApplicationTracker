# JobApplicationTracker
Full-stack AI-powered job application tracker with Claude-driven interview prep and resume fit scoring — built with FastAPI, React, and SQLite.
---

## Overview

JobApplicationTracker is a portfolio project that combines a structured application pipeline with Claude-powered AI features. Beyond basic CRUD functionality, the system uses large language models to generate tailored interview questions from job descriptions and produce detailed fit scores based on a candidate profile — reducing manual prep time and surfacing actionable insights directly in the UI.

---

## Features

### Application Pipeline
- Create, update, and delete job applications
- Track company, role, status (Applied, Interviewing, Offer, Rejected), date applied, and freeform notes
- Filter and sort applications by status or date

### Analytics Dashboard
- Visual breakdown of application statuses
- Pipeline conversion metrics (applications → interviews → offers)
- Weekly application volume tracking

### AI Interview Prep
- Paste any job description into the tool
- Claude generates 5 to 8 tailored, role-specific interview questions
- Questions are categorised by type (technical, behavioural, situational)

### AI Fit Score
- Paste a job description to receive a structured match analysis
- Claude compares the JD against a predefined candidate profile
- Output includes a fit score, matched skills, skill gaps, and a summary recommendation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.13, FastAPI |
| Frontend | React 18, Vite |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Database | SQLite via SQLAlchemy |
| Deployment | Backend on Render, Frontend on Vercel |

---

## Project Structure

```
JobApplicationTracker/
├── backend/
│   ├── routers/
│   │   ├── applications.py     # CRUD endpoints
│   │   ├── ai.py               # Interview prep and fit score endpoints
│   │   └── analytics.py        # Dashboard stats endpoints
│   ├── models/
│   │   └── application.py      # SQLAlchemy models and Pydantic schemas
│   ├── services/
│   │   └── ai_service.py       # Claude API integration logic
│   ├── main.py                 # FastAPI app entry point
│   ├── database.py             # SQLite connection and session management
│   ├── .env                    # Environment variables (not committed)
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/         # Reusable UI components
    │   ├── pages/              # Route-level page components
    │   └── api/                # Axios API client
    ├── index.html
    └── vite.config.js
```

---

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```
ANTHROPIC_API_KEY=your_api_key_here
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The React app will run at `http://localhost:5173`.

---

## AI Architecture

Both AI features follow the same pattern: the frontend sends a job description string to a FastAPI endpoint, which constructs a structured prompt and forwards it to the Claude API via the `anthropic` Python SDK. The response is parsed and returned to the frontend as structured JSON.

### Interview Prep Prompt Design

The system prompt anchors Claude to produce only interview questions in a specific format, categorised by question type. The job description is injected as user content, keeping the system prompt reusable across any role or industry.

### Fit Score Prompt Design

The candidate profile (skills, experience, education) is embedded in the system prompt as static context. Claude is instructed to compare the provided JD against this profile and return a structured JSON response containing a numeric fit score (0–100), matched skills, missing skills, and a plain-English recommendation.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/applications` | Fetch all applications |
| POST | `/applications` | Create a new application |
| PUT | `/applications/{id}` | Update an application |
| DELETE | `/applications/{id}` | Delete an application |
| GET | `/analytics/summary` | Fetch pipeline stats |
| POST | `/ai/interview-prep` | Generate interview questions from a JD |
| POST | `/ai/fit-score` | Generate a fit score from a JD |

---

## Deployment

### Backend (Render)

1. Push the `backend/` directory to GitHub
2. Create a new Web Service on Render pointing to the repo
3. Set the build command to `pip install -r requirements.txt`
4. Set the start command to `uvicorn main:app --host 0.0.0.0 --port 10000`
5. Add `ANTHROPIC_API_KEY` as an environment variable in the Render dashboard

### Frontend (Vercel)

1. Import the `frontend/` directory into Vercel
2. Set the framework preset to Vite
3. Add `VITE_API_URL` pointing to your Render backend URL as an environment variable

---

## About

Built by **Hashaam Khan** — Master of Data Science (Distinction, WAM 73, Deakin University) and Bachelor of Software Engineering.

Actively seeking roles in AI Engineering, Data Engineering, and Data Analytics in Melbourne, Australia.

[LinkedIn](https://linkedin.com/in/hashaamkhan) · [GitHub](https://github.com/HashaamKhan)

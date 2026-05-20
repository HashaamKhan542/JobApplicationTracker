# JobApplicationTracker

Full-stack AI-powered job application tracker with user accounts, profile-driven AI features, and Claude-generated interview prep and fit scoring — built with FastAPI, React, and SQLite.

---

## Overview

JobApplicationTracker is a portfolio project that combines a structured application pipeline with Claude-powered AI features. Users create an account, complete a profile wizard (skills, experience, education, job preferences), and the system uses that profile to generate personalised interview questions and fit scores against any job description — no hardcoded candidate data.

---

## Features

### Authentication & Accounts
- JWT-based registration and login (tokens stored in localStorage, 7-day expiry)
- Passwords hashed with bcrypt via passlib
- All data is user-scoped — each account sees only its own applications

### Profile Setup Wizard
- 4-step onboarding: Basic Info → Experience & Skills → Education → Job Preferences
- Tag-based skill and target-role inputs
- Work type preference pills (Remote / Hybrid / On-site / Open to all)
- Salary range inputs
- Profile gates access to the app — incomplete profiles are redirected to setup

### Application Pipeline
- Create, update, and delete job applications
- Track company, role, status (Applied / Interviewing / Offer / Rejected), date applied, and notes
- Real-time search by company or role
- Filter tabs by status with per-tab counts
- Stats strip showing application counts per status

### Analytics Dashboard
- Status breakdown donut chart
- Hiring funnel conversion visualization (applied → interviews → offers)
- Weekly application volume bar chart
- Summary stat cards

### AI Interview Prep
- Paste any job description to generate 5–8 tailored interview questions
- Questions categorised by type: Technical, Behavioural, Situational
- Results rendered as structured cards with numbered question badges
- One-click copy for all questions

### AI Fit Score
- Paste a job description for a match analysis against your own profile
- Claude reads your saved profile (skills, experience, education) from the database
- Output: numeric fit score, matched skills, skill gaps, and a plain-English recommendation
- Score rendered as an animated circular ring with colour-coded skill tags

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.13, FastAPI, SQLAlchemy, SQLite |
| Auth | JWT (`python-jose`), bcrypt (`passlib`, `bcrypt==4.0.1`) |
| Frontend | React 18, Vite, React Router, Recharts |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| HTTP Client | Axios (with request interceptor for Bearer token) |
| Deployment | Backend on Render / Railway, Frontend on Vercel |

---

## Project Structure

```
JobApplicationTracker/
├── Backend/
│   ├── models/
│   │   ├── __init__.py         # Registers all models for SQLAlchemy
│   │   ├── user.py             # User and UserProfile tables
│   │   └── application.py      # Application table (user_id FK)
│   ├── routers/
│   │   ├── auth.py             # /auth/register, /auth/login, /auth/me
│   │   ├── profile.py          # /profile/me, /profile/setup
│   │   ├── applications.py     # CRUD endpoints (auth-gated, user-scoped)
│   │   ├── analytics.py        # /analytics/summary (user-scoped)
│   │   └── ai.py               # /ai/interview-prep, /ai/fit-score
│   ├── auth_utils.py           # JWT creation/verification, get_current_user dependency
│   ├── main.py                 # FastAPI app, CORS config, router registration
│   ├── database.py             # SQLite connection and session management
│   ├── .env                    # Environment variables (not committed)
│   └── requirements.txt
└── Frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.js       # Axios client with Bearer token interceptor
    │   ├── context/
    │   │   └── AuthContext.jsx # Auth state, login/signup/logout, session restore
    │   ├── components/
    │   │   ├── Navbar.jsx      # Hides nav on auth pages, shows user email + sign out
    │   │   └── ProtectedRoute.jsx  # Redirects unauthenticated or profile-incomplete users
    │   └── pages/
    │       ├── Login.jsx
    │       ├── Signup.jsx
    │       ├── ProfileSetup.jsx  # 4-step wizard with TagInput component
    │       ├── Applications.jsx
    │       ├── Analytics.jsx
    │       └── AITools.jsx
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
cd Backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the `Backend/` directory:

```
ANTHROPIC_API_KEY=your_api_key_here
SECRET_KEY=your_random_secret_key_here
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

API available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

React app runs at `http://localhost:5173`.

---

## API Endpoints

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create a new user account |
| POST | `/auth/login` | Login and receive a JWT |
| GET | `/auth/me` | Get the current authenticated user |

### Profile

| Method | Endpoint | Description |
|---|---|---|
| GET | `/profile/me` | Fetch current user's profile |
| POST | `/profile/setup` | Create or update profile |

### Applications *(requires auth)*

| Method | Endpoint | Description |
|---|---|---|
| GET | `/applications/` | Fetch all applications for the current user |
| POST | `/applications/` | Create a new application |
| PUT | `/applications/{id}` | Update an application |
| DELETE | `/applications/{id}` | Delete an application |

### Analytics *(requires auth)*

| Method | Endpoint | Description |
|---|---|---|
| GET | `/analytics/summary` | Pipeline stats for the current user |

### AI *(requires auth)*

| Method | Endpoint | Description |
|---|---|---|
| POST | `/ai/interview-prep` | Generate interview questions from a job description |
| POST | `/ai/fit-score` | Score job description fit against user's saved profile |

---

## AI Architecture

Both AI endpoints receive a job description from the frontend. The backend loads the authenticated user's profile from the database and constructs a personalised prompt — skills, experience level, education, and target roles are all injected as context before the job description. Claude then generates structured output that the frontend parses into cards and visualisations without any external markdown library.

---

## Deployment

### Backend (Render or Railway)

1. Push the repo to GitHub
2. Create a new Web Service pointing to the `Backend/` directory
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port 10000`
5. Add environment variables: `ANTHROPIC_API_KEY`, `SECRET_KEY`
6. Update the CORS `allow_origins` list in `main.py` with your Vercel frontend URL

### Frontend (Vercel)

1. Import the repo into Vercel
2. Set the root directory to `Frontend/`
3. Framework preset: Vite
4. Update `API_BASE_URL` in `src/api/client.js` to point to your deployed backend URL

---

## About

Built by **Hashaam Khan** — Master of Data Science (Distinction, WAM 73, Deakin University) and Bachelor of Software Engineering.

Actively seeking roles in AI Engineering, Data Engineering, and Data Analytics in Melbourne, Australia.

[LinkedIn](https://linkedin.com/in/hashaamkhan) · [GitHub](https://github.com/HashaamKhan542)

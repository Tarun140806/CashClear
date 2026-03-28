# 💎 CashClear — Decision Engine

> AI-powered cash-flow management: prioritize obligations, estimate risk, and protect working capital.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [How the Decision Engine Works](#how-the-decision-engine-works)
- [Frontend Pages](#frontend-pages)
- [Data Models](#data-models)

---

## Overview

CashClear is a full-stack financial decision-support tool built for hackathon-26. It helps businesses and finance teams manage outgoing cash obligations intelligently — scoring each obligation by urgency, flexibility, and penalty risk, then recommending a prioritized payment order based on available cash balance.

Users can manually enter obligations, or import them from **CSV bank statements**, **PDF files**, or **images** (via OCR). Every analysis run is saved as a report.

---

## Features

### 🔐 Auth
- Sign up / Log in with email & password
- Session persisted in `localStorage` — survives page refresh
- User profile: name, role (Analyst / Finance Manager / CFO / Accountant)

### 📊 Dashboard
- Enter cash balance and add obligations manually
- Import obligations from CSV, PDF, PNG, JPG, or WEBP files
- Run AI-powered analysis — results appear instantly
- Every analysis is **auto-saved** to the Reports page

### 👤 My Account
- View and edit profile (name, role)
- Avatar generated automatically from initials (DiceBear)
- Danger zone: sign out

### 👥 Team
- Invite team members by name, email, and role
- View member list with status badges (Active / Invited)
- Remove members; can't remove yourself

### 📋 Reports
- Full history of every analysis run
- Expandable cards showing metrics, prioritized obligation table, and AI reasoning
- Summary strip: total runs, average balance, average shortfall, latest run date
- Clear all reports

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Web framework | FastAPI |
| Data validation | Pydantic v2 |
| CSV parsing | pandas |
| Database | MongoDB (via PyMongo) |
| Server | Uvicorn |
| File ingestion | Custom CSV / PDF / OCR parsers |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| Styling | Vanilla CSS (design system with CSS variables) |
| State management | React `useState` / Context API |
| Auth | `localStorage`-backed AuthContext |
| Routing | State-based (no router library needed) |
| Fonts | Inter + Space Grotesk (Google Fonts) |

---

## Project Structure

```
hackathon-26/
├── backend/
│   ├── main.py                  # FastAPI app, CORS config, router mounting
│   ├── requirements.txt
│   ├── models/
│   │   └── schema.py            # Pydantic models: Obligation, AnalyzeRequest, AnalyzeResponse
│   ├── routes/
│   │   ├── decision.py          # POST /analyze
│   │   └── upload.py            # POST /upload/document
│   ├── services/
│   │   ├── decision_engine.py   # Core scoring + prioritization logic
│   │   ├── risk_analysis.py     # Can-pay / risk-level assignment
│   │   ├── mongo_service.py     # Save analysis & upload events to MongoDB
│   │   ├── llm_service.py       # (stub) LLM integration
│   │   └── simulation.py        # (stub) Cash-flow simulation
│   ├── ingestion/
│   │   ├── csv_parser.py        # Parse bank statement CSVs → transactions
│   │   ├── pdf_parser.py        # Extract obligations from PDFs
│   │   └── ocr.py               # Extract obligations from images
│   └── utils/
│       └── scoring.py           # Priority score formula
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── src/
│   │   ├── main.jsx             # Entry point; wraps app in AuthProvider
│   │   ├── App.jsx              # Shell: sidebar + page routing + DashboardPage
│   │   ├── App.css              # Full design system (tokens, layout, components)
│   │   ├── index.css            # Base reset + font import
│   │   ├── api.js               # (API helpers)
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Login, signup, logout, updateProfile
│   │   ├── components/
│   │   │   ├── InputForm.jsx    # Cash balance + obligation entry form
│   │   │   └── Results.jsx      # Analysis results table + reasoning
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx     # Login / Signup split-layout page
│   │   │   ├── AuthPage.css     # Auth page styles
│   │   │   ├── AccountPage.jsx  # Profile settings + danger zone
│   │   │   ├── TeamPage.jsx     # Invite + manage team members
│   │   │   └── ReportsPage.jsx  # History of saved analysis runs
│   │   └── utils/
│   │       └── reports.js       # saveReport / loadReports / clearReports
│
├── data/                        # Sample data files
├── test.csv                     # Sample bank statement CSV
├── .env.example                 # Environment variable template
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)

---

### Backend Setup

```bash
# 1. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate       # macOS / Linux
# .venv\Scripts\activate        # Windows

# 2. Install Python dependencies
pip install -r backend/requirements.txt

# 3. Copy and fill in environment variables
cp .env.example .env
# Edit .env — set MONGODB_URI and MONGODB_DB

# 4. Start the API server (from the project root)
uvicorn backend.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

---

### Frontend Setup

```bash
# From the project root
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

> **Note:** The frontend dev server proxies API calls to `http://localhost:8000`. Make sure the backend is running before using the app.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `MONGODB_DB` | Database name | `cashclear` |

MongoDB is used to persist analysis events and file upload events. The app **works without MongoDB** — if the connection fails, events are simply not saved.

---

## API Reference

Base URL: `http://localhost:8000`

### `GET /health`
Returns server status.

```json
{ "status": "ok" }
```

---

### `POST /analyze`
Runs the decision engine on the provided obligations.

**Request body:**
```json
{
  "cash_balance": 230000,
  "obligations": [
    {
      "id": "ob-1",
      "vendor": "Supplier Co.",
      "amount": 50000,
      "due_date": "2026-04-01",
      "penalty_if_late": 2000,
      "flexibility": "low"
    }
  ]
}
```

**Response:**
```json
{
  "cash_balance": 230000,
  "total_obligations": 50000,
  "shortfall": 0,
  "days_to_zero": 138,
  "prioritized_obligations": [
    {
      "vendor": "Supplier Co.",
      "amount": 50000,
      "score": 52.0,
      "can_pay": true,
      "risk_level": "low",
      "status": "upcoming"
    }
  ],
  "reasoning": "All obligations can be covered with current cash balance.",
  "summary": {
    "total_can_pay": 1,
    "total_deferred": 0,
    "all_covered": true
  }
}
```

**Obligation fields:**

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `vendor` | string | Vendor / payee name |
| `amount` | float | Total amount owed |
| `amount_paid` | float | Already paid (default 0) |
| `due_date` | string | `YYYY-MM-DD` format |
| `penalty_if_late` | float | Late payment penalty amount |
| `flexibility` | `low` / `medium` / `high` | How deferrable the payment is |
| `recurring` | bool | Whether it recurs |
| `frequency` | `one-time` / `weekly` / `monthly` | Recurrence frequency |
| `currency` | string | Currency code (default `INR`) |

---

### `POST /upload/document`
Parses a file and extracts obligations.

**Request:** `multipart/form-data` with a `file` field.  
**Accepted formats:** `.csv`, `.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`

**Response:**
```json
{
  "source_type": "csv",
  "cash_balance": 150000.0,
  "obligations": [ ... ]
}
```

- **CSV:** Parsed as a bank statement. Negative-amount rows become obligations.
- **PDF:** Text extracted and parsed for obligation data.
- **Images:** OCR extracts text, which is then parsed for obligations.

---

## How the Decision Engine Works

Each obligation is assigned a **priority score** (0–80) by combining three factors:

| Factor | Max Points | Logic |
|---|---|---|
| **Penalty score** | 30 | `penalty_if_late / 1000`, capped at 30 |
| **Flexibility score** | 20 | `low` → 20 pts, `medium` → 10 pts, `high` → 0 pts |
| **Urgency score** | 30 | Overdue → 30, due today → 25, due in N days → `max(0, 30 − N)` |

Obligations are then sorted by score (descending), with penalty as a tiebreaker. The engine walks through the sorted list, deducting each obligation from the running cash balance:

- **Can pay → risk: low** — sufficient funds remain
- **Cannot pay, flexibility: low → risk: high**
- **Cannot pay, flexibility: medium → risk: medium**
- **Cannot pay, flexibility: high → risk: low** (safe to defer)

The response also includes:
- **Shortfall** — how much cash is missing to cover all obligations
- **Days to zero** — estimated days until cash runs out at the current burn rate
- **Reasoning** — plain-English summary (extendable with an LLM)

---

## Frontend Pages

| Page | Route (state) | Description |
|---|---|---|
| Login / Signup | `AuthPage` (unauthenticated) | Split-layout auth page |
| Dashboard | `dashboard` | Enter data, run analysis, view results |
| My Account | `account` | Edit profile, view member-since date |
| Team | `team` | Invite and manage members |
| Reports | `reports` | Browse past analyses in expandable cards |

Auth state is managed via `AuthContext` and stored in `localStorage`. Sessions persist across page refreshes.

---

## Data Models

### Obligation (core fields sent to `/analyze`)

```typescript
{
  id?:              string
  vendor?:          string
  amount:           number        // total owed
  amount_paid?:     number        // already paid
  due_date?:        string        // "YYYY-MM-DD"
  penalty_if_late?: number
  flexibility?:     "low" | "medium" | "high"
  recurring?:       boolean
  frequency?:       "one-time" | "weekly" | "monthly"
  currency?:        string        // default "INR"
}
```

### AnalyzeResponse (from `/analyze`)

```typescript
{
  cash_balance:             number
  total_obligations:        number
  shortfall:                number
  days_to_zero:             number
  prioritized_obligations:  ObligationResult[]
  reasoning:                string
  summary: {
    total_can_pay:   number
    total_deferred:  number
    all_covered:     boolean
  }
}
```

### ObligationResult (each item in prioritized_obligations)

```typescript
{
  ...Obligation
  score:      number            // 0–80 priority score
  status:     "overdue" | "due-today" | "upcoming"
  can_pay:    boolean
  risk_level: "high" | "medium" | "low"
  category:   "critical" | "high" | "medium" | "low"
}
```

---

*Built for Hackathon 26 · CashClear Decision Engine v1*

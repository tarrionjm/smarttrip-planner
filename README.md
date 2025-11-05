# SmartTrip Planner – Monorepo (Frontend + Backend)

This repository contains:
- /backend — Node.js + Express (API)
- /frontend — React (Vite)

During development:
- Backend runs at http://localhost:3000
- Frontend runs at http://localhost:5173 and calls the backend via '/api/...'

---

## Getting Started

### 1. Clone the repository

git clone https://github.com/robertstahldev/smarttrip-planner.git  
cd smarttrip-planner

### 2. Backend Setup (Express + MySQL)

    cd backend
    npm install

    Installed packages:
    - express  
    - dotenv  
    - cors  
    - morgan  
    - mysql2  
    - nodemon (dev dependency)

Create '/backend/.env' from the template (.env.example):

    PORT=3000
    DB_HOST=localhost
    DB_USER=root
    DB_PASS=yourpassword
    DB_NAME=smarttrip

Run the development server

    npm run dev

Complete a health check

    open in browser
    http://localhost:3000/health

    expected response:
    {"ok":true, "message": "SmartTrip backend running"}

Notes  
- CORS is enabled so the React dev server can call the API.
- If you want to restrict CORS later, set the allowed origin to http://localhost:5173

### 3. Frontend Setup (React + Vite)

From the repo root, open the /frontend folder and install dependencies

    cd frontend
    npm install

If /frontend needs to be recreated from scratch in the future, run

    npm create vite@latest . -- --template react

    (The . ensures Vite scaffolds inside the exisiting /frontend directory.)

Configure local API access (choose one of the options below)

    Option A - Vite proxy (recommended). 
                Edit '/frontend/vite.config.js'

                import { defineConfig } from 'vite'
                import react from '@vitejs/plugin-react'

                export default defineConfig({
                    plugins: [react()],
                    server: {
                        proxy: {
                            '/api': 'http://localhost:3000'
                        }
                    }
                })

                With these settings, any `fetch('/api/...')` from the frontend is forwarded to the backend

    Option B - Environment variable (no proxy). 
    
                Create `/frontend/.env` with:
                
                VITE_API_BASE=http://localhost:3000

                Then call the API in React using:

                fetch(${import.meta.env.VITE_API_BASE}/api/...)
                

Run the frontend

    npm run dev

    Open in browser
    http://localhost:5173

---

## API Route Convention

Namespace all API endpoints under/api to keep the proxy simple and avoid conflicts:

GET /api/health
GET /api/trips
POST /api/trips
GET /api/trips/:id
GET /api/trips/:id/itinerary

The proxy works only during local development; in production, API calls should use the deployed backend URL.

---

## Environment Variables (Do not commit)

- /backend/.env  (ignored by Git) — see /backend/.env.example
- /frontend/.env (ignored by Git, optional) — see example above

Create a file named `.env` in the project root (same folder as `package.json`).  
Use `.env.example` as a guide:

PORT=3000  
DB_HOST=localhost  
DB_USER=root  
DB_PASS=yourpassword  
DB_NAME=smarttrip  

**Only commit the `*.env.example` templates**

---

## Project Structure

smarttrip-planner/  
│  
├─ backend/
│  ├─ node_modules/
│  ├─ src/  
│  │  ├─ app.js              -- Main Express entry point  
│  │  ├─ routes/             -- Route handlers (Phase 2)  
│  │  ├─ middleware/         -- Shared logic (auth, error handling, RBAC)  
│  │  ├─ config/             -- Config helpers  
│  │  └─ db/                 -- Database connection & schema files  
│  ├─ .env.example
│  ├─ package.json
│  └─ .gitignore
│
├─ frontend/
│  ├─ node_modules/
│  ├─ src/
│  │  ├─ index.html
│  │  ├─ vite.config.js
│  ├─ .env.example           -- Template for environment variables  
│  ├─ .gitignore             -- Ignores node_modules and .env  
│  └─ package.json  
│
└─ README.md

---

##  Run both apps

Backend:

    cd backend
    npm run dev

Frontend (separate terminal):

    cd frontend
    npm run dev

With **Option A (proxy)**, call the API from the frontend as:

    fetch('/api/trips')

With **Option B (env)**, call the API from the frontend as:

    fetch(${import.meta.env.VITE_API_BASE}/api/trips)

---

## Current Implementation

- Express server running locally  
- Middleware configured:
  - express.json() for JSON parsing  
  - cors() for cross-origin access  
  - morgan("dev") for logging  
- Health check endpoint `/health`  
- Environment file setup ready (.env.example)  
- MySQL connection scaffold planned in `/backend/src/db/connection.js`

---

## Next Steps (Phase 2)

- Finalize ERD and database schema (users, trips, trip_members, itinerary_items, invites, cost_items, etc.)  
- Confirm DB connection credentials and test MySQL integration  
- Coordinate with API teammate for route mapping (/api/trips, /api/itinerary, etc.)  
- Begin implementing CRUD operations and data validation

---

## Team Notes

1. Pull the latest code from main.  
2. Copy `.env.example` → rename it `.env`.  
3. Run `npm run dev` and verify `/api/health` works via the frontend.  
4. Post setup issues before next review.

Maintainer: Robert Stahl  
Last Updated: November 4, 2025
# SmartTrip Planner – Backend (Phase 1)

This repository contains the backend service for the SmartTrip Planner project.  
Built with Node.js and Express, designed to connect to MySQL.

---

## Getting Started

### 1. Clone the repository
git clone https://github.com/robertstahldev/smarttrip-planner.git  
cd smarttrip-planner

### 2. Install dependencies
npm install

Installed packages:
- express  
- dotenv  
- cors  
- morgan  
- mysql2  
- nodemon (dev dependency)

---

## Environment Variables

Create a file named `.env` in the project root (same folder as `package.json`).  
Use `.env.example` as a guide:

PORT=3000  
DB_HOST=localhost  
DB_USER=root  
DB_PASS=yourpassword  
DB_NAME=smarttrip  

Notes:  
- For Phase 1, only PORT and DB_HOST are used.  
- Database credentials will be finalized once the shared schema is approved.  
- Do not commit `.env` — it’s ignored by `.gitignore`.

---

## Project Structure

smarttrip-planner/  
│  
├ src/  
│  ├─ app.js              -- Main Express entry point  
│  ├─ routes/             -- Route handlers (Phase 2)  
│  ├─ middleware/         -- Shared logic (auth, error handling, RBAC)  
│  ├─ config/             -- Config helpers  
│  └─ db/                 -- Database connection & schema files  
│  
├─ .env.example           -- Template for environment variables  
├─ .gitignore             -- Ignores node_modules and .env  
├─ package.json  
└─ node_modules/  

---

##  Run the Server

Development (auto-reload with nodemon):  
npm run dev

Production mode:  
npm start

Health check endpoint:  
http://localhost:3000/health  

Expected response:  
{ "ok": true, "message": "SmartTrip backend running" }

---

## Current Implementation

- Express server running locally  
- Middleware configured:
  - express.json() for JSON parsing  
  - cors() for cross-origin access  
  - morgan("dev") for logging  
- Health check endpoint `/health`  
- Environment file setup ready  
- MySQL connection scaffold created (`src/db/connection.js`)

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
3. Run `npm run dev` and verify `/health` returns the JSON message.  
4. Report setup issues before Sunday’s meeting.

Maintainer: Robert Stahl  
Last Updated: November 2025
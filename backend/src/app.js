// ============================================================================
//  src/app.js
//  Express application setup for the SmartTrip Planner backend.
//  Handles global middleware, security, CORS, logging, and route mounting.
// ============================================================================

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

// Route modules
const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// ============================================================================
//  TRUST PROXY
//  When deployed behind a proxy (Vercel), this ensures
//  Express reads the correct client IP and protocol for secure cookies.
// ============================================================================
app.set("trust proxy", 1);

// ============================================================================
//  GLOBAL RATE LIMITER
//  Protects the API from abuse. Limits each IP to 60 requests per minute.
// ============================================================================
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 60,
  })
);

// ============================================================================
//  BODY PARSER + REQUEST LOGGER
//  express.json() -- parses incoming JSON bodies.
//  morgan("dev")  -- logs each request (method, status, response time).
// ============================================================================
app.use(express.json());
app.use(morgan("dev"));

// ============================================================================
//  CORS CONFIGURATION
//  Allows frontends from an allow-list (set in .env) to access this API.
//  If origin is missing (like Thunder Client), allow by default.
// ============================================================================

const allowlist = (
  process.env.CORS_ALLOWLIST ||
  "http://localhost:5173,http://localhost:3000"
)
  .split(',')
  .map((s) => s.trim());

app.use(
  cors({
    origin(origin, cb) {
      // Allow non-browser clients with no Origin (Thunder Client, Postman, etc.)
      if (!origin) return cb(null, true);

      // Allow if origin is in the list
      if (allowlist.includes(origin)) {
        return cb(null, true);
      }

      // Otherwise block
      const error = new Error('Not allowed by CORS');
      error.status = 403;
      return cb(error);
    },
    credentials: true,
  })
);


// ============================================================================
//  HEALTH CHECK ENDPOINT
//  Basic ping route so frontend/deployment can verify backend is running.
// ============================================================================
app.get("/health", (_req, res) => {
  res.json({ ok: true, message: "SmartTrip backend running" });
});

// ============================================================================
//  API ROUTE MOUNTING
//  /api/auth   -- login, register, session verification
//  /api/trips  -- all trip, itinerary, and member functionality
//  /api/users  -- returns user-based data from the db
// ============================================================================
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/users", userRoutes);

// ============================================================================
//  404 NOT FOUND HANDLER
//  Triggered when no route above matches the request.
// ============================================================================
app.use((req, res) => {
  res.status(404).json({ error: { code: 404, message: "Not Found" } });
});

// ============================================================================
//  CENTRAL ERROR HANDLER
//  Any thrown error or next(err) from routes arrives here.
//  Responds with clean JSON error messages for the frontend.
// ============================================================================
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    error: { code: status, message },
  });
});

module.exports = app;

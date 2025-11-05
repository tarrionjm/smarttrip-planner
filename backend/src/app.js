// Import packages (CommonJS syntax)
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

// Create the app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Health check route
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "SmartTrip backend running" });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
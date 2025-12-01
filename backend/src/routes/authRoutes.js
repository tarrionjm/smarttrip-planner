const express = require('express');
const router = express.Router();

const { registerUser, loginUser } = require('../services/authService');
const authenticateToken = require('../middleware/auth');
const prisma = require('../../db/prisma');

const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const { findOrCreateUserByGoogle } = require('../services/users');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// ---------------------------------------------------------------------------
//  GOOGLE OAUTH CLIENTS
//  - oauth2Client: for redirect-based OAuth (code -> tokens -> profile)
//  - idTokenClient: (optional) for One Tap / ID token exchange (existing route)
// ---------------------------------------------------------------------------
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// This is used by the existing /google/exchange endpoint (ID token style)
const idTokenClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ---------------------------------------------------------------------------
//  POST /api/auth/register
// ---------------------------------------------------------------------------
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const { user, token } = await registerUser({
      firstName,
      lastName,
      email,
      password,
    });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });
  } catch (err) {
    console.error('Register error:', err.message);
    if (err.message.includes('Email already in use')) {
      return res.status(409).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
//  POST /api/auth/login (email + password)
// ---------------------------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const { user, token } = await loginUser({ email, password });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    if (err.message.includes('Invalid email or password')) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ============================================================================
//  REDIRECT-BASED GOOGLE OAUTH
// ============================================================================
//
//  GET /api/auth/google
//    - Redirects the browser to Google's OAuth consent screen.
//
//  GET /api/auth/google/callback
//    - Google redirects back here with ?code=...
//    - We exchange the code for tokens, fetch profile, upsert user,
//      issue JWT, then send back a tiny HTML page that:
//         * stores the JWT in localStorage
//         * redirects the user to the frontend homepage.
//
//  Requires env vars:
//
//    GOOGLE_CLIENT_ID
//    GOOGLE_CLIENT_SECRET
//    GOOGLE_REDIRECT_URI   (e.g. http://localhost:3000/api/auth/google/callback)
//    JWT_SECRET
//    FRONTEND_BASE_URL     (e.g. http://localhost:5173)
//
// ============================================================================

// GET /api/auth/google  --> start Google login
router.get('/google', (req, res) => {
  const scopes = ['openid', 'profile', 'email'];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });

  // Redirect the browser to Google's consent screen
  res.redirect(authUrl);
});

// GET /api/auth/google/callback  --> handle Google OAuth callback
router.get("/google/callback", async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send("Missing OAuth code");
    }

    // Your existing Google token exchange + user lookup happens here…

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "45m" }
    );

    const safeUser = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
    };

    const frontendBase =
      process.env.FRONTEND_BASE_URL || "http://localhost:5173";
    const redirectUrl = `${frontendBase}/homepage`;

    return res.send(`
<!DOCTYPE html>
<html>
  <head><title>Signing you in...</title></head>
  <body>
    <script>
      // NEW: Only these two keys, with JSON.stringify
      window.localStorage.setItem('token', ${JSON.stringify(token)});
      window.localStorage.setItem('user', ${JSON.stringify(safeUser)});

      // REMOVE this if you still have it:
      // window.localStorage.setItem('smarttrip_token', ...);

      window.location.href = ${JSON.stringify(redirectUrl)};
    </script>
  </body>
</html>
    `);
  } catch (err) {
    next(err);
  }
});

// ============================================================================
//  OPTIONAL: ID TOKEN EXCHANGE ENDPOINT (for One Tap / direct idToken usage)
//  POST /api/auth/google/exchange
// ============================================================================

router.post('/google/exchange', async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        error: { code: 400, message: 'Missing idToken' },
      });
    }

    // Verify the ID token
    const ticket = await idTokenClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload(); // { sub, email, name, picture, etc }

    const user = await findOrCreateUserByGoogle(payload);

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '45m' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
//  GET /api/auth/me
//  Returns the current authenticated user's info based on the JWT payload.
// ============================================================================

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        created_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error retrieving profile:', error);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

module.exports = router;

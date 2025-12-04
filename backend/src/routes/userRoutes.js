const express = require("express");
const prisma = require("../../db/prisma");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * GET /api/users
 * Returns a list of all users for the sharing page search box.
 * Protected: owner / co-owner only.
 */
router.get('/', auth, async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true
      }
    });

    const formatted = users.map(u => ({
      id: u.id,
      firstName: u.first_name,
      lastName: u.last_name,
      email: u.email
    }));

    res.json(formatted);
  } catch (err) {
     console.error('Error fetching users:', err);
     err.status = 500;
     err.message = 'Failed to fetch users';
     return next(err);
  }
});

module.exports = router;
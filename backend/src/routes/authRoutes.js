const express = require("express");

const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

/*
 * Register
 * POST /api/auth/register
 */
router.post("/register", registerUser);

/*
 * Login
 * POST /api/auth/login
 */
router.post("/login", loginUser);

/*
 * Current authenticated user
 * GET /api/auth/me
 */
router.get("/me", protect, getMe);

module.exports = router;
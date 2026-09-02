require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const authRoutes =
  require("./routes/authRoutes");

const giveawayRoutes =
  require("./routes/giveawayRoutes");

const dashboardRoutes =
  require("./routes/dashboardRoutes");

const requestIdMiddleware =
  require("./middleware/requestIdMiddleware");

const deviceSecurityMiddleware =
  require("./middleware/deviceSecurityMiddleware");

const app = express();

/*
|--------------------------------------------------------------------------
| SECURITY HEADERS
|--------------------------------------------------------------------------
*/

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const allowedOrigin =
  process.env.FRONTEND_URL ||
  "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Idempotency-Key",
      "X-Idempotency-Key",
      "X-Request-Id",
      "X-Veloop-Device-Id",
    ],
  })
);

/*
|--------------------------------------------------------------------------
| REQUEST ID
|--------------------------------------------------------------------------
*/

app.use(
  requestIdMiddleware
);

/*
|--------------------------------------------------------------------------
| BODY PARSING
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: "100kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "100kb",
  })
);

/*
|--------------------------------------------------------------------------
| COOKIE PARSER
|--------------------------------------------------------------------------
*/

app.use(
  cookieParser()
);

/*
|--------------------------------------------------------------------------
| DEVICE SECURITY
|--------------------------------------------------------------------------
*/

app.use(
  deviceSecurityMiddleware
);

/*
|--------------------------------------------------------------------------
| GLOBAL API RATE LIMIT
|--------------------------------------------------------------------------
*/

const apiLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    max: 100,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
      success: false,
      message:
        "Too many requests. Please try again later.",
    },

    skip: (req) => {
      /*
       * Health check should remain available.
       */

      return req.path === "/health";
    },
  });

app.use(
  "/api",
  apiLimiter
);

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get(
  "/",
  (req, res) => {
    return res.status(200).json({
      success: true,

      message:
        "Welcome to VELOOP Giveaway API",

      requestId:
        req.requestId,
    });
  }
);

app.get(
  "/api/health",
  (req, res) => {
    return res.status(200).json({
      success: true,

      message:
        "VELOOP API is running",

      requestId:
        req.requestId,
    });
  }
);

/*
|--------------------------------------------------------------------------
| AUTH ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/auth",
  authRoutes
);

/*
|--------------------------------------------------------------------------
| GIVEAWAY ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/giveaways",
  giveawayRoutes
);

/*
|--------------------------------------------------------------------------
| DASHBOARD ROUTES
|--------------------------------------------------------------------------
*/

app.use(
  "/api/dashboard",
  dashboardRoutes
);

/*
|--------------------------------------------------------------------------
| 404 HANDLER
|--------------------------------------------------------------------------
*/

app.use(
  (req, res) => {
    return res.status(404).json({
      success: false,

      message:
        "Route not found.",

      requestId:
        req.requestId,
    });
  }
);

/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
*/

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "Unhandled API error:",
      error
    );

    return res.status(
      error.status || 500
    ).json({
      success: false,

      message:
        error.message ||
        "Internal server error.",

      requestId:
        req.requestId,
    });
  }
);

module.exports = app;
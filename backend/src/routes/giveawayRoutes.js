const express = require("express");

const rateLimit =
  require("express-rate-limit");

const {
  getCurrentGiveaway,
  getGiveaways,
  getGiveawayById,
  enterGiveaway,
  checkEntryStatus,
  getPreviousGiveaways,
  getGiveawayWinners,
  getMyGiveawayHistory,
} = require("../controllers/giveawayController");

const {
  detectWinner,
  getWinner,
} = require("../controllers/winnerController");

const {
  submitPrizeClaim,
  getMyPrizeClaim,
} = require("../controllers/claimController");

const {
  getMyGiveawayResult,
} = require("../controllers/resultController");

const authMiddleware =
  require("../middleware/authMiddleware");

const adminMiddleware =
  require("../middleware/adminMiddleware");

/*
|--------------------------------------------------------------------------
| GIVEAWAY JOIN RATE LIMIT
|--------------------------------------------------------------------------
|
| Joining a giveaway can deduct VE.
|
| Therefore we use a stricter rate limit than
| the global API limiter.
|
*/

const joinGiveawayLimiter =
  rateLimit({
    windowMs:
      5 * 60 * 1000,

    max: 10,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
      success: false,
      message:
        "Too many giveaway join attempts. Please try again later.",
    },
  });

const router =
  express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

router.get(
  "/current",
  getCurrentGiveaway
);

router.get(
  "/previous",
  getPreviousGiveaways
);

router.get(
  "/",
  getGiveaways
);

/*
|--------------------------------------------------------------------------
| WINNER ROUTES
|--------------------------------------------------------------------------
*/

router.get(
  "/:id/winners",
  getGiveawayWinners
);

router.get(
  "/:id/winner",
  getWinner
);

/*
|--------------------------------------------------------------------------
| AUTHENTICATED ROUTES
|--------------------------------------------------------------------------
*/

router.get(
  "/history",
  authMiddleware,
  getMyGiveawayHistory
);

router.get(
  "/:id/result",
  authMiddleware,
  getMyGiveawayResult
);

router.get(
  "/:id/my-claim",
  authMiddleware,
  getMyPrizeClaim
);

router.post(
  "/:id/claim",
  authMiddleware,
  submitPrizeClaim
);

router.get(
  "/:id/entry-status",
  authMiddleware,
  checkEntryStatus
);

/*
|--------------------------------------------------------------------------
| ADMIN WINNER DETECTION
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/detect-winner",
  authMiddleware,
  adminMiddleware,
  detectWinner
);

/*
|--------------------------------------------------------------------------
| SECURE GIVEAWAY JOIN
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/enter",
  authMiddleware,
  joinGiveawayLimiter,
  enterGiveaway
);

/*
|--------------------------------------------------------------------------
| GIVEAWAY DETAILS
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  getGiveawayById
);

module.exports = router;
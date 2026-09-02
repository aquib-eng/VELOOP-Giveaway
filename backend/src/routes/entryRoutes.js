const express = require("express");

const {
  enterGiveaway,
} = require("../controllers/entryController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/giveaways/:giveawayId/enter",
  authMiddleware,
  enterGiveaway
);

module.exports = router;
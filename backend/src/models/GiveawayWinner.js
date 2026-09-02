const mongoose = require("mongoose");

const giveawayWinnerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    giveawayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Giveaway",
      required: true,
      index: true,
    },

    prizeId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },

    prizeName: {
      type: String,
      required: true,
      trim: true,
    },

    prizeCategory: {
      type: String,
      default: "General",
      trim: true,
    },

    winnerStatus: {
      type: String,
      enum: [
        "selected",
        "confirmed",
        "claimed",
        "expired",
      ],
      default: "selected",
      required: true,
    },

    selectedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },

    claimDeadline: {
      type: Date,
      default: null,
    },

    claimStatus: {
      type: String,
      enum: [
        "not_submitted",
        "submitted",
        "processing",
        "completed",
        "expired",
      ],
      default: "not_submitted",
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Prevent the same user from being
 * accidentally assigned twice to the
 * same giveaway and same prize.
 */
giveawayWinnerSchema.index(
  {
    userId: 1,
    giveawayId: 1,
    prizeId: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

/*
 * Useful history queries.
 */
giveawayWinnerSchema.index({
  giveawayId: 1,
  selectedAt: -1,
});

giveawayWinnerSchema.index({
  selectedAt: -1,
});

const GiveawayWinner = mongoose.model(
  "GiveawayWinner",
  giveawayWinnerSchema
);

module.exports = GiveawayWinner;
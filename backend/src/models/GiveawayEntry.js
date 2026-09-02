const mongoose = require("mongoose");

const giveawayEntrySchema = new mongoose.Schema(
  {
    giveaway: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Giveaway",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    enteredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same user from entering
// the same giveaway more than once.
giveawayEntrySchema.index(
  {
    giveaway: 1,
    user: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "GiveawayEntry",
  giveawayEntrySchema
);
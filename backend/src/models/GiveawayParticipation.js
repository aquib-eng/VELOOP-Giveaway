const mongoose = require("mongoose");

const giveawayParticipationSchema = new mongoose.Schema(
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

    entryCurrency: {
      type: String,
      required: true,
      default: "VE",
      uppercase: true,
      trim: true,
    },

    entryAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    deviceHash: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "active",
        "completed",
        "flagged",
        "blocked",
        "cancelled",
      ],
      default: "active",
      required: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EntryTransaction",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One user can participate only once in one giveaway
giveawayParticipationSchema.index(
  {
    userId: 1,
    giveawayId: 1,
  },
  {
    unique: true,
  }
);

const GiveawayParticipation = mongoose.model(
  "GiveawayParticipation",
  giveawayParticipationSchema
);

module.exports = GiveawayParticipation;
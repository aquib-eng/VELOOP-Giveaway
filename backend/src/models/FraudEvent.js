const mongoose = require("mongoose");

const fraudEventSchema = new mongoose.Schema(
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

    deviceHash: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    ipHash: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    riskLevel: {
      type: String,
      enum: [
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
      ],
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    signals: {
      type: [String],
      default: [],
    },

    action: {
      type: String,
      enum: [
        "NONE",
        "FLAGGED",
        "BLOCKED",
        "REVIEW",
      ],
      default: "NONE",
    },

    requestPath: {
      type: String,
      default: "",
      trim: true,
    },

    userAgent: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const FraudEvent = mongoose.model(
  "FraudEvent",
  fraudEventSchema
);

module.exports = FraudEvent;
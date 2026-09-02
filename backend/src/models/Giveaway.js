const mongoose = require("mongoose");

const giveawaySchema = new mongoose.Schema(
  {
    // ==========================================
    // BASIC INFORMATION
    // ==========================================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // PRIZE
    // ==========================================

    prize: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      value: {
        type: Number,
        required: true,
        min: 0,
      },

      image: {
        type: String,
        default: "",
      },

      // ========================================
      // PRIZE TYPE
      // ========================================

      type: {
        type: String,
        enum: [
          "physical",
          "gift_card",
          "digital",
          "general",
        ],
        default: "physical",
      },
    },

    // ==========================================
    // ENTRY FEE
    // ==========================================

    entryFee: {
      type: Number,
      default: 250,
      min: 0,
    },

    // ==========================================
    // DATES
    // ==========================================

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    // ==========================================
    // STATUS
    // ==========================================

    status: {
      type: String,
      enum: [
        "draft",
        "active",
        "completed",
      ],
      default: "draft",
    },

    // ==========================================
    // MAX ENTRIES
    // ==========================================

    maxEntriesPerUser: {
      type: Number,
      default: 1,
      min: 1,
    },

    // ==========================================
    // PUBLISHED
    // ==========================================

    isPublished: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // COMPLETION
    // ==========================================

    completedAt: {
      type: Date,
      default: null,
    },

    // ==========================================
    // WINNER SELECTION
    // ==========================================

    winnerSelectedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// INDEXES
// ==========================================

giveawaySchema.index({
  status: 1,
  startDate: 1,
  endDate: 1,
});

giveawaySchema.index({
  isPublished: 1,
  status: 1,
});

const Giveaway =
  mongoose.model(
    "Giveaway",
    giveawaySchema
  );

module.exports = Giveaway;
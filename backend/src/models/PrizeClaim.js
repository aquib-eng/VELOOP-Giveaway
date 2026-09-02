const mongoose = require("mongoose");

const prizeClaimSchema = new mongoose.Schema(
  {
    // ==========================================
    // USER
    // ==========================================

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================
    // GIVEAWAY
    // ==========================================

    giveawayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Giveaway",
      required: true,
      index: true,
    },

    // ==========================================
    // WINNER
    // ==========================================
    // IMPORTANT:
    // Do NOT use index: true here because
    // we create a unique index below.
    // ==========================================

    winnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GiveawayWinner",
      required: true,
    },

    // ==========================================
    // PRIZE
    // ==========================================

    prizeName: {
      type: String,
      required: true,
      trim: true,
    },

    prizeType: {
      type: String,
      enum: [
        "physical",
        "gift_card",
        "digital",
        "general",
      ],
      required: true,
    },

    // ==========================================
    // CLAIM STATUS
    // ==========================================

    status: {
      type: String,
      enum: [
        "submitted",
        "processing",
        "completed",
        "rejected",
        "expired",
      ],
      default: "submitted",
      required: true,
    },

    // ==========================================
    // IDEMPOTENCY
    // ==========================================

    idempotencyKey: {
      type: String,
      default: null,
      trim: true,
    },

    // ==========================================
    // PHYSICAL PRIZE INFORMATION
    // ==========================================

    recipientName: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    pin: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // DIGITAL / GIFT CARD
    // ==========================================

    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },

    // ==========================================
    // PROCESSING
    // ==========================================

    processedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// ONE CLAIM PER WINNER
// ==========================================

prizeClaimSchema.index(
  {
    winnerId: 1,
  },
  {
    unique: true,
  }
);

// ==========================================
// ONE CLAIM PER USER PER GIVEAWAY
// ==========================================

prizeClaimSchema.index(
  {
    userId: 1,
    giveawayId: 1,
  },
  {
    unique: true,
  }
);

// ==========================================
// IDEMPOTENCY KEY
// ==========================================

prizeClaimSchema.index(
  {
    userId: 1,
    giveawayId: 1,
    idempotencyKey: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

// ==========================================
// HISTORY INDEXES
// ==========================================

prizeClaimSchema.index({
  giveawayId: 1,
  createdAt: -1,
});

prizeClaimSchema.index({
  userId: 1,
  createdAt: -1,
});

// ==========================================
// MODEL
// ==========================================

const PrizeClaim =
  mongoose.model(
    "PrizeClaim",
    prizeClaimSchema
  );

module.exports =
  PrizeClaim;
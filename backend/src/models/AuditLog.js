const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    // ==========================================
    // AUDIT EVENT TYPE
    // ==========================================

    eventType: {
      type: String,
      enum: [
        "JOIN_GIVEAWAY",
        "ENTRY_FEE_DEDUCTED",
        "JOIN_REJECTED",
        "DUPLICATE_ATTEMPT",
        "FRAUD_FLAGGED",

        // Future events
        "WINNER_SELECTED",
        "PRIZE_CLAIMED",
        "PRIZE_CLAIM_REJECTED",
        "PARTICIPATION_CANCELLED",
      ],
      required: true,
      index: true,
    },

    // ==========================================
    // RESULT
    // ==========================================

    result: {
      type: String,
      enum: [
        "SUCCESS",
        "FAILED",
        "REJECTED",
        "FLAGGED",
        "BLOCKED",
      ],
      required: true,
      index: true,
    },

    // ==========================================
    // USER
    // ==========================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // ==========================================
    // GIVEAWAY
    // ==========================================

    giveaway: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Giveaway",
      default: null,
      index: true,
    },

    // ==========================================
    // PARTICIPATION
    // ==========================================

    participation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GiveawayParticipation",
      default: null,
      index: true,
    },

    // ==========================================
    // ENTRY
    // ==========================================

    entry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GiveawayEntry",
      default: null,
      index: true,
    },

    // ==========================================
    // TRANSACTION
    // ==========================================

    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EntryTransaction",
      default: null,
      index: true,
    },

    // ==========================================
    // REQUEST ID
    // ==========================================

    requestId: {
      type: String,
      required: true,
      index: true,
      trim: true,
      maxlength: 150,
    },

    // ==========================================
    // IDEMPOTENCY KEY
    // ==========================================

    idempotencyKey: {
      type: String,
      default: null,
      trim: true,
      maxlength: 150,
    },

    // ==========================================
    // FINANCIAL INFORMATION
    // ==========================================

    amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: "VE",
      uppercase: true,
      trim: true,
      maxlength: 20,
    },

    balanceBefore: {
      type: Number,
      default: null,
      min: 0,
    },

    balanceAfter: {
      type: Number,
      default: null,
      min: 0,
    },

    // ==========================================
    // SECURITY INFORMATION
    // ==========================================

    ipAddress: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    userAgent: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    deviceHash: {
      type: String,
      default: "",
      trim: true,
      maxlength: 255,
      index: true,
    },

    // ==========================================
    // FRAUD INFORMATION
    // ==========================================

    fraudRiskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    fraudRiskLevel: {
      type: String,
      enum: [
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
      ],
      default: "LOW",
    },

    fraudReason: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    // ==========================================
    // REASON
    // ==========================================

    reason: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    // ==========================================
    // ERROR CODE
    // ==========================================

    errorCode: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    // ==========================================
    // EXTRA METADATA
    // ==========================================

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// INDEXES
// ==========================================

auditLogSchema.index({
  user: 1,
  createdAt: -1,
});

auditLogSchema.index({
  giveaway: 1,
  createdAt: -1,
});

auditLogSchema.index({
  eventType: 1,
  createdAt: -1,
});

auditLogSchema.index({
  requestId: 1,
  createdAt: -1,
});

auditLogSchema.index({
  deviceHash: 1,
  createdAt: -1,
});

// ==========================================
// MODEL
// ==========================================

const AuditLog = mongoose.model(
  "AuditLog",
  auditLogSchema
);

module.exports = AuditLog;
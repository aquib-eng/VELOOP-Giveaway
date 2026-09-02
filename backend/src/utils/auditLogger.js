const crypto = require("crypto");

const AuditLog = require(
  "../models/AuditLog"
);

// ==========================================
// REQUEST ID
// ==========================================

const generateRequestId = () => {
  return crypto.randomUUID();
};

// ==========================================
// CLIENT IP
// ==========================================

const getClientIp = (req) => {
  if (!req) {
    return "";
  }

  const forwardedFor =
    req.headers?.[
      "x-forwarded-for"
    ];

  if (forwardedFor) {
    return forwardedFor
      .split(",")[0]
      .trim();
  }

  return (
    req.ip ||
    req.socket?.remoteAddress ||
    ""
  );
};

// ==========================================
// USER AGENT
// ==========================================

const getUserAgent = (req) => {
  if (!req) {
    return "";
  }

  return (
    req.headers?.[
      "user-agent"
    ] || ""
  );
};

// ==========================================
// DEVICE HASH
// ==========================================

const getDeviceHash = (req) => {
  if (!req) {
    return "";
  }

  return (
    req.deviceHash ||
    req.headers?.[
      "x-veloop-device-hash"
    ] ||
    ""
  );
};

// ==========================================
// WRITE AUDIT LOG
// ==========================================

const writeAuditLog = async ({
  req,

  eventType,
  result,

  user = null,
  giveaway = null,

  participation = null,
  entry = null,
  transaction = null,

  requestId = null,
  idempotencyKey = null,

  amount = 0,
  currency = "VE",

  balanceBefore = null,
  balanceAfter = null,

  fraudRiskScore = 0,
  fraudRiskLevel = "LOW",
  fraudReason = "",

  reason = "",
  errorCode = "",

  metadata = {},
}) => {
  try {
    const finalRequestId =
      requestId ||
      req?.requestId ||
      generateRequestId();

    const auditLog =
      await AuditLog.create({
        eventType,
        result,

        user,
        giveaway,

        participation,
        entry,
        transaction,

        requestId:
          finalRequestId,

        idempotencyKey,

        amount,
        currency,

        balanceBefore,
        balanceAfter,

        ipAddress:
          getClientIp(req),

        userAgent:
          getUserAgent(req),

        deviceHash:
          getDeviceHash(req),

        fraudRiskScore,
        fraudRiskLevel,
        fraudReason,

        reason,
        errorCode,

        metadata,
      });

    return auditLog;
  } catch (error) {
    /*
     * Audit logging should never
     * crash the main financial flow.
     */

    console.error(
      "Audit log failed:",
      error.message
    );

    return null;
  }
};

module.exports = {
  generateRequestId,
  getClientIp,
  getUserAgent,
  getDeviceHash,
  writeAuditLog,
};
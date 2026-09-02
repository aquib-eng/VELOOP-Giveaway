const crypto = require("crypto");

const GiveawayParticipation = require("../models/GiveawayParticipation");
const FraudEvent = require("../models/FraudEvent");

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const DEVICE_SECRET =
  process.env.DEVICE_HASH_SECRET ||
  "veloopp-device-secret-change-this";

const IP_HASH_SECRET =
  process.env.IP_HASH_SECRET ||
  "veloopp-ip-secret-change-this";

/*
|--------------------------------------------------------------------------
| Hash Helper
|--------------------------------------------------------------------------
*/

const createHash = (value, secret) => {
  return crypto
    .createHmac("sha256", secret)
    .update(String(value))
    .digest("hex");
};

/*
|--------------------------------------------------------------------------
| Device Hash
|--------------------------------------------------------------------------
*/

const generateDeviceHash = (deviceId) => {
  if (!deviceId) {
    return "";
  }

  return createHash(deviceId, DEVICE_SECRET);
};

/*
|--------------------------------------------------------------------------
| IP Hash
|--------------------------------------------------------------------------
*/

const generateIpHash = (ip) => {
  if (!ip) {
    return "";
  }

  return createHash(ip, IP_HASH_SECRET);
};

/*
|--------------------------------------------------------------------------
| Risk Level
|--------------------------------------------------------------------------
*/

const getRiskLevel = (riskScore) => {
  if (riskScore >= 80) {
    return "CRITICAL";
  }

  if (riskScore >= 60) {
    return "HIGH";
  }

  if (riskScore >= 30) {
    return "MEDIUM";
  }

  return "LOW";
};

/*
|--------------------------------------------------------------------------
| Risk Action
|--------------------------------------------------------------------------
*/

const getRiskAction = (riskScore) => {
  if (riskScore >= 80) {
    return "BLOCKED";
  }

  if (riskScore >= 60) {
    return "REVIEW";
  }

  if (riskScore >= 30) {
    return "FLAGGED";
  }

  return "NONE";
};

/*
|--------------------------------------------------------------------------
| Get Client IP
|--------------------------------------------------------------------------
*/

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];

  if (forwarded) {
    return forwarded
      .split(",")[0]
      .trim();
  }

  return (
    req.ip ||
    req.socket?.remoteAddress ||
    ""
  );
};

/*
|--------------------------------------------------------------------------
| Fraud Analysis
|--------------------------------------------------------------------------
*/

const analyzeParticipationRisk = async ({
  user,
  giveaway,
  deviceId,
  req,
}) => {
  let riskScore = 0;

  const signals = [];

  const deviceHash = generateDeviceHash(
    deviceId
  );

  const ipAddress = getClientIp(req);

  const ipHash = generateIpHash(
    ipAddress
  );

  /*
  |--------------------------------------------------------------------------
  | Signal 1 — Account status
  |--------------------------------------------------------------------------
  */

  if (user.status !== "active") {
    riskScore += 80;

    signals.push(
      "inactive_or_restricted_account"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Signal 2 — Account age
  |--------------------------------------------------------------------------
  */

  if (user.createdAt) {
    const accountAgeMs =
      Date.now() -
      new Date(user.createdAt).getTime();

    const accountAgeHours =
      accountAgeMs / (1000 * 60 * 60);

    /*
     * Very new accounts receive a small
     * risk increase.
     */

    if (accountAgeHours < 1) {
      riskScore += 20;

      signals.push(
        "very_new_account"
      );
    } else if (accountAgeHours < 24) {
      riskScore += 10;

      signals.push(
        "new_account"
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Signal 3 — Same device
  |--------------------------------------------------------------------------
  */

  if (deviceHash) {
    const existingDeviceParticipation =
      await GiveawayParticipation.findOne({
        giveawayId: giveaway._id,
        deviceHash,
        userId: {
          $ne: user._id,
        },
      }).lean();

    if (existingDeviceParticipation) {
      riskScore += 60;

      signals.push(
        "same_device_multiple_accounts"
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Signal 4 — Existing participation
  |--------------------------------------------------------------------------
  */

  const existingParticipation =
    await GiveawayParticipation.findOne({
      giveawayId: giveaway._id,
      userId: user._id,
    }).lean();

  if (existingParticipation) {
    riskScore += 70;

    signals.push(
      "repeated_participation_attempt"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Signal 5 — Recent participation frequency
  |--------------------------------------------------------------------------
  */

  const recentWindow =
    new Date(
      Date.now() - 10 * 60 * 1000
    );

  const recentParticipationCount =
    await GiveawayParticipation.countDocuments({
      userId: user._id,
      createdAt: {
        $gte: recentWindow,
      },
    });

  if (recentParticipationCount >= 3) {
    riskScore += 30;

    signals.push(
      "high_recent_participation_frequency"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Signal 6 — Device missing
  |--------------------------------------------------------------------------
  */

  if (!deviceId) {
    riskScore += 10;

    signals.push(
      "missing_device_identifier"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Cap score
  |--------------------------------------------------------------------------
  */

  riskScore = Math.min(
    riskScore,
    100
  );

  const riskLevel =
    getRiskLevel(riskScore);

  const action =
    getRiskAction(riskScore);

  let reason =
    "No significant fraud indicators";

  if (signals.length > 0) {
    reason =
      signals.join(", ");
  }

  return {
    riskScore,
    riskLevel,
    action,
    signals,
    reason,
    deviceHash,
    ipHash,
    ipAddress,
  };
};

/*
|--------------------------------------------------------------------------
| Record Fraud Event
|--------------------------------------------------------------------------
*/

const createFraudEvent = async ({
  user,
  giveaway,
  fraudResult,
  req,
}) => {
  return FraudEvent.create({
    userId: user._id,
    giveawayId: giveaway._id,

    deviceHash:
      fraudResult.deviceHash,

    ipHash:
      fraudResult.ipHash,

    riskScore:
      fraudResult.riskScore,

    riskLevel:
      fraudResult.riskLevel,

    reason:
      fraudResult.reason,

    signals:
      fraudResult.signals,

    action:
      fraudResult.action,

    requestPath:
      req.originalUrl || "",

    userAgent:
      req.get("user-agent") || "",
  });
};

module.exports = {
  generateDeviceHash,
  generateIpHash,
  getClientIp,
  getRiskLevel,
  getRiskAction,
  analyzeParticipationRisk,
  createFraudEvent,
};
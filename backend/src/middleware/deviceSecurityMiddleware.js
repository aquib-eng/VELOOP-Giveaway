const crypto = require("crypto");

const deviceSecurityMiddleware = (
  req,
  res,
  next
) => {
  try {
    const deviceId =
      req.headers[
        "x-veloopp-device-id"
      ] || "";

    const userAgent =
      req.headers[
        "user-agent"
      ] || "";

    const ip =
      req.headers[
        "x-forwarded-for"
      ]?.split(",")[0]?.trim() ||
      req.ip ||
      req.socket?.remoteAddress ||
      "";

    const secret =
      process.env.DEVICE_HASH_SECRET ||
      process.env.JWT_SECRET ||
      "veloopp-device-secret";

    const rawFingerprint = [
      deviceId,
      userAgent,
      ip,
    ].join("|");

    const deviceHash =
      crypto
        .createHmac(
          "sha256",
          secret
        )
        .update(
          rawFingerprint
        )
        .digest("hex");

    req.deviceHash =
      deviceHash;

    req.securitySignals = {
      hasDeviceId:
        Boolean(deviceId),

      ipAddress:
        ip,

      userAgent:
        userAgent,
    };

    next();
  } catch (error) {
    console.error(
      "Device security middleware error:",
      error
    );

    next();
  }
};

module.exports =
  deviceSecurityMiddleware;
const crypto = require("crypto");

const requestIdMiddleware = (
  req,
  res,
  next
) => {
  try {
    const incomingRequestId =
      req.headers["x-request-id"];

    const requestId =
      incomingRequestId ||
      crypto.randomUUID();

    req.requestId = requestId;

    res.setHeader(
      "X-Request-Id",
      requestId
    );

    next();
  } catch (error) {
    console.error(
      "Request ID middleware error:",
      error
    );

    next();
  }
};

module.exports =
  requestIdMiddleware;
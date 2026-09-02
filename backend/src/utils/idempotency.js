const crypto = require("crypto");

/*
|--------------------------------------------------------------------------
| Generate Idempotency Key
|--------------------------------------------------------------------------
*/

const generateIdempotencyKey = () => {
  return crypto.randomUUID();
};


/*
|--------------------------------------------------------------------------
| Get Idempotency Key
|--------------------------------------------------------------------------
|
| Client sends:
|
| Idempotency-Key: <unique-key>
|
*/

const getIdempotencyKey = (req) => {
  const key =
    req.headers["idempotency-key"];

  if (!key) {
    return null;
  }

  const normalizedKey =
    String(key).trim();

  if (!normalizedKey) {
    return null;
  }

  /*
   * Prevent unnecessarily large keys.
   */

  if (normalizedKey.length > 200) {
    return null;
  }

  return normalizedKey;
};


module.exports = {
  generateIdempotencyKey,
  getIdempotencyKey,
};
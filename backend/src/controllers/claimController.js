const mongoose = require("mongoose");

const Giveaway =
  require("../models/Giveaway");

const GiveawayWinner =
  require("../models/GiveawayWinner");

const PrizeClaim =
  require("../models/PrizeClaim");

const {
  writeAuditLog,
} = require("../utils/auditLogger");

// ==========================================
// HELPERS
// ==========================================

const getAuthenticatedUserId = (
  req
) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId ||
    null
  );
};

// ==========================================
// VALIDATE NAME
// ==========================================

const validateName = (
  value
) => {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  const name =
    value.trim();

  return (
    name.length >= 2 &&
    name.length <= 100
  );
};

// ==========================================
// VALIDATE PHONE
// ==========================================

const validatePhone = (
  value
) => {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  const phone =
    value.trim();

  return /^[0-9+\-\s()]{7,20}$/.test(
    phone
  );
};

// ==========================================
// VALIDATE PIN
// ==========================================

const validatePin = (
  value
) => {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  return /^\d{6}$/.test(
    value.trim()
  );
};

// ==========================================
// VALIDATE EMAIL
// ==========================================

const validateEmail = (
  value
) => {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value.trim()
  );
};

// ==========================================
// VALIDATE TEXT
// ==========================================

const validateText = (
  value,
  min = 2,
  max = 200
) => {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  const text =
    value.trim();

  return (
    text.length >= min &&
    text.length <= max
  );
};

// ==========================================
// SUBMIT PRIZE CLAIM
// ==========================================

const submitPrizeClaim =
  async (req, res) => {
    const { id } =
      req.params;

    const userId =
      getAuthenticatedUserId(
        req
      );

    // ========================================
    // AUTHENTICATION
    // ========================================

    if (!userId) {
      return res.status(401).json({
        success: false,

        message:
          "Authentication required.",

        code:
          "LOGIN_REQUIRED",
      });
    }

    // ========================================
    // VALIDATE GIVEAWAY ID
    // ========================================

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid giveaway ID.",

        code:
          "INVALID_GIVEAWAY_ID",
      });
    }

    // ========================================
    // IDEMPOTENCY KEY
    // ========================================

    const idempotencyKey =
      (
        req.headers[
          "idempotency-key"
        ] ||
        req.headers[
          "x-idempotency-key"
        ] ||
        ""
      )
        .toString()
        .trim();

    if (
      idempotencyKey &&
      idempotencyKey.length >
        150
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid idempotency key.",

        code:
          "INVALID_IDEMPOTENCY_KEY",
      });
    }

    // ========================================
    // START TRANSACTION
    // ========================================

    const session =
      await mongoose.startSession();

    try {
      session.startTransaction();

      // ======================================
      // FIND GIVEAWAY
      // ======================================

      const giveaway =
        await Giveaway.findById(
          id
        ).session(session);

      if (!giveaway) {
        await session.abortTransaction();

        return res.status(404).json({
          success: false,

          message:
            "Giveaway not found.",

          code:
            "GIVEAWAY_NOT_FOUND",
        });
      }

      // ======================================
      // GIVEAWAY MUST BE COMPLETED
      // ======================================

      if (
        giveaway.status !==
        "completed"
      ) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,

          message:
            "Prize claims are available only after the giveaway is completed.",

          code:
            "CLAIM_NOT_ALLOWED",
        });
      }

      // ======================================
      // FIND WINNER
      //
      // IMPORTANT:
      // We use authenticated user ID.
      //
      // Frontend cannot submit another
      // winnerId and claim someone else's prize.
      // ======================================

      const winner =
        await GiveawayWinner.findOne(
          {
            giveawayId:
              giveaway._id,

            userId:
              userId,

            winnerStatus: {
              $in: [
                "selected",
                "confirmed",
              ],
            },
          }
        )
          .session(session);

      // ======================================
      // NOT A WINNER
      // ======================================

      if (!winner) {
        await session.abortTransaction();

        return res.status(403).json({
          success: false,

          message:
            "You are not eligible to claim this prize.",

          code:
            "CLAIM_NOT_ALLOWED",
        });
      }

      // ======================================
      // CHECK WINNER CLAIM STATUS
      // ======================================

      if (
        winner.claimStatus ===
        "completed"
      ) {
        await session.abortTransaction();

        return res.status(409).json({
          success: false,

          message:
            "This prize has already been claimed.",

          code:
            "CLAIM_ALREADY_COMPLETED",
        });
      }

      // ======================================
      // CHECK CLAIM DEADLINE
      // ======================================

      const now =
        new Date();

      if (
        winner.claimDeadline &&
        winner.claimDeadline <
          now
      ) {
        winner.winnerStatus =
          "expired";

        winner.claimStatus =
          "expired";

        await winner.save({
          session,
        });

        await session.commitTransaction();

        await writeAuditLog({
          eventType:
            "CLAIM_SUBMITTED",

          result:
            "REJECTED",

          userId:
            userId,

          giveawayId:
            giveaway._id,

          requestId:
            req.requestId,

          reason:
            "Prize claim deadline has expired.",

          metadata: {
            code:
              "CLAIM_EXPIRED",
          },
        });

        return res.status(410).json({
          success: false,

          message:
            "The prize claim deadline has expired.",

          code:
            "CLAIM_EXPIRED",
        });
      }

      // ======================================
      // ALREADY SUBMITTED / PROCESSING
      // ======================================

      if (
        winner.claimStatus ===
          "submitted" ||
        winner.claimStatus ===
          "processing"
      ) {
        const existingClaim =
          await PrizeClaim.findOne({
            winnerId:
              winner._id,
          })
            .session(session);

        await session.commitTransaction();

        return res.status(200).json({
          success: true,

          message:
            "Your prize claim has already been submitted.",

          alreadySubmitted:
            true,

          claim:
            existingClaim
              ? {
                  id:
                    existingClaim._id,

                  status:
                    existingClaim.status,

                  prizeName:
                    existingClaim.prizeName,

                  prizeType:
                    existingClaim.prizeType,

                  createdAt:
                    existingClaim.createdAt,
                }
              : null,
        });
      }

      // ======================================
      // IDEMPOTENCY CHECK
      // ======================================

      if (
        idempotencyKey
      ) {
        const existingClaim =
          await PrizeClaim.findOne(
            {
              userId:
                userId,

              giveawayId:
                giveaway._id,

              idempotencyKey:
                idempotencyKey,
            }
          ).session(session);

        if (
          existingClaim
        ) {
          await session.commitTransaction();

          return res.status(200).json({
            success: true,

            message:
              "Prize claim already processed.",

            alreadyProcessed:
              true,

            claim: {
              id:
                existingClaim._id,

              status:
                existingClaim.status,

              prizeName:
                existingClaim.prizeName,

              prizeType:
                existingClaim.prizeType,

              createdAt:
                existingClaim.createdAt,
            },
          });
        }
      }

      // ======================================
      // GET PRIZE TYPE FROM BACKEND
      // ======================================

      const prize =
        giveaway.prize;

      const prizeType =
        prize.type ||
        "physical";

      // ======================================
      // REQUEST BODY
      // ======================================

      const body =
        req.body || {};

      // ======================================
      // CLAIM DATA
      // ======================================

      let claimData = {
        userId:
          userId,

        giveawayId:
          giveaway._id,

        winnerId:
          winner._id,

        prizeName:
          prize.name,

        prizeType:
          prizeType,

        status:
          "submitted",

        idempotencyKey:
          idempotencyKey ||
          null,
      };

      // ======================================
      // PHYSICAL PRIZE
      // ======================================

      if (
        prizeType ===
        "physical"
      ) {
        const {
          name,
          phone,
          address,
          city,
          state,
          pin,
        } = body;

        // ------------------------------------
        // NAME
        // ------------------------------------

        if (
          !validateName(name)
        ) {
          await session.abortTransaction();

          return res.status(400).json({
            success: false,

            message:
              "Please provide a valid recipient name.",

            code:
              "INVALID_CLAIM_NAME",
          });
        }

        // ------------------------------------
        // PHONE
        // ------------------------------------

        if (
          !validatePhone(phone)
        ) {
          await session.abortTransaction();

          return res.status(400).json({
            success: false,

            message:
              "Please provide a valid phone number.",

            code:
              "INVALID_CLAIM_PHONE",
          });
        }

        // ------------------------------------
        // ADDRESS
        // ------------------------------------

        if (
          !validateText(
            address,
            5,
            300
          )
        ) {
          await session.abortTransaction();

          return res.status(400).json({
            success: false,

            message:
              "Please provide a valid address.",

            code:
              "INVALID_CLAIM_ADDRESS",
          });
        }

        // ------------------------------------
        // CITY
        // ------------------------------------

        if (
          !validateText(
            city,
            2,
            100
          )
        ) {
          await session.abortTransaction();

          return res.status(400).json({
            success: false,

            message:
              "Please provide a valid city.",

            code:
              "INVALID_CLAIM_CITY",
          });
        }

        // ------------------------------------
        // STATE
        // ------------------------------------

        if (
          !validateText(
            state,
            2,
            100
          )
        ) {
          await session.abortTransaction();

          return res.status(400).json({
            success: false,

            message:
              "Please provide a valid state.",

            code:
              "INVALID_CLAIM_STATE",
          });
        }

        // ------------------------------------
        // PIN
        // ------------------------------------

        if (
          !validatePin(pin)
        ) {
          await session.abortTransaction();

          return res.status(400).json({
            success: false,

            message:
              "Please provide a valid 6-digit PIN.",

            code:
              "INVALID_CLAIM_PIN",
          });
        }

        claimData.recipientName =
          name.trim();

        claimData.phone =
          phone.trim();

        claimData.address =
          address.trim();

        claimData.city =
          city.trim();

        claimData.state =
          state.trim();

        claimData.pin =
          pin.trim();
      }

      // ======================================
      // GIFT CARD
      // ======================================

      else if (
        prizeType ===
        "gift_card"
      ) {
        const {
          email,
        } = body;

        if (
          !validateEmail(email)
        ) {
          await session.abortTransaction();

          return res.status(400).json({
            success: false,

            message:
              "Please provide a valid email address.",

            code:
              "INVALID_CLAIM_EMAIL",
          });
        }

        claimData.email =
          email
            .trim()
            .toLowerCase();
      }

      // ======================================
      // DIGITAL
      // ======================================

      else if (
        prizeType ===
        "digital"
      ) {
        const {
          email,
        } = body;

        if (
          !validateEmail(email)
        ) {
          await session.abortTransaction();

          return res.status(400).json({
            success: false,

            message:
              "Please provide a valid email address.",

            code:
              "INVALID_CLAIM_EMAIL",
          });
        }

        claimData.email =
          email
            .trim()
            .toLowerCase();
      }

      // ======================================
      // GENERAL
      // ======================================

      else {
        const {
          name,
          email,
        } = body;

        if (
          !validateName(name)
        ) {
          await session.abortTransaction();

          return res.status(400).json({
            success: false,

            message:
              "Please provide your name.",

            code:
              "INVALID_CLAIM_NAME",
          });
        }

        if (
          !validateEmail(email)
        ) {
          await session.abortTransaction();

          return res.status(400).json({
            success: false,

            message:
              "Please provide a valid email address.",

            code:
              "INVALID_CLAIM_EMAIL",
          });
        }

        claimData.recipientName =
          name.trim();

        claimData.email =
          email
            .trim()
            .toLowerCase();
      }

      // ======================================
      // CREATE CLAIM
      // ======================================

      const claim =
        new PrizeClaim(
          claimData
        );

      await claim.save({
        session,
      });

      // ======================================
      // UPDATE WINNER
      // ======================================

      winner.claimStatus =
        "submitted";

      winner.winnerStatus =
        "confirmed";

      await winner.save({
        session,
      });

      // ======================================
      // COMMIT
      // ======================================

      await session.commitTransaction();

      // ======================================
      // AUDIT LOG
      // ======================================

      await writeAuditLog({
        eventType:
          "CLAIM_SUBMITTED",

        result:
          "SUCCESS",

        userId:
          userId,

        giveawayId:
          giveaway._id,

        requestId:
          req.requestId,

        idempotencyKey:
          idempotencyKey ||
          null,

        reason:
          "Winner successfully submitted prize claim.",

        metadata: {
          prizeType:
            prizeType,

          prizeName:
            prize.name,
        },
      });

      // ======================================
      // RESPONSE
      //
      // IMPORTANT:
      // Do NOT return address,
      // phone or PIN.
      // ======================================

      return res.status(201).json({
        success: true,

        message:
          "Prize claim submitted successfully.",

        claim: {
          id:
            claim._id,

          status:
            claim.status,

          prizeName:
            claim.prizeName,

          prizeType:
            claim.prizeType,

          createdAt:
            claim.createdAt,
        },
      });
    } catch (error) {
      // ======================================
      // ROLLBACK
      // ======================================

      if (
        session.inTransaction()
      ) {
        await session.abortTransaction();
      }

      console.error(
        "Prize claim error:",
        error
      );

      // ======================================
      // DUPLICATE CLAIM
      // ======================================

      if (
        error.code === 11000
      ) {
        return res.status(409).json({
          success: false,

          message:
            "A prize claim already exists for this giveaway.",

          code:
            "CLAIM_ALREADY_EXISTS",
        });
      }

      return res.status(500).json({
        success: false,

        message:
          "Failed to submit prize claim.",

        error:
          process.env.NODE_ENV ===
          "production"
            ? undefined
            : error.message,
      });
    } finally {
      await session.endSession();
    }
  };

// ==========================================
// GET MY CLAIM
// ==========================================

const getMyPrizeClaim =
  async (req, res) => {
    const { id } =
      req.params;

    const userId =
      getAuthenticatedUserId(
        req
      );

    // ========================================
    // AUTH
    // ========================================

    if (!userId) {
      return res.status(401).json({
        success: false,

        message:
          "Authentication required.",

        code:
          "LOGIN_REQUIRED",
      });
    }

    // ========================================
    // VALIDATE ID
    // ========================================

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid giveaway ID.",
      });
    }

    try {
      // ======================================
      // FIND CLAIM
      // ======================================

      const claim =
        await PrizeClaim.findOne({
          giveawayId: id,

          userId:
            userId,
        }).select(
          "prizeName prizeType status createdAt processedAt completedAt rejectionReason"
        );

      // ======================================
      // NO CLAIM
      // ======================================

      if (!claim) {
        return res.status(404).json({
          success: false,

          message:
            "No prize claim found.",

          code:
            "CLAIM_NOT_FOUND",

          hasClaim:
            false,
        });
      }

      // ======================================
      // RESPONSE
      // ======================================

      return res.status(200).json({
        success: true,

        hasClaim:
          true,

        claim,
      });
    } catch (error) {
      console.error(
        "Get prize claim error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to get prize claim.",
      });
    }
  };

module.exports = {
  submitPrizeClaim,
  getMyPrizeClaim,
};
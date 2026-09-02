const mongoose = require("mongoose");

const Giveaway = require("../models/Giveaway");
const GiveawayEntry = require("../models/GiveawayEntry");
const EntryTransaction = require("../models/EntryTransaction");
const GiveawayParticipation = require("../models/GiveawayParticipation");
const GiveawayWinner = require("../models/GiveawayWinner");
const User = require("../models/User");

const {
  analyzeParticipationRisk,
  createFraudEvent,
} = require("../services/fraudService");

const {
  writeAuditLog,
} = require("../utils/auditLogger");

const {
  getIdempotencyKey,
} = require("../utils/idempotency");

/*
|--------------------------------------------------------------------------
| DEFAULT ENTRY FEE
|--------------------------------------------------------------------------
|
| Existing giveaways created before the entryFee field was added
| may not have entryFee stored in MongoDB.
|
| Your Giveaway schema default is 250, but MongoDB does not add
| that default to old documents automatically.
|
*/

const DEFAULT_ENTRY_FEE = 250;

/*
|--------------------------------------------------------------------------
| MASK USER
|--------------------------------------------------------------------------
*/

const maskText = (value) => {
  if (!value) {
    return "User";
  }

  const text = String(value).trim();

  if (text.length <= 2) {
    return `${text[0] || "*"}*`;
  }

  if (text.length <= 4) {
    return `${text.substring(0, 1)}****`;
  }

  return (
    text.substring(0, 2) +
    "****" +
    text.substring(text.length - 2)
  );
};

const getMaskedUser = (user) => {
  if (!user) {
    return "VE****";
  }

  if (user.name) {
    return maskText(user.name);
  }

  if (user.email) {
    const parts = user.email.split("@");

    if (parts.length === 2) {
      return (
        maskText(parts[0]) +
        "@" +
        parts[1]
      );
    }
  }

  return "VE****";
};

/*
|--------------------------------------------------------------------------
| CURRENT GIVEAWAY
|--------------------------------------------------------------------------
*/

const getCurrentGiveaway = async (req, res) => {
  try {
    const now = new Date();

    const giveaway = await Giveaway.findOne({
      status: "active",
      isPublished: true,
      startDate: {
        $lte: now,
      },
      endDate: {
        $gte: now,
      },
    }).lean();

    if (!giveaway) {
      return res.status(404).json({
        success: false,
        message: "No active giveaway available",
      });
    }

    /*
     * Backward compatibility:
     * Old giveaway documents may not contain entryFee.
     */

    if (
      giveaway.entryFee === undefined ||
      giveaway.entryFee === null
    ) {
      giveaway.entryFee = DEFAULT_ENTRY_FEE;
    }

    return res.status(200).json({
      success: true,
      data: giveaway,
    });
  } catch (error) {
    console.error(
      "Get current giveaway error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch current giveaway",
    });
  }
};

/*
|--------------------------------------------------------------------------
| ALL GIVEAWAYS
|--------------------------------------------------------------------------
*/

const getGiveaways = async (req, res) => {
  try {
    const giveaways = await Giveaway.find({
      isPublished: true,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    /*
     * Add default entry fee for old documents.
     */

    const safeGiveaways = giveaways.map(
      (giveaway) => ({
        ...giveaway,
        entryFee:
          giveaway.entryFee ??
          DEFAULT_ENTRY_FEE,
      })
    );

    return res.status(200).json({
      success: true,
      count: safeGiveaways.length,
      data: safeGiveaways,
    });
  } catch (error) {
    console.error(
      "Get giveaways error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch giveaways",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GIVEAWAY BY ID
|--------------------------------------------------------------------------
*/

const getGiveawayById = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid giveaway ID",
      });
    }

    const giveaway = await Giveaway.findOne({
      _id: id,
      isPublished: true,
    }).lean();

    if (!giveaway) {
      return res.status(404).json({
        success: false,
        message: "Giveaway not found",
      });
    }

    /*
     * Backward compatibility for old giveaway.
     */

    if (
      giveaway.entryFee === undefined ||
      giveaway.entryFee === null
    ) {
      giveaway.entryFee = DEFAULT_ENTRY_FEE;
    }

    return res.status(200).json({
      success: true,
      data: giveaway,
    });
  } catch (error) {
    console.error(
      "Get giveaway by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch giveaway",
    });
  }
};

/*
|--------------------------------------------------------------------------
| ENTRY STATUS
|--------------------------------------------------------------------------
*/

const checkEntryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid giveaway ID",
      });
    }

    const userId =
      req.user?._id ||
      req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const participation =
      await GiveawayParticipation.findOne({
        userId,
        giveawayId: id,
      }).lean();

    const entry =
      await GiveawayEntry.findOne({
        user: userId,
        giveaway: id,
      }).lean();

    return res.status(200).json({
      success: true,
      participated: Boolean(
        participation || entry
      ),
      data:
        participation ||
        entry ||
        null,
    });
  } catch (error) {
    console.error(
      "Check entry status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to check entry status",
    });
  }
};

/*
|--------------------------------------------------------------------------
| PREVIOUS GIVEAWAYS
|--------------------------------------------------------------------------
*/

const getPreviousGiveaways = async (req, res) => {
  try {
    const giveaways =
      await Giveaway.find({
        status: "completed",
        isPublished: true,
      })
        .sort({
          endDate: -1,
        })
        .lean();

    if (!giveaways.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const giveawayIds =
      giveaways.map(
        (giveaway) => giveaway._id
      );

    const winners =
      await GiveawayWinner.find({
        giveawayId: {
          $in: giveawayIds,
        },
      })
        .populate({
          path: "userId",
          select: "name email",
        })
        .sort({
          selectedAt: -1,
        })
        .lean();

    const winnerMap = new Map();

    for (const winner of winners) {
      const giveawayId =
        winner.giveawayId.toString();

      if (!winnerMap.has(giveawayId)) {
        winnerMap.set(
          giveawayId,
          []
        );
      }

      winnerMap.get(giveawayId).push({
        id: winner._id,

        userId:
          winner.userId?._id ||
          null,

        displayName:
          getMaskedUser(
            winner.userId
          ),

        prizeName:
          winner.prizeName,

        prizeCategory:
          winner.prizeCategory,

        winnerStatus:
          winner.winnerStatus,

        claimStatus:
          winner.claimStatus,

        selectedAt:
          winner.selectedAt,

        claimDeadline:
          winner.claimDeadline,
      });
    }

    const history =
      giveaways.map(
        (giveaway) => {
          const giveawayId =
            giveaway._id.toString();

          return {
            id: giveaway._id,

            title:
              giveaway.title,

            description:
              giveaway.description,

            prize:
              giveaway.prize,

            entryFee:
              giveaway.entryFee ??
              DEFAULT_ENTRY_FEE,

            startDate:
              giveaway.startDate,

            endDate:
              giveaway.endDate,

            status:
              giveaway.status,

            winners:
              winnerMap.get(
                giveawayId
              ) || [],
          };
        }
      );

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error(
      "Get previous giveaways error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch previous giveaways",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GIVEAWAY WINNERS
|--------------------------------------------------------------------------
*/

const getGiveawayWinners = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid giveaway ID",
      });
    }

    const giveaway =
      await Giveaway.findOne({
        _id: id,
        isPublished: true,
      }).lean();

    if (!giveaway) {
      return res.status(404).json({
        success: false,
        message: "Giveaway not found",
      });
    }

    if (
      giveaway.status !==
      "completed"
    ) {
      return res.status(200).json({
        success: true,
        finalized: false,
        message:
          "Winners will be announced after the giveaway ends.",
        data: [],
      });
    }

    const winners =
      await GiveawayWinner.find({
        giveawayId: id,
      })
        .populate({
          path: "userId",
          select: "name email",
        })
        .sort({
          selectedAt: -1,
        })
        .lean();

    const safeWinners =
      winners.map(
        (winner) => ({
          id: winner._id,

          userId:
            winner.userId?._id ||
            null,

          displayName:
            getMaskedUser(
              winner.userId
            ),

          prizeName:
            winner.prizeName,

          prizeCategory:
            winner.prizeCategory,

          winnerStatus:
            winner.winnerStatus,

          claimStatus:
            winner.claimStatus,

          selectedAt:
            winner.selectedAt,

          claimDeadline:
            winner.claimDeadline,
        })
      );

    return res.status(200).json({
      success: true,
      finalized: true,
      count:
        safeWinners.length,
      data: safeWinners,
    });
  } catch (error) {
    console.error(
      "Get giveaway winners error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch giveaway winners",
    });
  }
};

/*
|--------------------------------------------------------------------------
| MY GIVEAWAY HISTORY
|--------------------------------------------------------------------------
*/

const getMyGiveawayHistory = async (
  req,
  res
) => {
  try {
    const userId =
      req.user?._id ||
      req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const participations =
      await GiveawayParticipation.find({
        userId,
      })
        .populate({
          path: "giveawayId",
          select:
            "title description prize entryFee startDate endDate status",
        })
        .populate({
          path: "transactionId",
          select:
            "type currency amount balanceBefore balanceAfter status requestId idempotencyKey createdAt",
        })
        .sort({
          joinedAt: -1,
        })
        .lean();

    const history =
      participations.map(
        (participation) => ({
          id:
            participation._id,

          giveaway:
            participation.giveawayId,

          entryCurrency:
            participation.entryCurrency,

          entryAmount:
            participation.entryAmount,

          status:
            participation.status,

          joinedAt:
            participation.joinedAt,

          transaction:
            participation.transactionId
              ? {
                  id:
                    participation
                      .transactionId
                      ._id,

                  type:
                    participation
                      .transactionId
                      .type,

                  currency:
                    participation
                      .transactionId
                      .currency,

                  amount:
                    participation
                      .transactionId
                      .amount,

                  balanceBefore:
                    participation
                      .transactionId
                      .balanceBefore,

                  balanceAfter:
                    participation
                      .transactionId
                      .balanceAfter,

                  status:
                    participation
                      .transactionId
                      .status,

                  requestId:
                    participation
                      .transactionId
                      .requestId,

                  idempotencyKey:
                    participation
                      .transactionId
                      .idempotencyKey,

                  createdAt:
                    participation
                      .transactionId
                      .createdAt,
                }
              : null,
        })
      );

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error(
      "Get my giveaway history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch giveaway history",
    });
  }
};

/*
|--------------------------------------------------------------------------
| REPLAY EXISTING IDEMPOTENT REQUEST
|--------------------------------------------------------------------------
*/

const replayExistingRequest = async ({
  userId,
  giveawayId,
  idempotencyKey,
  requestId,
  res,
}) => {
  if (!idempotencyKey) {
    return false;
  }

  const transaction =
    await EntryTransaction.findOne({
      user: userId,
      giveaway: giveawayId,
      idempotencyKey,
    }).lean();

  if (!transaction) {
    return false;
  }

  const participation =
    await GiveawayParticipation.findOne({
      userId,
      giveawayId,
    }).lean();

  const entry =
    await GiveawayEntry.findOne({
      user: userId,
      giveaway: giveawayId,
    }).lean();

  res.status(200).json({
    success: true,

    replayed: true,

    message:
      "Original giveaway join request already processed",

    requestId,

    data: {
      giveawayId,

      participationId:
        participation?._id ||
        null,

      entryId:
        entry?._id ||
        transaction.entry ||
        null,

      transactionId:
        transaction._id,

      amount:
        transaction.amount,

      currency:
        transaction.currency,

      balanceBefore:
        transaction.balanceBefore,

      balanceAfter:
        transaction.balanceAfter,

      status:
        participation?.status ||
        "active",

      joinedAt:
        participation?.joinedAt ||
        transaction.createdAt,
    },
  });

  return true;
};

/*
|--------------------------------------------------------------------------
| ENTER GIVEAWAY
|--------------------------------------------------------------------------
*/

const enterGiveaway = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  let transactionStarted = false;

  try {
    const { id } = req.params;

    /*
     * --------------------------------------------------------------
     * 1. VALIDATE GIVEAWAY ID
     * --------------------------------------------------------------
     */

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid giveaway ID",
      });
    }

    /*
     * --------------------------------------------------------------
     * 2. AUTHENTICATED USER
     * --------------------------------------------------------------
     */

    const userId =
      req.user?._id ||
      req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    /*
     * --------------------------------------------------------------
     * 3. REQUEST ID
     * --------------------------------------------------------------
     */

    const requestId =
      req.requestId ||
      req.headers["x-request-id"] ||
      new mongoose.Types.ObjectId().toString();

    /*
     * --------------------------------------------------------------
     * 4. IDEMPOTENCY KEY
     * --------------------------------------------------------------
     */

    const idempotencyKey =
      getIdempotencyKey(req);

    /*
     * --------------------------------------------------------------
     * 5. REPLAY PREVIOUS REQUEST
     * --------------------------------------------------------------
     */

    if (idempotencyKey) {
      const replayed =
        await replayExistingRequest({
          userId,
          giveawayId: id,
          idempotencyKey,
          requestId,
          res,
        });

      if (replayed) {
        return;
      }
    }

    /*
     * --------------------------------------------------------------
     * 6. LOAD GIVEAWAY
     * --------------------------------------------------------------
     */

    const giveaway =
      await Giveaway.findById(id).lean();

    if (!giveaway) {
      await writeAuditLog({
        eventType:
          "JOIN_REJECTED",

        result:
          "REJECTED",

        user:
          userId,

        requestId,

        idempotencyKey,

        reason:
          "Giveaway not found",

        errorCode:
          "GIVEAWAY_NOT_FOUND",

        req,
      });

      return res.status(404).json({
        success: false,
        message:
          "Giveaway not found",
        requestId,
      });
    }

    /*
     * --------------------------------------------------------------
     * 7. SERVER TIME
     * --------------------------------------------------------------
     */

    const now = new Date();

    /*
     * --------------------------------------------------------------
     * 8. BACKEND-CONTROLLED GIVEAWAY STATUS
     * --------------------------------------------------------------
     */

    if (
      giveaway.status !== "active" ||
      !giveaway.isPublished
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Giveaway is not active",
        requestId,
      });
    }

    if (
      giveaway.startDate &&
      now < giveaway.startDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Giveaway has not started yet",
        requestId,
      });
    }

    if (
      giveaway.endDate &&
      now > giveaway.endDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Giveaway has ended",
        requestId,
      });
    }

    /*
     * --------------------------------------------------------------
     * 9. SERVER-CONTROLLED ENTRY FEE
     * --------------------------------------------------------------
     *
     * IMPORTANT FIX:
     *
     * Old MongoDB giveaway documents may not contain entryFee.
     *
     * Number(undefined) === NaN
     *
     * Therefore we explicitly use 250 as the backward-compatible
     * default.
     *
     */

    const rawEntryFee =
      giveaway.entryFee ??
      DEFAULT_ENTRY_FEE;

    const entryAmount =
      Number(rawEntryFee);

    /*
     * NEVER allow NaN or Infinity.
     */

    if (
      !Number.isFinite(entryAmount) ||
      entryAmount < 0
    ) {
      console.error(
        "Invalid giveaway entry fee:",
        rawEntryFee
      );

      return res.status(500).json({
        success: false,
        message:
          "Invalid giveaway entry fee configured by administrator",
        requestId,
      });
    }

    /*
     * --------------------------------------------------------------
     * 10. CURRENCY
     * --------------------------------------------------------------
     */

    const currency = "VE";

    /*
     * --------------------------------------------------------------
     * 11. LOAD AUTHORITATIVE USER
     * --------------------------------------------------------------
     */

    const user =
      await User.findById(userId)
        .select(
          "name email role status walletBalance"
        )
        .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        requestId,
      });
    }

    /*
     * --------------------------------------------------------------
     * 12. USER STATUS
     * --------------------------------------------------------------
     */

    if (
      user.status !== "active"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is not active",
        requestId,
      });
    }

    /*
     * --------------------------------------------------------------
     * 13. AUTHORITATIVE WALLET BALANCE
     * --------------------------------------------------------------
     *
     * IMPORTANT FIX:
     *
     * We never perform arithmetic using an unchecked value.
     *
     */

    const rawWalletBalance =
      user.walletBalance ?? 0;

    const balanceBefore =
      Number(rawWalletBalance);

    /*
     * NEVER allow NaN or Infinity.
     */

    if (
      !Number.isFinite(
        balanceBefore
      ) ||
      balanceBefore < 0
    ) {
      console.error(
        "Invalid user wallet balance:",
        {
          userId: user._id,
          walletBalance:
            rawWalletBalance,
        }
      );

      return res.status(500).json({
        success: false,
        message:
          "Invalid wallet balance. Please contact support.",
        requestId,
      });
    }

    /*
     * --------------------------------------------------------------
     * 14. FRAUD CHECK BEFORE MONEY DEDUCTION
     * --------------------------------------------------------------
     */

    const deviceId =
      req.headers[
        "x-veloopp-device-id"
      ] || "";

    const fraudResult =
      await analyzeParticipationRisk({
        user,
        giveaway,
        deviceId,
        req,
      });

    /*
     * BLOCKED
     */

    if (
      fraudResult.action ===
      "BLOCKED"
    ) {
      await createFraudEvent({
        user,
        giveaway,
        deviceId,
        req,
        fraudResult,
      });

      await writeAuditLog({
        eventType:
          "FRAUD_FLAGGED",

        result:
          "BLOCKED",

        user:
          user._id,

        giveaway:
          giveaway._id,

        requestId,

        idempotencyKey,

        fraudRiskScore:
          fraudResult.riskScore,

        fraudRiskLevel:
          fraudResult.riskLevel,

        fraudReason:
          fraudResult.reason,

        req,
      });

      return res.status(403).json({
        success: false,
        message:
          "Participation blocked due to security checks",
        requestId,
      });
    }

    /*
     * REVIEW
     */

    if (
      fraudResult.action ===
      "REVIEW"
    ) {
      await createFraudEvent({
        user,
        giveaway,
        deviceId,
        req,
        fraudResult,
      });

      return res.status(403).json({
        success: false,
        message:
          "Participation requires security review",
        requestId,
      });
    }

    /*
     * FLAGGED
     */

    if (
      fraudResult.action ===
      "FLAGGED"
    ) {
      await createFraudEvent({
        user,
        giveaway,
        deviceId,
        req,
        fraudResult,
      });
    }

    /*
     * --------------------------------------------------------------
     * 15. EXISTING PARTICIPATION CHECK
     * --------------------------------------------------------------
     */

    const existingParticipation =
      await GiveawayParticipation.findOne({
        userId:
          user._id,

        giveawayId:
          giveaway._id,
      }).lean();

    if (
      existingParticipation
    ) {
      /*
       * Same idempotency key?
       * Return original transaction.
       */

      if (idempotencyKey) {
        const existingTransaction =
          await EntryTransaction.findOne({
            user:
              user._id,

            giveaway:
              giveaway._id,

            idempotencyKey,
          }).lean();

        if (
          existingTransaction
        ) {
          return res.status(200).json({
            success: true,
            replayed: true,
            message:
              "Original giveaway join request already processed",
            requestId,

            data: {
              giveawayId:
                giveaway._id,

              participationId:
                existingParticipation._id,

              entryId:
                existingTransaction.entry,

              transactionId:
                existingTransaction._id,

              amount:
                existingTransaction.amount,

              currency:
                existingTransaction.currency,

              balanceBefore:
                existingTransaction.balanceBefore,

              balanceAfter:
                existingTransaction.balanceAfter,

              status:
                existingParticipation.status,

              joinedAt:
                existingParticipation.joinedAt,
            },
          });
        }
      }

      /*
       * Audit duplicate.
       */

      await writeAuditLog({
        eventType:
          "DUPLICATE_ATTEMPT",

        result:
          "REJECTED",

        user:
          user._id,

        giveaway:
          giveaway._id,

        participation:
          existingParticipation._id,

        requestId,

        idempotencyKey,

        reason:
          "User already participated",

        errorCode:
          "ALREADY_PARTICIPATING",

        req,
      });

      return res.status(409).json({
        success: false,
        message:
          "You have already participated in this giveaway",
        requestId,
      });
    }

    /*
     * --------------------------------------------------------------
     * 16. BALANCE CHECK
     * --------------------------------------------------------------
     */

    if (
      balanceBefore < entryAmount
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Insufficient VE balance",

        required:
          entryAmount,

        available:
          balanceBefore,

        requestId,
      });
    }

    /*
     * --------------------------------------------------------------
     * 17. CALCULATE BALANCE AFTER
     * --------------------------------------------------------------
     */

    const balanceAfter =
      balanceBefore -
      entryAmount;

    /*
     * Final protection against NaN.
     */

    if (
      !Number.isFinite(
        balanceAfter
      ) ||
      balanceAfter < 0
    ) {
      console.error(
        "Invalid balance calculation:",
        {
          balanceBefore,
          entryAmount,
          balanceAfter,
        }
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to calculate wallet balance",
        requestId,
      });
    }

    /*
     * --------------------------------------------------------------
     * 18. START MONGODB TRANSACTION
     * --------------------------------------------------------------
     */

    session.startTransaction();

    transactionStarted = true;

    /*
     * --------------------------------------------------------------
     * 19. DUPLICATE CHECK INSIDE TRANSACTION
     * --------------------------------------------------------------
     */

    const duplicateInside =
      await GiveawayParticipation.findOne({
        userId:
          user._id,

        giveawayId:
          giveaway._id,
      }).session(session);

    if (duplicateInside) {
      await session.abortTransaction();

      transactionStarted = false;

      return res.status(409).json({
        success: false,
        message:
          "You have already participated in this giveaway",
        requestId,
      });
    }

    /*
     * --------------------------------------------------------------
     * 20. ATOMIC WALLET DEDUCTION
     * --------------------------------------------------------------
     */

    const updatedUser =
      await User.findOneAndUpdate(
        {
          _id:
            user._id,

          walletBalance: {
            $gte:
              entryAmount,
          },
        },

        {
          $inc: {
            walletBalance:
              -entryAmount,
          },
        },

        {
          new: true,
          session,
        }
      );

    /*
     * If no user was updated, another request may have consumed
     * the balance.
     */

    if (!updatedUser) {
      await session.abortTransaction();

      transactionStarted = false;

      return res.status(400).json({
        success: false,
        message:
          "Insufficient VE balance",
        requestId,
      });
    }

    /*
     * --------------------------------------------------------------
     * 21. CREATE GIVEAWAY ENTRY
     * --------------------------------------------------------------
     */

    const [entry] =
      await GiveawayEntry.create(
        [
          {
            giveaway:
              giveaway._id,

            user:
              user._id,

            enteredAt:
              new Date(),
          },
        ],
        {
          session,
        }
      );

    /*
     * --------------------------------------------------------------
     * 22. CREATE ENTRY TRANSACTION
     * --------------------------------------------------------------
     */

    const [transaction] =
      await EntryTransaction.create(
        [
          {
            user:
              user._id,

            giveaway:
              giveaway._id,

            entry:
              entry._id,

            type:
              "entry_fee",

            currency,

            amount:
              entryAmount,

            balanceBefore,

            balanceAfter,

            status:
              "completed",

            requestId,

            idempotencyKey,
          },
        ],
        {
          session,
        }
      );

    /*
     * --------------------------------------------------------------
     * 23. CREATE PARTICIPATION
     * --------------------------------------------------------------
     */

    const [participation] =
      await GiveawayParticipation.create(
        [
          {
            userId:
              user._id,

            giveawayId:
              giveaway._id,

            prizeId:
              null,

            entryCurrency:
              currency,

            entryAmount,

            deviceHash:
              req.deviceHash ||
              "",

            status:
              "active",

            joinedAt:
              new Date(),

            transactionId:
              transaction._id,
          },
        ],
        {
          session,
        }
      );

    /*
     * --------------------------------------------------------------
     * 24. COMMIT TRANSACTION
     * --------------------------------------------------------------
     */

    await session.commitTransaction();

    transactionStarted = false;

    /*
     * --------------------------------------------------------------
     * 25. AUDIT SUCCESSFUL JOIN
     * --------------------------------------------------------------
     */

    await writeAuditLog({
      eventType:
        "JOIN_GIVEAWAY",

      result:
        "SUCCESS",

      user:
        user._id,

      giveaway:
        giveaway._id,

      participation:
        participation._id,

      entry:
        entry._id,

      transaction:
        transaction._id,

      requestId,

      idempotencyKey,

      amount:
        entryAmount,

      currency,

      balanceBefore,

      balanceAfter,

      fraudRiskScore:
        fraudResult.riskScore,

      fraudRiskLevel:
        fraudResult.riskLevel,

      fraudReason:
        fraudResult.reason,

      req,
    });

    /*
     * --------------------------------------------------------------
     * 26. AUDIT FEE DEDUCTION
     * --------------------------------------------------------------
     */

    await writeAuditLog({
      eventType:
        "ENTRY_FEE_DEDUCTED",

      result:
        "SUCCESS",

      user:
        user._id,

      giveaway:
        giveaway._id,

      participation:
        participation._id,

      entry:
        entry._id,

      transaction:
        transaction._id,

      requestId,

      idempotencyKey,

      amount:
        entryAmount,

      currency,

      balanceBefore,

      balanceAfter,

      req,
    });

    /*
     * --------------------------------------------------------------
     * 27. FINAL SUCCESS RESPONSE
     * --------------------------------------------------------------
     */

    return res.status(201).json({
      success: true,

      replayed: false,

      message:
        "Successfully joined giveaway",

      requestId,

      data: {
        giveawayId:
          giveaway._id,

        participationId:
          participation._id,

        entryId:
          entry._id,

        transactionId:
          transaction._id,

        amount:
          entryAmount,

        currency,

        balanceBefore,

        balanceAfter,

        status:
          participation.status,

        joinedAt:
          participation.joinedAt,
      },
    });
  } catch (error) {
    /*
     * --------------------------------------------------------------
     * ROLLBACK
     * --------------------------------------------------------------
     */

    if (transactionStarted) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error(
          "Abort transaction error:",
          abortError.message
        );
      }
    }

    /*
     * --------------------------------------------------------------
     * DUPLICATE KEY
     * --------------------------------------------------------------
     */

    if (
      error?.code === 11000
    ) {
      const userId =
        req.user?._id ||
        req.user?.id;

      const giveawayId =
        req.params?.id;

      const idempotencyKey =
        getIdempotencyKey(req);

      /*
       * Try to retrieve the transaction created by the
       * successful concurrent request.
       */

      if (
        userId &&
        mongoose.Types.ObjectId.isValid(
          giveawayId
        ) &&
        idempotencyKey
      ) {
        const existingTransaction =
          await EntryTransaction.findOne({
            user:
              userId,

            giveaway:
              giveawayId,

            idempotencyKey,
          }).lean();

        if (
          existingTransaction
        ) {
          const participation =
            await GiveawayParticipation.findOne({
              userId,
              giveawayId,
            }).lean();

          const entry =
            await GiveawayEntry.findOne({
              user:
                userId,

              giveaway:
                giveawayId,
            }).lean();

          return res.status(200).json({
            success: true,

            replayed: true,

            message:
              "Original giveaway join request already processed",

            requestId:
              req.requestId ||
              null,

            data: {
              giveawayId,

              participationId:
                participation?._id ||
                null,

              entryId:
                entry?._id ||
                existingTransaction.entry ||
                null,

              transactionId:
                existingTransaction._id,

              amount:
                existingTransaction.amount,

              currency:
                existingTransaction.currency,

              balanceBefore:
                existingTransaction.balanceBefore,

              balanceAfter:
                existingTransaction.balanceAfter,

              status:
                participation?.status ||
                "active",

              joinedAt:
                participation?.joinedAt ||
                existingTransaction.createdAt,
            },
          });
        }
      }

      return res.status(409).json({
        success: false,
        message:
          "Duplicate participation request",
        requestId:
          req.requestId ||
          null,
      });
    }

    /*
     * --------------------------------------------------------------
     * REAL SERVER ERROR
     * --------------------------------------------------------------
     */

    console.error(
      "Enter giveaway error:",
      error
    );

    /*
     * --------------------------------------------------------------
     * DEVELOPMENT ERROR RESPONSE
     * --------------------------------------------------------------
     *
     * This helps us debug backend problems during development.
     * In production you can remove errorDetails.
     */

    return res.status(500).json({
      success: false,
      message:
        "Failed to join giveaway",
      requestId:
        req.requestId ||
        null,

      errorDetails:
        process.env.NODE_ENV !==
        "production"
          ? error.message
          : undefined,
    });
  } finally {
    await session.endSession();
  }
};

/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

module.exports = {
  getCurrentGiveaway,
  getGiveaways,
  getGiveawayById,
  checkEntryStatus,
  getPreviousGiveaways,
  getGiveawayWinners,
  getMyGiveawayHistory,
  enterGiveaway,
};
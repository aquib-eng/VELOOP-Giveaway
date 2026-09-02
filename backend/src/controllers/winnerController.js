const crypto = require("crypto");
const mongoose = require("mongoose");

const Giveaway =
  require("../models/Giveaway");

const GiveawayEntry =
  require("../models/GiveawayEntry");

const GiveawayParticipation =
  require("../models/GiveawayParticipation");

const GiveawayWinner =
  require("../models/GiveawayWinner");

const FraudEvent =
  require("../models/FraudEvent");

const {
  writeAuditLog,
} = require("../utils/auditLogger");

// ==========================================
// WINNER CLAIM PERIOD
// ==========================================

const CLAIM_DAYS = Number(
  process.env.WINNER_CLAIM_DAYS || 7
);

// ==========================================
// DETECT WINNER
// ==========================================

const detectWinner = async (
  req,
  res
) => {
  const { id } = req.params;

  // ==========================================
  // VALIDATE ID
  // ==========================================

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

  const session =
    await mongoose.startSession();

  try {
    session.startTransaction();

    const now = new Date();

    // ==========================================
    // FIND GIVEAWAY
    // ==========================================

    const giveaway =
      await Giveaway.findById(id)
        .session(session);

    if (!giveaway) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message:
          "Giveaway not found.",
      });
    }

    // ==========================================
    // ALREADY COMPLETED
    // ==========================================

    if (
      giveaway.status ===
      "completed"
    ) {
      const existingWinner =
        await GiveawayWinner.findOne({
          giveawayId:
            giveaway._id,
        })
          .populate(
            "userId",
            "name email"
          )
          .session(session);

      await session.commitTransaction();

      return res.status(200).json({
        success: true,

        message:
          "Giveaway has already been completed.",

        alreadyCompleted: true,

        giveaway,

        winner:
          existingWinner || null,

        winnerSelected:
          !!existingWinner,
      });
    }

    // ==========================================
    // GIVEAWAY MUST BE ACTIVE
    // ==========================================

    if (
      giveaway.status !==
      "active"
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,

        message:
          "Only an active giveaway can be completed.",

        code:
          "GIVEAWAY_NOT_ACTIVE",
      });
    }

    // ==========================================
    // CHECK END DATE
    // ==========================================

    if (
      giveaway.endDate >
      now
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,

        message:
          "Giveaway has not ended yet.",

        code:
          "GIVEAWAY_NOT_ENDED",

        endDate:
          giveaway.endDate,
      });
    }

    // ==========================================
    // GET ACTIVE PARTICIPATIONS
    // ==========================================

    const participations =
      await GiveawayParticipation.find({
        giveawayId:
          giveaway._id,

        status: "active",
      })
        .populate(
          "userId",
          "name email status"
        )
        .session(session)
        .lean();

    // ==========================================
    // GET SUSPICIOUS USERS
    // ==========================================

    const fraudEvents =
      await FraudEvent.find({
        giveawayId:
          giveaway._id,

        action: {
          $in: [
            "FLAGGED",
            "BLOCKED",
            "REVIEW",
          ],
        },
      })
        .session(session)
        .lean();

    const suspiciousUsers =
      new Set();

    fraudEvents.forEach(
      (fraudEvent) => {
        if (
          fraudEvent.userId
        ) {
          suspiciousUsers.add(
            fraudEvent.userId.toString()
          );
        }
      }
    );

    // ==========================================
    // PARTICIPATION MAP
    // ==========================================

    const participationMap =
      new Map();

    participations.forEach(
      (participation) => {
        if (
          participation.userId
        ) {
          participationMap.set(
            participation.userId._id.toString(),
            participation
          );
        }
      }
    );

    // ==========================================
    // GET GIVEAWAY ENTRIES
    // ==========================================

    const entries =
      await GiveawayEntry.find({
        giveaway:
          giveaway._id,
      })
        .session(session)
        .lean();

    // ==========================================
    // FILTER ELIGIBLE ENTRIES
    // ==========================================

    const eligibleEntries =
      entries.filter(
        (entry) => {
          // -------------------------------
          // Entry must have user
          // -------------------------------

          if (!entry.user) {
            return false;
          }

          const userId =
            entry.user.toString();

          // -------------------------------
          // Participation must exist
          // -------------------------------

          const participation =
            participationMap.get(
              userId
            );

          if (!participation) {
            return false;
          }

          // -------------------------------
          // User account must be active
          // -------------------------------

          if (
            participation.userId &&
            participation.userId.status &&
            participation.userId.status !==
              "active"
          ) {
            return false;
          }

          // -------------------------------
          // Suspicious users cannot win
          // -------------------------------

          if (
            suspiciousUsers.has(
              userId
            )
          ) {
            return false;
          }

          return true;
        }
      );

    // ==========================================
    // NO ELIGIBLE ENTRIES
    // ==========================================

    if (
      eligibleEntries.length ===
      0
    ) {
      giveaway.status =
        "completed";

      giveaway.completedAt =
        now;

      giveaway.winnerSelectedAt =
        now;

      await giveaway.save({
        session,
      });

      // ----------------------------------------
      // COMPLETE ACTIVE PARTICIPATIONS
      // ----------------------------------------

      await GiveawayParticipation.updateMany(
        {
          giveawayId:
            giveaway._id,

          status: "active",
        },
        {
          $set: {
            status:
              "completed",
          },
        },
        {
          session,
        }
      );

      await session.commitTransaction();

      // ----------------------------------------
      // AUDIT
      // ----------------------------------------

      await writeAuditLog({
        eventType:
          "GIVEAWAY_COMPLETED",

        result:
          "SUCCESS",

        userId:
          req.user?.id ||
          req.user?._id ||
          null,

        giveawayId:
          giveaway._id,

        requestId:
          req.requestId,

        reason:
          "Giveaway completed without an eligible winner.",

        metadata: {
          eligibleEntries: 0,
        },
      });

      return res.status(200).json({
        success: true,

        message:
          "Giveaway completed, but no eligible winner was available.",

        giveaway,

        winner: null,

        winnerSelected: false,
      });
    }

    // ==========================================
    // SECURE RANDOM SELECTION
    // ==========================================

    const randomIndex =
      crypto.randomInt(
        0,
        eligibleEntries.length
      );

    const selectedEntry =
      eligibleEntries[
        randomIndex
      ];

    // ==========================================
    // GET SELECTED PARTICIPATION
    // ==========================================

    const selectedParticipation =
      await GiveawayParticipation.findOne(
        {
          giveawayId:
            giveaway._id,

          userId:
            selectedEntry.user,

          status: "active",
        }
      ).session(session);

    if (
      !selectedParticipation
    ) {
      throw new Error(
        "Selected participant is no longer eligible."
      );
    }

    // ==========================================
    // CLAIM DEADLINE
    // ==========================================

    const claimDeadline =
      new Date(now);

    claimDeadline.setDate(
      claimDeadline.getDate() +
        CLAIM_DAYS
    );

    // ==========================================
    // CREATE WINNER
    //
    // IMPORTANT:
    // These values match YOUR schema:
    //
    // winnerStatus = selected
    // claimStatus  = not_submitted
    // ==========================================

    const winner =
      new GiveawayWinner({
        userId:
          selectedEntry.user,

        giveawayId:
          giveaway._id,

        prizeId:
          null,

        prizeName:
          giveaway.prize.name,

        prizeCategory:
          "General",

        winnerStatus:
          "selected",

        selectedAt:
          now,

        claimDeadline:
          claimDeadline,

        claimStatus:
          "not_submitted",
      });

    await winner.save({
      session,
    });

    // ==========================================
    // UPDATE GIVEAWAY
    // ==========================================

    giveaway.status =
      "completed";

    giveaway.completedAt =
      now;

    giveaway.winnerSelectedAt =
      now;

    await giveaway.save({
      session,
    });

    // ==========================================
    // COMPLETE ACTIVE PARTICIPATIONS
    // ==========================================

    await GiveawayParticipation.updateMany(
      {
        giveawayId:
          giveaway._id,

        status: "active",
      },
      {
        $set: {
          status:
            "completed",
        },
      },
      {
        session,
      }
    );

    // ==========================================
    // COMMIT
    // ==========================================

    await session.commitTransaction();

    // ==========================================
    // AUDIT — GIVEAWAY COMPLETED
    // ==========================================

    await writeAuditLog({
      eventType:
        "GIVEAWAY_COMPLETED",

      result:
        "SUCCESS",

      userId:
        req.user?.id ||
        req.user?._id ||
        null,

      giveawayId:
        giveaway._id,

      requestId:
        req.requestId,

      reason:
        "Giveaway completed and winner selected.",

      metadata: {
        eligibleEntries:
          eligibleEntries.length,

        winnerSelected:
          true,
      },
    });

    // ==========================================
    // AUDIT — WINNER SELECTED
    // ==========================================

    await writeAuditLog({
      eventType:
        "WINNER_SELECTED",

      result:
        "SUCCESS",

      userId:
        selectedEntry.user,

      giveawayId:
        giveaway._id,

      requestId:
        req.requestId,

      reason:
        "Winner selected using secure cryptographic random selection.",

      metadata: {
        selectionMethod:
          "crypto_random",

        eligibleEntries:
          eligibleEntries.length,
      },
    });

    // ==========================================
    // GET FINAL WINNER
    // ==========================================

    const finalWinner =
      await GiveawayWinner.findById(
        winner._id
      )
        .populate(
          "userId",
          "name email"
        );

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      message:
        "Giveaway completed and winner selected successfully.",

      giveaway,

      winner:
        finalWinner,

      winnerSelected:
        true,

      eligibleEntries:
        eligibleEntries.length,
    });
  } catch (error) {
    // ==========================================
    // ROLLBACK
    // ==========================================

    if (
      session.inTransaction()
    ) {
      await session.abortTransaction();
    }

    console.error(
      "Winner detection error:",
      error
    );

    // ==========================================
    // DUPLICATE WINNER
    // ==========================================

    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,

        message:
          "Winner has already been selected for this giveaway.",

        code:
          "WINNER_ALREADY_SELECTED",
      });
    }

    return res.status(500).json({
      success: false,

      message:
        "Failed to complete giveaway and select winner.",

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
// GET SINGLE WINNER
// ==========================================

const getWinner = async (
  req,
  res
) => {
  const { id } = req.params;

  // ==========================================
  // VALIDATE ID
  // ==========================================

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
    const winner =
      await GiveawayWinner.findOne({
        giveawayId: id,

        winnerStatus: {
          $in: [
            "selected",
            "confirmed",
            "claimed",
          ],
        },
      })
        .populate(
          "userId",
          "name"
        )
        .populate(
          "giveawayId",
          "title prize status"
        );

    // ==========================================
    // NO WINNER YET
    // ==========================================

    if (!winner) {
      return res.status(404).json({
        success: false,

        message:
          "Winner has not been selected yet.",

        winnerSelected:
          false,
      });
    }

    // ==========================================
    // SUCCESS
    // ==========================================

    return res.status(200).json({
      success: true,

      winnerSelected:
        true,

      winner,
    });
  } catch (error) {
    console.error(
      "Get winner error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to get giveaway winner.",
    });
  }
};

module.exports = {
  detectWinner,
  getWinner,
};
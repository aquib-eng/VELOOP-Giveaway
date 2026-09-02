const mongoose = require("mongoose");

const Giveaway =
  require("../models/Giveaway");

const GiveawayParticipation =
  require("../models/GiveawayParticipation");

const GiveawayWinner =
  require("../models/GiveawayWinner");

const PrizeClaim =
  require("../models/PrizeClaim");

// ==========================================
// GET AUTHENTICATED USER ID
// ==========================================

const getAuthenticatedUserId = (req) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId ||
    null
  );
};

// ==========================================
// GET MY GIVEAWAY RESULT
// ==========================================

const getMyGiveawayResult = async (
  req,
  res
) => {
  const { id } = req.params;

  const userId =
    getAuthenticatedUserId(req);

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  if (!userId) {
    return res.status(401).json({
      success: false,

      message:
        "Authentication required.",

      code:
        "LOGIN_REQUIRED",
    });
  }

  // ==========================================
  // VALIDATE GIVEAWAY ID
  // ==========================================

  if (
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    return res.status(400).json({
      success: false,

      message:
        "Invalid giveaway ID.",

      code:
        "INVALID_GIVEAWAY_ID",
    });
  }

  try {
    // ========================================
    // FIND GIVEAWAY
    // ========================================

    const giveaway =
      await Giveaway.findById(id).select(
        "title description prize entryFee startDate endDate status completedAt winnerSelectedAt isPublished"
      );

    if (!giveaway) {
      return res.status(404).json({
        success: false,

        message:
          "Giveaway not found.",

        code:
          "GIVEAWAY_NOT_FOUND",
      });
    }

    // ========================================
    // CHECK PARTICIPATION
    // ========================================

    const participation =
      await GiveawayParticipation.findOne({
        giveawayId:
          giveaway._id,

        userId:
          userId,
      }).select(
        "status entryCurrency entryAmount joinedAt transactionId"
      );

    // ========================================
    // USER DID NOT PARTICIPATE
    // ========================================

    if (!participation) {
      return res.status(200).json({
        success: true,

        result: "not_participated",

        participated: false,

        winner: false,

        nonWinner: false,

        waiting: false,

        giveaway: {
          id:
            giveaway._id,

          title:
            giveaway.title,

          status:
            giveaway.status,
        },

        message:
          "You did not participate in this giveaway.",
      });
    }

    // ========================================
    // GIVEAWAY STILL ACTIVE
    // ========================================

    if (
      giveaway.status ===
      "active"
    ) {
      return res.status(200).json({
        success: true,

        result: "waiting",

        participated: true,

        winner: false,

        nonWinner: false,

        waiting: true,

        participation: {
          status:
            participation.status,

          joinedAt:
            participation.joinedAt,
        },

        giveaway: {
          id:
            giveaway._id,

          title:
            giveaway.title,

          status:
            giveaway.status,

          endDate:
            giveaway.endDate,
        },

        message:
          "Giveaway is still active. Winner announcement is pending.",
      });
    }

    // ========================================
    // GIVEAWAY NOT COMPLETED YET
    // ========================================

    if (
      giveaway.status !==
      "completed"
    ) {
      return res.status(200).json({
        success: true,

        result: "waiting",

        participated: true,

        winner: false,

        nonWinner: false,

        waiting: true,

        giveaway: {
          id:
            giveaway._id,

          title:
            giveaway.title,

          status:
            giveaway.status,
        },

        message:
          "Winner announcement is pending.",
      });
    }

    // ========================================
    // FIND WINNER
    // ========================================

    const winner =
      await GiveawayWinner.findOne({
        giveawayId:
          giveaway._id,

        userId:
          userId,
      }).select(
        "prizeName prizeCategory winnerStatus selectedAt claimDeadline claimStatus"
      );

    // ========================================
    // USER IS WINNER
    // ========================================

    if (
      winner &&
      winner.winnerStatus !==
        "expired"
    ) {
      // --------------------------------------
      // FIND CLAIM
      // --------------------------------------

      const claim =
        await PrizeClaim.findOne({
          giveawayId:
            giveaway._id,

          userId:
            userId,
        }).select(
          "prizeName prizeType status createdAt processedAt completedAt"
        );

      return res.status(200).json({
        success: true,

        result: "winner",

        participated: true,

        winner: true,

        nonWinner: false,

        waiting: false,

        giveaway: {
          id:
            giveaway._id,

          title:
            giveaway.title,

          status:
            giveaway.status,

          completedAt:
            giveaway.completedAt,

          winnerSelectedAt:
            giveaway.winnerSelectedAt,
        },

        winner: {
          status:
            winner.winnerStatus,

          prizeName:
            winner.prizeName,

          prizeCategory:
            winner.prizeCategory,

          selectedAt:
            winner.selectedAt,

          claimDeadline:
            winner.claimDeadline,

          claimStatus:
            winner.claimStatus,
        },

        claim: claim
          ? {
              status:
                claim.status,

              prizeName:
                claim.prizeName,

              prizeType:
                claim.prizeType,

              createdAt:
                claim.createdAt,

              processedAt:
                claim.processedAt,

              completedAt:
                claim.completedAt,
            }
          : null,

        message:
          "Congratulations! You are the winner.",
      });
    }

    // ========================================
    // USER IS NOT WINNER
    // ========================================

    return res.status(200).json({
      success: true,

      result: "non_winner",

      participated: true,

      winner: false,

      nonWinner: true,

      waiting: false,

      giveaway: {
        id:
          giveaway._id,

        title:
          giveaway.title,

        status:
          giveaway.status,

        completedAt:
          giveaway.completedAt,

        winnerSelectedAt:
          giveaway.winnerSelectedAt,
      },

      participation: {
        status:
          participation.status,

        joinedAt:
          participation.joinedAt,
      },

      message:
        "Thank you for participating. Unfortunately, you were not selected as the winner.",
    });
  } catch (error) {
    console.error(
      "Get giveaway result error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to get giveaway result.",

      error:
        process.env.NODE_ENV ===
        "production"
          ? undefined
          : error.message,
    });
  }
};

module.exports = {
  getMyGiveawayResult,
};
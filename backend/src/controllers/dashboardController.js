const User = require("../models/User");
const Giveaway = require("../models/Giveaway");
const GiveawayParticipation = require("../models/GiveawayParticipation");
const GiveawayWinner = require("../models/GiveawayWinner");
const PrizeClaim = require("../models/PrizeClaim");
const EntryTransaction = require("../models/EntryTransaction");

const getAuthenticatedUserId = (req) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId ||
    null
  );
};

// ==========================================
// GET USER DASHBOARD
// ==========================================

const getDashboard = async (req, res) => {
  const userId = getAuthenticatedUserId(req);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
      code: "LOGIN_REQUIRED",
    });
  }

  try {
    // ========================================
    // USER
    // ========================================

    const user = await User.findById(userId).select(
      "name email walletBalance referralCode status createdAt lastLoginAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        code: "USER_NOT_FOUND",
      });
    }

    // ========================================
    // CURRENT GIVEAWAY
    // ========================================

    const currentGiveaway = await Giveaway.findOne({
      status: "active",
      isPublished: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    }).select(
      "title description prize entryFee startDate endDate status"
    );

    // ========================================
    // MY CURRENT PARTICIPATION
    // ========================================

    let currentParticipation = null;

    if (currentGiveaway) {
      currentParticipation =
        await GiveawayParticipation.findOne({
          userId,
          giveawayId: currentGiveaway._id,
        }).select(
          "status entryCurrency entryAmount joinedAt transactionId"
        );
    }

    // ========================================
    // PARTICIPATION COUNT
    // ========================================

    const participationCount =
      await GiveawayParticipation.countDocuments({
        userId,
      });

    // ========================================
    // WINNER COUNT
    // ========================================

    const winnerCount =
      await GiveawayWinner.countDocuments({
        userId,
      });

    // ========================================
    // COMPLETED CLAIMS
    // ========================================

    const claimedCount =
      await PrizeClaim.countDocuments({
        userId,
        status: "completed",
      });

    // ========================================
    // MY RECENT PARTICIPATIONS
    // ========================================

    const participations =
      await GiveawayParticipation.find({
        userId,
      })
        .sort({ joinedAt: -1 })
        .limit(10)
        .populate({
          path: "giveawayId",
          select:
            "title prize entryFee startDate endDate status completedAt winnerSelectedAt",
        })
        .lean();

    // ========================================
    // MY WINNERS
    // ========================================

    const winners =
      await GiveawayWinner.find({
        userId,
      })
        .sort({ selectedAt: -1 })
        .limit(10)
        .populate({
          path: "giveawayId",
          select: "title prize status completedAt",
        })
        .lean();

    // ========================================
    // MY CLAIMS
    // ========================================

    const claims =
      await PrizeClaim.find({
        userId,
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .select(
          "giveawayId winnerId prizeName prizeType status createdAt processedAt completedAt"
        )
        .populate({
          path: "giveawayId",
          select: "title",
        })
        .lean();

    // ========================================
    // RECENT TRANSACTIONS
    // ========================================

    const transactions =
      await EntryTransaction.find({
        user: userId,
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .select(
          "giveaway amount currency balanceBefore balanceAfter status type requestId createdAt"
        )
        .populate({
          path: "giveaway",
          select: "title",
        })
        .lean();

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      success: true,

      dashboard: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          status: user.status,
          referralCode: user.referralCode,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        },

        wallet: {
          balance: user.walletBalance,
          currency: "VE",
        },

        statistics: {
          participationCount,
          winnerCount,
          claimedCount,
        },

        currentGiveaway: currentGiveaway
          ? {
              id: currentGiveaway._id,
              title: currentGiveaway.title,
              description: currentGiveaway.description,

              prize: currentGiveaway.prize,

              entryFee:
                currentGiveaway.entryFee,

              startDate:
                currentGiveaway.startDate,

              endDate:
                currentGiveaway.endDate,

              status:
                currentGiveaway.status,

              participated:
                Boolean(currentParticipation),

              participation:
                currentParticipation
                  ? {
                      status:
                        currentParticipation.status,

                      entryCurrency:
                        currentParticipation.entryCurrency,

                      entryAmount:
                        currentParticipation.entryAmount,

                      joinedAt:
                        currentParticipation.joinedAt,
                    }
                  : null,
            }
          : null,

        recentParticipations:
          participations,

        winners,

        claims,

        recentTransactions:
          transactions,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load dashboard.",
      error:
        process.env.NODE_ENV === "production"
          ? undefined
          : error.message,
    });
  }
};

module.exports = {
  getDashboard,
};
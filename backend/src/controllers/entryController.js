const Giveaway = require("../models/Giveaway");
const GiveawayEntry = require("../models/GiveawayEntry");

const enterGiveaway = async (req, res) => {
  try {
    const { giveawayId } = req.params;

    const userId = req.user._id;

    // Find giveaway
    const giveaway = await Giveaway.findById(
      giveawayId
    );

    if (!giveaway) {
      return res.status(404).json({
        success: false,
        message: "Giveaway not found.",
      });
    }

    // Check giveaway status
    if (giveaway.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This giveaway is not active.",
      });
    }

    // Check published
    if (!giveaway.isPublished) {
      return res.status(400).json({
        success: false,
        message: "This giveaway is not available.",
      });
    }

    // Check date
    const now = new Date();

    if (
      now < giveaway.startDate ||
      now > giveaway.endDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This giveaway is outside its active period.",
      });
    }

    // Check existing entry
    const existingEntry =
      await GiveawayEntry.findOne({
        giveaway: giveawayId,
        user: userId,
      });

    if (existingEntry) {
      return res.status(409).json({
        success: false,
        message:
          "You have already entered this giveaway.",
      });
    }

    // Create entry
    const entry = await GiveawayEntry.create({
      giveaway: giveawayId,
      user: userId,
    });

    return res.status(201).json({
      success: true,
      message:
        "You have successfully entered the giveaway!",
      entry,
    });
  } catch (error) {
    console.error(
      "Giveaway entry error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to enter giveaway.",
    });
  }
};

module.exports = {
  enterGiveaway,
};
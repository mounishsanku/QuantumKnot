import { Router } from "express";
import Policy from "../models/Policy.js";
import Rider from "../models/Rider.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { calculatePremium } from "../services/premiumService.js";
import { sendPolicyCreatedEmail } from "../services/emailService.js";
import logger from "../logger.js";

const router = Router();

/**
 * CREATE POLICY
 */
router.post("/create", authMiddleware, async (req, res) => {
  try {
    // ✅ SAFETY CHECK
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { tier, addOns = [] } = req.body;

    const rider = await Rider.findById(req.user.id);
    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    const finalTier =
      tier === "ev" || tier === "standard"
        ? tier
        : rider.vehicleType === "ev"
          ? "ev"
          : "standard";

    const premiumPayload = {
      city: rider.city,
      vehicleType: rider.vehicleType,
      workingHours: rider.workingHours,
      dailyEarnings: rider.dailyEarnings,
      addOns,
      tier: finalTier,
    };

    const premiumResult = await calculatePremium(premiumPayload);

    const weeklyPremium = premiumResult.adjustedPremium;
    const baseCoverage = finalTier === "ev" ? 15000 : 10000;
    const coverageAmount = baseCoverage + addOns.length * 500;

    // Cancel old active policies
    await Policy.updateMany(
      { riderId: rider._id, status: "active" },
      { $set: { status: "cancelled" } }
    );

    const startDate = new Date();
    const nextRenewalDate = new Date(
      startDate.getTime() + 7 * 24 * 60 * 60 * 1000
    );

    const policy = await Policy.create({
      riderId: rider._id,
      tier: finalTier,
      addOns,
      weeklyPremium,
      coverageAmount,
      status: "active",
      startDate,
      nextRenewalDate,
      city: rider.city,
      vehicleType: rider.vehicleType,
    });

    await sendPolicyCreatedEmail(rider, policy);

    res.status(201).json({
      policy,
      premiumBreakdown: premiumResult.breakdown || [],
      basePremium: premiumResult.basePremium,
      adjustedPremium: premiumResult.adjustedPremium,
      source: premiumResult.source,
    });
  } catch (err) {
    logger.error(`[policies] Create failed: ${err.message}`);
    res.status(500).json({ message: "Could not create policy" });
  }
});

/**
 * GET ACTIVE POLICY
 */
const getActivePolicy = async (req, res) => {
  try {
    // ✅ CRITICAL FIX (prevents ObjectId crash)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    logger.info(`[policies] Fetching policy for rider: ${req.user.id}`);

    const policy = await Policy.findOne({
      riderId: req.user.id,
      status: "active",
    }).sort({ startDate: -1 });

    if (!policy) {
      return res.json({ policy: null });
    }

    res.json({ policy });
  } catch (err) {
    logger.error(`[policies] Fetch failed: ${err.message}`);
    res.status(500).json({ message: "Failed to load policy" });
  }
};

// ROUTES
router.get("/active", authMiddleware, getActivePolicy);
router.get("/my-policy", authMiddleware, getActivePolicy);

// ✅ THIS LINE FIXES YOUR DEPLOY ERROR
export default router;
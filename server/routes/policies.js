import { Router } from "express";
import Policy from "../models/Policy.js";
import Rider from "../models/Rider.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { calculatePremium } from "../services/premiumService.js";
import { sendPolicyCreatedEmail } from "../services/emailService.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Policy:
 *       type: object
 *       properties:
 *         tier:
 *           type: string
 *           enum: [standard, ev]
 *         addOns:
 *           type: array
 *           items:
 *             type: string
 *         weeklyPremium:
 *           type: number
 *         coverageAmount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [active, cancelled]
 *         startDate:
 *           type: string
 *           format: date-time
 *         nextRenewalDate:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/policies/create:
 *   post:
 *     summary: Create a new insurance policy
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tier:
 *                 type: string
 *               addOns:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Policy created successfully
 *       404:
 *         description: Rider not found
 */
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { tier, addOns = [] } = req.body;
    // req.user is populated by authMiddleware
    const rider = await Rider.findById(req.user.id);
    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    const requested = tier === "ev" || tier === "standard" ? tier : null;
    const finalTier = requested || (rider.vehicleType === "ev" ? "ev" : "standard");

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

    await Policy.updateMany({ riderId: rider._id, status: "active" }, { $set: { status: "cancelled" } });

    const startDate = new Date();
    const nextRenewalDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

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
    res.status(500).json({ message: err.message || "Could not create policy" });
  }
});

/**
 * @swagger
 * /api/policies/active:
 *   get:
 *     summary: Get the active policy for the logged-in rider
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active policy data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 policy:
 *                   $ref: '#/components/schemas/Policy'
 */
/**
 * @swagger
 * /api/policies/my-policy:
 *   get:
 *     summary: Alias for /active (User preferred naming)
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 */
const getActivePolicy = async (req, res) => {
  try {
    logger.info(`[policies] Fetching active policy for rider: ${req.user?.id}`);
    const policy = await Policy.findOne({ riderId: req.user.id, status: "active" }).sort({
      startDate: -1,
    });
    if (!policy) {
      return res.json({ policy: null });
    }
    res.json({ policy });
  } catch (err) {
    logger.error(`[policies] Fetch failed: ${err.message}`);
    res.status(500).json({ message: err.message || "Failed to load policy" });
  }
};

router.get("/active", authMiddleware, getActivePolicy);
router.get("/my-policy", authMiddleware, getActivePolicy);

export default router;

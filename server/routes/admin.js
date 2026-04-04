import { Router } from "express";
import Rider from "../models/Rider.js";
import Policy from "../models/Policy.js";
import Claim from "../models/Claim.js";
import { processTrigger } from "../services/triggerEngine.js";
import { authMiddleware } from "../middleware/auth.js";
import logger from "../logger.js";
import { io } from "../index.js";

const router = Router();

// /api/admin/overview
router.get("/overview", async (req, res) => {
  try {
    const totalUsers = await Rider.countDocuments();
    const totalPolicies = await Policy.countDocuments();
    const totalClaims = await Claim.countDocuments();
    
    const claims = await Claim.find().select("payoutAmount status");
    const totalPayouts = claims
      .filter(c => c.status === "paid")
      .reduce((sum, c) => sum + (c.payoutAmount || 0), 0);

    const recentClaims = await Claim.find()
      .populate("riderId", "name phone city")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalUsers,
      totalPolicies,
      totalClaims,
      totalPayouts,
      recentClaims
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// /api/admin/claims
router.get("/claims", async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate("riderId", "name phone city")
      .sort({ createdAt: -1 });

    res.json({ claims });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── Trigger simulation values ── */
const SIM_VALUES = {
  rainfall: "35mm/hr",
  heat: "45°C",
  strike: "city-wide",
};

// POST /api/admin/simulate — fire trigger for ALL active policyholders
router.post("/simulate", async (req, res) => {
  try {
    const { triggerType } = req.body;
    if (!triggerType || !SIM_VALUES[triggerType]) {
      return res.status(400).json({ message: "triggerType must be rainfall, heat, or strike" });
    }

    const activePolicies = await Policy.find({ status: "active" }).select("riderId city").lean();
    if (activePolicies.length === 0) {
      return res.json({ message: "No active policies found", results: [] });
    }

    const results = [];
    for (const pol of activePolicies) {
      const riderId = String(pol.riderId);
      logger.info(`[simulate] Firing ${triggerType} for rider ${riderId} in ${pol.city}`);
      const claim = await processTrigger(io, riderId, triggerType, SIM_VALUES[triggerType], pol.city);
      if (claim) {
        results.push({ riderId, claimId: claim._id, amount: claim.payoutAmount, status: claim.status });
      }
    }

    logger.info(`[simulate] Complete — ${results.length} claims created`);
    res.json({ message: `Simulated ${triggerType} for ${activePolicies.length} riders`, results });
  } catch (err) {
    logger.error(`[simulate] Error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/simulate-me — fire trigger for the LOGGED-IN user only (for dashboard button)
router.post("/simulate-me", authMiddleware, async (req, res) => {
  try {
    const { triggerType } = req.body;
    if (!triggerType || !SIM_VALUES[triggerType]) {
      return res.status(400).json({ message: "triggerType must be rainfall, heat, or strike" });
    }

    const riderId = String(req.rider._id);
    const rider = req.rider;
    logger.info(`[simulate-me] Firing ${triggerType} for rider ${riderId}`);

    const claim = await processTrigger(io, riderId, triggerType, SIM_VALUES[triggerType], rider.city);
    if (!claim) {
      return res.json({ message: "Trigger did not produce a claim (dedup, no policy, or low confidence)", claim: null });
    }

    res.json({
      message: `${triggerType} triggered successfully`,
      claim: {
        _id: claim._id,
        triggerType: claim.triggerType,
        payoutAmount: claim.payoutAmount,
        status: claim.status,
        explanation: claim.explanation,
        fraudScore: claim.fraudScore,
      },
    });
  } catch (err) {
    logger.error(`[simulate-me] Error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/simulate-trigger — Force trigger for the demo (guaranteed claim)
router.post("/simulate-trigger", authMiddleware, async (req, res) => {
  try {
    const { triggerType } = req.body;
    if (!triggerType || !SIM_VALUES[triggerType]) {
      return res.status(400).json({ success: false, message: "triggerType must be rainfall, heat, or strike" });
    }

    const riderId = String(req.rider._id);
    const rider = req.rider;
    logger.info(`[SIMULATION] Forced ${triggerType} for rider ${riderId}`);

    const claim = await processTrigger(io, riderId, triggerType, SIM_VALUES[triggerType], rider.city, true);

    res.json({
      success: true,
      claimCreated: !!claim,
      payoutAmount: claim ? claim.payoutAmount : 0,
      claim: claim
    });
  } catch (err) {
    logger.error(`[SIMULATION ERROR] ${err.message}`);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;


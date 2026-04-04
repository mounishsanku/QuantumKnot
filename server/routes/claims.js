import { Router } from "express";
import mongoose from "mongoose";
import Claim from "../models/Claim.js";
import Policy from "../models/Policy.js";
import Payout from "../models/Payout.js";
import { authMiddleware } from "../middleware/auth.js";
import logger from "../logger.js";

const router = Router();

/* ── Demo seed data ── */
const DEMO_CLAIMS = [
  {
    triggerType: "rainfall",
    triggerValue: "32mm/hr",
    zone: "Hyderabad",
    incomeEstimate: 350,
    payoutAmount: 263,
    fraudScore: 12,
    status: "paid",
    autoTriggered: true,
    explanation:
      "Heavy rain detected (32mm/hr). Your avg income ₹700/day (₹88/hr). Estimated disruption: 3 hours. Calculated loss: ₹263. Fraud score 12 (low risk). Payout approved.",
    breakdown: { baseAmount: 200, severityMultiplier: 1.2, earningsFactor: 1.1, finalAmount: 264 },
    createdAt: new Date(Date.now() - 2 * 86400000), // 2 days ago
  },
  {
    triggerType: "heat",
    triggerValue: "44°C",
    zone: "Hyderabad",
    incomeEstimate: 350,
    payoutAmount: 350,
    fraudScore: 8,
    status: "paid",
    autoTriggered: true,
    explanation:
      "Extreme heat detected (44°C). Your avg income ₹700/day (₹88/hr). Estimated disruption: 4 hours. Calculated loss: ₹350. Fraud score 8 (low risk). Payout approved.",
    breakdown: { baseAmount: 200, severityMultiplier: 1.3, earningsFactor: 1.35, finalAmount: 351 },
    createdAt: new Date(Date.now() - 5 * 86400000), // 5 days ago
  },
  {
    triggerType: "strike",
    triggerValue: "city-wide",
    zone: "Hyderabad",
    incomeEstimate: 350,
    payoutAmount: 438,
    fraudScore: 22,
    status: "paid",
    autoTriggered: true,
    explanation:
      "City-wide strike detected (city-wide). Your avg income ₹700/day (₹88/hr). Estimated disruption: 5 hours. Calculated loss: ₹438. Fraud score 22 (low risk). Payout approved.",
    breakdown: { baseAmount: 200, severityMultiplier: 1.5, earningsFactor: 1.45, finalAmount: 435 },
    createdAt: new Date(Date.now() - 8 * 86400000), // 8 days ago
  },
];

async function seedDemoClaims(riderId) {
  try {
    const policy = await Policy.findOne({ riderId, status: "active" }).sort({ startDate: -1 }).lean();
    if (!policy) {
      logger.info(`[demo-seed] No active policy for rider ${riderId}, skipping demo claims`);
      return [];
    }

    const city = policy.city || "Hyderabad";
    const docs = DEMO_CLAIMS.map((d) => ({
      ...d,
      riderId,
      policyId: policy._id,
      zone: city,
    }));

    const created = await Claim.insertMany(docs);
    logger.info(`[demo-seed] Created ${created.length} demo claims for rider ${riderId}`);
    return created.map((c) => c.toObject());
  } catch (err) {
    logger.warn(`[demo-seed] Failed to seed demo claims: ${err.message}`);
    return [];
  }
}

router.get("/my-claims", authMiddleware, async (req, res) => {
  try {
    let claims = await Claim.find({ riderId: req.rider._id }).sort({ createdAt: -1 }).lean();

    // ── Auto-seed demo claims if rider has none ──
    if (claims.length === 0) {
      const seeded = await seedDemoClaims(req.rider._id);
      if (seeded.length > 0) {
        claims = seeded.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    }

    const claimIds = claims.map((c) => c._id);
    const payouts = await Payout.find({ claimId: { $in: claimIds } }).lean();
    const byClaim = Object.fromEntries(payouts.map((p) => [String(p.claimId), p]));
    const enriched = claims.map((c) => ({
      ...c,
      transactionId: byClaim[String(c._id)]?.transactionId || null,
    }));
    res.json({ claims: enriched });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load claims" });
  }
});

router.get("/:claimId", authMiddleware, async (req, res) => {
  try {
    const { claimId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(claimId)) {
      return res.status(400).json({ message: "Invalid claim id" });
    }
    const claim = await Claim.findOne({ _id: claimId, riderId: req.rider._id }).lean();
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }
    const payout = await Payout.findOne({ claimId: claim._id }).lean();
    res.json({ claim: { ...claim, transactionId: payout?.transactionId || null } });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load claim" });
  }
});

export default router;


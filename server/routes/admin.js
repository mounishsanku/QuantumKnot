import { Router } from "express";
import Rider from "../models/Rider.js";
import Policy from "../models/Policy.js";
import Claim from "../models/Claim.js";
import { processTrigger } from "../services/triggerEngine.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import logger from "../logger.js";


const router = Router();

// 🔐 Apply globally
router.use(authMiddleware, adminMiddleware);

// 📊 OVERVIEW
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
    logger.error(`[admin/overview] ${err.message}`);
    res.status(500).json({ message: err.message });
  }
});

// 📄 CLAIMS
router.get("/claims", async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate("riderId", "name phone city")
      .sort({ createdAt: -1 });

    res.json({ claims });

  } catch (err) {
    logger.error(`[admin/claims] ${err.message}`);
    res.status(500).json({ message: err.message });
  }
});

// ⚡ SIM VALUES
const SIM_VALUES = {
  rainfall: "35mm/hr",
  heat: "45°C",
  strike: "city-wide",
};

// 🌍 SIMULATE ALL USERS
router.post("/simulate", async (req, res) => {
  try {
    const { triggerType } = req.body;

    if (!triggerType || !SIM_VALUES[triggerType]) {
      return res.status(400).json({
        message: "triggerType must be rainfall, heat, or strike"
      });
    }

    const activePolicies = await Policy.find({ status: "active" })
      .select("riderId city")
      .lean();

    if (!activePolicies.length) {
      return res.json({ message: "No active policies found", results: [] });
    }

    const results = [];

    for (const pol of activePolicies) {
      const riderId = String(pol.riderId);

      logger.info(`[simulate] ${triggerType} for rider ${riderId}`);

      const claim = await processTrigger(
        io,
        riderId,
        triggerType,
        SIM_VALUES[triggerType],
        pol.city
      );

      if (claim) {
        results.push({
          riderId,
          claimId: claim._id,
          amount: claim.payoutAmount,
          status: claim.status
        });
      }
    }

    res.json({
      message: `Simulated ${triggerType}`,
      results
    });

  } catch (err) {
    logger.error(`[simulate] ${err.message}`);
    res.status(500).json({ message: err.message });
  }
});

// 👤 SIMULATE ME
router.post("/simulate-trigger", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { triggerType } = req.body;

    if (!triggerType || !SIM_VALUES[triggerType]) {
      return res.status(400).json({
        success: false,
        message: "Invalid triggerType"
      });
    }

    const riderId = req.user.id;
    const rider = await Rider.findById(riderId);

    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    logger.info(`[simulation] ${triggerType} for ${riderId}`);

    const claim = await processTrigger(
      null, // 🔥 FIXED
      riderId,
      triggerType,
      SIM_VALUES[triggerType],
      rider.city,
      true
    );

    res.json({
      success: true,
      claimCreated: !!claim,
      payoutAmount: claim?.payoutAmount || 0,
      claim
    });

  } catch (err) {
    logger.error(`[simulation error] ${err.message}`);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
// 🚀 FORCE SIMULATION


router.post("/simulate-trigger", authMiddleware, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ message: "User not found" });
    }

    const { triggerType } = req.body;

    if (!triggerType || !SIM_VALUES[triggerType]) {
      return res.status(400).json({
        success: false,
        message: "Invalid triggerType"
      });
    }

    const riderId = req.user.id;
    const rider = await Rider.findById(req.user.id);

    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    logger.info(`[simulation] ${triggerType} for ${riderId}`);

    const claim = await processTrigger(
      io,
      riderId,
      triggerType,
      SIM_VALUES[triggerType],
      rider.city,
      true
    );

    res.json({
      success: true,
      claimCreated: !!claim,
      payoutAmount: claim?.payoutAmount || 0,
      claim
    });

  } catch (err) {
    logger.error(`[simulation error] ${err.message}`);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// 🌊 BULK SIMULATION
router.post("/simulate-bulk", async (req, res) => {
  try {
    const { count = 20, triggerType = "rainfall" } = req.body;

    const riders = await Rider.find().limit(count);
    const io = req.app.get("io");

    const batchSize = 10;

    for (let i = 0; i < riders.length; i += batchSize) {
      const batch = riders.slice(i, i + batchSize);

      await Promise.all(
        batch.map((rider) =>
          processTrigger(
            io,
            rider._id,
            triggerType,
            SIM_VALUES[triggerType] || "bulk_sim",
            rider.city,
            true // force simulation
          ).catch((err) => {
            console.log("[SIM] Failed for rider:", rider._id);
          })
        )
      );
    }

    res.json({
      success: true,
      message: `Simulated ${riders.length} riders`
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Bulk simulation failed"
    });
  }
});

export default router;